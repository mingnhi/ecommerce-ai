import { Suspense } from 'react';
import ProductDetailPage from '@/modules/ProductDetailPage';
import { ProductDetailSkeleton } from '@/modules/ProductDetailPage/components/Skeleton';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};

  const slow = typeof sp.slow === 'string' ? sp.slow : undefined;
  if (slow === '1') await sleep(1000);

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailPage slug={slug} />
    </Suspense>
  );
}

// ==================== METADATA ĐỘNG (SEO) ====================
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  try {
    // Bạn có thể import ProductService ở đây nếu muốn fetch metadata
    // const product = await ProductService.getBySlug(slug);
    
    return {
      title: `Sản phẩm ${slug} - Tên Cửa Hàng`,
      description: `Chi tiết sản phẩm ${slug}`,
      openGraph: {
        title: `Sản phẩm ${slug}`,
        description: `Xem chi tiết sản phẩm ${slug}`,
        images: [{ url: '/images/og-image.jpg' }], // có thể thay bằng ảnh thật sau
      },
    };
  } catch (error) {
    return {
      title: 'Sản phẩm không tồn tại',
      description: 'Không tìm thấy sản phẩm bạn đang tìm kiếm.',
    };
  }
}