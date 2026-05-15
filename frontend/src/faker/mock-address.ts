export const MOCK_PROVINCES = [
  { id: "hanoi", name: "Thành phố Hà Nội" },
  { id: "hcm", name: "Thành phố Hồ Chí Minh" },
  { id: "danang", name: "Thành phố Đà Nẵng" },
  { id: "haiphong", name: "Thành phố Hải Phòng" },
  { id: "cantho", name: "Thành phố Cần Thơ" },
  { id: "hue", name: "Thành phố Huế" },
];

export const MOCK_WARDS: Record<string, { id: string; name: string }[]> = {
  hanoi: [
    { id: "hn-1", name: "Phường Tràng Tiền" },
    { id: "hn-2", name: "Phường Lý Thái Tổ" },
    { id: "hn-3", name: "Phường Phan Chu Trinh" },
  ],
  hcm: [
    { id: "hcm-1", name: "Phường Bến Nghé" },
    { id: "hcm-2", name: "Phường Bến Thành" },
    { id: "hcm-3", name: "Phường Đa Kao" },
  ],
  danang: [
    { id: "dn-1", name: "Phường Ngũ Hành Sơn" },
    { id: "dn-2", name: "Phường Mỹ An" },
    { id: "dn-3", name: "Phường Khuê Mỹ" },
    { id: "dn-4", name: "Phường Hòa Quý" },
    { id: "dn-5", name: "Phường Hòa Hải" },
  ],
  haiphong: [
    { id: "hp-1", name: "Phường Minh Khai" },
    { id: "hp-2", name: "Phường Phan Bội Châu" },
  ],
  cantho: [
    { id: "ct-1", name: "Phường Tân An" },
    { id: "ct-2", name: "Phường An Lạc" },
  ],
  hue: [
    { id: "hue-1", name: "Phường Phú Hội" },
    { id: "hue-2", name: "Phường Vĩnh Ninh" },
  ],
};
