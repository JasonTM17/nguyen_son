import type { PortfolioProject } from "../types/portfolio";

type VietnameseArchiveProjectCopy = Pick<PortfolioProject, "category" | "description">;

export const publicProjectArchiveVietnameseCopy = [
  { category: "Vận hành / giao nhận", description: "Giao đồ ăn thời gian thực với NestJS, ứng dụng vận hành Next.js, Flutter, Supabase Realtime/PostGIS và Docker." },
  { category: "Di chuyển / vận hành", description: "Các luồng gọi xe, giao đồ ăn, ví, chat thời gian thực và vận hành trên Flutter, React, NestJS, Docker và CI." },
  { category: "Mobile / tài chính", description: "Quản lý tài chính cá nhân ưu tiên offline với PIN/sinh trắc học, SQLite, Riverpod, Fastify/PostgreSQL, container và tự động hóa HMAC." },
  { category: "AI / lập kế hoạch du lịch", description: "Nền tảng du lịch Việt Nam và lập kế hoạch chuyến đi bằng AI, xây dựng bằng Next.js, Fastify, DeepSeek và Docker." },
  { category: "AI / hệ thống vật lý", description: "Phân loại rác bằng YOLO với điều khiển PySide6, dashboard Next.js, UART/Arduino, Supabase và EcoPet AI." },
  { category: "Cloud / microservices", description: "Các microservice tuyển dụng Java 21 Spring Boot với Kafka, OpenSearch, Docker, Kubernetes, Terraform, observability, CI/CD và RAG." },
  { category: "DevOps / nền tảng", description: "Nền tảng developer self-service với GitOps, EKS, Terraform và các thực hành observability." },
  { category: "Đại học / vận hành", description: "Nền tảng vận hành đại học với Next.js, microservice NestJS, UX song ngữ, observability và thanh toán sinh viên sẵn sàng sandbox." },
  { category: "Thuật toán / học tập", description: "Nền tảng luyện thuật toán và cấu trúc dữ liệu với Next.js, React, dịch vụ chấm Go và Docker." },
  { category: "Âm thanh / streaming", description: "Nền tảng âm nhạc lấy cảm hứng từ SoundCloud, xây dựng bằng Next.js, NestJS, PostgreSQL, Redis, MinIO, Docker và GitHub Actions." },
  { category: "Học tập / ngôn ngữ", description: "Nền tảng học ngôn ngữ với lặp lại ngắt quãng, gamification, lộ trình cá nhân hóa, Next.js, Express, Prisma và Docker." },
  { category: "Thương mại / e-commerce", description: "Nền tảng thương mại điện tử trà sữa cao cấp." },
  { category: "Thương mại / thời trang", description: "Thương mại điện tử thời trang với Next.js, TypeScript, Tailwind CSS, Prisma, PWA, dashboard quản trị và Docker." },
  { category: "Du lịch / full stack", description: "Nền tảng du lịch Việt Nam với NestJS, Next.js, FastAPI AI, Flutter, pnpm và Turborepo." },
  { category: "Thương mại / Java", description: "Thương mại điện tử laptop Spring Boot MVC với storefront, checkout, dashboard quản trị, test, Docker và CI." },
  { category: "Thương mại / full stack", description: "Nhà sách trực tuyến full-stack xây dựng bằng Next.js và Spring Boot." },
  { category: "Tuyển dụng / full stack", description: "Nền tảng tuyển dụng IT với Spring Boot, Next.js, MySQL, Docker, RBAC, kiểm thử end-to-end và visual regression." },
  { category: "AI / thuật toán", description: "Phòng lab học AI tương tác với vết truy tìm có thể kiểm chứng, benchmark, gameplay và tô màu bản đồ CSP." },
  { category: "AI / thuật toán", description: "Phòng lab AI Streamlit cho tìm kiếm 8-puzzle, local search, CSP, demo đối kháng, phát lại trace và trò chơi xếp hình ảnh." },
] as const satisfies readonly VietnameseArchiveProjectCopy[];
