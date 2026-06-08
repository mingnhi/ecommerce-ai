import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";
import type { Category } from "../types/category.type";

type FormValues = {
  name: string;
  parentId?: string;
};

type Props = {
  categories: Category[];
  initialData?: Category;
  loading?: boolean;
  onSubmit: (values: FormValues) => void;
  onCancel?: () => void;
};

const fieldClass =
  "h-10 rounded-lg border border-slate-200 bg-background/50 text-sm transition-all placeholder:text-muted-foreground/60 focus-visible:border-sky-500 focus-visible:ring-3 focus-visible:ring-sky-500/10 dark:border-slate-800";

export function CategoryForm({
  categories,
  initialData,
  loading,
  onSubmit,
  onCancel,
}: Props) {
  const { register, handleSubmit, setValue, watch, reset } = useForm<FormValues>({
    defaultValues: {
      name: initialData?.name ?? "",
      parentId: initialData?.parentId ?? "0",
    },
  });

  useEffect(() => {
    reset({
      name: initialData?.name ?? "",
      parentId: initialData?.parentId ?? "0",
    });
  }, [initialData, reset]);

  const parentOptions = categories.filter((c) => c.id !== initialData?.id);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
      <div className="space-y-2">
        <Label
          htmlFor="category-name"
          className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          Tên danh mục
        </Label>
        <Input
          id="category-name"
          placeholder="Ví dụ: Điện thoại, Laptop..."
          className={fieldClass}
          {...register("name", { required: true })}
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="category-parent"
          className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          Danh mục cha
        </Label>
        <Select
          value={watch("parentId") || "0"}
          onValueChange={(value) => setValue("parentId", value)}
        >
          <SelectTrigger id="category-parent" className={cn(fieldClass, "w-full")}>
            <SelectValue placeholder="Chọn danh mục cha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Không có</SelectItem>
            {parentOptions.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DialogFooter className="gap-2 border-t border-slate-100 pt-4 sm:gap-0 dark:border-slate-900">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-10 cursor-pointer rounded-lg border-slate-200 px-4 font-semibold dark:border-slate-800"
          >
            Hủy
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={loading}
          className="h-10 cursor-pointer rounded-lg bg-sky-600 px-5 font-semibold text-white shadow-sm transition-all hover:bg-sky-700 active:scale-95"
        >
          {loading
            ? "Đang xử lý..."
            : initialData
              ? "Cập nhật"
              : "Tạo danh mục"}
        </Button>
      </DialogFooter>
    </form>
  );
}
