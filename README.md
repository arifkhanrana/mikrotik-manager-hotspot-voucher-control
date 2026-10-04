Accomplishments So Far
Server Identity & Branding Updated to AKR-IT NETWORK:

Configured AKR-IT NETWORK as the official system brand name across default settings, database migrations, receipt headers, and DNS domain (wifi.akr-it.net).
Updated document title and HTML metadata to AKR-IT NETWORK - MikroTik Server Manager & Hotspot Voucher Control.
Updated router defaults to AKR-IT Core Gateway - RB750Gr3 and AKR-IT Beachside Hotspot - hAP ac3.
Updated simulated RouterOS CLI prompt to [admin@AKR-IT-NETWORK-GW] >.
Full NEW RouterOS v7 Script Generator (/api/script/generate):

Re-written the .rsc script generator backend to output a NEW, complete, production-ready RouterOS v7 setup script designed specifically for AKR-IT NETWORK.
Script Sections Included:
System Identity (AKR-IT-NETWORK-GW) & Time Sync (pool.ntp.org).
Bridge & Port assignments (bridge-akr-hotspot, ether2-LAN, ether3, ether4).
IP Addressing (10.5.50.1/24) and IP Pool (10.5.50.10 - 10.5.50.254).
DHCP Server (dhcp-akr-hotspot) and DNS Static entries (wifi.akr-it.net).
Hotspot Server Profile (hsprof-akr) and Hotspot Server (AKR-IT-Hotspot-GW).
Tariff Bandwidth Profiles (1-Hour-Pass, 24-Hour-Pass, 7-Day-Weekly, 30-Day-VIP, AKR-Member-Plan).
Firewall NAT Masquerade & Filter Security Rules (ICMP ping allow, drop invalid, DNS accept).
Walled Garden Bypasses (Android/Apple/Microsoft captive detection, Stripe, M-Pesa, Cloudflare).
Default Admin User (admin-akr) and Demo Voucher.
Automated System Backup Scheduler (AKR_Daily_Backup running every 24 hours at 03:00 AM).
