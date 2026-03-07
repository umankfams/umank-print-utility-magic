import { useState } from "react";
import { usePartners, Partner } from "@/hooks/usePartners";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Building2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { useTitle } from "@/hooks/useTitle";

const emptyForm = { companyName: "", email: "", phone: "", isActive: true };

export default function Partners() {
  useTitle("Mitra");
  const { partners, isLoading, createPartner, updatePartner, deletePartner } = usePartners();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditingPartner(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Partner) => {
    setEditingPartner(p);
    setForm({ companyName: p.companyName, email: p.email || "", phone: p.phone || "", isActive: p.isActive });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.companyName.trim()) {
      toast.error("Nama perusahaan wajib diisi");
      return;
    }
    try {
      if (editingPartner) {
        await updatePartner.mutateAsync({ id: editingPartner.id, ...form });
        toast.success("Mitra berhasil diperbarui");
      } else {
        await createPartner.mutateAsync(form);
        toast.success("Mitra berhasil ditambahkan");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Gagal menyimpan mitra");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePartner.mutateAsync(id);
      toast.success("Mitra berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus mitra");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mitra</h1>
          <p className="text-muted-foreground">Kelola mitra cetak perusahaan Anda</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Mitra
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Daftar Mitra
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Memuat data...</p>
          ) : partners.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Belum ada mitra. Tambahkan mitra pertama Anda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Perusahaan</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>No. Handphone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {p.companyName}
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.email ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {p.email}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.phone ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {p.phone}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? "default" : "secondary"}>
                        {p.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPartner ? "Edit Mitra" : "Tambah Mitra"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Perusahaan *</Label>
              <Input
                placeholder="PT. Contoh Printing"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email Perusahaan</Label>
              <Input
                type="email"
                placeholder="info@contoh.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>No. Handphone</Label>
              <Input
                placeholder="08123456789"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Status Aktif</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
