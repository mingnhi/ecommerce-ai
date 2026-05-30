import type { LucideIcon } from "lucide-react";
import { buildPermissionKey } from "./permissions";
import {
  AlertTriangle,
  ClipboardCheck,
  Eye,
  PackagePlus,
  Pencil,
  Plus,
  ImagePlus,
  RefreshCw,
  Settings,
  Shield,
  ShieldCheck,
  Trash2,
  UserCog,
  XCircle,
} from "lucide-react";

export const PERMISSION_RESOURCE_LABELS = {
  Dashboard: "Tổng quan",
  Product: "Sản phẩm & Danh mục",
  Order: "Đơn hàng",
  Inventory: "Tồn kho",
  User: "Người dùng",
  Role: "Vai trò",
  Permission: "Quyền hạn",
} as const;

export const PERMISSION_RESOURCE_ACTIONS = {
  Dashboard: ["read"],
  Product: ["read", "create", "update", "delete", "upload_images"],
  Order: ["read", "update_status", "cancel", "delete"],
  Inventory: ["read", "import", "check", "adjust", "update_threshold", "delete"],
  Role: ["read", "create", "update", "delete", "assign_permissions"],
  Permission: ["read", "create", "update", "delete"],
  User: ["read", "create", "update", "delete", "update_status", "assign_roles"],
} as const;

const PRODUCT_RESOURCE_ENDPOINTS: Record<string, string> = {
  read: "GET /products · GET /products/:slug · GET /categories",
  create: "POST /products · POST /categories",
  update: "PUT /products/:id · PUT /categories/:id",
  delete: "DELETE /products/:id · DELETE /categories/:id · DELETE /images/:id",
  upload_images:
    "POST /products/:id/images · PATCH /images/:id/thumbnail · DELETE /images/:id",
};

export type PermissionResource = keyof typeof PERMISSION_RESOURCE_ACTIONS;
export type PermissionAction = keyof typeof PERMISSION_ACTION_META;

type ActionTone = "blue" | "emerald" | "amber" | "yellow" | "rose" | "violet" | "sky" | "indigo" | "orange" | "cyan" | "purple";

export type PermissionActionMeta = {
  label: string;
  description: string;
  method: string;
  icon: LucideIcon;
  tone: ActionTone;
  endpoint?: string;
};

export const PERMISSION_ACTION_TONES: Record<
  ActionTone,
  { active: string; idle: string }
> = {
  blue: {
    active: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    idle: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  emerald: {
    active: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    idle: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  amber: {
    active: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    idle: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  yellow: {
    active: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300",
    idle: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  rose: {
    active: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
    idle: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  violet: {
    active: "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
    idle: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  sky: {
    active: "bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400",
    idle: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  indigo: {
    active: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",
    idle: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  orange: {
    active: "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
    idle: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  cyan: {
    active: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400",
    idle: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  purple: {
    active: "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
    idle: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
};

export const PERMISSION_ACTION_META: Record<string, PermissionActionMeta> = {
  read: {
    label: "Xem",
    description: "Xem danh sách và chi tiết",
    method: "GET",
    icon: Eye,
    tone: "blue",
  },
  create: {
    label: "Tạo mới",
    description: "Tạo dữ liệu mới",
    method: "POST",
    icon: Plus,
    tone: "emerald",
  },
  update: {
    label: "Cập nhật",
    description: "Sửa đổi dữ liệu",
    method: "PATCH",
    icon: Pencil,
    tone: "amber",
  },
  delete: {
    label: "Xóa",
    description: "Xóa dữ liệu",
    method: "DELETE",
    icon: Trash2,
    tone: "rose",
  },
  manage: {
    label: "Toàn quyền",
    description: "Tất cả thao tác trên resource",
    method: "ALL",
    icon: Shield,
    tone: "violet",
  },
  import: {
    label: "Nhập kho",
    description: "Nhập hàng vào kho",
    method: "POST",
    icon: PackagePlus,
    tone: "sky",
    endpoint: "POST /inventory/import",
  },
  check: {
    label: "Kiểm kho",
    description: "Kiểm tra thực tế tồn kho",
    method: "POST",
    icon: ClipboardCheck,
    tone: "indigo",
    endpoint: "POST /inventory/check",
  },
  adjust: {
    label: "Điều chỉnh",
    description: "Điều chỉnh số lượng tồn",
    method: "PATCH",
    icon: Settings,
    tone: "amber",
    endpoint: "PATCH /inventory/:id/adjust",
  },
  update_threshold: {
    label: "Cập nhật ngưỡng",
    description: "Thay đổi ngưỡng cảnh báo tồn",
    method: "PATCH",
    icon: AlertTriangle,
    tone: "orange",
    endpoint: "PATCH /inventory/:id/threshold",
  },
  update_status: {
    label: "Cập nhật trạng thái",
    description: "Thay đổi trạng thái",
    method: "PATCH",
    icon: RefreshCw,
    tone: "yellow",
  },
  cancel: {
    label: "Hủy",
    description: "Hủy bỏ đơn hàng",
    method: "PATCH",
    icon: XCircle,
    tone: "rose",
    endpoint: "PATCH /orders/:id/cancel",
  },
  assign_roles: {
    label: "Gán vai trò",
    description: "Gán vai trò cho người dùng",
    method: "POST",
    icon: UserCog,
    tone: "purple",
    endpoint: "POST /users/:id/roles",
  },
  assign_permissions: {
    label: "Gán quyền",
    description: "Gán quyền cho vai trò",
    method: "POST",
    icon: ShieldCheck,
    tone: "violet",
    endpoint: "POST /roles/:id/permissions",
  },
  upload_images: {
    label: "Quản lý ảnh",
    description: "Upload, đặt thumbnail và xóa ảnh sản phẩm",
    method: "POST/PATCH/DELETE",
    icon: ImagePlus,
    tone: "cyan",
    endpoint: "POST /products/:id/images",
  },
};

export function getPermissionResources(): PermissionResource[] {
  return Object.keys(PERMISSION_RESOURCE_ACTIONS) as PermissionResource[];
}

export function getActionsForResource(resource: PermissionResource): string[] {
  return [...PERMISSION_RESOURCE_ACTIONS[resource]];
}

export function getActionMeta(action: string): PermissionActionMeta | undefined {
  return PERMISSION_ACTION_META[action];
}

export function getResourceLabel(resource: string): string {
  return PERMISSION_RESOURCE_LABELS[resource as PermissionResource] ?? resource;
}

export function createPermissionDraft(
  resource: PermissionResource,
  action: string
): { name: string; description: string } | null {
  const meta = getActionMeta(action);
  if (!meta) return null;

  const resourceLabel = PERMISSION_RESOURCE_LABELS[resource];
  const resourceEndpoint =
    resource === "Product" ? PRODUCT_RESOURCE_ENDPOINTS[action] : undefined;
  const endpointDetail = resourceEndpoint ?? meta.endpoint;
  const endpoint = endpointDetail ? ` (${endpointDetail})` : "";

  return {
    name: buildPermissionKey(resource, action),
    description: `${meta.description} · ${resourceLabel} · ${meta.method}${endpoint}`,
  };
}
