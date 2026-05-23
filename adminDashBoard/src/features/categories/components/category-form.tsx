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
      className="space-y-5"
    >
      <div className="space-y-2">
        <Label>
          Tên danh mục
        </Label>

        <Input
          placeholder="Nhập tên danh mục..."
          {...register(
            "name"
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>
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
          <SelectTrigger>
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
                category => (
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

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading
          ? "Đang xử lý..."
          : initialData
            ? "Cập nhật"
            : "Tạo danh mục"}
      </Button>
    </form>
  );
};