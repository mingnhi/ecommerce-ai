import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  getActionMeta,
  PERMISSION_ACTION_TONES,
} from "@/shared/lib/casl/permission-actions";

type Props = {
  actions: string[];
  value: string;
  onChange: (action: string) => void;
};

export function PermissionActionGrid({ actions, value, onChange }: Props) {
  if (actions.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-sky-500/25 bg-sky-500/5 px-3 py-6 text-center text-xs text-muted-foreground">
        Tất cả hành động của module này đã được tạo.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action) => {
        const meta = getActionMeta(action);
        if (!meta) return null;

        const selected = value === action;
        const Icon = meta.icon;
        const tone = PERMISSION_ACTION_TONES[meta.tone];

        return (
          <button
            key={action}
            type="button"
            onClick={() => onChange(action)}
            className={cn(
              "group flex flex-col gap-2 rounded-sm border p-3 text-left transition-all",
              selected
                ? "border-sky-500 bg-sky-500/[0.06] ring-2 ring-sky-500/15"
                : "border-sky-500/15 hover:border-sky-500/30 hover:bg-sky-500/[0.03]"
            )}
          >
            <div className="flex w-full items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-sm",
                    selected ? tone.active : tone.idle
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{meta.label}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {meta.method} · {action}
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border",
                  selected
                    ? "border-sky-500 bg-sky-500 text-white"
                    : "border-slate-300 dark:border-slate-600"
                )}
              >
                {selected && <Check className="size-2.5 stroke-[3]" />}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
