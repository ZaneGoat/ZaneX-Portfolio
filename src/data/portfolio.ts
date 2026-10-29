import {
  Shield, Mail, Github, Globe,
  Database, Cpu, Server, LucideIcon
} from "lucide-react";

export type Persona = "operator" | "friend";

export interface Project {
  id: string;
  title: string;
  category: "ERP" | "Automation" | "Security" | "Systems" | "Web";
  subtitle: string;
  description: string;
  highlights: string[];
  tags: string[];
  status: "Production" | "Active" | "Showcase";
  github?: string;
  live?: string;
  friendNote?: string;
}

export interface SkillCategory {
  title: string;
  icon: LucideIcon;
  description: string;
  skills: { name: string; level: number; tag: string }[];
}

export interface SystemSpecs {
  handle: string;
  realName: string;
  role: string;
  location: string;
  status: string;
  os: string;
  shell: string;
  uptime: string;
  bio: string;
  stats: { value: string; label: string }[];
}

export const systemSpecsByPersona: Record<Persona, SystemSpecs> = {
  operator: {
    handle: "ZANE_GOAT",
    realName: "Aziz Maaizate",
    role: "Systems & Security Engineer",
    location: "Casablanca [33.5731° N, 7.5898° W]",
    status: "ONLINE · Available for Q4 Contracts",
    os: "Kali Linux x86_64 [Kernel 6.8]",
    shell: "zsh /dev/pts/0",
    uptime: "99.98% Uptime",
    bio: "Software & systems engineer building custom desktop/web ERPs, Linux hardware daemons, 802.11 Wi-Fi CSI motion sensors, and automated data pipelines.",
    stats: [
      { value: "64", label: "OFDM Carriers" },
      { value: "3-Hop", label: "Tor Relay" },
      { value: "0x68", label: "EC Register" }
    ]
  },
  friend: {
    handle: "Zane (Aziz)",
    realName: "Aziz Maaizate",
    role: "Night Owl · Gamer · Creator · Homie",
    location: "Casablanca, Morocco 🇲🇦",
    status: "ONLINE · Fresh mint tea brewing · Chill beats rolling 🍵",
    os: "Cozy Battlestation & DualSense 🎮",
    shell: "Lo-Fi beats & midnight conversations",
    uptime: "Always down for good vibes",
    bio: "Welcome to my space! Grab some hot Moroccan mint tea, throw on the Zanophy playlist, and kick back. You don't need to know code, Linux terminals, or tech jargon to hang out here—just good energy, real conversations, late-night gaming, and creative ideas.",
    stats: [
      { value: "🍵 4+", label: "Pots of Mint Tea" },
      { value: "🎧 24/7", label: "Lo-Fi & Chill Beats" },
      { value: "🎮 3 AM", label: "Gaming & Deep Chats" }
    ]
  }
};

export const systemSpecs = systemSpecsByPersona.operator;

export const skillsData: SkillCategory[] = [
  {
    title: "Full-Stack & Custom ERP",
    icon: Database,
    description: "Business management suites, point-of-sale desktop apps, and relational databases.",
    skills: [
      { name: "Python (Flask & Django)", level: 95, tag: "Backend" },
      { name: "PyQt & CustomTkinter", level: 92, tag: "Desktop POS/ERP" },
      { name: "PostgreSQL, SQLite & SQLAlchemy", level: 90, tag: "Database" },
      { name: "React, TypeScript & Tailwind", level: 88, tag: "Web UI" },
      { name: "REST APIs & Role-Based Auth", level: 90, tag: "Access Control" }
    ]
  },
  {
    title: "Data Pipelines & Automation",
    icon: Cpu,
    description: "High-reliability scrapers, document generators, and background worker daemons.",
    skills: [
      { name: "Multi-Threaded Scrapers & Tor", level: 92, tag: "Network I/O" },
      { name: "Automated PDF & Docx Engines", level: 94, tag: "Document Gen" },
      { name: "Background Queues & Cron Jobs", level: 90, tag: "Workers" },
      { name: "Barcode, Inventory & OCR Flows", level: 88, tag: "Clinic / Retail" },
      { name: "Third-Party Webhook Sync", level: 90, tag: "Integrations" }
    ]
  },
  {
    title: "Linux Systems & Security",
    icon: Shield,
    description: "Direct hardware register control, RF signal processing, and network auditing.",
    skills: [
      { name: "Wi-Fi CSI Doppler Sensing", level: 90, tag: "802.11 RF" },
      { name: "Embedded Controller (EC) I/O", level: 92, tag: "Linux Firmware" },
      { name: "USB HID & Gamepad Drivers", level: 88, tag: "Low-Latency" },
      { name: "Network Recon & Auditing", level: 86, tag: "Security" },
      { name: "Kali / Debian Kernel Tuning", level: 92, tag: "Systems" }
    ]
  },
  {
    title: "Infrastructure & Delivery",
    icon: Server,
    description: "Reproducible containers, hardened Linux VPS setups, and automated builds.",
    skills: [
      { name: "Docker & Compose Stacks", level: 88, tag: "Containers" },
      { name: "Nginx, Systemd & TLS", level: 90, tag: "VPS Ops" },
      { name: "Git & GitHub Actions CI", level: 92, tag: "Release" },
      { name: "SSH, Firewall & Fail2ban", level: 89, tag: "Hardening" }
    ]
  }
];

export const projectsData: Project[] = [];

export const friendLoungeData = {
  gamerTag: "ZaneGoat",
  favoriteGames: ["Cyberpunk 2077", "Counter-Strike 2", "Elden Ring", "Dead Cells", "Cozy Indies"],
  vibeTrack: "Moroccan Lo-Fi & Smooth Jazz",
  teaIntake: "4+ Pots of Moroccan Mint Tea / day",
  homieNote: "Glad you stopped by! No dev knowledge required here. Drop a note on the board, vibe to the music, or challenge me in the arcade."
};

export const contactLinks = [
  { icon: Mail, label: "Email", href: "mailto:azizmaaizat@outlook.com", display: "azizmaaizat@outlook.com" },
  { icon: Github, label: "GitHub", href: "https://github.com/ZaneGoat", display: "github.com/ZaneGoat" },
  { icon: Globe, label: "Source Code", href: "https://github.com/ZaneGoat/ZaneX-Portfolio", display: "ZaneX-Portfolio" }
];

export interface PricingTier {
  id: string;
  index: string;
  name: string;
  tagline: string;
  price: string;
  period: string;
  badge?: string;
  recommended?: boolean;
  description: string;
  deliverables: string[];
  idealFor: string;
  cta: string;
}

export const pricingTiers: PricingTier[] = [
  {
    id: "care",
    index: "01",
    name: "Maintenance & Security",
    tagline: "Keep your live app fast, patched, and backed up",
    price: "$199.98",
    period: "/ mo",
    description: "Hands-on monthly upkeep for existing web apps, databases, and Linux servers so nothing breaks in production.",
    deliverables: [
      "Weekly security patches & dependency updates",
      "Linux VPS, Docker & SSL certificate upkeep",
      "Automated off-site database backups",
      "Bug fixes & performance cleanup (48h response)",
      "Direct line via Email, WhatsApp, or Discord"
    ],
    idealFor: "Live business sites & clinics that want reliable peace of mind",
    cta: "Start Maintenance Plan"
  },
  {
    id: "build",
    index: "02",
    name: "Full-Stack & Custom ERP",
    tagline: "Steady feature shipping for web & desktop software",
    price: "$449.98",
    period: "/ mo",
    badge: "Most Popular",
    recommended: true,
    description: "Ongoing engineering capacity to build and expand your POS, clinic/inventory ERP, or customer web portal.",
    deliverables: [
      "Continuous feature builds (Python, React, TypeScript)",
      "Custom desktop POS & ERP modules (PyQt / CustomTkinter)",
      "PostgreSQL & SQLite database design & migrations",
      "PDF / Docx invoice, prescription & report exports",
      "48-hour turnaround on queued tasks",
      "Weekly progress builds you can test immediately"
    ],
    idealFor: "Growing businesses replacing spreadsheets with custom software",
    cta: "Start Full-Stack Plan"
  },
  {
    id: "systems",
    index: "03",
    name: "Systems & Dedicated Eng",
    tagline: "Heavy backend architecture, scrapers & Linux systems",
    price: "$899.98",
    period: "/ mo",
    badge: "Priority",
    description: "Senior-level execution for complex backends, automated data pipelines, custom hardware/RF tools, and multi-service stacks.",
    deliverables: [
      "Custom data pipelines, scrapers & background workers",
      "Multi-container Docker & hardened Linux deployments",
      "Low-level Linux daemons, HID & hardware integration",
      "Architecture reviews, load testing & security audits",
      "Same-day priority response & emergency hotfixes",
      "Direct 1-on-1 collaboration with zero middlemen"
    ],
    idealFor: "Teams shipping demanding backend or hardware-linked products",
    cta: "Start Dedicated Plan"
  }
];

export const terminalCommandsHelp = [
  { cmd: "help", desc: "List all available terminal commands" },
  { cmd: "neofetch", desc: "Display ZaneOS system telemetry and specs" },
  { cmd: "whoami", desc: "Display operator identity & security clearance" },
  { cmd: "pricing", desc: "View monthly engineering plans ($199.98 – $899.98/mo)" },
  { cmd: "ctf [flag]", desc: "Hack My Portfolio CTF bounty board & flag submission" },
  { cmd: "csi [--gui]", desc: "Wi-Fi CSI Doppler radar & 64 OFDM subcarrier visualizer" },
  { cmd: "controler [--gui]", desc: "DualSense & Gamepad calibration suite" },
  { cmd: "hardware [--gui]", desc: "MSI GF65 EC hardware simulator & live fan curve tuner" },
  { cmd: "projects", desc: "List signature systems, ERP, and security repositories" },
  { cmd: "mood [random | jazz]", desc: "Switch Zanophy mood: Random (3 AM) or They are Jazz" },
  { cmd: "playlist [random | jazz]", desc: "Open official YouTube playlist for Random or They are Jazz" },
  { cmd: "cat [id]", desc: "Inspect architectural deep-dive of any project or file" },
  { cmd: "curl [url]", desc: "Simulate HTTP request (e.g. curl /robots.txt)" },
  { cmd: "repo [id]", desc: "Open the GitHub repository for any project" },
  { cmd: "skills", desc: "Inspect categorized technical proficiencies" },
  { cmd: "logo", desc: "Render Braille ASCII brand crest & 3D rolling zoom shift" },
  { cmd: "theme [matrix | existence]", desc: "Switch between Default HUD & ASCII Map View" },
  { cmd: "matrix", desc: "Unleash full-screen Matrix Construct Takeover" },
  { cmd: "breach", desc: "Launch Cyberpunk Breach Protocol hacking minigame" },
  { cmd: "celestial", desc: "Launch Celestial Zen Night Mode Arcade (3 modes)" },
  { cmd: "fortune", desc: "Display a random hacker/dev quote" },
  { cmd: "cowsay [msg]", desc: "Classic Linux cowsay ASCII art" },
  { cmd: "ping [host]", desc: "Ping remote hosts with simulated latency" },
  { cmd: "history", desc: "Show recent command history" },
  { cmd: "time", desc: "Display current Morocco (GMT+1) local time" },
  { cmd: "sudo", desc: "Request root elevation" },
  { cmd: "clear", desc: "Clear terminal buffer" },
  { cmd: "exit", desc: "Close terminal session" }
];

export const navLinks = [
  { name: "Overview", href: "#overview" },
  { name: "Repositories", href: "#repositories" },
  { name: "Principles", href: "#philosophy" },
  { name: "Pricing", href: "#pricing" },
  { name: "Arena", href: "#games" },
  { name: "Contact", href: "#contact" }
];
