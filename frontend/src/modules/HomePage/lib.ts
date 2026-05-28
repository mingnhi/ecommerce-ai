// modules/home/HomePage/lib.ts
export const HERO_SLIDES = [
  {
    badge: "Bộ sưu tập smartphone",
    title: "Smartphone chính hãng — công nghệ trong tầm tay bạn",
    subtitle: "Giảm đến 50% cho đơn hàng đầu tiên · Giao nhanh trong ngày tại TP.HCM & Hà Nội",
    description: "iPhone, Samsung, Xiaomi và hàng trăm mẫu máy mới nhất với giá niêm yết minh bạch.",
    image: "/images/phone.png",
  },
  {
    badge: "Âm thanh & phụ kiện",
    title: "Âm thanh sống động — tai nghe & loa không dây chính hãng",
    subtitle: "Chống ồn chủ động · Pin lâu · Kết nối Bluetooth đa thiết bị",
    description: "Tai nghe, earbuds và loa Bluetooth từ các thương hiệu uy tín.",
    image: "/images/earphone.png",
  },
  {
    badge: "Laptop & thiết bị làm việc",
    title: "Laptop hiệu năng cao — làm việc, học tập và sáng tạo",
    subtitle: "Chip thế hệ mới · Pin cả ngày · Màn hình sắc nét",
    description: "Từ ultrabook mỏng nhẹ đến máy trạm đồ họa.",
    image: "/images/laptop.png",
  },
] as const;

export const HERO_COLOR_BENDS = {
  colors: ["#0284c8", "#0ea5e9", "#38bdf8", "#bae6fd"] as string[],
  rotation: 90,
  speed: 0.2,
  scale: 1,
  frequency: 1,
  warpStrength: 1,
  mouseInfluence: 0.6,
  noise: 0.1,
  parallax: 0.5,
  iterations: 1,
  intensity: 1.5,
  bandWidth: 6,
  transparent: true,
  autoRotate: 0,
};

export const HERO_SLIDES = [
  {
    badge: "Bộ sưu tập smartphone",
    title: "Smartphone chính hãng — công nghệ trong tầm tay bạn",
    subtitle: "Giảm đến 50% cho đơn hàng đầu tiên · Giao nhanh trong ngày tại TP.HCM & Hà Nội",
    description:
      "iPhone, Samsung, Xiaomi và hàng trăm mẫu máy mới nhất với giá niêm yết minh bạch. Trả góp 0% qua thẻ tín dụng, bảo hành chính hãng toàn quốc và đổi trả trong 7 ngày nếu lỗi từ nhà sản xuất.",
    image: "/images/phone.png",
  },
  {
    badge: "Âm thanh & phụ kiện",
    title: "Âm thanh sống động — tai nghe & loa không dây chính hãng",
    subtitle: "Chống ồn chủ động · Pin lâu · Kết nối Bluetooth đa thiết bị",
    description:
      "Tai nghe, earbuds và loa Bluetooth từ các thương hiệu uy tín. Phù hợp nghe nhạc, họp trực tuyến hay tập luyện — kèm bảo hành chính hãng và hỗ trợ kỹ thuật nhanh chóng.",
    image: "/images/earphone.png",
  },
  {
    badge: "Laptop & thiết bị làm việc",
    title: "Laptop hiệu năng cao — làm việc, học tập và sáng tạo không giới hạn",
    subtitle: "Chip thế hệ mới · Pin cả ngày · Màn hình sắc nét, màu chuẩn cho thiết kế",
    description:
      "Từ ultrabook mỏng nhẹ đến máy trạm đồ họa: chọn đúng cấu hình với tư vấn miễn phí, khuyến mãi phụ kiện kèm theo và vệ sinh, kiểm tra máy định kỳ trong năm đầu sử dụng.",
    image: "/images/laptop.png",
  },

] as const;



export function getDealEndOfDay() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getProductsByCategory(categoryName?: string) {
  if (!categoryName || categoryName === "Tất cả") return HOME_PRODUCTS;
  return HOME_PRODUCTS.filter((p) => p.category === categoryName);
}

export function getPopularProducts(tab: string) {
  return getProductsByCategory(tab === "Tất cả" ? undefined : tab).slice(0, 10);
}

export function getDailyBestProducts(tab = "Tất cả") {
  let pool = HOME_PRODUCTS;
  if (tab === "Ưu đãi hôm nay") pool = pool.filter((p) => p.originalPrice);
  else if (tab !== "Tất cả") pool = getProductsByCategory(tab);
  return [...pool].sort((a, b) => b.sold / b.stock - a.sold / a.stock).slice(0, 4);
}

export function getDealProducts() {
  return HOME_PRODUCTS.filter((p) => p.originalPrice).slice(0, 4);
}

export function getTopSelling() {
  return [...HOME_PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 3);
}

export function getTrendingProducts() {
  return [...HOME_PRODUCTS].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 3);
}

export function getRecentlyAdded() {
  return [...HOME_PRODUCTS].reverse().slice(0, 3);
}

export function getTopRated() {
  return [...HOME_PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 3);
}

export { HOME_CATEGORIES, HOME_PRODUCTS };
