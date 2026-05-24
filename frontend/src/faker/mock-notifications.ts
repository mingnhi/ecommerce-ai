export interface INotification {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  type: 'order' | 'promotion' | 'system';
}

export const MOCK_NOTIFICATIONS: INotification[] = [
  {
    id: '1',
    title: 'Đơn hàng giao thành công',
    content: 'Đơn hàng #123456 của bạn đã được giao thành công. Đánh giá sản phẩm ngay để nhận xu!',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    type: 'order',
  },
  {
    id: '2',
    title: 'Voucher giảm 50% đang chờ bạn',
    content: 'Mừng sinh nhật 5 tuổi, tặng bạn voucher giảm 50% tối đa 100k cho đơn từ 200k.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    type: 'promotion',
  },
  {
    id: '3',
    title: 'Đơn hàng đang được vận chuyển',
    content: 'Đơn hàng #123455 của bạn đã được bàn giao cho đơn vị vận chuyển J&T Express.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    type: 'order',
  },
  {
    id: '4',
    title: 'Chào mừng bạn đến với Ecommerce AI',
    content: 'Cảm ơn bạn đã đăng ký tài khoản. Khám phá ngay hàng ngàn sản phẩm hấp dẫn!',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    type: 'system',
  },
  {
    id: '5',
    title: 'Flash Sale: Siêu sale 11.11',
    content: 'Săn sale linh đình vào lúc 0h ngày mai. Đừng bỏ lỡ!',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    type: 'promotion',
  },
];
