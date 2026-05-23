import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import {
  ProductForm,
} from "./product-form";

type Props = {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;
};

export const ProductDialog =
  ({
    open,
    onOpenChange,
  }: Props) => {
    return (
      <Dialog
        open={open}
        onOpenChange={
          onOpenChange
        }
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Product
            </DialogTitle>
          </DialogHeader>

          <ProductForm
            onSubmit={async () => {}}
          />
        </DialogContent>
      </Dialog>
    );
  };