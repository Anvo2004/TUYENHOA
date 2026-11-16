import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Loader2, X, Home } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const EMPTY_FORM = { ten: '', biThu: '', thonTruong: '', matTran: '', soHo: '', danSo: '', thuTu: '' }

// Ô số để trống → null (MiniApp ẩn dòng số hộ/dân số thay vì hiện 0).
const toNum = (v) => (v === '' || v === null || v === undefined ? null : Number(v))
const fmt = (n) => (n === null || n === undefined ? '—' : n.toLocaleString('vi-VN'))

export default function ThonXomPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data, isLoading } = useQuery({
    queryKey: ['thon-xom'],
    queryFn: () => api.get('/api/thon-xom').then((r) => r.data),
  })
  const items = data?.items ?? []
  const tongHo = items.reduce((s, v) => s + (v.soHo || 0), 0)
  const tongDan = items.reduce((s, v) => s + (v.danSo || 0), 0)
  const tongCongDan = items.reduce((s, v) => s + (v.soCongDan || 0), 0)

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingId ? api.put(`/api/thon-xom/${editingId}`, payload) : api.post('/api/thon-xom', payload),
    onSuccess: () => {
      toast.success(editingId ? 'Đã cập nhật thôn' : 'Đã thêm thôn')
      resetForm()
      queryClient.invalidateQueries({ queryKey: ['thon-xom'] })
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Lỗi lưu dữ liệu'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/thon-xom/${id}`),
    onSuccess: () => {
      toast.success('Đã xoá thôn')
      queryClient.invalidateQueries({ queryKey: ['thon-xom'] })
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Lỗi xoá'),
  })

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  function startEdit(v) {
    setEditingId(v._id)
    setForm({
      ten: v.ten || '', biThu: v.biThu || '', thonTruong: v.thonTruong || '', matTran: v.matTran || '',
      soHo: v.soHo ?? '', danSo: v.danSo ?? '', thuTu: v.thuTu ?? '',
    })
    setShowForm(true)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.ten.trim()) {
      toast.error('Vui lòng nhập tên thôn')
      return
    }
    saveMutation.mutate({
      ten: form.ten.trim(),
      biThu: form.biThu.trim(),
      thonTruong: form.thonTruong.trim(),
      matTran: form.matTran.trim(),
      soHo: toNum(form.soHo),
      danSo: toNum(form.danSo),
      thuTu: toNum(form.thuTu) ?? 0,
    })
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function confirmDelete(v) {
    const warn = v.soCongDan
      ? `\n\n${v.soCongDan} công dân đang chọn thôn này sẽ phải chọn lại thôn trong MiniApp.`
      : ''
    if (window.confirm(`Xoá ${v.ten}?${warn}`)) deleteMutation.mutate(v._id)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Home className="h-6 w-6 text-primary" /> Thôn xóm</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} thôn · {fmt(tongHo)} hộ · {fmt(tongDan)} người · {tongCongDan} công dân đã liên kết
          </p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus className="h-4 w-4 mr-1" /> Thêm thôn
        </Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{editingId ? `Sửa ${form.ten || 'thôn'}` : 'Thêm thôn'}</h2>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={resetForm}><X className="h-4 w-4" /></Button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Tên thôn *</Label>
              <Input value={form.ten} onChange={set('ten')} placeholder="VD: Thôn Tiền Phong" required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Thứ tự hiển thị</Label>
              <Input type="number" min="0" value={form.thuTu} onChange={set('thuTu')} placeholder="1, 2, 3..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bí thư chi bộ</Label>
              <Input value={form.biThu} onChange={set('biThu')} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Thôn trưởng</Label>
              <Input value={form.thonTruong} onChange={set('thonTruong')} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Trưởng ban công tác Mặt trận</Label>
              <Input value={form.matTran} onChange={set('matTran')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Số hộ</Label>
                <Input type="number" min="0" value={form.soHo} onChange={set('soHo')} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Dân số (người)</Label>
                <Input type="number" min="0" value={form.danSo} onChange={set('danSo')} />
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={resetForm}>Huỷ</Button>
              <Button type="submit" size="sm" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                {editingId ? 'Lưu thay đổi' : 'Thêm'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">Chưa có thôn nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  {['#', 'Tên thôn', 'Bí thư', 'Thôn trưởng', 'TBCT Mặt trận', 'Số hộ', 'Dân số', 'Công dân liên kết'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-muted-foreground text-xs">{v.thuTu || ''}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{v.ten}</td>
                    <td className="px-4 py-3">{v.biThu || <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3">{v.thonTruong || <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3">{v.matTran || <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3">{fmt(v.soHo)}</td>
                    <td className="px-4 py-3">{fmt(v.danSo)}</td>
                    <td className="px-4 py-3">{v.soCongDan || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(v)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline" size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive hover:text-white border-destructive/30"
                          onClick={() => confirmDelete(v)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
