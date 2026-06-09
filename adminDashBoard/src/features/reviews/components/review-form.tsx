// features/reviews/components/ReviewForm.tsx
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import type { Review, UpdateReviewRequest } from "../types/review.type";

interface Props {
  initialData?: Review;
  onSubmit: (data: UpdateReviewRequest) => Promise<any>;
  onCancel?: () => void;
  loading?: boolean;
}

export const ReviewForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: Props) => {
  const { register, handleSubmit, setValue, watch } = useForm<UpdateReviewRequest>({
    defaultValues: {
      rating: initialData?.rating || 5,
      comment: initialData?.comment || "",
    },
  });

  const onSubmitHandler = async (values: UpdateReviewRequest) => {
    try {
      await onSubmit(values);
      toast.success("Cập nhật đánh giá thành công");
      onCancel?.();
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message
        : "Có lỗi xảy ra";
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chỉnh sửa Đánh giá</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
          <div className="space-y-2">
            <Label>Điểm đánh giá</Label>
            <Select
              value={String(watch("rating"))}
              onValueChange={(v) => setValue("rating", Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    {r} sao
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nội dung đánh giá</Label>
            <Textarea
              {...register("comment")}
              rows={5}
              placeholder="Nội dung đánh giá..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};