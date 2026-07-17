const projectFacts = [
  ["AgriCore SpringBoot Microservices", "AgriCore_SpringBoot_Microservices", "Java 21 and Spring Boot microservices learning platform for agricultural operations, with an API gateway, identity, farm and crop services, PostgreSQL, Redis, Kafka-ready messaging, Docker, tests, and CI.", "agriculture java spring boot microservices postgresql redis kafka docker devops"],
  ["Horror Game Funny", "Horror_Game_Funny", "ROOM 407: THE LAST SHIFT — a source-only first-person psychological horror learning project built with Godot 4.7.1 and GDScript.", "first person psychological horror game godot gdscript"],
  ["FoodFlow", "FoodDelivery_App", "Real-time food delivery with NestJS, Next.js operations apps, Flutter, Supabase Realtime/PostGIS, and Docker.", "delivery nestjs nextjs flutter supabase realtime"],
  ["Crab", "Crab_Mobile_Flutter", "Ride-hailing, food delivery, wallet, real-time chat, and operations flows across Flutter, React, NestJS, Docker, and CI.", "mobility ride hailing flutter react nestjs"],
  ["Money Management", "Money_Management_App", "Offline-first Flutter finance app with PIN/biometrics, SQLite, Riverpod, Fastify/PostgreSQL, containers, and HMAC automation.", "finance flutter sqlite fastify postgresql"],
  ["VN TravelAI", "VN_TravelAI", "Vietnam travel marketplace and AI trip planner with Next.js, Fastify, DeepSeek, and Docker.", "travel ai deepseek nextjs fastify"],
  ["AI-powered waste sorting", "App_AI_powered_waste_sorting", "YOLO waste sorting with PySide6 control, a Next.js dashboard, UART/Arduino, Supabase, and EcoPet AI.", "yolo waste arduino python physical ai"],
  ["DevHire Cloud", "DevHire_Cloud_Spring_Microservices", "Java 21 Spring Boot recruitment microservices with Kafka, OpenSearch, Docker, Kubernetes, Terraform, observability, CI/CD, and RAG.", "java spring boot microservices kafka kubernetes terraform devops rag"],
  ["Internal Developer Platform", "Internal_Developer_Platform_DevOps", "Self-service developer platform using GitOps, EKS, Terraform, and observability.", "devops gitops eks terraform platform"],
  ["CampusCore", "CampusCore_FullStack_Individual", "University operations platform with Next.js, NestJS microservices, bilingual UX, observability, and sandbox-ready student payments.", "university nextjs nestjs microservices observability"],
  ["LeetRank", "Leetrank_Project", "Algorithms and data-structure practice platform with Next.js, React, a Go judge service, and Docker.", "algorithms data structure go judge react"],
  ["Wavestream", "Wavestream_Soundcloud", "SoundCloud-inspired music platform using Next.js, NestJS, PostgreSQL, Redis, MinIO, Docker, and GitHub Actions.", "music soundcloud nestjs redis minio github actions"],
  ["LinguaFlow", "Language_App", "Language-learning platform with spaced repetition, gamification, personalised paths, Next.js, Express, Prisma, and Docker.", "language learning spaced repetition express prisma"],
  ["MilkTea Iku", "MilkTea_Iku", "Premium milk-tea e-commerce platform.", "milk tea ecommerce typescript"],
  ["ON/OFF", "ON-OFF_JS", "Fashion e-commerce with Next.js, TypeScript, Tailwind CSS, Prisma, PWA, an admin dashboard, and Docker.", "fashion ecommerce nextjs prisma pwa"],
  ["WanderViet", "ChillTravel_NextJS", "Vietnam travel platform with NestJS, Next.js, FastAPI AI, Flutter, pnpm, and Turborepo.", "travel vietnam nestjs fastapi flutter"],
  ["Laptop Shop", "Laptopshop_Spring_Boot_MVC", "Spring Boot MVC laptop e-commerce with storefront, checkout, admin dashboard, tests, Docker, and CI.", "java spring boot mvc ecommerce"],
  ["BookStore", "Ecommerce_BookStore", "Full-stack online bookstore built with Next.js and Spring Boot.", "bookstore java spring boot nextjs"],
  ["JobHunter", "JobHunter_SpringBoot_RestfulAPI_React", "IT recruitment platform with Spring Boot, Next.js, MySQL, Docker, RBAC, end-to-end, and visual regression coverage.", "jobs recruitment java spring boot mysql rbac"],
  ["15-puzzle AI Lab", "AI_Algothrithm_Study_University", "Interactive AI learning lab with auditable search traces, benchmarks, gameplay, and CSP map coloring.", "python ai puzzle search csp algorithms"],
  ["8-puzzle AI Lab", "AI_Algothrithm_Invidual_Study_University", "Streamlit AI lab for 8-puzzle search, local search, CSP, adversarial demos, trace playback, and an image puzzle game.", "python streamlit ai puzzle search csp"],
];

const DEFAULT_STUDENT_PROFILE = "Nguyen Son is a student developer who is learning in public and welcomes constructive feedback and support from the community.";
const DISALLOWED_PROFILE_CONTENT = /\b(api[\s_-]?key|authorization|bearer|contact|dia\s+chi|dien\s+thoai|email|password|phone|private\s+key|secret|token)\b|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?84|0)\d{8,10}/i;

export function getPublicStudentProfile() {
  const configuredProfile = process.env.PORTFOLIO_ASSISTANT_PROFILE
    ?.replace(/\s+/g, " ")
    .trim();

  // This configuration is for owner-approved biography only. Never turn it into a
  // general-purpose prompt or pass it through when it resembles a credential.
  if (!configuredProfile || configuredProfile.length > 500 || DISALLOWED_PROFILE_CONTENT.test(configuredProfile)) {
    return DEFAULT_STUDENT_PROFILE;
  }

  return configuredProfile;
}

function getStudentProfile() {
  return {
    id: "student-profile",
    title: "Student profile",
    keywords: "nguyen son student information technology university age feedback community",
    content: getPublicStudentProfile(),
  };
}

const foundationDocuments = [
  getStudentProfile(),
  {
    id: "learning-focus",
    title: "Learning focus",
    keywords: "devops software engineering java systems system design learning skills interests",
    content: "Son is especially interested in DevOps, software engineering, Java, and systems. His portfolio documents a learning path across full-stack products, real-time workflows, mobile applications, applied AI, cloud delivery, observability, and platform engineering.",
  },
  {
    id: "portfolio-catalog",
    title: "Portfolio catalog",
    keywords: "how many projects repository repositories github public portfolio archive",
    content: "The portfolio archive automatically follows Son's current public GitHub project repositories. The GitHub profile README and the portfolio repository itself are metadata repositories, not project entries. Four curated learning projects are featured while the full archive refreshes from GitHub.",
  },
  {
    id: "assistant-boundary",
    title: "Assistant scope",
    keywords: "assistant chatbot ask answer contact email personal private api key instructions",
    content: "The portfolio assistant answers questions about Son's public portfolio, learning path, and verified public repositories. It does not have private contact details, private source code, credentials, API keys, or information beyond the supplied portfolio context.",
  },
];

export const portfolioDocuments = [
  ...foundationDocuments,
  ...projectFacts.map(([title, repository, summary, keywords]) => ({
    id: repository,
    kind: "project",
    title: `${title} project`,
    keywords: `${title} ${repository} ${keywords}`,
    content: `${title} (${repository}): ${summary}`,
  })),
];
