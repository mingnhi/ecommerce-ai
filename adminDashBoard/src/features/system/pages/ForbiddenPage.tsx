import { Link, useNavigate } from "react-router-dom"
import { ArrowLeftIcon, ShieldAlert, HomeIcon } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

const ForbiddenPage = () => {
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-[calc(100svh-8rem)] flex-col items-center justify-center px-6 pb-16 pt-8 md:min-h-[calc(100svh-8.5rem)]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-24 top-1/4 size-72 rounded-full bg-rose-500/[0.04] blur-3xl" />
        <div className="absolute -left-16 bottom-1/4 size-56 rounded-full bg-amber-500/[0.03] blur-2xl" />
      </div>
      
      <div className="size-16 rounded-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 border border-rose-100 dark:border-rose-900/30 animate-pulse">
        <ShieldAlert className="size-8" />
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-500">
        Lỗi 403 · Hạn chế truy cập
      </p>
      <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl text-center">
        Không có quyền truy cập
      </h1>
      <p className="mt-5 max-w-md text-pretty text-center text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
        Bạn không có đủ đặc quyền để xem hoặc chỉnh sửa dữ liệu trên trang này.
        Vui lòng liên hệ Quản trị viên để được mở rộng phân quyền nếu cần thiết.
      </p>
      
      <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="h-11 gap-2 rounded-sm shadow-sm bg-rose-600 hover:bg-rose-700 text-white hover:cursor-pointer">
          <Link to="/dashboard">
            <HomeIcon className="size-4" />
            Về tổng quan
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 rounded-sm border-border/80 bg-background hover:cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon className="size-4" />
          Quay lại
        </Button>
      </div>
      <p className="mt-12 font-mono text-xs tabular-nums text-muted-foreground/80">
        Mã 403 · ecommerce-ai
      </p>
    </div>
  )
}

export default ForbiddenPage
