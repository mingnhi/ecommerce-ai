import { useEffect } from "react";

import {
  useForm,
} from "react-hook-form";

import {
  Button,
} from "@/shared/components/ui/button";

import {
  Input,
} from "@/shared/components/ui/input";

import {
  Label,
} from "@/shared/components/ui/label";

import {
  Card,
  CardContent,
} from "@/shared/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import type { Category } from "../types";

interface Props {
  categories: Category[];

  initialData?: Category;

  loading?: boolean;

  onSubmit: (
    values: {
      name: string;

      parentId?: string;
    }
  ) => void;
}

interface FormValues {
  name: string;

  parentId?: string;
}

export const CategoryForm = ({
  categories,
  initialData,
  loading,
  onSubmit,
}: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } =
    useForm<FormValues>({
      defaultValues: {
        name:
          initialData?.name ||
          "",

        parentId:
          initialData?.parentId ||
          "0",
      },
    });

  useEffect(() => {
    reset({
      name:
        initialData?.name ||
        "",

      parentId:
        initialData?.parentId ||
        "0",
    });
  }, [
    initialData,
    reset,
  ]);

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit
      )}
      className="space-y-6"
    >
      <Card className="border-0 shadow-none">
        <CardContent className="space-y-6 p-0">
          {/* NAME */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Tên danh mục
            </Label>

            <Input
              placeholder="Ví dụ: Điện thoại, Laptop..."
              className="h-11"
              {...register(
                "name"
              )}
            />
          </div>

          {/* PARENT */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Danh mục cha
            </Label>

            <Select
              value={
                watch(
                  "parentId"
                ) || "0"
              }
              onValueChange={v =>
                setValue(
                  "parentId",
                  v
                )
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Chọn danh mục cha" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="0">
                  Không có
                </SelectItem>

                {categories
                  .filter(
                    c =>
                      c.id !==
                      initialData?.id
                  )
                  .map(
                    (
                      category: Category
                    ) => (
                      <SelectItem
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </SelectItem>
                    )
                  )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ACTION */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="h-11 px-6"
        >
          {loading
            ? "Đang xử lý..."
            : initialData
              ? "Cập nhật danh mục"
              : "Tạo danh mục"}
        </Button>
      </div>
    </form>
  );
};