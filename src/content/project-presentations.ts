type BilingualText = Readonly<{ en: string; vi: string }>;
export type ProjectPresentation = Readonly<{
  title: string;
  category: BilingualText;
  summary: BilingualText;
  problem: BilingualText;
  implementation: BilingualText;
  outcome: BilingualText;
  stack: readonly string[];
  demo?: string;
  contribution?: BilingualText;
}>;

// Reviewed against each project's public README on 2026-10-31. These are
// editorial learning-project notes, not claims of personal authorship or uptime.
const presentations: Readonly<Record<string, ProjectPresentation>> = {
  "JasonTM17/App_AI_powered_waste_sorting": {
    title: "Trash Sorter Pro",
    category: { en: "Applied AI / hardware", vi: "AI ứng dụng / phần cứng" },
    summary: { en: "From camera recognition to a sorting workflow: YOLO, a desktop controller and a web dashboard.", vi: "Từ nhận diện qua camera đến luồng phân loại: YOLO, ứng dụng điều khiển desktop và dashboard web." },
    problem: { en: "Connect visual waste recognition with device control and a clear monitoring interface.", vi: "Kết nối nhận diện rác với điều khiển thiết bị và giao diện theo dõi dễ hiểu." },
    implementation: { en: "PySide6 desktop, YOLO inference, UART/Arduino bridge, Next.js and Supabase.", vi: "Desktop PySide6, suy luận YOLO, cầu nối UART/Arduino, Next.js và Supabase." },
    outcome: { en: "Public dashboard demo and documented desktop/hardware workflows. Physical sorting requires a connected device.", vi: "Có demo dashboard và tài liệu luồng desktop/phần cứng. Phân loại vật lý cần thiết bị được kết nối." },
    stack: ["Python", "YOLO", "PySide6", "Next.js", "Arduino", "Supabase"],
    demo: "https://trash-sorter-v2.vercel.app",
  },
  "JasonTM17/Ecommerce_BookStore": {
    title: "BookStore",
    category: { en: "Commerce / full stack", vi: "Thương mại / full stack" },
    summary: { en: "A book-shopping journey from discovery and flash sales to cart, checkout and administration.", vi: "Hành trình mua sách từ tìm kiếm, flash sale đến giỏ hàng, thanh toán và quản trị." },
    problem: { en: "Practice a connected commerce flow across customer and admin interfaces.", vi: "Thực hành luồng thương mại liền mạch giữa giao diện khách hàng và quản trị." },
    implementation: { en: "Next.js storefront, Spring Boot API, authentication and PostgreSQL/MySQL data layers.", vi: "Storefront Next.js, API Spring Boot, xác thực và lớp dữ liệu PostgreSQL/MySQL." },
    outcome: { en: "Repository includes storefront previews, deployment notes and automated quality checks. No active public demo is listed here.", vi: "Repository có ảnh giao diện, hướng dẫn triển khai và kiểm tra tự động. Chưa gắn demo công khai đang hoạt động." },
    stack: ["Java", "Spring Boot", "Next.js", "PostgreSQL", "Docker"],
  },
  "JasonTM17/JobHunter_SpringBoot_RestfulAPI_React": {
    title: "JobHunter",
    category: { en: "Recruitment / full stack", vi: "Tuyển dụng / full stack" },
    summary: { en: "A recruitment workspace connecting job discovery, applications and recruiter review.", vi: "Không gian tuyển dụng kết nối tìm việc, ứng tuyển và quá trình xét duyệt của nhà tuyển dụng." },
    problem: { en: "Keep candidate, recruiter and administrator workflows separated by responsibility.", vi: "Tổ chức luồng ứng viên, nhà tuyển dụng và quản trị theo từng trách nhiệm." },
    implementation: { en: "Spring Boot API, Next.js client, MySQL, role-based access and Docker tooling.", vi: "API Spring Boot, client Next.js, MySQL, phân quyền theo vai trò và công cụ Docker." },
    outcome: { en: "Documented application pipeline, local setup, end-to-end and visual regression checks.", vi: "Có tài liệu quy trình ứng tuyển, chạy local, kiểm thử end-to-end và visual regression." },
    stack: ["Java", "Spring Boot", "Next.js", "MySQL", "Docker"],
  },
  "JasonTM17/Laptopshop_Spring_Boot_MVC": {
    title: "LaptopShop",
    category: { en: "Commerce / Java MVC", vi: "Thương mại / Java MVC" },
    summary: { en: "A laptop storefront with product discovery, checkout, order history and an admin workspace.", vi: "Cửa hàng laptop với tìm sản phẩm, đặt hàng, lịch sử mua hàng và trang quản trị." },
    problem: { en: "Explore the complete customer order journey in a server-rendered Java application.", vi: "Tìm hiểu hành trình đặt hàng trong ứng dụng Java render phía máy chủ." },
    implementation: { en: "Spring Boot MVC, Java, customer/admin roles, automated tests and Docker packaging.", vi: "Spring Boot MVC, Java, vai trò khách hàng/quản trị, kiểm thử tự động và đóng gói Docker." },
    outcome: { en: "Public source includes storefront screenshots and a repeatable local demonstration guide.", vi: "Mã nguồn công khai có ảnh storefront và hướng dẫn chạy bản trình diễn local." },
    stack: ["Java", "Spring Boot", "Docker"],
  },
  "JasonTM17/HealthCare_Project": {
    title: "HealthCare",
    category: { en: "Healthcare / service workflows", vi: "Y tế / quy trình dịch vụ" },
    summary: { en: "A learning platform for appointment discovery and patient, clinician and administration workflows.", vi: "Nền tảng học tập về đặt lịch và các luồng dành cho bệnh nhân, bác sĩ, quản trị viên." },
    problem: { en: "Organize appointment and care information across distinct hospital roles.", vi: "Tổ chức thông tin lịch hẹn và chăm sóc theo các vai trò trong bệnh viện." },
    implementation: { en: "Spring Boot, Next.js, PostgreSQL and a FastAPI AI/RAG service with source/access boundaries.", vi: "Spring Boot, Next.js, PostgreSQL và dịch vụ AI/RAG FastAPI có ranh giới nguồn, quyền truy cập." },
    outcome: { en: "Public website and documented demo workflows. This is an educational project, not a verified clinical service.", vi: "Có website công khai và tài liệu luồng demo. Đây là dự án học tập, chưa xác nhận là dịch vụ khám chữa bệnh thực tế." },
    stack: ["Java", "Spring Boot", "Next.js", "FastAPI", "PostgreSQL"],
    demo: "https://www.healthcare.id.vn",
  },
  "JasonTM17/Student_Management_UTE": {
    title: "CampusUTE",
    category: { en: "Education / academic portal", vi: "Giáo dục / cổng học vụ" },
    summary: { en: "A bilingual academic portal for course registration, grades, attendance and university workflows.", vi: "Cổng học vụ song ngữ cho đăng ký học phần, điểm số, điểm danh và các quy trình đào tạo." },
    problem: { en: "Connect academic tasks while respecting student, lecturer and administrative roles.", vi: "Kết nối nghiệp vụ học vụ theo vai trò sinh viên, giảng viên và quản trị." },
    implementation: { en: "Modular Spring Boot backend, Next.js portal, PostgreSQL/Flyway and an internal RAG sidecar. Expo client is in development.", vi: "Backend Spring Boot theo module, portal Next.js, PostgreSQL/Flyway và RAG sidecar nội bộ. Client Expo đang phát triển." },
    outcome: { en: "Public portal and source-documented academic flows with separate local demo data.", vi: "Có cổng thông tin công khai và tài liệu luồng học vụ với dữ liệu demo local riêng." },
    stack: ["Java", "Spring Boot", "Next.js", "PostgreSQL", "Expo"],
    demo: "https://campusute.io.vn",
  },
  "JasonTM17/FoodDelivery_App": {
    title: "FoodFlow",
    category: { en: "Operations / delivery", vi: "Vận hành / giao nhận" },
    summary: { en: "Food ordering and real-time delivery workflows across customer, merchant and operations interfaces.", vi: "Đặt món và giao nhận thời gian thực qua giao diện khách hàng, cửa hàng và vận hành." },
    problem: { en: "Coordinate a delivery order across multiple participants.", vi: "Phối hợp một đơn giao đồ ăn giữa nhiều bên tham gia." },
    implementation: { en: "NestJS, Next.js, Flutter, PostgreSQL/PostGIS and Supabase Realtime.", vi: "NestJS, Next.js, Flutter, PostgreSQL/PostGIS và Supabase Realtime." },
    outcome: { en: "Public customer demo and repository walkthroughs with separate demo data.", vi: "Có demo khách hàng công khai và hướng dẫn trải nghiệm với dữ liệu demo riêng." },
    stack: ["NestJS", "Next.js", "Flutter", "PostgreSQL", "Docker"],
    demo: "https://foodflow-customer.vercel.app",
  },
  "JasonTM17/Ecommerce_BookStore_NodeJS": {
    title: "BookStore NodeJS",
    category: { en: "Commerce / TypeScript", vi: "Thương mại / TypeScript" },
    summary: { en: "A book-commerce demo with a storefront, checkout and administration workspace.", vi: "Demo thương mại sách với storefront, đặt hàng và không gian quản trị." },
    problem: { en: "Build a connected book-shopping journey across a TypeScript web stack.", vi: "Xây luồng mua sách liền mạch trên hệ thống web TypeScript." },
    implementation: { en: "NestJS services, Next.js frontend and PostgreSQL persistence.", vi: "Dịch vụ NestJS, frontend Next.js và lưu trữ PostgreSQL." },
    outcome: { en: "Public storefront demo, production screenshots and a repository walkthrough.", vi: "Có demo storefront, ảnh giao diện triển khai và hướng dẫn trong repository." },
    stack: ["TypeScript", "NestJS", "Next.js", "PostgreSQL"],
    demo: "https://bookstore-node-web.vercel.app/",
  },
};

export function getProjectPresentation(fullName: string): ProjectPresentation | undefined {
  const project = Object.hasOwn(presentations, fullName) ? presentations[fullName] : undefined;
  const personal = ['App_AI_powered_waste_sorting', 'Ecommerce_BookStore', 'JobHunter_SpringBoot_RestfulAPI_React', 'Laptopshop_Spring_Boot_MVC', 'HealthCare_Project', 'Student_Management_UTE'].some(name => fullName === `JasonTM17/${name}`);
  return project && personal ? { ...project, contribution: { en: 'Personal project — implemented by Son. The functional scope is described below.', vi: 'Dự án cá nhân — Sơn tự thực hiện. Phạm vi chức năng được trình bày bên dưới.' } } : project;
}

export function getPresentationForHref(href: string): ProjectPresentation | undefined {
  const prefix = "https://github.com/";
  return href.startsWith(prefix) ? getProjectPresentation(href.slice(prefix.length)) : undefined;
}
