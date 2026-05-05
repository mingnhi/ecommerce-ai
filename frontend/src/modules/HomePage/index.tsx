import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { siteConfig } from "@/configs/site";

export default function HomePage() {
  return (
    <section className="min-h-[calc(100vh-66px)] w-full flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-white to-gray-50">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center tracking-tight">
        {siteConfig.name}
      </h1>
      <p className="mt-4 text-lg text-gray-600 text-center max-w-xl">
        Nền tảng học tập và phát triển kỹ năng của bạn.
      </p>
      <div className="mt-10 flex flex-wrap gap-4 justify-center">
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href={ROUTES.LOGIN}>Đăng nhập</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full px-8">
          <Link href={ROUTES.REGISTER}>Đăng ký</Link>
        </Button>
      </div>
    </section>
  );
}
