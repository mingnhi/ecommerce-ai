// modules/home/HomePage/lib.ts

export const HERO_SLIDES = [
  {
    badge: "Bộ sưu tập smartphone",
    title:
      "Smartphone chính hãng — công nghệ trong tầm tay bạn",
    subtitle:
      "Giảm đến 50% cho đơn hàng đầu tiên · Giao nhanh trong ngày tại TP.HCM & Hà Nội",
    description:
      "iPhone, Samsung, Xiaomi và hàng trăm mẫu máy mới nhất với giá niêm yết minh bạch.",
    image: "/images/phone.png",
  },
  {
    badge: "Âm thanh & phụ kiện",
    title:
      "Âm thanh sống động — tai nghe & loa không dây chính hãng",
    subtitle:
      "Chống ồn chủ động · Pin lâu · Kết nối Bluetooth đa thiết bị",
    description:
      "Tai nghe, earbuds và loa Bluetooth từ các thương hiệu uy tín.",
    image: "/images/earphone.png",
  },
  {
    badge: "Laptop & thiết bị làm việc",
    title:
      "Laptop hiệu năng cao — làm việc, học tập và sáng tạo",
    subtitle:
      "Chip thế hệ mới · Pin cả ngày · Màn hình sắc nét",
    description:
      "Từ ultrabook mỏng nhẹ đến máy trạm đồ họa.",
    image: "/images/laptop.png",
  },
] as const;

export const HERO_COLOR_BENDS = {
  colors: [
    "#0284c8",
    "#0ea5e9",
    "#38bdf8",
    "#bae6fd",
  ] as string[],
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

export function getDealEndOfDay() {
  const end = new Date();

  end.setHours(23, 59, 59, 999);

  return end;
}