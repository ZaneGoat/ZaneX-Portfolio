import { 
  Shield, Code, Lock, Terminal, Mail, Github, Globe, FileText, 
  Database, Cpu, Server, Layers, Wrench, Sparkles, Binary, CheckCircle2
} from "lucide-react";

export interface Project {
  id: string;
  title: string;
  category: "ERP" | "AI" | "Security" | "Web";
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
  role: "Full-Stack ERP Architect & AI Specialist",
  location: "Morocco (GMT+1)",
  status: "Online / Ready for Deployments",
  os: "Kali Linux / Dual-Boot MSI GF65 Thin",
  shell: "zsh & bash automated workflows",
  uptime: "99.98% System Stability",
  bio: "Engineering enterprise-grade desktop & web ERP systems, automating complex pipelines with local LLMs (DeepSeek CLI, Ollama) & Google Gemini API, and analyzing systems from a security-first perspective."
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
      { name: "Bash & WSL Automations", level: 90, tag: "CLI Scripting" },
      { name: "Context Engineering & Tooling", level: 88, tag: "Agentic Systems" },
      { name: "Automated Docx/PDF Pipelines", level: 92, tag: "Report Engines" }
    ]
  },
  {
    title: "Offensive Security & Systems",
    icon: Shield,
    description: "Security-first development, system auditing, vulnerability research & hardware controls.",
    skills: [
      { name: "Kali Linux Environment", level: 92, tag: "OS & Tooling" },
      { name: "Network Auditing & Recon", level: 85, tag: "Pentest Fundamentals" },
      { name: "Hardware & EC Telemetry", level: 88, tag: "Low-Level / ISW" },
      { name: "Secure Authentication / JWT", level: 90, tag: "AppSec" },
      { name: "Defensive Hardening & Firewalls", level: 86, tag: "SysAdmin" }
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
    id: "optigest",
    title: "OptiGest ERP",
    category: "ERP",
    subtitle: "Enterprise Optical Clinic & Stock Management System",
    description: "Comprehensive desktop and web platform tailored for optometrists and optical retail centers. Manages client optical prescriptions, frames/lenses catalog with barcode support, billing engines, and one-click PDF/Docx medical reports.",
    highlights: [
      "Custom relational database schema with complex ERD modeling",
      "Automated optical prescription calculation and invoice generation",
      "CustomTkinter high-DPI desktop interface with SQLite engine",
      "Zero-latency barcode scanning and stock alert telemetry"
    ],
    tags: ["Python", "CustomTkinter", "SQLite", "ERD Modeling", "Docx Exporter"],
    status: "Production"
  },
  {
    id: "ayaresto",
    title: "AyaResto & Patisserie",
    category: "ERP",
    subtitle: "Real-Time Restaurant & Bakery POS Ecosystem",
    description: "Modern POS and digital order system built for dining establishments and bakeries. Includes customer mobile QR menu, live kitchen display system (KDS), table booking engine, and daily financial reconciliation.",
    highlights: [
      "Full-stack Flask + SQLAlchemy architecture with Glassmorphism UI",
      "Live order queuing and table allocation matrix",
      "Integrated daily cash flow analytics and inventory deduction",
      "Printable receipt generator with thermal POS printer support"
    ],
    tags: ["Flask", "Python", "SQLAlchemy", "Jinja2", "Modern CSS"],
    status: "Production"
  },
  {
    id: "zaneai",
    title: "ZaneAI Automation Suite",
    category: "AI",
    subtitle: "Autonomous Local LLM & Pipeline Agent Hub",
    description: "Modular AI orchestration suite bridging local models (Ollama, DeepSeek CLI) with the Google Gemini API. Automates code auditing, documentation synthesis, system telemetry monitoring, and file transformation.",
    highlights: [
      "Offline local inference with seamless fallback to cloud models",
      "CLI tools for high-throughput batch prompt execution",
      "Context-aware bash workflows integrated into Kali Linux",
      "Multi-agent reasoning pipelines for software refactoring"
    ],
    tags: ["Python", "Ollama", "DeepSeek CLI", "Gemini API", "Bash Automation"],
    status: "Active"
  },
  {
    id: "ipirnet",
    title: "IPIRNET & ScolarX",
    category: "ERP",
    subtitle: "Institutional Academic ERP & Attendance Portal",
    description: "Multi-role academic management system powering student enrollment, gradebook computation, attendance tracking ('Gestion-Absence'), and parent communications with strict RBAC permission matrices.",
    highlights: [
      "Role-Based Access Control (Admin, Teachers, Students, Parents)",
      "High-speed student attendance dashboard with exportable Excel ledgers",
      "Automated grade weighting engine and report card generation",
      "Enterprise SQL schema handling thousands of relational records"
    ],
    tags: ["Django/Flask", "Python", "SQLite", "Excel Engine", "RBAC Security"],
    status: "Production"
  },
  {
    id: "koraarena",
    title: "KoraArena Platform",
    category: "Web",
    subtitle: "Stadium & Sports Facility Dynamic Booking Engine",
    description: "End-to-end reservation platform connecting football players with private pitch facilities. Features real-time slot lock algorithms, manager analytics, and interactive venue scheduling.",
    highlights: [
      "Concurrency-safe slot reservation engine preventing double-bookings",
      "Facility owner revenue dashboards with dynamic pricing rules",
      "Responsive mobile-first interface designed for quick booking"
    ],
    tags: ["Flask", "Python", "SQLAlchemy", "JavaScript", "Responsive UI"],
    status: "Active"
  },
  {
    id: "pharmagest",
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
    status: "Production"
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
  { cmd: "skills", desc: "Inspect categorized technical proficiencies" },
  { cmd: "projects", desc: "List enterprise ERP, AI, and Web projects" },
  { cmd: "cat [project]", desc: "Inspect architectural deep-dive of a project" },
  { cmd: "theme [emerald|amber|cyan]", desc: "Switch live Cyberpunk HUD color scheme" },
  { cmd: "clear", desc: "Clear terminal buffer" },
  { cmd: "breach", desc: "Launch Cyberpunk Breach Protocol hacking minigame" },
  { cmd: "matrix [speed]", desc: "Adjust matrix rain velocity" },
  { cmd: "sudo", desc: "Request root access" },
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
