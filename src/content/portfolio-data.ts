import type { ExternalLink, PortfolioProject } from "../types/portfolio";

export const profileLinks: readonly ExternalLink[] = [
  { label: "GitHub", href: "https://github.com/JasonTM17" },
];

export const focusAreas = [
  "Full-stack products",
  "Real-time workflows",
  "Mobile applications",
  "Applied AI systems",
] as const;

export const selectedProjects = [
  {
    category: "Operations / delivery",
    title: "FoodFlow",
    description:
      "A real-time food-delivery platform with a NestJS API, Next.js operations apps, Flutter clients, Supabase Realtime/PostGIS, and Docker.",
    tags: ["NestJS", "Next.js", "Flutter", "Supabase"],
    href: "https://github.com/JasonTM17/FoodDelivery_App",
  },
  {
    category: "Mobile / finance",
    title: "Money Management",
    description:
      "An offline-first Flutter finance app with PIN/biometrics, SQLite, Riverpod, and a Fastify/PostgreSQL API.",
    tags: ["Flutter", "SQLite", "Fastify", "PostgreSQL"],
    href: "https://github.com/JasonTM17/Money_Management_App",
  },
  {
    category: "AI / travel planning",
    title: "VN TravelAI",
    description:
      "A Vietnam travel marketplace with an AI trip planner, built with Next.js, Fastify, and Docker.",
    tags: ["Next.js", "Fastify", "AI", "Docker"],
    href: "https://github.com/JasonTM17/VN_TravelAI",
  },
  {
    category: "AI / physical systems",
    title: "AI-powered waste sorting",
    description:
      "A waste-sorting system that brings together YOLO, a PySide6 desktop app, dashboard tooling, UART/Arduino, and Supabase.",
    tags: ["Python", "YOLO", "Arduino", "Supabase"],
    href: "https://github.com/JasonTM17/App_AI_powered_waste_sorting",
  },
] as const satisfies readonly PortfolioProject[];

export const workingPrinciples = [
  "Start from the real user workflow, then make the system earn its complexity.",
  "Keep interfaces clear across web, mobile, service, and hardware boundaries.",
  "Make reliability visible through thoughtful states, observability, and delivery tooling.",
] as const;
