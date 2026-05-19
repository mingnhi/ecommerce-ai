import ShapeGrid from "@/shared/components/ui/ShapeGrid";
import { cn } from "@/shared/lib/utils";

const heroClip = {
  clipPath:
    "polygon(0 0, calc(100% - 3.5rem) 0, 100% 50%, calc(100% - 3.5rem) 100%, 0 100%)",
  WebkitClipPath:
    "polygon(0 0, calc(100% - 3.5rem) 0, 100% 50%, calc(100% - 3.5rem) 100%, 0 100%)",
} as const;

export function LoginHeroPanel() {
  const y = new Date().getFullYear();
  return (
    <aside
      className={cn(
        "relative z-[1] hidden h-screen min-w-0 flex-col justify-between overflow-hidden bg-sky-600 p-10 text-primary-foreground lg:flex xl:px-10 xl:py-8",
      )}
      style={heroClip}
    >
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.65] mix-blend-soft-light">
        <ShapeGrid
          direction="right"
          speed={0.35}
          borderColor="rgba(255,255,255,0.28)"
          squareSize={44}
          hoverFillColor="rgba(255,255,255,0.14)"
          shape="square"
          hoverTrailAmount={4}
          className="h-full w-full opacity-80"
        />
      </div>
      <div
        className="pointer-events-none absolute -right-20 top-1/4 z-0 size-[min(55vw,420px)] rounded-full bg-white/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 z-0 size-[min(50vw,360px)] rounded-full bg-[color-mix(in_oklab,var(--primary-foreground)_18%,transparent)] blur-3xl"
        aria-hidden
      />

      <div className="relative z-[1] flex w-full min-w-0 flex-1 flex-col">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-primary-foreground/70">
          Console
        </p>
        <p className="mt-2 w-full text-xs font-medium leading-snug text-primary-foreground/80">
          Hệ thống quản trị nội bộ — tập trung vận hành, catalog và đội ngũ trên một nền tảng
          thống nhất.
        </p>
        <h1 className="mt-6 w-full font-heading text-3xl font-medium tracking-[-0.03em] xl:text-4xl">
          Quản trị
          <span className="mt-1 block text-primary-foreground/85">Hệ thống</span>
        </h1>
        <div className="mt-6 w-full space-y-3 text-sm leading-relaxed text-primary-foreground/75">
          <p>
            Chỉ thành viên được cấp quyền mới truy cập được khu vực này. Hãy đăng xuất khi dùng chung thiết bị để bảo vệ dữ liệu khách
            hàng.
          </p>

        </div>

        <div className="mt-12 flex w-full min-w-0 flex-1 items-center justify-start lg:mt-10">
          <div className="w-full max-w-xl rounded-xl border border-primary-foreground/20 bg-primary-foreground/[0.08] p-4 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="mb-4 flex items-center gap-2 border-b border-primary-foreground/15 pb-3">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-red-400/90" />
                <span className="size-2.5 rounded-full bg-amber-300/90" />
                <span className="size-2.5 rounded-full bg-emerald-400/90" />
              </div>
              <div className="h-2 flex-1 max-w-[55%] rounded-full bg-primary-foreground/20" />
            </div>
            <div className="mb-4 grid grid-cols-3 gap-2">
              {[72, 55, 88].map((w) => (
                <div key={w} className="rounded-lg bg-primary-foreground/10 p-2.5">
                  <div className="mb-2 h-1.5 w-8 rounded-full bg-primary-foreground/25" />
                  <div
                    className="h-6 rounded-md bg-primary-foreground/20"
                    style={{ width: `${w}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2 rounded-lg bg-primary-foreground/[0.06] p-3">
              <div className="flex h-[72px] items-end gap-1.5">
                {[40, 65, 35, 80, 50, 90, 45].map((h, i) => (
                  <div
                    key={i}
                    className="min-w-0 flex-1 rounded-t-sm bg-primary-foreground/30"
                    style={{ height: `${(h / 100) * 72}px` }}
                  />
                ))}
              </div>
              <div className="flex justify-between gap-2">
                <div className="h-2 flex-1 rounded-full bg-primary-foreground/15" />
                <div className="h-2 w-1/3 rounded-full bg-primary-foreground/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-[1] w-full min-w-0 space-y-3 border-t border-primary-foreground/15 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-primary-foreground/60">
              {y} · Admin console
            </p>
            <p className="w-full text-xs leading-relaxed text-primary-foreground/55">
              Môi trường chỉ dành cho nhân sự được ủy quyền. Mọi thao tác có thể được ghi trong nhật ký
              phục vụ kiểm toán và bảo mật.
            </p>
          </div>
          <div className="h-px w-16 shrink-0  self-end max-sm:hidden" aria-hidden />
        </div>
        <p className="w-full text-[11px] leading-relaxed text-primary-foreground/50">
          Cần hỗ trợ truy cập hoặc quên thông tin đăng nhập — liên hệ quản trị hệ thống của bạn.
          Không chia sẻ tài khoản với bên thứ ba.
        </p>
      </div>
    </aside>
  );
}
