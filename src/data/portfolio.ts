import { Shield, Code, Lock, Terminal, Mail, Github, Linkedin, Twitter, MessageSquare } from "lucide-react";

export const skills = [
  {
    icon: Shield,
    title: "Penetration Testing",
    items: ["Web Application Testing", "Network Penetration Testing", "Mobile App Security", "WiFi Penetration Testing", "API Security Testing"]
  },
  {
    icon: Terminal,
    title: "Security Tools",
    items: ["Burp Suite, OWASP ZAP", "Metasploit, Nmap", "Wireshark, tcpdump", "Ghidra, IDA Pro"]
  },
  {
    icon: Code,
    title: "Programming & Scripting",
    items: ["Python, Bash", "JavaScript, PHP", "PowerShell", "SQL"]
  },
  {
    icon: Lock,
    title: "Security Domains",
    items: ["OWASP Top 10", "Cloud Security (AWS, Azure)", "Incident Response", "Threat Intelligence"]
  }
];

export const projects = [
  {
    title: "LMA3za AI",
    description: "An advanced AI interface built using Google's Gemini API, focusing on intuitive interaction and rapid response generation.",
    tags: ["Google API", "React", "AI/ML"]
  },
  {
    title: "Code-to-Music Translator",
    description: "A creative project exploring the intersection of music and programming. Developed a system to generate musical patterns directly from code structures.",
    tags: ["Audio API", "JavaScript", "Algorithms"]
  },
  {
    title: "Multi-UI School Management",
    description: "A comprehensive web application for schools featuring multiple UI versions tailored for students, teachers, and administrators.",
    tags: ["Fullstack", "UI/UX", "Database"]
  },
  {
    title: "ZaneX Cyber Portfolio",
    description: "The interactive, easter-egg-filled portfolio you are currently exploring, designed with a focus on cybersecurity aesthetics.",
    tags: ["Framer Motion", "Tailwind", "React"]
  }
];

export const contactLinks = [
  { icon: Mail, label: "Email", href: "mailto:resandelgmin@gmail.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://pranx.com/fake-dos/" },
  { icon: MessageSquare, label: "WhatsApp", href: "/404" },
  { icon: Github, label: "GitHub", href: "https://github.com/RESAndel" },
  { icon: Twitter, label: "Twitter", href: "https://pranx.com/bios/" }
];
export const navLinks = ["About", "Dev Skills", "Projects", "Philosophy", "Games", "Contact"];
