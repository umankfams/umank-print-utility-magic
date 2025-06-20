
import { Button } from "@/components/ui/button";
import { Plus, FileText, LayoutGrid, Table as TableIcon } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { useState } from "react";

interface ProductListProps {
  products: Product[];
  onAddNew: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onViewIngredients: (product: Product) => void; // Kept for backward compatibility
  onViewTasks: (product: Product) => void;
}

export const ProductList = ({
  products,
  onAddNew,
  onEdit,
  onDelete,
  onViewIngredients,
  onViewTasks,
}: ProductListProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? "bg-muted" : ""}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setViewMode('table')}
            className={`ml-2 ${viewMode === 'table' ? "bg-muted" : ""}`}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={onAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Produk
        </Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewIngredients={onViewIngredients}
              onViewTasks={onViewTasks}
            />
          ))}

          {products.length === 0 && (
            <div className="text-center py-10 col-span-full">
              <p className="text-muted-foreground">
                Produk tidak ditemukan. Klik "Tambah Produk" untuk membuat satu.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-sm">Nama</th>
                <th className="text-left p-3 font-medium text-sm">Harga Pokok</th>
                <th className="text-left p-3 font-medium text-sm">Harga Jual</th>
                <th className="text-left p-3 font-medium text-sm">Stok</th>
                <th className="text-left p-3 font-medium text-sm">Pesanan Min</th>
                <th className="text-left p-3 font-medium text-sm">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="p-3">{product.name}</td>
                  <td className="p-3">Rp{product.costPrice.toLocaleString('id-ID')}</td>
                  <td className="p-3">Rp{product.sellingPrice.toLocaleString('id-ID')}</td>
                  <td className="p-3">{product.stock}</td>
                  <td className="p-3">{product.minOrder}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onViewTasks(product)}>
                        <FileText className="h-4 w-4 mr-1" /> Tugas
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(product.id)}>
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-muted-foreground">
                    Produk tidak ditemukan. Klik "Tambah Produk" untuk membuat satu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
