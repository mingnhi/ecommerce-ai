import { Link, useNavigate } from "react-router-dom"
import { ArrowLeftIcon, HomeIcon } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-[calc(100svh-8rem)] flex-col items-center justify-center px-6 pb-16 pt-8 md:min-h-[calc(100svh-8.5rem)]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-24 top-1/4 size-72 rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="absolute -left-16 bottom-1/4 size-56 rounded-full bg-primary/[0.04] blur-2xl" />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
        Lỗi 404
      </p>
      <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
        Trang không tồn tại
      </h1>
      <p className="mt-5 max-w-md text-pretty text-center text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
        Đường dẫn bạn truy cập không có trong hệ thống, hoặc đã được đổi tên.
        Kiểm tra URL hoặc quay lại trang tổng quan để tiếp tục làm việc.
      </p>
      <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="h-11 gap-2 rounded-sm shadow-sm">
          <Link to="/dashboard">
            <HomeIcon className="size-4" />
            Về tổng quan
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 rounded-sm border-border/80 bg-background"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon className="size-4" />
          Quay lại
        </Button>
      </div>
      <p className="mt-12 font-mono text-xs tabular-nums text-muted-foreground/80">
        Mã 404 · ecommerce-ai
      </p>
    </div>
  )
}

export default NotFoundPage
