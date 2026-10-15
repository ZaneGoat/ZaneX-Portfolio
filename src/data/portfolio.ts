import { 
  Shield, Code, Lock, Terminal, Mail, Github, Globe, FileText, 
  Database, Cpu, Server, Layers, Wrench, Sparkles, Binary, CheckCircle2, Radio, Gamepad2, Wifi
} from "lucide-react";

export interface Project {
  id: string;
  title: string;
  category: "ERP" | "AI" | "Security" | "Systems" | "Web";
  subtitle: string;
  description: string;
  highlights: string[];
  tags: string[];
  status: "Production" | "Active" | "Showcase";
  github?: string;
  live?: string;
}

export interface SkillCategory {
  title: string;
  icon: any;
  description: string;
  skills: { name: string; level: number; tag: string }[];
}

export const systemSpecs = {
  handle: "Zane Goat",
  realName: "Aziz Maaizate",
  role: "Full-Stack ERP Architect, AI Specialist & Systems Engineer",
  location: "Morocco (GMT+1)",
  status: "Online / Ready for Deployments",
  os: "Kali Linux / Dual-Boot MSI GF65 Thin",
  shell: "zsh & bash automated workflows",
  uptime: "99.98% System Stability",
  bio: "Engineering enterprise-grade desktop & web ERP systems, developing hardware EC control tools, Wi-Fi CSI sensing radars, and AI-powered OSINT platforms."
};

export const skillsData: SkillCategory[] = [
  {
    title: "Full-Stack & ERP Engineering",
    icon: Database,
    description: "Multi-tier business platforms, relational database schemas, and desktop POS suites.",
    skills: [
      { name: "Python (Flask / Django)", level: 95, tag: "Backend Core" },
      { name: "CustomTkinter & PyQt", level: 92, tag: "Desktop ERP" },
      { name: "SQL, SQLite & SQLAlchemy", level: 90, tag: "Relational DBs" },
      { name: "React, Vite & TailwindCSS", level: 88, tag: "Modern Frontend" },
      { name: "RESTful Architecture & RBAC", level: 90, tag: "Security & API" }
    ]
  },
  {
    title: "AI & Agentic Automation",
    icon: Cpu,
    description: "Local inference workflows, autonomous scripting, and LLM API integrations.",
    skills: [
      { name: "Local LLMs (Ollama & DeepSeek)", level: 94, tag: "Private AI" },
      { name: "Google Gemini API Pipelines", level: 92, tag: "Model Integrations" },
      { name: "Dark Web OSINT Scraping", level: 88, tag: "Recon & Tor" },
      { name: "Context Engineering & Tooling", level: 88, tag: "Agentic Systems" },
      { name: "Automated Docx/PDF Pipelines", level: 92, tag: "Report Engines" }
    ]
  },
  {
    title: "Offensive Security & Systems",
    icon: Shield,
    description: "Low-level EC registers, Wi-Fi CSI Doppler radar, hardware telemetry & network auditing.",
    skills: [
      { name: "Wi-Fi CSI Sensing & Radar", level: 90, tag: "RF Sensing" },
      { name: "Embedded Controller (EC) I/O", level: 92, tag: "Hardware Tuning" },
      { name: "Kali Linux Environment", level: 92, tag: "OS & Tooling" },
      { name: "Network Auditing & Recon", level: 85, tag: "Pentest Fundamentals" },
      { name: "Gamepad & HID Drivers", level: 88, tag: "Device Input" }
    ]
  },
  {
    title: "DevOps & Cloud Deployments",
    icon: Server,
    description: "Isolated environments, continuous deployment pipelines, and microservice stacks.",
    skills: [
      { name: "Docker Containerization", level: 88, tag: "Microservices" },
      { name: "Git & GitHub CI/CD", level: 92, tag: "Version Control" },
      { name: "Vercel & Cloud Edge", level: 90, tag: "Deployment" },
      { name: "Linux System Hardening", level: 88, tag: "Infrastructure" }
    ]
  }
];

export const projectsData: Project[] = [
  {
    id: "robin",
    title: "Robin OSINT Suite",
    category: "Security",
    subtitle: "AI-Powered Dark Web Intelligence & Recon Tool",
    description: "Autonomous threat intelligence and OSINT scraping suite operating over the Tor network. Crawls hidden onion services, parses PGP keys, extracts exposed artifacts, and synthesizes findings using local LLMs.",
    highlights: [
      "Automated multi-hop Tor proxy routing & hidden service crawler",
      "LLM-powered threat summarization and entity extraction",
      "Credential leak parsing and cross-referencing algorithms",
      "CLI report export in Markdown, JSON, and encrypted bundles"
    ],
    tags: ["Python", "Tor Network", "AI / LLM", "OSINT", "Dark Web"],
    status: "Active",
    github: "https://github.com/ZaneGoat/robin"
  },
  {
    id: "csi",
    title: "CSI Wi-Fi Sensing Radar",
    category: "Security",
    subtitle: "Camera-Free Human Presence & Doppler Motion Recognition",
    description: "Non-invasive physical motion recognition engine that extracts raw Channel State Information (CSI) from 802.11 Wi-Fi packets. Uses Doppler frequency shifts and subcarrier phase analysis to detect human movement through walls without optical cameras.",
    highlights: [
      "Subcarrier amplitude & phase sanitization pipeline",
      "Doppler velocity profile calculation for gesture recognition",
      "Privacy-preserving contactless presence verification",
      "Real-time radar display and alert telemetry"
    ],
    tags: ["Python", "Wi-Fi CSI", "RF Sensing", "Signal Processing", "Radar"],
    status: "Active",
    github: "https://github.com/ZaneGoat/csi_project"
  },
  {
    id: "zanemegacenter",
    title: "Zane Mega Center",
    category: "Systems",
    subtitle: "Low-Level EC Hardware & Fan Curve Controller",
    description: "Hardware telemetry and cooling management workstation built specifically for MSI GF65 laptops on Linux. Directly addresses Embedded Controller (EC) registers to override hardware fan speeds, monitor CPU/GPU thermal sensors, and bypass aggressive thermal throttling.",
    highlights: [
      "Direct EC register read/write operations (0x68-0x90 registers)",
      "Dynamic custom fan curve algorithms based on CPU/GPU thermal delta",
      "Modern CustomTkinter desktop interface with real-time gauges",
      "Safe register readback validation preventing hardware stalls"
    ],
    tags: ["Python", "CustomTkinter", "Linux EC", "Hardware Tuning", "ISW"],
    status: "Active",
    github: "https://github.com/ZaneGoat/ZaneMegaCenter"
  },
  {
    id: "optigest",
    title: "OptiGest ERP",
    category: "ERP",
    subtitle: "Enterprise Optical Clinic & Stock Management System",
    description: "Comprehensive desktop and web platform tailored for optometrists and optical retail centers. Manages client optical prescriptions, frames/lenses catalog with barcode support, billing engines, and automated Docx medical exports.",
    highlights: [
      "Custom relational database schema with complex ERD modeling",
      "Automated optical prescription calculation and invoice generation",
      "CustomTkinter high-DPI desktop interface with SQLite engine",
      "Zero-latency barcode scanning and stock alert telemetry"
    ],
    tags: ["Python", "CustomTkinter", "SQLite", "ERD Modeling", "Docx Exporter"],
    status: "Production",
    github: "https://github.com/ZaneGoat/Gestion-optic"
  },
  {
    id: "smart-appointments",
    title: "Smart Appointment System",
    category: "Web",
    subtitle: "Automated Booking & Multi-Channel Reminder Platform",
    description: "Comprehensive appointment reservation platform designed for medical clinics, consultancies, and service businesses. Features automated client notifications, conflict-free scheduling algorithms, and practitioner calendars.",
    highlights: [
      "Concurrency-safe slot reservation engine preventing overlapping bookings",
      "Automated notification triggers via Email and Webhooks",
      "Interactive multi-view calendar (Day, Week, Month) with quick reschedule",
      "Admin dashboard with appointment attendance and cancellation metrics"
    ],
    tags: ["Python", "Flask", "SQLite", "Calendar Engine", "Notifications"],
    status: "Production",
    github: "https://github.com/ZaneGoat/smart-appointment-system"
  },
  {
    id: "ayaresto",
    title: "AyaResto & Pizzeria POS",
    category: "ERP",
    subtitle: "Real-Time Restaurant & Pizzeria Management Platform",
    description: "Modern POS and digital order system built for dining establishments. Includes live kitchen display system (KDS), table management, order queue matrix, and daily financial reconciliation.",
    highlights: [
      "Full-stack Flask + SQLAlchemy architecture with Glassmorphism UI",
      "Live order queuing and table allocation matrix",
      "Integrated daily cash flow analytics and inventory deduction",
      "Printable receipt generator with thermal POS printer support"
    ],
    tags: ["Python", "Flask", "SQLAlchemy", "Jinja2", "Modern CSS"],
    status: "Production",
    github: "https://github.com/ZaneGoat/Ousdi"
  },
  {
    id: "highway-sys",
    title: "Highway-Sys Flow Engine",
    category: "Systems",
    subtitle: "Toll Station Automation & Traffic Flow Management",
    description: "High-throughput toll booth transit management system. Features vehicle classification telemetry, barrier gate controller logic, daily transit revenue ledgers, and traffic congestion analytics.",
    highlights: [
      "Vehicle classification state machine (Light, Heavy, Emergency)",
      "Automated toll ticket generation and barcode validation",
      "Daily audit ledgers with shift supervisor reconciliation",
      "Real-time lane throughput telemetry"
    ],
    tags: ["Python", "SQLite", "State Machine", "Hardware I/O", "Traffic"],
    status: "Production",
    github: "https://github.com/ZaneGoat/Highway-Sys"
  },
  {
    id: "controllerspace",
    title: "ControllerSpace Engine",
    category: "Systems",
    subtitle: "DualSense & Gamepad Custom Telemetry Suite",
    description: "Low-latency gamepad remapping and calibration suite. Allows configuring deadzones, custom button bindings, haptic rumble feedback triggers, and virtual stick curves on Linux/Windows.",
    highlights: [
      "Direct raw HID input parsing with sub-millisecond polling",
      "Interactive deadzone & stick curve visualizer",
      "Custom vibration profiles and battery level telemetry",
      "Zero-latency system tray background service"
    ],
    tags: ["Python", "PyQt/CustomTkinter", "HID API", "Gamepad Drivers"],
    status: "Active",
    github: "https://github.com/ZaneGoat/Controler-space"
  },
  {
    id: "pharmacie",
    title: "PharmaGest POS",
    category: "ERP",
    subtitle: "Pharmacy Inventory & Drug Expiry Protection",
    description: "Critical retail pharmaceutical software featuring expiry tracking, supplier supply chains, prescription validation, and regulatory compliance logging.",
    highlights: [
      "Automated 30/60/90-day expiry threshold alerts",
      "Drug interaction warning database and barcode lookup",
      "Daily ledger tracking with profit-margin auditing"
    ],
    tags: ["Python", "SQL", "Custom POS UI", "Inventory Logic"],
    status: "Production",
    github: "https://github.com/ZaneGoat/Pharmacie"
  },
  {
    id: "school-hub",
    title: "School Hub & ScolarX",
    category: "Web",
    subtitle: "TypeScript Academic Administration Dashboard",
    description: "Modern institutional portal powering student enrollment, gradebook computation, attendance tracking, and parent communications with strict RBAC permission matrices.",
    highlights: [
      "TypeScript & React single-page administrative dashboard",
      "Role-Based Access Control (Admin, Teachers, Students, Parents)",
      "Automated grade weighting engine and report card generation",
      "Excel/CSV export pipelines for governmental reporting"
    ],
    tags: ["TypeScript", "React", "TailwindCSS", "RBAC Security", "Dashboard"],
    status: "Active",
    github: "https://github.com/ZaneGoat/school-hub-dashboard"
  }
];

export const contactLinks = [
  { icon: Mail, label: "Email", href: "mailto:azizmaaizat@outlook.com", display: "azizmaaizat@outlook.com" },
  { icon: Github, label: "GitHub", href: "https://github.com/ZaneGoat", display: "github.com/ZaneGoat" },
  { icon: Globe, label: "Live Portfolio", href: "https://github.com/ZaneGoat/ZaneX-Portfolio", display: "ZaneX-Portfolio" }
];

export const terminalCommandsHelp = [
  { cmd: "help", desc: "List all available terminal commands" },
  { cmd: "neofetch", desc: "Display ZaneOS system telemetry and specs" },
  { cmd: "whoami", desc: "Display operator identity & security clearance" },
  { cmd: "ctf [flag]", desc: "Hack My Portfolio CTF bounty board & flag submission" },
  { cmd: "csi [--gui]", desc: "Wi-Fi CSI Doppler radar & 64 OFDM subcarrier visualizer" },
  { cmd: "robin [--map]", desc: "Dark-web OSINT crawler & Tor threat intelligence map" },
  { cmd: "hardware [--gui]", desc: "MSI GF65 EC hardware simulator & live fan curve tuner" },
  { cmd: "projects", desc: "List all enterprise ERP, AI, Systems, and Security projects" },
  { cmd: "cat [id]", desc: "Inspect architectural deep-dive of any project or file" },
  { cmd: "curl [url]", desc: "Simulate HTTP request (e.g. curl /robots.txt)" },
  { cmd: "repo [id]", desc: "Open the GitHub repository for any project" },
  { cmd: "skills", desc: "Inspect categorized technical proficiencies" },
  { cmd: "theme [theme]", desc: "Switch HUD color scheme: emerald, amber, or cyan" },
  { cmd: "matrix", desc: "Unleash full-screen Matrix Construct Takeover" },
  { cmd: "breach", desc: "Launch Cyberpunk Breach Protocol hacking minigame" },
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
  { name: "Projects", href: "#projects" },
  { name: "Tech Matrix", href: "#skills" },
  { name: "Terminal", href: "#terminal" },
  { name: "Minigame", href: "#games" },
  { name: "Contact", href: "#contact" }
];
