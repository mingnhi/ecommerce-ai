import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";

import * as z from "zod";

import { Button } from "@/shared/components/ui/button";

import { Input } from "@/shared/components/ui/input";

import { Textarea } from "@/shared/components/ui/textarea";

import { Switch } from "@/shared/components/ui/switch";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { useCategories } from "@/features/categories/hooks/categories";

const productSchema = z.object({
  categoryId: z.string(),

  name: z.string().min(1),

  shortDescription:
    z.string().optional(),

  description:
    z.string().optional(),

  price: z.coerce.number(),

  originalPrice:
    z.coerce.number().optional(),

  isActive: z.boolean(),
});

export type ProductFormValues =
  z.infer<
    typeof productSchema
  >;

type Props = {
  defaultValues?: Partial<ProductFormValues>;

  loading?: boolean;

  onSubmit: (
    values: ProductFormValues
  ) => Promise<void>;
};

export default function ProductForm({
  defaultValues,
  loading,
  onSubmit,
}: Props) {
  const { categories } =
    useCategories("flat");

  const form =
    useForm<ProductFormValues>({
      resolver:
        zodResolver(
          productSchema
        ),

      defaultValues: {
        categoryId:
          defaultValues?.categoryId ||
          "",

        name:
          defaultValues?.name ||
          "",

        shortDescription:
          defaultValues?.shortDescription ||
          "",

        description:
          defaultValues?.description ||
          "",

        price:
          defaultValues?.price ||
          0,

        originalPrice:
          defaultValues?.originalPrice,

        isActive:
          defaultValues?.isActive ??
          true,
      },
    });

  const handleSubmit =
    async (
      values: ProductFormValues
    ) => {
      await onSubmit(values);
    };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          handleSubmit
        )}
        className="space-y-5"
      >
        {/* CATEGORY */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({
            field,
          }) => (
            <FormItem>
              <FormLabel>
                Category
              </FormLabel>

              <Select
                value={
                  field.value
                }
                onValueChange={
                  field.onChange
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {categories.map(
                    (
                      category
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

              <FormMessage />
            </FormItem>
          )}
        />

        {/* NAME */}
        <FormField
          control={form.control}
          name="name"
          render={({
            field,
          }) => (
            <FormItem>
              <FormLabel>
                Product Name
              </FormLabel>

              <FormControl>
                <Input
                  placeholder="Enter product name"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* SHORT DESCRIPTION */}
        <FormField
          control={form.control}
          name="shortDescription"
          render={({
            field,
          }) => (
            <FormItem>
              <FormLabel>
                Short Description
              </FormLabel>

              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Short description"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* DESCRIPTION */}
        <FormField
          control={form.control}
          name="description"
          render={({
            field,
          }) => (
            <FormItem>
              <FormLabel>
                Description
              </FormLabel>

              <FormControl>
                <Textarea
                  rows={6}
                  placeholder="Product description"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* PRICE */}
        <FormField
          control={form.control}
          name="price"
          render={({
            field,
          }) => (
            <FormItem>
              <FormLabel>
                Price
              </FormLabel>

              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(
                    e
                  ) =>
                    field.onChange(
                      Number(
                        e.target
                          .value
                      )
                    )
                  }
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* ORIGINAL PRICE */}
        <FormField
          control={form.control}
          name="originalPrice"
          render={({
            field,
          }) => (
            <FormItem>
              <FormLabel>
                Original Price
              </FormLabel>

              <FormControl>
                <Input
                  type="number"
                  value={
                    field.value ||
                    ""
                  }
                  onChange={(
                    e
                  ) =>
                    field.onChange(
                      e.target
                        .value
                        ? Number(
                            e
                              .target
                              .value
                          )
                        : undefined
                    )
                  }
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* ACTIVE */}
        <FormField
          control={form.control}
          name="isActive"
          render={({
            field,
          }) => (
            <FormItem className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <FormLabel>
                  Active
                </FormLabel>
              </div>

              <FormControl>
                <Switch
                  checked={
                    field.value
                  }
                  onCheckedChange={
                    field.onChange
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : "Save Product"}
        </Button>
      </form>
    </Form>
  );
}