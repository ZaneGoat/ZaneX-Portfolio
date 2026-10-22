import { 
  Shield, Code, Lock, Terminal, Mail, Github, Globe, FileText, 
  Database, Cpu, Server, Layers, Wrench, Sparkles, Binary, CheckCircle2, Radio, Gamepad2, Wifi
} from "lucide-react";

export type Persona = "operator" | "friend";

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
  friendNote?: string;
}

export interface SkillCategory {
  title: string;
  icon: any;
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
    role: "Root Clearance Operator // Level 99",
    location: "Grid Casablanca [33.5731° N, 7.5898° W]",
    status: "ACTIVE // wlan0mon RF & Tor Proxy Online",
    os: "Kali Linux x86_64 [Kernel 4.2.0 Hardened]",
    shell: "zsh /dev/pts/0 (Root Privileges Granted)",
    uptime: "99.98% Cryptographic Integrity",
    bio: "Specialized in raw 802.11 Wi-Fi CSI subcarrier phase perturbation, multi-threaded Tor dark-web scraping, and direct MSI Embedded Controller memory I/O.",
    stats: [
      { value: "64", label: "OFDM Carriers" },
      { value: "3-Hop", label: "Tor Relay" },
      { value: "0x68", label: "EC Register" }
    ]
  },
  friend: {
    handle: "Zane Goat (Aziz)",
    realName: "Aziz Maaizate",
    role: "The Guy Who Breaks Things & Fixes Them at 3 AM",
    location: "Casablanca, Morocco 🇲🇦",
    status: "ONLINE // Sipping mint tea & writing code",
    os: "Beast MSI GF65 (Cooled with custom EC governor)",
    shell: "zsh (with 50 open terminal tabs)",
    uptime: "100% Homemade Caffeine & Code",
    bio: "Welcome to my lab! If you're a friend, you already know I spend way too much time in Linux terminals, hacking laptop fan curves, building ERPs from scratch, and gaming. Grab some tea and check out what I've been building below!",
    stats: [
      { value: "∞", label: "Terminal tabs" },
      { value: "3 AM", label: "Bug hunt hour" },
      { value: "100%", label: "Real code" }
    ]
  }
};

export const systemSpecs = systemSpecsByPersona.operator;

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

export const projectsData: Project[] = [];

export const friendLoungeData = {
  gamerTag: "ZaneGoat",
  favoriteGames: ["Cyberpunk 2077", "Counter-Strike 2", "Elden Ring", "Dead Cells"],
  vibeTrack: "Cyberpunk Synthwave & Moroccan Lo-Fi",
  teaIntake: "4+ Pots of Mint Tea per day 🍵",
  homieNote: "Thanks for dropping by! Hit the scratchpad below to leave a shoutout that saves right in your browser."
};

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
  { cmd: "controler [--gui]", desc: "DualSense & Gamepad calibration suite" },
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
  { name: "Repositories", href: "#repositories" },
  { name: "Tech Matrix", href: "#skills" },
  { name: "Terminal", href: "#terminal" },
  { name: "Minigame", href: "#games" },
  { name: "Contact", href: "#contact" }
];
