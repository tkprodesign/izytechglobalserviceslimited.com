import { Camera, Cable, Cpu, Home, Sun, Zap } from "lucide-react";

export interface ServiceContent {
  id: string;
  num: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  color: string;
  featured: boolean;
}

export const serviceIcons = {
  solar: Sun,
  industrial: Cable,
  smartHome: Home,
  security: Camera,
  itTech: Cpu,
  electrical: Zap,
} as const;

export const serviceContent: ServiceContent[] = [
  {
    id: "solar",
    num: "01",
    title: "Solar Energy Systems",
    description:
      "Solar design, installation and energy storage for homes, businesses and industrial facilities. We build practical systems around your load profile, from hybrid backup to large commercial installations.",
    features: [
      "System Design & Sizing",
      "Solar Installation",
      "Inverter & Battery Systems",
      "Off-Grid & Hybrid Systems",
      "Preventive Maintenance",
      "Performance Monitoring",
    ],
    image: "/site-images/project-commercial-solar.jpg",
    color: "#F0A20E",
    featured: true,
  },
  {
    id: "industrial",
    num: "02",
    title: "Industrial Wiring",
    description:
      "Electrical infrastructure for facilities that need dependable distribution and backup power, including distribution boards, UPS systems, transfer switches and industrial power equipment.",
    features: [
      "Electrical Design",
      "Distribution Boards",
      "UPS & Backup Systems",
      "Transfer Switches",
      "Industrial Power Equipment",
      "Testing & Commissioning",
    ],
    image: "/site-images/project-power-unit.jpg",
    color: "#3B82F6",
    featured: false,
  },
  {
    id: "smartHome",
    num: "03",
    title: "Smart Home Automation",
    description:
      "We assess your property and plan connected home systems around lighting, access, security and everyday convenience, with the right infrastructure for a smooth integrated installation.",
    features: [
      "Site Assessment",
      "Lighting Control",
      "Smart Locks & Entry",
      "Security Integration",
      "Perimeter Security",
      "System Planning",
    ],
    image: "/site-images/project-site-team.jpg",
    color: "#8B5CF6",
    featured: false,
  },
  {
    id: "security",
    num: "04",
    title: "CCTV & Security",
    description:
      "Professional CCTV installation and surveillance for homes, businesses, vessels and industrial sites, with camera placement designed around the areas that need visibility most.",
    features: [
      "CCTV Installation",
      "Site Surveillance",
      "Remote Monitoring",
      "Access Control",
      "Perimeter Protection",
      "Security System Design",
    ],
    image: "/site-images/project-cctv.jpg",
    color: "#EF4444",
    featured: false,
  },
  {
    id: "itTech",
    num: "05",
    title: "IT & Tech Services",
    description:
      "Practical technology support for organisations, from computer and network installations to websites and digital brand systems that help teams connect and businesses show up online.",
    features: [
      "Computer Networking",
      "Network Infrastructure",
      "Device & Wi-Fi Setup",
      "Website Development",
      "Digital Brand Management",
      "IT Consulting",
    ],
    image: "/site-images/project-network-installation.jpg",
    color: "#10B981",
    featured: false,
  },
  {
    id: "electrical",
    num: "06",
    title: "General Electrical",
    description:
      "Electrical installation and finishing work for residential and commercial spaces, from lighting installations to safe power distribution, upgrades and ongoing maintenance.",
    features: [
      "Lighting Installation",
      "Electrical Installation",
      "Power Distribution",
      "Fault Finding",
      "Rewiring & Upgrades",
      "Electrical Maintenance",
    ],
    image: "/site-images/project-electrical-installation.jpg",
    color: "#F59E0B",
    featured: false,
  },
];

export const services = serviceContent.map((service) => ({
  ...service,
  icon: serviceIcons[service.id as keyof typeof serviceIcons] ?? Zap,
}));

export function withServiceIcons(content: ServiceContent[]) {
  return content.map((service) => ({
    ...service,
    icon: serviceIcons[service.id as keyof typeof serviceIcons] ?? Zap,
  }));
}