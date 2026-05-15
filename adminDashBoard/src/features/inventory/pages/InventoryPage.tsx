import { useState, type FormEvent } from "react";
import { AlertTriangle, Package } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import { Card, CardContent } from "@/shared/components/ui/card";
import { toast } from "@/shared/components/ui/toast";
import { useInventoryList, useCreateMovement, useMovements } from "../hooks";
import type { MovementType } from "../types";

export default function InventoryPage() {
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [openHistory, setOpenHistory] = useState<string | null>(null);
  const [openMovement, setOpenMovement] = useState(false);
  const [mVariantId, setMVariantId] = useState("");
  const [mType, setMType] = useState<MovementType>("IMPORT");
  const [mQty, setMQty] = useState("");
  const [mNote, setMNote] = useState("");

  const inventory = useInventoryList({ low_stock: lowStockOnly || undefined, page, limit: 20 });
  const createMv = useCreateMovement();
  const movements = useMovements({ variantId: openHistory || undefined, limit: 30 });

  const onSubmitMovement = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createMv.mutateAsync({
        variantId: mVariantId,
        type: mType,
        quantity: Number(mQty),
        note: mNote || undefined,
      });
      toast.success(`${mType} ${mQty} units OK`);
      setOpenMovement(false);
      setMVariantId(""); setMQty(""); setMNote("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Lỗi");
    }
  };

  const meta = inventory.data?.meta;

  const lowCount = inventory.data?.items.filter((i) => i.lowStock).length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventory</h1>
          <p className="text-sm text-slate-500">Stock dashboard, IMPORT/ADJUST, movement history</p>
        </div>
        <Button onClick={() => setOpenMovement(true)}>
          <Package size={14} className="mr-1" /> Tạo movement
        </Button>
      </div>

      {lowCount > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertTriangle className="text-yellow-700" size={18} />
            <span className="text-sm">
              Có <strong>{lowCount}</strong> variant đang low stock
            </span>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1); }}
          />
          Chỉ low stock
        </label>
      </div>

      <div className="rounded-lg border bg-white">
        {inventory.isLoading ? (
          <div className="p-8 flex justify-center"><Spinner size={20} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant ID</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">Sold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Chưa có inventory
                  </TableCell>
                </TableRow>
              ) : (
                inventory.data?.items.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-mono text-xs">{i.variantId}</TableCell>
                    <TableCell className="text-right font-medium">{i.available}</TableCell>
                    <TableCell className="text-right text-orange-600">{i.reserved}</TableCell>
                    <TableCell className="text-right text-slate-500">{i.sold}</TableCell>
                    <TableCell>
                      {i.lowStock ? (
                        <Badge variant="warning">Low stock</Badge>
                      ) : (
                        <Badge variant="success">OK</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOpenHistory(i.variantId)}
                      >
                        Lịch sử
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Page {meta.page}/{meta.totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Movement dialog */}
      <Dialog open={openMovement} onOpenChange={setOpenMovement}>
        <DialogHeader><DialogTitle>Tạo movement</DialogTitle></DialogHeader>
        <form onSubmit={onSubmitMovement}>
          <DialogContent className="space-y-3">
            <div className="space-y-1">
              <Label>Variant ID</Label>
              <Input value={mVariantId} onChange={(e) => setMVariantId(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={mType} onChange={(e) => setMType(e.target.value as MovementType)}>
                <option value="IMPORT">IMPORT (nhập kho)</option>
                <option value="ADJUST">ADJUST (set absolute)</option>
                <option value="RELEASE">RELEASE (reserved → available)</option>
                <option value="SELL">SELL (reserved → sold)</option>
                <option value="RESERVE">RESERVE (available → reserved)</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Quantity</Label>
              <Input type="number" min={1} value={mQty} onChange={(e) => setMQty(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Ghi chú</Label>
              <Input value={mNote} onChange={(e) => setMNote(e.target.value)} />
            </div>
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenMovement(false)}>Hủy</Button>
            <Button type="submit" disabled={createMv.isPending}>Tạo</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* History dialog */}
      <Dialog open={!!openHistory} onOpenChange={(v) => !v && setOpenHistory(null)} className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Lịch sử movement</DialogTitle>
          <div className="text-xs text-slate-500 font-mono mt-1">{openHistory}</div>
        </DialogHeader>
        <DialogContent className="max-h-[60vh] overflow-y-auto">
          {movements.isLoading ? (
            <Spinner size={20} />
          ) : !movements.data?.items.length ? (
            <div className="text-slate-500 text-sm">Chưa có movement</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Ref</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.data?.items.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Badge variant={
                        m.type === "IMPORT" ? "success"
                        : m.type === "SELL" ? "default"
                        : m.type === "RESERVE" ? "warning"
                        : "secondary"
                      }>
                        {m.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{m.quantity}</TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {m.referenceType ? `${m.referenceType}:${m.referenceId?.slice(0, 8)}` : "-"}
                    </TableCell>
                    <TableCell className="text-xs">{m.note ?? "-"}</TableCell>
                    <TableCell className="text-xs">
                      {new Date(m.createdAt).toLocaleString("vi-VN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
