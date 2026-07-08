export type Project = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string[];
  category: string;
  year: number;
  status: "Hoàn thành" | "Đang phát triển";
  role: string;
  duration: string;
  accent: string;
  technologies: string[];
  features: { title: string; description: string; icon: string }[];
  learnings: string[];
  githubUrl: string;
  demoUrl: string;
};

export const projects: Project[] = [
  {
    slug: "quan-ly-karaoke",
    title: "Website quản lý karaoke",
    shortDescription: "Quản lý phòng hát, đặt phòng, tính tiền, kho hàng và báo cáo doanh thu.",
    description: [
      "Hệ thống được xây dựng dành cho mô hình quán karaoke từ 10–20 phòng, giúp chủ quán theo dõi trạng thái phòng, lịch đặt và quá trình phục vụ theo thời gian thực.",
      "Ứng dụng tích hợp quản lý sản phẩm, kho, hóa đơn và báo cáo doanh thu trong cùng một giao diện responsive, dễ sử dụng trên máy tính và điện thoại.",
    ],
    category: "Website quản lý",
    year: 2026,
    status: "Đang phát triển",
    role: "Full-stack Developer",
    duration: "3 tháng",
    accent: "purple",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL"],
    features: [
      { title: "Quản lý phòng hát", description: "Theo dõi phòng trống, đang hát và đã đặt.", icon: "door" },
      { title: "Đặt phòng", description: "Tiếp nhận và quản lý lịch đặt theo ngày.", icon: "calendar" },
      { title: "Quản lý sản phẩm", description: "Đồ uống, thức ăn và dịch vụ đi kèm.", icon: "package" },
      { title: "Tính tiền & hóa đơn", description: "Tính giờ hát và dịch vụ tự động.", icon: "receipt" },
      { title: "Quản lý kho", description: "Nhập xuất tồn và cảnh báo số lượng thấp.", icon: "warehouse" },
      { title: "Báo cáo doanh thu", description: "Thống kê theo ngày, tuần và tháng.", icon: "chart" },
    ],
    learnings: ["Thiết kế hệ thống phân quyền rõ ràng", "Xử lý dữ liệu thời gian thực", "Tối ưu giao diện POS trên nhiều thiết bị", "Thiết kế cơ sở dữ liệu nghiệp vụ"],
    githubUrl: "https://github.com/Hoikroos",
    demoUrl: "#",
  },
  {
    slug: "weathernow",
    title: "Ứng dụng thời tiết WeatherNow",
    shortDescription: "Theo dõi thời tiết theo vị trí, dự báo 7 ngày và bản đồ trực quan.",
    description: ["Ứng dụng thời tiết hiện đại sử dụng dữ liệu API và bản đồ Leaflet.", "Giao diện trực quan, hỗ trợ vị trí hiện tại và hiển thị chất lượng không khí."],
    category: "Ứng dụng thời tiết",
    year: 2026,
    status: "Hoàn thành",
    role: "Frontend Developer",
    duration: "1 tháng",
    accent: "blue",
    technologies: ["Next.js", "ReactJS", "Leaflet", "REST API"],
    features: [
      { title: "Thời tiết hiện tại", description: "Nhiệt độ và điều kiện theo vị trí.", icon: "cloud" },
      { title: "Dự báo 7 ngày", description: "Hiển thị chi tiết từng ngày.", icon: "calendar" },
      { title: "Bản đồ", description: "Theo dõi thời tiết trực quan.", icon: "map" },
      { title: "Chất lượng không khí", description: "Theo dõi chỉ số AQI.", icon: "wind" },
      { title: "Tìm kiếm", description: "Tra cứu thành phố nhanh chóng.", icon: "search" },
      { title: "Responsive", description: "Tối ưu điện thoại và desktop.", icon: "phone" },
    ],
    learnings: ["Tích hợp API bên thứ ba", "Xử lý quyền truy cập vị trí", "Tối ưu bản đồ Leaflet", "Thiết kế dashboard thời tiết"],
    githubUrl: "https://github.com/Hoikroos",
    demoUrl: "#",
  },
  {
    slug: "quan-ly-san-bong",
    title: "Website quản lý sân bóng",
    shortDescription: "Quản lý sân, lịch đặt, khách hàng và thanh toán sau trận đấu.",
    description: ["Nền tảng hỗ trợ chủ sân quản lý lịch trống và khách hàng tìm kiếm sân.", "Hệ thống gồm trang công khai, trang chủ sân và khu vực quản trị."],
    category: "Website đặt lịch",
    year: 2026,
    status: "Đang phát triển",
    role: "Full-stack Developer",
    duration: "2 tháng",
    accent: "green",
    technologies: ["Next.js", "Supabase", "PostgreSQL", "TypeScript"],
    features: [
      { title: "Danh sách sân", description: "Hiển thị sân theo khu vực.", icon: "field" },
      { title: "Đặt lịch", description: "Chọn khung giờ còn trống.", icon: "calendar" },
      { title: "Quản lý chủ sân", description: "Theo dõi sân và doanh thu.", icon: "user" },
      { title: "Khách hàng", description: "Quản lý lịch sử đặt sân.", icon: "users" },
      { title: "Đánh giá", description: "Nhận xét chất lượng sân.", icon: "star" },
      { title: "Thống kê", description: "Báo cáo hoạt động theo thời gian.", icon: "chart" },
    ],
    learnings: ["Thiết kế mô hình nhiều vai trò", "Quản lý lịch đặt tránh trùng", "Xây dựng trang tìm kiếm công khai", "Thiết kế luồng nghiệp vụ thực tế"],
    githubUrl: "https://github.com/Hoikroos",
    demoUrl: "#",
  },
  {
    slug: "bat-dong-san",
    title: "Hệ thống đăng tin bất động sản",
    shortDescription: "Đăng tin, tìm kiếm, lọc và đồng bộ dữ liệu bất động sản.",
    description: ["Hệ thống quản lý nội dung và tin đăng dành cho doanh nghiệp bất động sản.", "Hỗ trợ quy trình đăng tin, phân quyền và tự động hóa qua n8n."],
    category: "Bất động sản",
    year: 2026,
    status: "Hoàn thành",
    role: "Backend Developer",
    duration: "2 tháng",
    accent: "cyan",
    technologies: ["Laravel", "PostgreSQL", "n8n", "REST API"],
    features: [], learnings: ["Xây dựng webhook", "Phân quyền role", "Đồng bộ dữ liệu", "Xử lý API"], githubUrl: "https://github.com/Hoikroos", demoUrl: "#"
  },
  {
    slug: "website-ban-hang",
    title: "Website bán hàng",
    shortDescription: "Website thương mại điện tử với giỏ hàng và quản lý đơn hàng.",
    description: ["Website bán hàng thời trang có đăng ký, đăng nhập, giỏ hàng và thanh toán.", "Quản lý sản phẩm, phân trang và lưu dữ liệu người dùng."],
    category: "Thương mại điện tử",
    year: 2024,
    status: "Hoàn thành",
    role: "Frontend Developer",
    duration: "1 tháng",
    accent: "orange",
    technologies: ["HTML", "CSS", "JavaScript", "LocalStorage"],
    features: [], learnings: ["Quản lý trạng thái giỏ hàng", "Xác thực biểu mẫu", "Thiết kế trang sản phẩm", "Responsive CSS"], githubUrl: "https://github.com/Hoikroos", demoUrl: "#"
  },
  {
    slug: "dashboard-quan-tri",
    title: "Dashboard quản trị",
    shortDescription: "Dashboard với thống kê, biểu đồ, thông báo và phân quyền.",
    description: ["Giao diện quản trị tập trung cho các hệ thống nội bộ.", "Hiển thị dữ liệu qua biểu đồ và các thẻ thống kê trực quan."],
    category: "Dashboard",
    year: 2026,
    status: "Hoàn thành",
    role: "UI Developer",
    duration: "3 tuần",
    accent: "dark",
    technologies: ["ReactJS", "TypeScript", "Chart.js", "REST API"],
    features: [], learnings: ["Trực quan hóa dữ liệu", "Thiết kế component tái sử dụng", "Responsive dashboard", "Trải nghiệm người dùng"], githubUrl: "https://github.com/Hoikroos", demoUrl: "#"
  },
];

export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
