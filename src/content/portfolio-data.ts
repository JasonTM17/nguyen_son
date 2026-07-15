import type { ExternalLink, PortfolioProject } from "../types/portfolio";
import type { PortfolioLanguage } from "../i18n/portfolio-language-context";

export const profileLinks: readonly ExternalLink[] = [
  { label: "GitHub", href: "https://github.com/JasonTM17" },
];

export const focusAreas = [
  "Learning full-stack products",
  "Real-time workflows",
  "Java & system design",
  "DevOps & applied AI",
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
  "Start from a real user workflow, then learn what the system actually needs.",
  "Build across web, mobile, service, and hardware boundaries — and document what each attempt teaches.",
  "Ask for feedback early, improve in public, and make the next iteration more reliable.",
] as const;

const vietnameseFocusAreas = [
  "Học sản phẩm full-stack",
  "Quy trình thời gian thực",
  "Java & thiết kế hệ thống",
  "DevOps & AI ứng dụng",
] as const;

const vietnameseSelectedProjectCopy = [
  {
    category: "Vận hành / giao nhận",
    description:
      "Nền tảng giao đồ ăn thời gian thực với API NestJS, ứng dụng vận hành Next.js, ứng dụng Flutter, Supabase Realtime/PostGIS và Docker.",
  },
  {
    category: "Mobile / tài chính",
    description:
      "Ứng dụng quản lý tài chính Flutter ưu tiên offline với PIN/sinh trắc học, SQLite, Riverpod và API Fastify/PostgreSQL.",
  },
  {
    category: "AI / lập kế hoạch du lịch",
    description: "Nền tảng du lịch Việt Nam với trình lập kế hoạch chuyến đi bằng AI, xây dựng bằng Next.js, Fastify và Docker.",
  },
  {
    category: "AI / hệ thống vật lý",
    description:
      "Hệ thống phân loại rác kết hợp YOLO, ứng dụng desktop PySide6, công cụ dashboard, UART/Arduino và Supabase.",
  },
] as const satisfies readonly Pick<PortfolioProject, "category" | "description">[];

const vietnameseWorkingPrinciples = [
  "Bắt đầu từ luồng công việc thật của người dùng, rồi học điều hệ thống thực sự cần.",
  "Xây dựng qua ranh giới web, mobile, service và hardware — đồng thời ghi lại điều mỗi lần thử nghiệm dạy mình.",
  "Xin góp ý sớm, cải thiện công khai và làm cho vòng lặp tiếp theo đáng tin cậy hơn.",
] as const;

export function getFocusAreas(language: PortfolioLanguage): readonly string[] {
  return language === "vi" ? vietnameseFocusAreas : focusAreas;
}

export function getSelectedProjects(language: PortfolioLanguage): readonly PortfolioProject[] {
  if (language === "en") return selectedProjects;

  return selectedProjects.map((project, index) => ({
    ...project,
    ...vietnameseSelectedProjectCopy[index],
  }));
}

export function getWorkingPrinciples(language: PortfolioLanguage): readonly string[] {
  return language === "vi" ? vietnameseWorkingPrinciples : workingPrinciples;
}
