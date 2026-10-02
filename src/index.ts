import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";

export class App extends DurableObject {
  private app: Hono;

  constructor(ctx: DurableObjectState, env: Record<string, unknown>) {
    super(ctx, env);
    this.app = new Hono();
    this.setupRoutes();
  }

  private initDatabase() {
    // 1. Settings Table
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Default settings
    const existingCurrency = this.ctx.storage.sql.exec(`SELECT value FROM settings WHERE key='currency'`).toArray();
    if (existingCurrency.length === 0) {
      this.ctx.storage.sql.exec(`INSERT INTO settings (key, value) VALUES ('currency', 'USD ($)')`);
      this.ctx.storage.sql.exec(`INSERT INTO settings (key, value) VALUES ('business_name', 'NetZone Hotspot & ISP')`);
      this.ctx.storage.sql.exec(`INSERT INTO settings (key, value) VALUES ('hotspot_title', 'Connect to High-Speed Internet')`);
      this.ctx.storage.sql.exec(`INSERT INTO settings (key, value) VALUES ('contact_number', '+1 (555) 019-2831')`);
      this.ctx.storage.sql.exec(`INSERT INTO settings (key, value) VALUES ('receipt_header', 'Welcome to NetZone Hotspot! Enjoy fast & reliable internet.')`);
      this.ctx.storage.sql.exec(`INSERT INTO settings (key, value) VALUES ('receipt_footer', 'Support: call +1 555-019-2831. Non-refundable voucher.')`);
      this.ctx.storage.sql.exec(`INSERT INTO settings (key, value) VALUES ('dns_name', 'wifi.netzone.hotspot')`);
    }

    // 2. Routers Table
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS routers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        host TEXT NOT NULL,
        port INTEGER NOT NULL DEFAULT 8728,
        rest_port INTEGER NOT NULL DEFAULT 443,
        username TEXT NOT NULL DEFAULT 'admin',
        password TEXT NOT NULL DEFAULT '',
        is_active INTEGER NOT NULL DEFAULT 1,
        ros_version TEXT DEFAULT '7.14.2',
        model TEXT DEFAULT 'RB750Gr3',
        location TEXT DEFAULT 'Main Gate Router',
        status TEXT DEFAULT 'online',
        created_at INTEGER NOT NULL
      )
    `);

    const routersCount = this.ctx.storage.sql.exec(`SELECT COUNT(*) as c FROM routers`).one().c as number;
    if (routersCount === 0) {
      this.ctx.storage.sql.exec(`
        INSERT INTO routers (name, host, port, rest_port, username, password, is_active, ros_version, model, location, status, created_at)
        VALUES ('Core Gateway - RB750Gr3', '192.168.88.1', 8728, 443, 'admin', 'p@ss123', 1, '7.15.1', 'RB750Gr3 (hex)', 'Server Room Rack 1', 'online', ?)
      `, Date.now() - 86400000 * 30);

      this.ctx.storage.sql.exec(`
        INSERT INTO routers (name, host, port, rest_port, username, password, is_active, ros_version, model, location, status, created_at)
        VALUES ('Beachside Hotspot - hAP ac3', '192.168.89.1', 8728, 443, 'admin', 'p@ss123', 1, '7.14.2', 'RBD53iG-5HacD2HnD', 'Beach Cafe Tower', 'online', ?)
      `, Date.now() - 86400000 * 15);
    }

    // 3. Profiles Table (Hotspot Tariff Plans)
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        router_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        dns_name TEXT DEFAULT 'netzone.wifi',
        ip_pool TEXT DEFAULT 'hs-pool-1',
        rate_limit TEXT NOT NULL, -- e.g. 5M/2M
        shared_users INTEGER NOT NULL DEFAULT 1,
        validity_value INTEGER NOT NULL DEFAULT 1,
        validity_unit TEXT NOT NULL DEFAULT 'hours', -- minutes, hours, days
        time_limit_value INTEGER DEFAULT 0,
        time_limit_unit TEXT DEFAULT 'hours',
        data_limit_mb INTEGER DEFAULT 0, -- 0 means unlimited
        price REAL NOT NULL DEFAULT 0,
        lock_mac INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL
      )
    `);

    const profilesCount = this.ctx.storage.sql.exec(`SELECT COUNT(*) as c FROM profiles`).one().c as number;
    if (profilesCount === 0) {
      const now = Date.now();
      this.ctx.storage.sql.exec(`
        INSERT INTO profiles (router_id, name, dns_name, ip_pool, rate_limit, shared_users, validity_value, validity_unit, time_limit_value, time_limit_unit, data_limit_mb, price, lock_mac, created_at)
        VALUES (1, '1 Hour Fast Pass', 'netzone.wifi', 'hs-pool-1', '5M/2M', 1, 1, 'hours', 1, 'hours', 0, 0.50, 1, ?)
      `, now);

      this.ctx.storage.sql.exec(`
        INSERT INTO profiles (router_id, name, dns_name, ip_pool, rate_limit, shared_users, validity_value, validity_unit, time_limit_value, time_limit_unit, data_limit_mb, price, lock_mac, created_at)
        VALUES (1, '24 Hours Unlimited Day Pass', 'netzone.wifi', 'hs-pool-1', '10M/3M', 1, 1, 'days', 24, 'hours', 0, 2.00, 1, ?)
      `, now);

      this.ctx.storage.sql.exec(`
        INSERT INTO profiles (router_id, name, dns_name, ip_pool, rate_limit, shared_users, validity_value, validity_unit, time_limit_value, time_limit_unit, data_limit_mb, price, lock_mac, created_at)
        VALUES (1, '7 Days Weekly Special (10GB)', 'netzone.wifi', 'hs-pool-1', '15M/5M', 2, 7, 'days', 0, 'hours', 10240, 7.50, 1, ?)
      `, now);

      this.ctx.storage.sql.exec(`
        INSERT INTO profiles (router_id, name, dns_name, ip_pool, rate_limit, shared_users, validity_value, validity_unit, time_limit_value, time_limit_unit, data_limit_mb, price, lock_mac, created_at)
        VALUES (1, '30 Days VIP Premium Pass', 'netzone.wifi', 'hs-pool-1', '25M/10M', 3, 30, 'days', 0, 'hours', 0, 25.00, 0, ?)
      `, now);
    }

    // 4. Vouchers / Users Table
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS vouchers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        router_id INTEGER NOT NULL,
        profile_id INTEGER NOT NULL,
        code TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'voucher', -- 'voucher' or 'user'
        price REAL NOT NULL DEFAULT 0,
        rate_limit TEXT DEFAULT '5M/2M',
        validity TEXT DEFAULT '24h',
        time_limit TEXT DEFAULT '',
        data_limit_mb INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active', -- 'active', 'used', 'expired', 'disabled'
        used_by_mac TEXT DEFAULT '',
        used_by_ip TEXT DEFAULT '',
        uptime_used INTEGER DEFAULT 0,
        bytes_in INTEGER DEFAULT 0,
        bytes_out INTEGER DEFAULT 0,
        batch_id TEXT DEFAULT '',
        comment TEXT DEFAULT '',
        created_at INTEGER NOT NULL,
        first_login_at INTEGER DEFAULT 0,
        expires_at INTEGER DEFAULT 0
      )
    `);

    const voucherCount = this.ctx.storage.sql.exec(`SELECT COUNT(*) as c FROM vouchers`).one().c as number;
    if (voucherCount === 0) {
      const now = Date.now();
      const batchAlpha = "BATCH-" + Math.floor(now / 1000);
      
      // Sample Vouchers
      const sampleVouchers = [
        { code: 'NET-8921', pass: '8921', prof: 1, status: 'active', price: 0.50, mac: '', comment: 'Front Desk Counter' },
        { code: 'NET-4410', pass: '4410', prof: 1, status: 'active', price: 0.50, mac: '', comment: 'Batch Print' },
        { code: 'NET-7731', pass: '7731', prof: 2, status: 'active', price: 2.00, mac: '', comment: 'Batch Print' },
        { code: 'NET-9012', pass: '9012', prof: 2, status: 'used', price: 2.00, mac: '04:D4:C4:8A:12:90', comment: 'Cafe Customer' },
        { code: 'NET-3382', pass: '3382', prof: 2, status: 'used', price: 2.00, mac: '7C:10:C9:4F:B2:1A', comment: 'Hotel Room 204' },
        { code: 'NET-5109', pass: '5109', prof: 3, status: 'used', price: 7.50, mac: 'A4:5E:60:11:88:DF', comment: 'Weekly Guest' },
        { code: 'VIP-ALEX', pass: 'secret99', prof: 4, status: 'active', price: 25.00, mac: '38:F9:D3:91:02:AA', comment: 'Resident Member Alex' },
        { code: 'NET-1102', pass: '1102', prof: 2, status: 'expired', price: 2.00, mac: '52:54:00:12:34:56', comment: 'Expired Yesterday' },
      ];

      for (const v of sampleVouchers) {
        this.ctx.storage.sql.exec(`
          INSERT INTO vouchers (router_id, profile_id, code, password, type, price, rate_limit, validity, status, used_by_mac, used_by_ip, uptime_used, bytes_in, bytes_out, batch_id, comment, created_at, first_login_at, expires_at)
          VALUES (1, ?, ?, ?, 'voucher', ?, '10M/3M', '24h', ?, ?, '192.168.88.210', ?, ?, ?, ?, ?, ?, ?, ?)
        `, 
          v.prof, 
          v.code, 
          v.pass, 
          v.price, 
          v.status, 
          v.mac, 
          v.status === 'used' ? 14400 : 0, 
          v.status === 'used' ? 485000000 : 0, 
          v.status === 'used' ? 1850000000 : 0, 
          batchAlpha, 
          v.comment, 
          now - 86400000, 
          v.status === 'used' ? now - 18000000 : 0, 
          v.status === 'used' ? now + 68400000 : (v.status === 'expired' ? now - 3600000 : 0)
        );
      }
    }

    // 5. Sales Transactions Table
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        router_id INTEGER NOT NULL,
        voucher_id INTEGER,
        code TEXT NOT NULL,
        profile_name TEXT NOT NULL,
        price REAL NOT NULL,
        seller TEXT NOT NULL DEFAULT 'Admin',
        payment_method TEXT NOT NULL DEFAULT 'Cash',
        sold_at INTEGER NOT NULL
      )
    `);

    const salesCount = this.ctx.storage.sql.exec(`SELECT COUNT(*) as c FROM sales`).one().c as number;
    if (salesCount === 0) {
      const now = Date.now();
      // Generate some historical sales over past 14 days
      const profileNames = ['1 Hour Fast Pass', '24 Hours Unlimited Day Pass', '7 Days Weekly Special (10GB)', '30 Days VIP Premium Pass'];
      const prices = [0.50, 2.00, 7.50, 25.00];
      const sellers = ['Admin Front Desk', 'Cashier Stand 1', 'Self Portal (QR Pay)', 'Admin Front Desk'];
      const methods = ['Cash', 'Cash', 'M-Pesa / Mobile Money', 'Credit Card'];

      for (let i = 0; i < 35; i++) {
        const daysAgo = Math.floor(Math.random() * 14);
        const idx = Math.floor(Math.random() * profileNames.length);
        const soldTime = now - (daysAgo * 86400000) - Math.floor(Math.random() * 3600000 * 12);
        const randCode = 'NET-' + Math.floor(1000 + Math.random() * 8999);

        this.ctx.storage.sql.exec(`
          INSERT INTO sales (router_id, voucher_id, code, profile_name, price, seller, payment_method, sold_at)
          VALUES (1, NULL, ?, ?, ?, ?, ?, ?)
        `, randCode, profileNames[idx], prices[idx], sellers[idx % sellers.length], methods[idx % methods.length], soldTime);
      }
    }

    // 6. Logs Table
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        router_id INTEGER NOT NULL,
        category TEXT NOT NULL, -- hotspot, dhcp, system, firewall, interface
        level TEXT NOT NULL DEFAULT 'info', -- info, warning, error
        message TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      )
    `);

    const logsCount = this.ctx.storage.sql.exec(`SELECT COUNT(*) as c FROM logs`).one().c as number;
    if (logsCount === 0) {
      const now = Date.now();
      const sampleLogs = [
        { cat: 'hotspot', lvl: 'info', msg: 'hotspot,info,debug NET-9012 (192.168.88.210): logged in, MAC 04:D4:C4:8A:12:90' },
        { cat: 'dhcp', lvl: 'info', msg: 'dhcp,info dhcp-hotspot assigned 192.168.88.210 to 04:D4:C4:8A:12:90' },
        { cat: 'system', lvl: 'info', msg: 'system,info,account user admin logged in from 192.168.88.100 via winbox' },
        { cat: 'hotspot', lvl: 'warning', msg: 'hotspot,warning NET-1102: session expired (time limit reached)' },
        { cat: 'firewall', lvl: 'info', msg: 'firewall,info drop-invalid-packets forward: in:ether1-WAN out:bridge-LAN' },
        { cat: 'interface', lvl: 'info', msg: 'interface,info ether1-WAN link up (speed 1Gbps, full duplex)' },
        { cat: 'hotspot', lvl: 'info', msg: 'hotspot,info VIP-ALEX (192.168.88.188): reconnected, MAC 38:F9:D3:91:02:AA' }
      ];

      for (let i = 0; i < sampleLogs.length; i++) {
        const l = sampleLogs[i];
        this.ctx.storage.sql.exec(`
          INSERT INTO logs (router_id, category, level, message, timestamp)
          VALUES (1, ?, ?, ?, ?)
        `, l.cat, l.lvl, l.msg, now - (i * 300000 + Math.random() * 100000));
      }
    }
  }

  private setupRoutes() {
    // Middleware to ensure database schema is ready
    this.app.use("*", async (c, next) => {
      this.initDatabase();
      await next();
    });

    // 1. App Summary Status
    this.app.get("/api/status", (c) => {
      const totalRouters = this.ctx.storage.sql.exec(`SELECT COUNT(*) as c FROM routers WHERE is_active=1`).one().c as number;
      const totalVouchers = this.ctx.storage.sql.exec(`SELECT COUNT(*) as c FROM vouchers`).one().c as number;
      const activeVouchers = this.ctx.storage.sql.exec(`SELECT COUNT(*) as c FROM vouchers WHERE status='active'`).one().c as number;
      const usedVouchers = this.ctx.storage.sql.exec(`SELECT COUNT(*) as c FROM vouchers WHERE status='used'`).one().c as number;
      const expiredVouchers = this.ctx.storage.sql.exec(`SELECT COUNT(*) as c FROM vouchers WHERE status='expired'`).one().c as number;

      // Sales metrics
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todaySales = this.ctx.storage.sql.exec(`
        SELECT SUM(price) as total, COUNT(*) as count FROM sales WHERE sold_at >= ?
      `, startOfDay.getTime()).one();

      const totalSalesAllTime = this.ctx.storage.sql.exec(`
        SELECT SUM(price) as total, COUNT(*) as count FROM sales
      `).one();

      // Mock live stats
      const activeSessionsCount = 14 + Math.floor(Math.random() * 5);
      const rxSpeedMbps = (18.4 + (Math.random() * 6 - 3)).toFixed(1);
      const txSpeedMbps = (42.1 + (Math.random() * 12 - 6)).toFixed(1);

      return c.json({
        routers_count: totalRouters,
        vouchers: {
          total: totalVouchers,
          active: activeVouchers,
          used: usedVouchers,
          expired: expiredVouchers
        },
        today_revenue: todaySales.total || 0,
        today_sales_count: todaySales.count || 0,
        total_revenue: totalSalesAllTime.total || 0,
        total_sales_count: totalSalesAllTime.count || 0,
        active_sessions: activeSessionsCount,
        traffic: {
          rx_mbps: parseFloat(rxSpeedMbps),
          tx_mbps: parseFloat(txSpeedMbps)
        }
      });
    });

    // 2. Settings API
    this.app.get("/api/settings", (c) => {
      const rows = this.ctx.storage.sql.exec(`SELECT key, value FROM settings`).toArray();
      const settingsObj: Record<string, string> = {};
      for (const row of rows) {
        settingsObj[row.key as string] = row.value as string;
      }
      return c.json(settingsObj);
    });

    this.app.post("/api/settings", async (c) => {
      const body = await c.req.json<Record<string, string>>();
      for (const [key, val] of Object.entries(body)) {
        this.ctx.storage.sql.exec(`
          INSERT INTO settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value=excluded.value
        `, key, String(val));
      }
      return c.json({ success: true });
    });

    // 3. Routers Management API
    this.app.get("/api/routers", (c) => {
      const routers = this.ctx.storage.sql.exec(`SELECT * FROM routers ORDER BY id ASC`).toArray();
      return c.json(routers);
    });

    this.app.post("/api/routers", async (c) => {
      const body = await c.req.json<{
        name: string;
        host: string;
        port?: number;
        rest_port?: number;
        username: string;
        password?: string;
        model?: string;
        location?: string;
      }>();

      if (!body.name || !body.host) {
        return c.json({ error: "Name and Host IP address are required" }, 400);
      }

      this.ctx.storage.sql.exec(`
        INSERT INTO routers (name, host, port, rest_port, username, password, is_active, ros_version, model, location, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, '7.15.1', ?, ?, 'online', ?)
      `, body.name, body.host, body.port || 8728, body.rest_port || 443, body.username || 'admin', body.password || '', body.model || 'RB750Gr3', body.location || 'Branch Office', Date.now());

      return c.json({ success: true });
    });

    this.app.put("/api/routers/:id", async (c) => {
      const id = c.req.param("id");
      const body = await c.req.json<{
        name: string;
        host: string;
        port: number;
        rest_port: number;
        username: string;
        password?: string;
        model: string;
        location: string;
        is_active: number;
      }>();

      this.ctx.storage.sql.exec(`
        UPDATE routers SET name=?, host=?, port=?, rest_port=?, username=?, password=?, model=?, location=?, is_active=?
        WHERE id=?
      `, body.name, body.host, body.port, body.rest_port, body.username, body.password, body.model, body.location, body.is_active, id);

      return c.json({ success: true });
    });

    this.app.delete("/api/routers/:id", (c) => {
      const id = c.req.param("id");
      this.ctx.storage.sql.exec(`DELETE FROM routers WHERE id=?`, id);
      return c.json({ success: true });
    });

    this.app.post("/api/routers/:id/test", (c) => {
      const id = c.req.param("id");
      const router = this.ctx.storage.sql.exec(`SELECT * FROM routers WHERE id=?`, id).toArray()[0];
      if (!router) {
        return c.json({ success: false, message: "Router not found" }, 404);
      }

      // Simulated RouterOS API latency & connection health check
      return c.json({
        success: true,
        latency_ms: Math.floor(12 + Math.random() * 25),
        ros_version: router.ros_version,
        identity: router.name,
        board_name: router.model,
        uptime: "14d 06:22:19",
        cpu_load: Math.floor(5 + Math.random() * 25) + "%",
        free_memory_mb: 184,
        total_memory_mb: 256
      });
    });

    // 4. Live Router Details (Interfaces, Firewall, Queues, DHCP)
    this.app.get("/api/routers/:id/details", (c) => {
      const id = c.req.param("id");
      const router = this.ctx.storage.sql.exec(`SELECT * FROM routers WHERE id=?`, id).toArray()[0];
      if (!router) return c.json({ error: "Router not found" }, 404);

      // Realtime interfaces with simulated traffic
      const interfaces = [
        { name: "ether1-WAN", type: "ether", mac: "D4:01:C3:80:11:01", running: true, disabled: false, mtu: 1500, rx_kbps: Math.floor(18000 + Math.random() * 5000), tx_kbps: Math.floor(42000 + Math.random() * 8000), comment: "Main Fiber ISP (100Mbps)" },
        { name: "ether2-LAN-Bridge", type: "ether", mac: "D4:01:C3:80:11:02", running: true, disabled: false, mtu: 1500, rx_kbps: Math.floor(35000 + Math.random() * 6000), tx_kbps: Math.floor(15000 + Math.random() * 4000), comment: "Local LAN Trunk" },
        { name: "ether3-Hotspot-AP1", type: "ether", mac: "D4:01:C3:80:11:03", running: true, disabled: false, mtu: 1500, rx_kbps: Math.floor(12000 + Math.random() * 3000), tx_kbps: Math.floor(22000 + Math.random() * 4000), comment: "Cafe AP Outdoor" },
        { name: "ether4-Hotspot-AP2", type: "ether", mac: "D4:01:C3:80:11:04", running: true, disabled: false, mtu: 1500, rx_kbps: Math.floor(8000 + Math.random() * 2000), tx_kbps: Math.floor(14000 + Math.random() * 3000), comment: "Lobby Access Point" },
        { name: "ether5-Management", type: "ether", mac: "D4:01:C3:80:11:05", running: false, disabled: false, mtu: 1500, rx_kbps: 0, tx_kbps: 0, comment: "Backup Admin Line" },
        { name: "wlan1-Hotspot-2.4G", type: "wlan", mac: "D4:01:C3:80:11:06", running: true, disabled: false, mtu: 1500, rx_kbps: Math.floor(6000 + Math.random() * 1500), tx_kbps: Math.floor(11000 + Math.random() * 2000), comment: "Internal Wireless" }
      ];

      // Firewall Filter Rules
      const firewallFilters = [
        { id: "*1", chain: "input", action: "accept", connection_state: "established,related", comment: "defconf: accept established,related", bytes: 14829102, packets: 92810, disabled: false },
        { id: "*2", chain: "input", action: "drop", connection_state: "invalid", comment: "defconf: drop invalid", bytes: 84120, packets: 1240, disabled: false },
        { id: "*3", chain: "input", action: "accept", protocol: "icmp", comment: "defconf: accept ICMP ping", bytes: 34100, packets: 512, disabled: false },
        { id: "*4", chain: "forward", action: "accept", comment: "Hotspot Walled Garden bypass list", bytes: 894012, packets: 6100, disabled: false },
        { id: "*5", chain: "forward", action: "drop", in_interface: "ether1-WAN", connection_state: "new", comment: "defconf: drop WAN in new connections", bytes: 298104, packets: 4890, disabled: false }
      ];

      // NAT Rules
      const firewallNat = [
        { id: "*10", chain: "srcnat", action: "masquerade", out_interface: "ether1-WAN", comment: "defconf: masquerade WAN traffic", bytes: 98124019, packets: 812040, disabled: false },
        { id: "*11", chain: "dstnat", action: "redirect", protocol: "tcp", dst_port: "80", in_interface: "ether3-Hotspot-AP1", comment: "Hotspot HTTP Captive Portal Redirect", bytes: 481023, packets: 9820, disabled: false }
      ];

      // Simple Queues
      const queues = [
        { name: "hs-user-NET-9012", target: "192.168.88.210/32", max_limit: "10M/3M", burst_limit: "15M/5M", bytes: "485M/1.85G", packets: "341k/982k", disabled: false },
        { name: "hs-user-VIP-ALEX", target: "192.168.88.188/32", max_limit: "25M/10M", burst_limit: "35M/15M", bytes: "1.2G/8.4G", packets: "890k/2.4M", disabled: false },
        { name: "Total-Hotspot-Bandwidth-Cap", target: "192.168.88.0/24", max_limit: "80M/30M", burst_limit: "100M/40M", bytes: "14.2G/88.1G", packets: "9.8M/31.2M", disabled: false }
      ];

      // DHCP Leases
      const dhcpLeases = [
        { address: "192.168.88.210", mac: "04:D4:C4:8A:12:90", host_name: "Galaxy-S22-Ultra", status: "bound", expires_after: "11m 42s", comment: "Voucher NET-9012" },
        { address: "192.168.88.188", mac: "38:F9:D3:91:02:AA", host_name: "MacBook-Pro-Alex", status: "bound", expires_after: "2d 14h", comment: "Voucher VIP-ALEX" },
        { address: "192.168.88.105", mac: "7C:10:C9:4F:B2:1A", host_name: "iPhone-14-Pro", status: "bound", expires_after: "48m 10s", comment: "Voucher NET-3382" },
        { address: "192.168.88.142", mac: "A4:5E:60:11:88:DF", host_name: "Windows-Laptop-Guest", status: "bound", expires_after: "5d 08h", comment: "Voucher NET-5109" },
        { address: "192.168.88.100", mac: "18:C0:4D:21:99:81", host_name: "Cashier-POS-PC", status: "bound", expires_after: "static", comment: "POS Static IP" }
      ];

      return c.json({
        router,
        resources: {
          uptime: "14d 06:22:19",
          cpu_load: Math.floor(8 + Math.random() * 20),
          free_memory_mb: 184,
          total_memory_mb: 256,
          free_hdd_mb: 12.8,
          total_hdd_mb: 16.0,
          voltage: "24.1V",
          temperature: "41.5°C",
          board_name: router.model,
          architecture: "mipsbe",
          ros_version: router.ros_version
        },
        interfaces,
        firewall_filters: firewallFilters,
        firewall_nat: firewallNat,
        queues,
        dhcp_leases: dhcpLeases
      });
    });

    // 5. Profiles API (Tariffs / Plans)
    this.app.get("/api/profiles", (c) => {
      const profiles = this.ctx.storage.sql.exec(`SELECT * FROM profiles ORDER BY price ASC`).toArray();
      return c.json(profiles);
    });

    this.app.post("/api/profiles", async (c) => {
      const body = await c.req.json<{
        router_id: number;
        name: string;
        dns_name?: string;
        ip_pool?: string;
        rate_limit: string;
        shared_users: number;
        validity_value: number;
        validity_unit: string;
        time_limit_value?: number;
        time_limit_unit?: string;
        data_limit_mb?: number;
        price: number;
        lock_mac?: number;
      }>();

      if (!body.name || !body.rate_limit) {
        return c.json({ error: "Profile Name and Rate Limit (e.g. 5M/2M) are required" }, 400);
      }

      this.ctx.storage.sql.exec(`
        INSERT INTO profiles (router_id, name, dns_name, ip_pool, rate_limit, shared_users, validity_value, validity_unit, time_limit_value, time_limit_unit, data_limit_mb, price, lock_mac, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, 
        body.router_id || 1, 
        body.name, 
        body.dns_name || 'netzone.wifi', 
        body.ip_pool || 'hs-pool-1', 
        body.rate_limit, 
        body.shared_users || 1, 
        body.validity_value || 1, 
        body.validity_unit || 'days', 
        body.time_limit_value || 0, 
        body.time_limit_unit || 'hours', 
        body.data_limit_mb || 0, 
        body.price || 0, 
        body.lock_mac !== undefined ? body.lock_mac : 1, 
        Date.now()
      );

      return c.json({ success: true });
    });

    this.app.put("/api/profiles/:id", async (c) => {
      const id = c.req.param("id");
      const body = await c.req.json<{
        name: string;
        dns_name: string;
        ip_pool: string;
        rate_limit: string;
        shared_users: number;
        validity_value: number;
        validity_unit: string;
        time_limit_value: number;
        time_limit_unit: string;
        data_limit_mb: number;
        price: number;
        lock_mac: number;
      }>();

      this.ctx.storage.sql.exec(`
        UPDATE profiles SET name=?, dns_name=?, ip_pool=?, rate_limit=?, shared_users=?, validity_value=?, validity_unit=?, time_limit_value=?, time_limit_unit=?, data_limit_mb=?, price=?, lock_mac=?
        WHERE id=?
      `, 
        body.name, body.dns_name, body.ip_pool, body.rate_limit, body.shared_users, body.validity_value, body.validity_unit, body.time_limit_value, body.time_limit_unit, body.data_limit_mb, body.price, body.lock_mac, id
      );

      return c.json({ success: true });
    });

    this.app.delete("/api/profiles/:id", (c) => {
      const id = c.req.param("id");
      this.ctx.storage.sql.exec(`DELETE FROM profiles WHERE id=?`, id);
      return c.json({ success: true });
    });

    // 6. Vouchers API
    this.app.get("/api/vouchers", (c) => {
      const statusFilter = c.req.query("status");
      const profileFilter = c.req.query("profile_id");
      const searchQuery = c.req.query("search");

      let query = `
        SELECT v.*, p.name as profile_name, p.price as profile_price, p.rate_limit as profile_rate_limit, p.validity_value, p.validity_unit
        FROM vouchers v
        LEFT JOIN profiles p ON v.profile_id = p.id
        WHERE 1=1
      `;
      const params: unknown[] = [];

      if (statusFilter && statusFilter !== 'all') {
        query += ` AND v.status = ?`;
        params.push(statusFilter);
      }

      if (profileFilter && profileFilter !== 'all') {
        query += ` AND v.profile_id = ?`;
        params.push(profileFilter);
      }

      if (searchQuery) {
        query += ` AND (v.code LIKE ? OR v.comment LIKE ? OR v.used_by_mac LIKE ?)`;
        const likeStr = `%${searchQuery}%`;
        params.push(likeStr, likeStr, likeStr);
      }

      query += ` ORDER BY v.id DESC LIMIT 300`;

      const rows = this.ctx.storage.sql.exec(query, ...params).toArray();
      return c.json(rows);
    });

    // Generate Vouchers Batch
    this.app.post("/api/vouchers/generate", async (c) => {
      const body = await c.req.json<{
        profile_id: number;
        quantity: number;
        code_length: number;
        prefix: string;
        character_set: 'numbers' | 'uppercase' | 'lowercase' | 'mixed' | 'custom';
        same_password: boolean;
        comment: string;
      }>();

      const profile = this.ctx.storage.sql.exec(`SELECT * FROM profiles WHERE id=?`, body.profile_id).toArray()[0];
      if (!profile) {
        return c.json({ error: "Profile not found" }, 400);
      }

      const qty = Math.min(Math.max(body.quantity || 1, 1), 500);
      const len = Math.min(Math.max(body.code_length || 6, 3), 12);
      const prefix = (body.prefix || '').trim();
      const batchId = "BATCH-" + Math.floor(Date.now() / 1000);
      const now = Date.now();

      let charPool = "1234567890";
      if (body.character_set === 'uppercase') charPool = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      else if (body.character_set === 'lowercase') charPool = "abcdefghjkmnpqrstuvwxyz23456789";
      else if (body.character_set === 'mixed') charPool = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

      const createdCodes: string[] = [];

      this.ctx.storage.transactionSync(() => {
        for (let i = 0; i < qty; i++) {
          let randPart = "";
          for (let j = 0; j < len; j++) {
            randPart += charPool.charAt(Math.floor(Math.random() * charPool.length));
          }
          const voucherCode = (prefix ? `${prefix}-${randPart}` : randPart).toUpperCase();
          const voucherPass = body.same_password ? voucherCode : Math.floor(1000 + Math.random() * 8999).toString();

          this.ctx.storage.sql.exec(`
            INSERT INTO vouchers (router_id, profile_id, code, password, type, price, rate_limit, validity, status, batch_id, comment, created_at)
            VALUES (?, ?, ?, ?, 'voucher', ?, ?, ?, 'active', ?, ?, ?)
          `, 
            profile.router_id as number, 
            profile.id as number, 
            voucherCode, 
            voucherPass, 
            profile.price as number, 
            profile.rate_limit as string, 
            `${profile.validity_value}${profile.validity_unit.charAt(0)}`, 
            batchId, 
            body.comment || `Batch ${qty} pcs`, 
            now
          );

          createdCodes.push(voucherCode);
        }
      });

      // Log activity
      this.ctx.storage.sql.exec(`
        INSERT INTO logs (router_id, category, level, message, timestamp)
        VALUES (?, 'hotspot', 'info', ?, ?)
      `, profile.router_id as number, `Generated batch ${batchId} (${qty} vouchers for ${profile.name})`, now);

      return c.json({
        success: true,
        batch_id: batchId,
        count: qty,
        vouchers: createdCodes
      });
    });

    // Quick single voucher / user create
    this.app.post("/api/vouchers/quick-create", async (c) => {
      const body = await c.req.json<{
        profile_id: number;
        code: string;
        password?: string;
        comment?: string;
        type?: 'voucher' | 'user';
      }>();

      const profile = this.ctx.storage.sql.exec(`SELECT * FROM profiles WHERE id=?`, body.profile_id).toArray()[0];
      if (!profile) return c.json({ error: "Profile not found" }, 400);

      const code = (body.code || '').trim().toUpperCase();
      if (!code) return c.json({ error: "Code/Username is required" }, 400);

      const pass = body.password ? body.password.trim() : code;
      const now = Date.now();

      try {
        this.ctx.storage.sql.exec(`
          INSERT INTO vouchers (router_id, profile_id, code, password, type, price, rate_limit, validity, status, comment, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
        `, profile.router_id as number, profile.id as number, code, pass, body.type || 'user', profile.price as number, profile.rate_limit as string, `${profile.validity_value}${profile.validity_unit.charAt(0)}`, body.comment || 'Manual Creation', now);

        return c.json({ success: true, code });
      } catch {
        return c.json({ error: "Voucher / User Code already exists" }, 400);
      }
    });

    // Sell / Mark Voucher Used & Log Sales
    this.app.post("/api/vouchers/sell", async (c) => {
      const body = await c.req.json<{
        voucher_id: number;
        seller?: string;
        payment_method?: string;
      }>();

      const voucher = this.ctx.storage.sql.exec(`
        SELECT v.*, p.name as profile_name, p.price as profile_price
        FROM vouchers v
        LEFT JOIN profiles p ON v.profile_id = p.id
        WHERE v.id=?
      `, body.voucher_id).toArray()[0];

      if (!voucher) return c.json({ error: "Voucher not found" }, 404);

      const now = Date.now();
      const mockMac = "04:" + Array.from({length: 5}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0').toUpperCase()).join(':');
      const mockIp = "192.168.88." + (100 + Math.floor(Math.random() * 150));

      // Update voucher status to used
      this.ctx.storage.sql.exec(`
        UPDATE vouchers
        SET status='used', used_by_mac=?, used_by_ip=?, first_login_at=?, expires_at=?
        WHERE id=?
      `, mockMac, mockIp, now, now + 86400000, body.voucher_id);

      // Log sale transaction
      this.ctx.storage.sql.exec(`
        INSERT INTO sales (router_id, voucher_id, code, profile_name, price, seller, payment_method, sold_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, voucher.router_id as number, voucher.id as number, voucher.code as string, (voucher.profile_name || 'Hotspot Pass') as string, (voucher.price || 0) as number, body.seller || 'Cashier Desk', body.payment_method || 'Cash', now);

      return c.json({ success: true, mac: mockMac, ip: mockIp });
    });

    this.app.delete("/api/vouchers/:id", (c) => {
      const id = c.req.param("id");
      this.ctx.storage.sql.exec(`DELETE FROM vouchers WHERE id=?`, id);
      return c.json({ success: true });
    });

    this.app.post("/api/vouchers/batch-delete", async (c) => {
      const body = await c.req.json<{ filter: 'used' | 'expired' | 'all_active' }>();
      if (body.filter === 'used') {
        this.ctx.storage.sql.exec(`DELETE FROM vouchers WHERE status='used'`);
      } else if (body.filter === 'expired') {
        this.ctx.storage.sql.exec(`DELETE FROM vouchers WHERE status='expired'`);
      }
      return c.json({ success: true });
    });

    // 7. Active Sessions API
    this.app.get("/api/sessions", (c) => {
      // Combines DB used vouchers with simulated active sessions
      const usedVouchers = this.ctx.storage.sql.exec(`
        SELECT v.*, p.name as profile_name, p.rate_limit as profile_rate_limit
        FROM vouchers v
        LEFT JOIN profiles p ON v.profile_id = p.id
        WHERE v.status='used'
      `).toArray();

      const mockSessions = [
        {
          id: "s101",
          user: "NET-9012",
          profile: "24 Hours Unlimited Day Pass",
          ip: "192.168.88.210",
          mac: "04:D4:C4:8A:12:90",
          uptime: "03h 42m 10s",
          bytes_in_mb: 485,
          bytes_out_mb: 1850,
          rx_rate_kbps: Math.floor(1200 + Math.random() * 2000),
          tx_rate_kbps: Math.floor(3400 + Math.random() * 4000),
          host_name: "Galaxy-S22-Ultra",
          login_by: "http-chap"
        },
        {
          id: "s102",
          user: "VIP-ALEX",
          profile: "30 Days VIP Premium Pass",
          ip: "192.168.88.188",
          mac: "38:F9:D3:91:02:AA",
          uptime: "1d 14h 05m",
          bytes_in_mb: 1200,
          bytes_out_mb: 8400,
          rx_rate_kbps: Math.floor(4500 + Math.random() * 3000),
          tx_rate_kbps: Math.floor(12000 + Math.random() * 8000),
          host_name: "MacBook-Pro-Alex",
          login_by: "cookie"
        },
        {
          id: "s103",
          user: "NET-3382",
          profile: "24 Hours Unlimited Day Pass",
          ip: "192.168.88.105",
          mac: "7C:10:C9:4F:B2:1A",
          uptime: "00h 15m 32s",
          bytes_in_mb: 82,
          bytes_out_mb: 310,
          rx_rate_kbps: Math.floor(800 + Math.random() * 1000),
          tx_rate_kbps: Math.floor(2100 + Math.random() * 2000),
          host_name: "iPhone-14-Pro",
          login_by: "http-pap"
        },
        {
          id: "s104",
          user: "NET-5109",
          profile: "7 Days Weekly Special (10GB)",
          ip: "192.168.88.142",
          mac: "A4:5E:60:11:88:DF",
          uptime: "12h 10m 00s",
          bytes_in_mb: 910,
          bytes_out_mb: 4120,
          rx_rate_kbps: Math.floor(2100 + Math.random() * 1500),
          tx_rate_kbps: Math.floor(5800 + Math.random() * 3000),
          host_name: "Windows-Laptop-Guest",
          login_by: "http-chap"
        }
      ];

      return c.json({
        total: mockSessions.length,
        sessions: mockSessions
      });
    });

    this.app.post("/api/sessions/:id/kick", (c) => {
      const sessionId = c.req.param("id");
      return c.json({ success: true, message: `Session ${sessionId} disconnected from hotspot` });
    });

    // 8. Sales Analytics API
    this.app.get("/api/sales", (c) => {
      const sales = this.ctx.storage.sql.exec(`SELECT * FROM sales ORDER BY sold_at DESC LIMIT 200`).toArray();
      
      // Calculate daily stats for charts (last 7 days)
      const now = Date.now();
      const dailyStats: Array<{ date: string; revenue: number; count: number }> = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const endOfDay = startOfDay + 86400000;

        const res = this.ctx.storage.sql.exec(`
          SELECT SUM(price) as rev, COUNT(*) as cnt FROM sales WHERE sold_at >= ? AND sold_at < ?
        `, startOfDay, endOfDay).one();

        const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
        dailyStats.push({
          date: dateStr,
          revenue: (res.rev as number) || 0,
          count: (res.cnt as number) || 0
        });
      }

      return c.json({
        sales,
        daily_stats: dailyStats
      });
    });

    // 9. Logs API
    this.app.get("/api/logs", (c) => {
      const category = c.req.query("category");
      let query = `SELECT * FROM logs WHERE 1=1`;
      const params: unknown[] = [];

      if (category && category !== 'all') {
        query += ` AND category=?`;
        params.push(category);
      }

      query += ` ORDER BY timestamp DESC LIMIT 150`;

      const rows = this.ctx.storage.sql.exec(query, ...params).toArray();
      return c.json(rows);
    });

    // 10. RouterOS Script Generator API
    this.app.post("/api/script/generate", async (c) => {
      const body = await c.req.json<{
        hotspot_name: string;
        dns_name: string;
        ip_address: string;
        netmask: string;
        ip_pool_start: string;
        ip_pool_end: string;
        rate_limit: string;
      }>();

      const hsName = body.hotspot_name || "NetZone-Hotspot";
      const dnsName = body.dns_name || "netzone.wifi";
      const ipAddr = body.ip_address || "192.168.88.1";
      const poolStart = body.ip_pool_start || "192.168.88.10";
      const poolEnd = body.ip_pool_end || "192.168.88.254";

      const rscScript = `# =========================================================
# MikroTik RouterOS Hotspot Auto-Configuration Script
# Generated by NetZone MikroTik Server Manager
# RouterOS Version: 7.x
# Date: ${new Date().toISOString().split('T')[0]}
# =========================================================

/log info message="Starting Hotspot Setup Script..."

# 1. Create IP Pool
/ip pool add name=hs-pool-1 ranges=${poolStart}-${poolEnd}

# 2. Add IP Address to Hotspot Interface
/ip address add address=${ipAddr}/24 interface=bridge-hotspot comment="Hotspot Gateway"

# 3. Create Hotspot User Profile
/ip hotspot user profile
add name="default" idle-timeout=none keepalive-timeout=2m status-autorefresh=1m
add name="1-Hour-Pass" rate-limit="5M/2M" shared-users=1 status-autorefresh=1m
add name="24-Hour-Pass" rate-limit="10M/3M" shared-users=1 status-autorefresh=1m
add name="VIP-Monthly" rate-limit="25M/10M" shared-users=3 status-autorefresh=1m

# 4. Create Hotspot Server Profile
/ip hotspot profile
add dns-name="${dnsName}" hotspot-area="" html-directory=hotspot \\
    http-cookie-lifetime=1d login-by=http-chap,http-pap,cookie name=hsprof-1 \\
    rate-limit="" use-radius=no

# 5. Create Hotspot Server
/ip hotspot
add address-pool=hs-pool-1 disabled=no interface=bridge-hotspot \\
    name="${hsName}" profile=hsprof-1 idle-timeout=5m

# 6. Walled Garden Rules (Bypass payment / portal assets)
/ip hotspot walled-garden
add comment="Allow payment gateways" dst-host="*.stripe.com"
add comment="Allow portal assets" dst-host="*.cloudflare.com"

# 7. Add Sample Hotspot Users
/ip hotspot user
add name="admin-hs" password="admin-password" profile="VIP-Monthly" comment="Admin Superuser"

/log info message="Hotspot Configuration Complete! DNS: ${dnsName}"
`;

      return c.json({ script: rscScript });
    });

    // 11. Interactive RouterOS CLI Terminal Interpreter
    this.app.post("/api/terminal/exec", async (c) => {
      const body = await c.req.json<{ command: string }>();
      const cmd = (body.command || '').trim();

      if (!cmd) return c.json({ output: "" });

      const lower = cmd.toLowerCase();
      let output = "";

      if (lower === "help" || lower === "?") {
        output = `Available RouterOS simulated CLI commands:
  /system resource print     - View CPU, Memory, Uptime
  /interface print          - List all network interfaces
  /ip hotspot user print    - List active hotspot vouchers/users
  /ip hotspot active print  - List active connected hotspot sessions
  /ip dhcp-server lease print - List DHCP leases
  /ip firewall filter print  - View firewall rules
  /system identity print    - Router system name
  ping <ip>                 - Test ping connectivity`;
      } else if (lower.includes("system resource print")) {
        output = `[admin@Core-Gateway] > /system resource print
         uptime: 14d06h22m19s
        version: 7.15.1 (stable)
     build-time: May/28/2024 11:20:00
    factory-software: 6.48.6
    free-memory: 184.2MiB
   total-memory: 256.0MiB
            cpu: MIPS 1004Kc V2.15
      cpu-count: 4
  cpu-frequency: 880MHz
       cpu-load: 12%
 free-hdd-space: 12.8MiB
  total-hdd-space: 16.0MiB
write-sect-since-reboot: 98124
   write-sect-total: 1049281
         architecture-name: mmips
         board-name: RB750Gr3
           platform: MikroTik`;
      } else if (lower.includes("interface print")) {
        output = `[admin@Core-Gateway] > /interface print
Flags: D - dynamic, X - disabled, R - running, S - slave
 #     NAME                    TYPE       ACTUAL-MTU L2MTU  MAX-L2MTU MAC-ADDRESS
 0 R   ether1-WAN              ether            1500  1598       9214 D4:01:C3:80:11:01
 1 R   ether2-LAN-Bridge       ether            1500  1598       9214 D4:01:C3:80:11:02
 2 R   ether3-Hotspot-AP1      ether            1500  1598       9214 D4:01:C3:80:11:03
 3 R   ether4-Hotspot-AP2      ether            1500  1598       9214 D4:01:C3:80:11:04
 4     ether5-Management       ether            1500  1598       9214 D4:01:C3:80:11:05
 5 R   wlan1-Hotspot-2.4G      wlan             1500  1600       2290 D4:01:C3:80:11:06`;
      } else if (lower.includes("ip hotspot user print")) {
        const vouchers = this.ctx.storage.sql.exec(`SELECT code, password, status FROM vouchers LIMIT 10`).toArray();
        output = `[admin@Core-Gateway] > /ip hotspot user print
Flags: X - disabled, D - dynamic
 #   NAME                  PASSWORD             PROFILE        STATUS
` + vouchers.map((v, i) => ` ${i}   ${(v.code as string).padEnd(20)} ${(v.password as string).padEnd(20)} 24-Hour-Pass   ${v.status}`).join('\n');
      } else if (lower.includes("ip hotspot active print")) {
        output = `[admin@Core-Gateway] > /ip hotspot active print
Flags: R - radius, B - blocked
 #   USER        ADDRESS        MAC-ADDRESS       UPTIME      BYTES-IN   BYTES-OUT
 0   NET-9012    192.168.88.210 04:D4:C4:8A:12:90 03h42m10s   485.2MB    1.85GB
 1   VIP-ALEX    192.168.88.188 38:F9:D3:91:02:AA 1d14h05m    1.20GB     8.40GB
 2   NET-3382    192.168.88.105 7C:10:C9:4F:B2:1A 00h15m32s   82.0MB     310.5MB`;
      } else if (lower.startsWith("ping")) {
        const target = cmd.split(" ")[1] || "8.8.8.8";
        output = `[admin@Core-Gateway] > ping ${target}
  SEQ HOST                                     SIZE TTL TIME  STATUS
    0 ${target}                                   56  118 14ms
    1 ${target}                                   56  118 12ms
    2 ${target}                                   56  118 15ms
    3 ${target}                                   56  118 13ms
    sent=4 received=4 packet-loss=0% min-rtt=12ms avg-rtt=13ms max-rtt=15ms`;
      } else {
        output = `[admin@Core-Gateway] > ${cmd}
Command output executed successfully.`;
      }

      return c.json({ output });
    });
  }

  async fetch(request: Request): Promise<Response> {
    return this.app.fetch(request);
  }
}
