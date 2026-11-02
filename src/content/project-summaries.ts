import type { PortfolioLanguage } from '../i18n/portfolio-language-context';
// Concise editorial summaries reviewed against public repository descriptions.
// These describe repository scope, not personal authorship, uptime or achievement.
const summaries: Readonly<Record<string, readonly [string, string]>> = {
  'All-In-One-Holiday': ['A Vietnamese holiday hub with a lunar calendar, greeting cards and offline browsing.', 'Cổng ngày lễ Việt Nam với lịch âm dương, tạo thiệp và khả năng xem ngoại tuyến.'],
  CampusCore_Ecosystem: ['An academic platform for enrollment, schedules, grades and a source-citing assistant.', 'Nền tảng học vụ cho đăng ký học phần, lịch học, điểm số và trợ lý có trích dẫn nguồn.'],
  'Uptime-Monitoring-Platform': ['An endpoint monitoring workspace with incidents, Telegram alerts and a Go API.', 'Không gian giám sát website, quản lý sự cố và cảnh báo Telegram với API Go.'],
  WeatherAWS_FinalTerm: ['A serverless weather and air-quality project using AWS data pipelines and monitoring.', 'Đồ án thời tiết và chất lượng không khí với luồng dữ liệu, triển khai và giám sát trên AWS.'],
  Horror_Game_Funny: ['A first-person psychological horror game built with Godot and GDScript.', 'Trò chơi kinh dị tâm lý góc nhìn thứ nhất, xây dựng bằng Godot và GDScript.'],
  Security_Lab_Study: ['A local security learning lab with intentionally vulnerable exercises and defensive comparisons.', 'Phòng thực hành an toàn thông tin chạy local, có bài tập lỗ hổng và bản đối chứng phòng thủ.'],
  Farmly_Flutter: ['An offline-first farming application for crops, livestock, tasks and harvests.', 'Ứng dụng quản lý nông trại ưu tiên ngoại tuyến: cây trồng, vật nuôi, công việc và thu hoạch.'],
  Willowmere_Game_Indie_Relax: ['A browser village adventure with fishing, quests and an embedded arcade game.', 'Trò chơi làng ven hồ trên trình duyệt với câu cá, nhiệm vụ và trò chơi arcade.'],
  'Voxel-Pagoda-Garden': ['A Three.js voxel garden with a pagoda, koi pond and lantern-lit dusk.', 'Khu vườn voxel Three.js với tháp chùa, hồ cá koi và khung cảnh đèn lồng lúc chạng vạng.'],
  CampusUTE_Kotlin_Project: ['An Android campus application with offline workflows and a source-grounded assistant.', 'Ứng dụng khuôn viên trường trên Android, có luồng ngoại tuyến và trợ lý dựa trên nguồn dữ liệu.'],
  Language_Kotlin_App: ['A Kotlin language-learning app with cited tutoring and offline spaced repetition.', 'Ứng dụng học ngôn ngữ Kotlin với gia sư trích dẫn nguồn và ôn tập giãn cách ngoại tuyến.'],
  Money_Management_App: ['An offline-first personal finance application with local storage and an optional API.', 'Ứng dụng quản lý tài chính cá nhân ưu tiên ngoại tuyến, có lưu trữ local và API kết nối.'],
  CampusMate: ['A Flutter student workspace with an e-library, academic dashboard and AI assistance.', 'Không gian sinh viên Flutter với thư viện điện tử, bảng học vụ và trợ lý AI.'],
  ForgeBase: ['A collection of starter templates across languages with CI and Docker setup.', 'Bộ mẫu khởi tạo dự án cho nhiều ngôn ngữ, kèm cấu hình CI và Docker.'],
  RAG_LLM_Services: ['A learning platform for scoped knowledge bases, retrieval, cited chat and ingestion.', 'Nền tảng học tập về kho tri thức phân quyền, truy xuất, trò chuyện có nguồn và nạp dữ liệu.'],
  LK_Gold_Bot: ['A Telegram assistant for public Locket links and local usage tracking.', 'Trợ lý Telegram xử lý liên kết Locket công khai và theo dõi lượt sử dụng bằng SQLite.'],
  Arcade_Hub_Game: ['A browser arcade hub with multiple mini-games, audio controls and local high scores.', 'Cổng trò chơi arcade trên trình duyệt, có điều khiển âm thanh và điểm cao lưu trên máy.'],
  Nexora: ['A multi-tenant CMS and knowledge workspace with publishing, events and scoped retrieval.', 'Không gian quản lý nội dung và tri thức nhiều tenant, có xuất bản, sự kiện và truy xuất theo phạm vi.'],
  AgriInsight: ['An agricultural analytics workspace with data pipelines, real-time events and scoped RAG.', 'Không gian phân tích nông nghiệp với luồng dữ liệu, sự kiện thời gian thực và RAG theo phạm vi.'],
  OpsMind_AI: ['An AI-assisted incident investigation workspace with traceable evidence and guarded remediation.', 'Không gian điều tra sự cố có AI hỗ trợ, bằng chứng truy vết và kiểm soát thao tác khắc phục.'],
  RepoMentor: ['An AI code-review and programming tutoring workspace for developers.', 'Không gian hỗ trợ rà soát mã nguồn và học lập trình với AI.'],
  RepoMedic_AI: ['A local-first agent workflow for bug triage and guarded source patches.', 'Luồng agent ưu tiên local để phân loại lỗi và đề xuất bản sửa có kiểm soát.'],
  Flappy_Bird_Clone: ['A Phaser arcade game with procedural visuals, synthesized audio and local scores.', 'Trò chơi arcade Phaser với đồ họa tạo bằng mã, âm thanh tổng hợp và điểm số local.'],
  Eventory: ['An event ticketing application with seat holds, QR check-in and payment workflows.', 'Ứng dụng bán vé sự kiện với giữ chỗ, kiểm vé QR và luồng thanh toán.'],
  Ideogram_LearningApp: ['A Vietnamese-first AI learning platform for Japanese, Chinese and Korean.', 'Nền tảng học tiếng Nhật, Trung và Hàn với AI, ưu tiên người học Việt Nam.'],
  PipeForge: ['A distributed data-processing workspace using Go, Python, queues and object storage.', 'Không gian xử lý dữ liệu phân tán với Go, Python, hàng đợi và kho lưu trữ đối tượng.'],
  AgriCore_SpringBoot_Microservices: ['An agricultural microservices learning platform with Java, events and a cited assistant.', 'Nền tảng học tập về microservices nông nghiệp với Java, sự kiện và trợ lý trích dẫn nguồn.'],
  Distill_LLM: ['A model-distillation experiment with LoRA, quantized deployment and a chat interface.', 'Thử nghiệm chưng cất mô hình với LoRA, triển khai lượng tử hóa và giao diện trò chuyện.'],
  Minecraft_Adventure: ['A browser voxel adventure with procedural terrain and a dragon encounter.', 'Trò chơi phiêu lưu voxel trên trình duyệt với địa hình tạo bằng mã và trận chiến rồng.'],
  Aethera_ChillTimeWeb: ['An editorial studio website built with React, Vite and TypeScript.', 'Website studio theo phong cách biên tập, xây dựng bằng React, Vite và TypeScript.'],
  Velorah_Dream: ['A responsive studio website with accessible navigation and controlled motion.', 'Website studio thích ứng nhiều màn hình, có điều hướng hỗ trợ tiếp cận và chuyển động có kiểm soát.'],
  DevHire_Cloud_Spring_Microservices: ['A recruitment microservices learning platform with Java, event streaming and DevOps tooling.', 'Nền tảng học tập về tuyển dụng theo microservices với Java, luồng sự kiện và công cụ DevOps.'],
  CampusCore_FullStack_Individual: ['A university operations application with a bilingual portal and sandbox payment flows.', 'Ứng dụng vận hành học vụ với cổng song ngữ và luồng thanh toán thử nghiệm.'],
  Wavestream_Soundcloud: ['A music application with a Next.js client, NestJS API and object storage.', 'Ứng dụng nghe nhạc với giao diện Next.js, API NestJS và kho lưu trữ đối tượng.'],
  Internal_Developer_Platform_DevOps: ['A self-service developer platform exploring GitOps, infrastructure and observability.', 'Nền tảng tự phục vụ cho lập trình viên, tìm hiểu GitOps, hạ tầng và khả năng quan sát hệ thống.'],
  ChillTravel_NextJS: ['A Vietnam travel platform connecting web, mobile and an AI service.', 'Nền tảng du lịch Việt Nam kết nối web, mobile và dịch vụ AI.'],
  'ON-OFF_JS': ['A fashion storefront with a product catalog, cart, checkout and administration.', 'Cửa hàng thời trang trực tuyến với danh mục sản phẩm, giỏ hàng, thanh toán và quản trị.'],
  Crab_Mobile_Flutter: ['A learning application for ride-hailing, food delivery, wallets and real-time chat.', 'Ứng dụng học tập về gọi xe, giao đồ ăn, ví và trò chuyện thời gian thực.'],
  AI_Algothrithm_Invidual_Study_University: ['A Streamlit search-algorithm lab with puzzle gameplay and trace playback.', 'Phòng thực hành thuật toán tìm kiếm Streamlit, có trò chơi xếp hình và xem lại từng bước.'],
  AI_Algothrithm_Study_University: ['An interactive puzzle-search lab with benchmarks and map-coloring exercises.', 'Phòng thực hành tìm kiếm trên trò chơi xếp hình, có đo lường và bài tập tô màu bản đồ.'],
  VN_TravelAI: ['A Vietnam travel marketplace with AI-assisted trip planning.', 'Nền tảng đặt dịch vụ du lịch Việt Nam và lập kế hoạch chuyến đi có AI hỗ trợ.'],
  Language_App: ['A language-learning application with spaced repetition and personalized study paths.', 'Ứng dụng học ngôn ngữ với ôn tập giãn cách và lộ trình học cá nhân hóa.'],
  MilkTea_Iku: ['A milk-tea e-commerce application.', 'Ứng dụng thương mại điện tử dành cho sản phẩm trà sữa.'],
  Leetrank_Project: ['An algorithm-practice platform with a Go judging service.', 'Nền tảng luyện thuật toán và cấu trúc dữ liệu, có dịch vụ chấm bài bằng Go.'],
};
export function reviewedProjectSummary(fullName: string, language: PortfolioLanguage): string | undefined {
  if (!fullName.startsWith('JasonTM17/')) return undefined;
  return summaries[fullName.slice('JasonTM17/'.length)]?.[language === 'vi' ? 1 : 0];
}
export const reviewedProjectStack = (fullName: string): readonly string[] => fullName === 'JasonTM17/CampusCore_Ecosystem' ? ['Java', 'Spring Boot', 'Next.js', 'PostgreSQL'] : [];
