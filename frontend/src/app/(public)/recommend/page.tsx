import RecommendSection from "@/modules/HomePage/components/RecommendSection";

export default function RecommendPage() {
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Product Recommendation</h1>

        <p className="mt-2 text-gray-500">
          Các sản phẩm được đề xuất dựa trên mô hình Neural Collaborative
          Filtering (NCF) kết hợp Metadata sản phẩm.
        </p>
      </div>

      <RecommendSection limit={100} showHeader={false} />
    </main>
  );
}
