import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { ProductDialog } from "../components/product-dialog";
import { ProductTable } from "../components/product-table";

import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../hooks/products";

import { useCategories } from "@/features/categories/hooks/categories";

import type { ProductFormValues, ProductListItem } from "../types/product.type";

const ProductsPage = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    ProductListItem | undefined
  >(undefined);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sort, setSort] = useState("newest");

  const { data: productsData, isLoading: isProductsLoading, refetch } =
    useProducts({
      search,
      limit: 50,
      categoryId: categoryId === "all" ? undefined : categoryId,
      sort,
    });

  const { data: categoriesData } = useCategories("flat");

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const products = productsData?.products || [];
  console.log(productsData);
  
  const categories = categoriesData?.categories || [];

  /**
   * Chỉ tạo/cập nhật product — trả về response để ProductForm lấy productId upload ảnh.
   * KHÔNG đóng dialog, KHÔNG navigate — để ProductForm kiểm soát flow hoàn chỉnh.
   */
  const handleSubmit = async (values: ProductFormValues) => {
    if (selectedProduct) {
      const response = await updateMutation.mutateAsync({
        id: selectedProduct.id,
        payload: {
          categoryId: values.categoryId,
          name: values.name,
          shortDescription: values.shortDescription,
          description: values.description,
          isActive: values.isActive,
          prices: values.prices || [],
          variants: values.variants || [],
          attributes: values.attributes || [],
        },
      });
      return response;
    } else {
      const response = await createMutation.mutateAsync({
        categoryId: values.categoryId,
        name: values.name,
        shortDescription: values.shortDescription,
        description: values.description,
        isActive: values.isActive,
        prices: values.prices || [],
        variants: values.variants || [],
        attributes: values.attributes || [],
      });
      return response;
    }
  };

  /**
   * Được gọi bởi ProductDialog sau khi ProductForm hoàn tất toàn bộ flow.
   * Lúc này mới đóng dialog và refetch.
   */
  const handleSuccess = () => {
    setSelectedProduct(undefined);
    refetch();
  };

  const handleEdit = (product: ProductListItem) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Xóa sản phẩm thành công");
        refetch();
      },
      onError: () => toast.error("Không thể xóa sản phẩm"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý sản phẩm
          </h1>
          <p className="mt-1 text-muted-foreground">
            Tổng số: {products.length} sản phẩm
          </p>
        </div>

        <Button
          onClick={() => {
            setSelectedProduct(undefined);
            setOpen(true);
          }}
          className="h-11 px-5"
        >
          <PlusIcon className="mr-2 size-4" />
          Thêm sản phẩm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative w-full max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="h-11 pl-10"
          />
        </div>

        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="h-11 w-full md:w-[240px]">
            <SelectValue placeholder="Tất cả danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((cat: any) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-11 w-full md:w-[240px]">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="oldest">Cũ nhất</SelectItem>
            <SelectItem value="price_asc">Giá thấp → cao</SelectItem>
            <SelectItem value="price_desc">Giá cao → thấp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isProductsLoading ? (
        <div className="rounded-2xl border bg-card py-20 text-center">
          Đang tải danh sách...
        </div>
      ) : (
        <ProductTable
          products={products}
          onView={(slug) => navigate(`/products/${slug}`)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ProductDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setSelectedProduct(undefined);
        }}
        initialData={selectedProduct as any}
        categories={categories}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default ProductsPage;
