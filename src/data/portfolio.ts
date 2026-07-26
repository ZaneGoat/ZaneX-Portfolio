import { Shield, Code, Lock, Terminal, Mail, Github, Globe, FileText, Database, Cpu } from "lucide-react";

export const skills = [
  {
    icon: Code,
    title: "Full-Stack & Web Dev",
    items: ["Python, Flask, Django", "JavaScript (ES6+), HTML5, CSS3", "React, TailwindCSS, Vite", "RESTful APIs & UI/UX Design"]
  },
  {
    icon: Cpu,
    title: "AI & Automation",
    items: ["Local LLM Setup (Ollama, DeepSeek)", "Google Gemini API Integration", "WSL & Bash Automation Scripts", "Prompt Engineering & Pipelines"]
  },
  {
    icon: Database,
    title: "ERP Systems & Databases",
    items: ["SQL, SQLite, SQLAlchemy", "CustomTkinter Desktop Apps", "ERD Modeling & Database Architecture", "Docx & PDF Automated Exports"]
  },
  {
    icon: Lock,
    title: "DevOps & Infrastructure",
    items: ["Docker & Microservices", "Vercel Cloud Deployment", "Git, GitHub CI/CD Workflows", "Role-Based Access Control (RBAC)"]
  }
];

export const projects = [
  {
    title: "OptiGest – Optical Store ERP",
    description: "Desktop & Web ERP tailored for opticians. Features client prescription archives, frame/lens stock management, automated billing, and custom report exports.",
    tags: ["Python", "CustomTkinter", "SQLite", "ERD", "Docx Exports"]
  },
  {
    title: "AyaResto & Patisserie ERP",
    description: "Modern restaurant and bakery management platform with customer digital ordering, table reservations, invoice calculation, and real-time delivery status dashboard.",
    tags: ["Python", "Flask", "SQLAlchemy", "Jinja2", "Glassmorphism CSS"]
  },
  {
    title: "KoraArena – Pitch Booking Platform",
    description: "Sports stadium and football pitch reservation platform. Players can browse slot schedules, reserve fields, and field owners track revenue analytics.",
    tags: ["Flask", "Python", "SQLAlchemy", "HTML5/JS", "PFE System"]
  },
  {
    title: "IPIRNET & ScolarX – Academic ERP",
    description: "School management portal powering student enrollment, attendance tracking (Gestion-Absence), gradebook records, and financial payment exports.",
    tags: ["Python", "Django/Flask", "SQLite", "CSV/Excel Exporter", "RBAC"]
  },
  {
    title: "ZaneAI – Local LLM Automation",
    description: "Suite of custom AI tools and automation pipelines connecting local LLMs (Ollama, DeepSeek CLI) and Google Gemini API for automated task execution.",
    tags: ["Python", "Ollama", "DeepSeek CLI", "Gemini API", "WSL/Bash"]
  },
  {
    title: "PharmaGest – Pharmacy Management",
    description: "Pharmacy inventory & prescription POS software with automated drug stock tracking, expiration alerts, supplier management, and daily sales ledgers.",
    tags: ["Python", "SQL", "Custom POS UI", "Inventory Logic"]
  },
  {
    title: "ZaneX Deployment Hub",
    description: "Containerized deployment architecture hosting microservices and showcase applications with continuous deployment to Vercel and cloud containers.",
    tags: ["Docker", "Vercel", "Node.js", "Microservices", "Git"]
  },
  {
    title: "PizzaTime & Traiteur Événements",
    description: "Web ordering and event catering package estimator platforms featuring dynamic menu builders, custom package pricing, and quote approval workflows.",
    tags: ["Flask", "Python", "SQLite", "Quote Engine", "JavaScript"]
  }
];

export const contactLinks = [
  { icon: Mail, label: "Email", href: "mailto:azizmaaizat@outlook.com" },
  { icon: Github, label: "GitHub", href: "https://github.com/ZaneGoat/" },
  { icon: Globe, label: "Portfolio Live", href: "https://spinach-chevron-riverboat.ngrok-free.dev/" },
  { icon: FileText, label: "Coded CV (PDF)", href: "/Coded%20CV.pdf" }
];

export const navLinks = ["About", "Dev Skills", "Projects", "Philosophy", "Games", "Contact"];
