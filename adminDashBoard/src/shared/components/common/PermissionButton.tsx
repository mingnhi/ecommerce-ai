import { useCan } from "@/shared/hooks/use-can";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ShieldAlert, HelpCircle } from "lucide-react";
import { useState } from "react";
type PermissionButtonProps = React.ComponentProps<typeof Button> & {
  permission: string;
  fallbackBehavior?: "hide" | "disable" | "alert";
  children: React.ReactNode;
};

function getPermissionLabel(permission: string): { action: string; subject: string } {
  const [subject, action] = permission.split(":") as [string, string];
  
  const subjectLabels: Record<string, string> = {
    dashboard: "Tổng quan",
    product: "Sản phẩm",
    order: "Đơn hàng",
    inventory: "Tồn kho",
    role: "Vai trò",
    permission: "Quyền hạn",
    user: "Người dùng",
  };

  const actionLabels: Record<string, string> = {
    read: "Xem",
    view: "Xem",
    create: "Tạo mới",
    update: "Cập nhật",
    delete: "Xóa",
    update_status: "Cập nhật trạng thái",
    cancel: "Hủy",
    import: "Nhập kho",
    check: "Kiểm kho",
    adjust: "Điều chỉnh tồn",
    update_threshold: "Cập nhật ngưỡng",
    assign_permissions: "Gán quyền",
    assign_roles: "Gán vai trò",
  };

  return {
    action: actionLabels[action] || action,
    subject: subjectLabels[subject] || subject,
  };
}

export function PermissionButton({
  permission,
  fallbackBehavior = "alert",
  onClick,
  children,
  ...props
}: PermissionButtonProps) {
  const [showWarning, setShowWarning] = useState(false);
  const allowed = useCan(permission);

  if (!allowed && fallbackBehavior === "hide") {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!allowed) {
      e.preventDefault();
      e.stopPropagation();
      
      if (fallbackBehavior === "alert") {
        setShowWarning(true);
      }
      return;
    }

    if (onClick) {
      onClick(e);
    }
  };

  const { action, subject } = getPermissionLabel(permission);

  return (
    <>
      <Button
        {...props}
        onClick={handleClick}
        disabled={!allowed && fallbackBehavior === "disable" ? true : props.disabled}
        className={`${props.className || ""} ${
          !allowed && fallbackBehavior === "alert" ? "opacity-90 hover:bg-opacity-100" : ""
        }`}
      >
        {children}
      </Button>

      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="sm:max-w-md p-6 rounded-sm border border-amber-100 dark:border-amber-900/30 bg-white dark:bg-slate-950 shadow-2xl flex flex-col gap-0">
          <DialogHeader className="pb-4 items-center text-center shrink-0">
            <div className="size-14 rounded-sm bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500 mb-4 border border-amber-100 dark:border-amber-900/30">
              <ShieldAlert className="size-7" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
              Hạn chế quyền hạn thao tác
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
              Tài khoản hiện tại của bạn không được phân quyền thực hiện hành động này.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 p-4 rounded-sm bg-amber-50/50 dark:bg-amber-950/5 border border-amber-100/50 dark:border-amber-900/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <HelpCircle className="size-3.5" /> Hành động yêu cầu:
              </span>
              <strong className="text-amber-700 dark:text-amber-400 font-bold">
                {action}
              </strong>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-amber-100/50 dark:border-amber-900/10 pt-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <HelpCircle className="size-3.5" /> Tài nguyên:
              </span>
              <strong className="text-amber-700 dark:text-amber-400 font-bold">
                {subject}
              </strong>
            </div>
            <div className="text-[10px] text-center text-muted-foreground mt-2 pt-2 border-t border-amber-100/50 dark:border-amber-900/10">
              Permission: <code className="bg-amber-100/50 dark:bg-amber-900/10 px-1 py-0.5 rounded">{permission}</code>
            </div>
          </div>

          <DialogFooter className="-mx-6 -mb-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-900 shrink-0 bg-slate-50/50 dark:bg-slate-900/30 p-6 flex items-center justify-center w-full">
            <Button
              type="button"
              onClick={() => setShowWarning(false)}
              className="rounded-sm px-6 h-9 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all active:scale-95 hover:cursor-pointer"
            >
              Đã hiểu, đóng lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
