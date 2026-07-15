import type { PortfolioProject } from "../types/portfolio";
import type { PortfolioLanguage } from "../i18n/portfolio-language-context";
import { publicProjectArchiveVietnameseCopy } from "./public-project-archive-vi";

export const publicProjectArchive = [
  {
    category: "Operations / delivery",
    title: "FoodFlow",
    description: "Real-time food delivery with NestJS, Next.js operations apps, Flutter, Supabase Realtime/PostGIS, and Docker.",
    tags: ["NestJS", "Next.js", "Flutter", "Supabase"],
    href: "https://github.com/JasonTM17/FoodDelivery_App",
  },
  {
    category: "Mobility / operations",
    title: "Crab",
    description: "Ride-hailing, food delivery, wallet, real-time chat, and operations flows across Flutter, React, NestJS, Docker, and CI.",
    tags: ["Flutter", "React", "NestJS", "Docker"],
    href: "https://github.com/JasonTM17/Crab_Mobile_Flutter",
  },
  {
    category: "Mobile / finance",
    title: "Money Management",
    description: "Offline-first personal finance with PIN/biometrics, SQLite, Riverpod, Fastify/PostgreSQL, containers, and HMAC automation.",
    tags: ["Flutter", "SQLite", "Fastify", "PostgreSQL"],
    href: "https://github.com/JasonTM17/Money_Management_App",
  },
  {
    category: "AI / travel planning",
    title: "VN TravelAI",
    description: "Vietnam travel marketplace and AI trip planner built with Next.js, Fastify, DeepSeek, and Docker.",
    tags: ["Next.js", "Fastify", "DeepSeek", "Docker"],
    href: "https://github.com/JasonTM17/VN_TravelAI",
  },
  {
    category: "AI / physical systems",
    title: "AI-powered waste sorting",
    description: "YOLO waste sorting with PySide6 control, a Next.js dashboard, UART/Arduino, Supabase, and EcoPet AI.",
    tags: ["Python", "YOLO", "Arduino", "Supabase"],
    href: "https://github.com/JasonTM17/App_AI_powered_waste_sorting",
  },
  {
    category: "Cloud / microservices",
    title: "DevHire Cloud",
    description: "Java 21 Spring Boot recruitment microservices with Kafka, OpenSearch, Docker, Kubernetes, Terraform, observability, CI/CD, and RAG.",
    tags: ["Java", "Spring Boot", "Kubernetes", "Terraform"],
    href: "https://github.com/JasonTM17/DevHire_Cloud_Spring_Microservices",
  },
  {
    category: "DevOps / platform",
    title: "Internal Developer Platform",
    description: "A self-service developer platform using GitOps, EKS, Terraform, and observability practices.",
    tags: ["GitOps", "EKS", "Terraform", "Observability"],
    href: "https://github.com/JasonTM17/Internal_Developer_Platform_DevOps",
  },
  {
    category: "University / operations",
    title: "CampusCore",
    description: "University operations platform with Next.js, NestJS microservices, bilingual UX, observability, and sandbox-ready student payments.",
    tags: ["Next.js", "NestJS", "Microservices", "Observability"],
    href: "https://github.com/JasonTM17/CampusCore_FullStack_Individual",
  },
  {
    category: "Algorithms / learning",
    title: "LeetRank",
    description: "Algorithms and data-structure practice platform with Next.js, React, a Go judge service, and Docker.",
    tags: ["Next.js", "React", "Go", "Docker"],
    href: "https://github.com/JasonTM17/Leetrank_Project",
  },
  {
    category: "Media / streaming",
    title: "Wavestream",
    description: "SoundCloud-inspired music platform built with Next.js, NestJS, PostgreSQL, Redis, MinIO, Docker, and GitHub Actions.",
    tags: ["Next.js", "NestJS", "Redis", "MinIO"],
    href: "https://github.com/JasonTM17/Wavestream_Soundcloud",
  },
  {
    category: "Learning / language",
    title: "LinguaFlow",
    description: "Language-learning platform with spaced repetition, gamification, personalised paths, Next.js, Express, Prisma, and Docker.",
    tags: ["Next.js", "Express", "Prisma", "Docker"],
    href: "https://github.com/JasonTM17/Language_App",
  },
  {
    category: "Commerce / e-commerce",
    title: "MilkTea Iku",
    description: "A premium milk-tea e-commerce platform.",
    tags: ["TypeScript", "E-commerce"],
    href: "https://github.com/JasonTM17/MilkTea_Iku",
  },
  {
    category: "Commerce / fashion",
    title: "ON/OFF",
    description: "Fashion e-commerce with Next.js, TypeScript, Tailwind CSS, Prisma, PWA, an admin dashboard, and Docker.",
    tags: ["Next.js", "Prisma", "PWA", "Docker"],
    href: "https://github.com/JasonTM17/ON-OFF_JS",
  },
  {
    category: "Travel / full stack",
    title: "WanderViet",
    description: "Vietnam travel platform with NestJS, Next.js, FastAPI AI, Flutter, pnpm, and Turborepo.",
    tags: ["NestJS", "Next.js", "FastAPI", "Flutter"],
    href: "https://github.com/JasonTM17/ChillTravel_NextJS",
  },
  {
    category: "Commerce / Java",
    title: "Laptop Shop",
    description: "Spring Boot MVC laptop e-commerce with storefront, checkout, an admin dashboard, tests, Docker, and CI.",
    tags: ["Java", "Spring Boot", "Docker", "CI"],
    href: "https://github.com/JasonTM17/Laptopshop_Spring_Boot_MVC",
  },
  {
    category: "Commerce / full stack",
    title: "BookStore",
    description: "Full-stack online bookstore built with Next.js and Spring Boot.",
    tags: ["Next.js", "Java", "Spring Boot"],
    href: "https://github.com/JasonTM17/Ecommerce_BookStore",
  },
  {
    category: "Recruitment / full stack",
    title: "JobHunter",
    description: "IT recruitment platform with Spring Boot, Next.js, MySQL, Docker, RBAC, end-to-end, and visual regression coverage.",
    tags: ["Spring Boot", "Next.js", "MySQL", "Docker"],
    href: "https://github.com/JasonTM17/JobHunter_SpringBoot_RestfulAPI_React",
  },
  {
    category: "AI / algorithms",
    title: "15-puzzle AI Lab",
    description: "Interactive AI learning lab with auditable search traces, benchmarks, gameplay, and CSP map coloring.",
    tags: ["Python", "AI", "Search", "CSP"],
    href: "https://github.com/JasonTM17/AI_Algothrithm_Study_University",
  },
  {
    category: "AI / algorithms",
    title: "8-puzzle AI Lab",
    description: "Streamlit AI lab for 8-puzzle search, local search, CSP, adversarial demos, trace playback, and an image puzzle game.",
    tags: ["Python", "Streamlit", "AI", "Search"],
    href: "https://github.com/JasonTM17/AI_Algothrithm_Invidual_Study_University",
  },
] as const satisfies readonly PortfolioProject[];

export function getPublicProjectArchive(language: PortfolioLanguage): readonly PortfolioProject[] {
  if (language === "en") return publicProjectArchive;

  return publicProjectArchive.map((project, index) => ({
    ...project,
    ...publicProjectArchiveVietnameseCopy[index],
  }));
}
