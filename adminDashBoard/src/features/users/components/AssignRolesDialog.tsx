import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Shield, Search, UserRound } from "lucide-react";
import { useRoles } from "@/features/roles/hooks";
import { useAssignUserRoles } from "../hooks";
import type { User } from "../types";
import { cn } from "@/shared/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
};

export function AssignRolesDialog({ open, onOpenChange, user }: Props) {
  const [draftIds, setDraftIds] = useState<string[] | null>(null);
  const [search, setSearch] = useState("");

  const { data: allRoles = [], isLoading } = useRoles();
  const assignMutation = useAssignUserRoles();

  const currentRoleIds = useMemo(
    () => user?.roles?.map((r) => r.id) ?? [],
    [user?.roles]
  );

  const selectedIds = draftIds ?? currentRoleIds;

  const updateSelectedIds = (updater: string[] | ((prev: string[]) => string[])) => {
    setDraftIds((prev) => {
      const base = prev ?? currentRoleIds;
      return typeof updater === "function" ? updater(base) : updater;
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setDraftIds(null);
      setSearch("");
    }
    onOpenChange(next);
  };

  const filteredRoles = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allRoles;
    return allRoles.filter(
      (role) =>
        role.name.toLowerCase().includes(q) ||
        role.description?.toLowerCase().includes(q)
    );
  }, [allRoles, search]);

  const diffStats = useMemo(() => {
    const initial = new Set(currentRoleIds);
    const selected = new Set(selectedIds);
    const added = selectedIds.filter((id) => !initial.has(id)).length;
    const removed = currentRoleIds.filter((id) => !selected.has(id)).length;
    return { added, removed, changed: added > 0 || removed > 0 };
  }, [currentRoleIds, selectedIds]);

  const isAllFilteredSelected =
    filteredRoles.length > 0 &&
    filteredRoles.every((r) => selectedIds.includes(r.id));

  const toggleRole = (id: string) => {
    updateSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAllFiltered = () => {
    const ids = filteredRoles.map((r) => r.id);
    if (isAllFilteredSelected) {
      updateSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
      return;
    }
    updateSelectedIds((prev) => [...prev, ...ids.filter((id) => !prev.includes(id))]);
  };

  const handleSave = async () => {
    if (!user) return;
    await assignMutation.mutateAsync({ userId: user.id, roleIds: selectedIds });
    handleOpenChange(false);
  };

  const isPending = assignMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-6 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl flex flex-col gap-0 max-h-[90vh]">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-900 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            <div className="size-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Shield className="size-5" />
            </div>
            Gán vai trò cho người dùng
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-10">
            Chọn vai trò phù hợp, sau đó nhấn Lưu thay đổi.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 shrink-0">
            <div className="size-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
              <UserRound className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                {user.fullName || "—"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Badge variant="outline" className="shrink-0 text-[10px] font-medium">
              {selectedIds.length} vai trò
            </Badge>
          </div>
        )}

        <div className="py-4 shrink-0 space-y-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm vai trò theo tên, mô tả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-background/50 outline-none focus:border-sky-500 focus:ring-3 focus:ring-sky-500/10 transition-all placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-muted-foreground">
              {filteredRoles.length} / {allRoles.length} vai trò
            </span>
            {filteredRoles.length > 0 && (
              <button
                type="button"
                onClick={toggleAllFiltered}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 transition-colors"
              >
                {isAllFilteredSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[320px] sm:h-[360px] border border-slate-100 dark:border-slate-900 rounded-xl p-3 bg-slate-50/[0.07]">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-xs text-muted-foreground">
              Đang tải vai trò...
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xs text-muted-foreground italic">
                Không tìm thấy vai trò phù hợp.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRoles.map((role) => {
                const checked = selectedIds.includes(role.id);
                const wasAssigned = currentRoleIds.includes(role.id);

                return (
                  <label
                    key={role.id}
                    className={cn(
                      "flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all",
                      "bg-white/60 dark:bg-slate-950/40 shadow-sm",
                      checked
                        ? "border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/20 ring-1 ring-sky-500/10"
                        : "border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-800 hover:bg-white dark:hover:bg-slate-950/60"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleRole(role.id)}
                      className="mt-0.5 border-slate-300 dark:border-slate-700 data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {role.name}
                        </span>
                        {wasAssigned && (
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                            Hiện tại
                          </Badge>
                        )}
                      </div>
                      {role.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {role.description}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-900 shrink-0 flex items-center justify-between w-full sm:flex-row flex-col gap-3">
          <div className="text-[11px] text-muted-foreground text-left w-full sm:w-auto">
            {diffStats.changed ? (
              <span>
                Thay đổi:{" "}
                {diffStats.added > 0 && (
                  <strong className="text-emerald-600">+{diffStats.added} gán</strong>
                )}
                {diffStats.added > 0 && diffStats.removed > 0 && ", "}
                {diffStats.removed > 0 && (
                  <strong className="text-rose-500">-{diffStats.removed} gỡ</strong>
                )}
              </span>
            ) : (
              "Chưa có thay đổi nào"
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="rounded-lg px-4 h-9 text-xs font-semibold border-slate-200 dark:border-slate-800"
            >
              Hủy
            </Button>
            <Button
              type="button"
              disabled={isPending || !diffStats.changed}
              onClick={handleSave}
              className="rounded-lg px-5 h-9 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
