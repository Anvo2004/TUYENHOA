import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Loader2, X, UserRound } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ImageUploadField from '@/components/ImageUploadField'
import { toast } from 'sonner'

// Tiện ích "Lãnh đạo xã" trên MiniApp — nhóm theo "Cơ quan" theo thứ tự hiển thị.
const EMPTY = { hoTen: '', chucVu: '', coQuan: '', dienThoai: '', email: '', anh: '', thuTu: '' }

export default function LanhDaoPage() {
  const qc = useQueryClient()
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const { data, isLoading } = useQuery({
    queryKey: ['lanh-dao'],
    queryFn: () => api.get('/api/lanh-dao').then((r) => r.data),
  })
  const items = data?.items ?? []
  const groups = [...new Set(items.map((x) => x.coQuan).filter(Boolean))]

  const save = useMutation({
    mutationFn: (p) => (editingId ? api.put(`/api/lanh-dao/${editingId}`, p) : api.post('/api/lanh-dao', p)),
    onSuccess: () => {
      toast.success(editingId ? 'Đã cập nhật' : 'Đã thêm')
      reset()
      qc.invalidateQueries({ queryKey: ['lanh-dao'] })
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Lỗi lưu dữ liệu'),
  })
  const del = useMutation({
    mutationFn: (id) => api.delete(`/api/lanh-dao/${id}`),
    onSuccess: () => {
      toast.success('Đã xoá')
      qc.invalidateQueries({ queryKey: ['lanh-dao'] })
    },
  })

  function reset() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY)
  }
  function edit(v) {
    setEditingId(v._id)
    setForm({ ...EMPTY, ...v, thuTu: v.thuTu ?? '' })
    setShowForm(true)
  }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function submit(e) {
    e.preventDefault()
    if (!form.hoTen.trim()) return toast.error('Vui lòng nhập họ tên')
    save.mutate({
      hoTen: form.hoTen.trim(),
      chucVu: form.chucVu.trim(),
      coQuan: form.coQuan.trim(),
      dienThoai: form.dienThoai.trim(),
      email: form.email.trim(),
      anh: form.anh.trim(),
      thuTu: form.thuTu === '' ? (items.length + 1) : Number(form.thuTu),
    })
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><UserRound className="h-6 w-6 text-primary" /> Lãnh đạo xã</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} người · {groups.length} cơ quan — hiển thị ở tiện ích "Lãnh đạo xã" trên MiniApp</p>
        </div>
        <Button size="sm" onClick={() => { reset(); setShowForm(true) }}><Plus className="h-4 w-4 mr-1" /> Thêm</Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{editingId ? `Sửa ${form.hoTen}` : 'Thêm lãnh đạo'}</h2>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={reset}><X className="h-4 w-4" /></Button>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Họ tên *</Label><Input value={form.hoTen} onChange={set('hoTen')} required /></div>
            <div className="space-y-1"><Label className="text-xs">Chức vụ</Label><Input value={form.chucVu} onChange={set('chucVu')} /></div>
            <div className="space-y-1">
              <Label className="text-xs">Cơ quan (nhóm hiển thị)</Label>
              <Input value={form.coQuan} onChange={set('coQuan')} list="lanh-dao-groups" placeholder="VD: UBND xã" />
              <datalist id="lanh-dao-groups">{groups.map((g) => <option key={g} value={g} />)}</datalist>
            </div>
            <div className="space-y-1"><Label className="text-xs">Thứ tự hiển thị</Label><Input type="number" min="0" value={form.thuTu} onChange={set('thuTu')} /></div>
            <div className="space-y-1"><Label className="text-xs">Điện thoại</Label><Input value={form.dienThoai} onChange={set('dienThoai')} /></div>
            <div className="space-y-1"><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={set('email')} /></div>
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs">Ảnh chân dung (dọc 3:4)</Label>
              <ImageUploadField value={form.anh} onChange={(v) => setForm((f) => ({ ...f, anh: v }))} uploadUrl="/api/lanh-dao/upload" aspect="aspect-[3/4]" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={reset}>Huỷ</Button>
              <Button type="submit" size="sm" disabled={save.isPending}>
                {save.isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                {editingId ? 'Lưu thay đổi' : 'Thêm'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">Chưa có dữ liệu</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  {['#', 'Ảnh', 'Họ tên', 'Chức vụ', 'Cơ quan', 'Điện thoại', 'Email'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs text-muted-foreground">{v.thuTu}</td>
                    <td className="px-4 py-2">
                      {v.anh ? <img src={v.anh} alt="" className="h-12 w-9 rounded object-cover" /> : <div className="h-12 w-9 rounded bg-gray-100" />}
                    </td>
                    <td className="px-4 py-2 font-medium whitespace-nowrap">{v.hoTen}</td>
                    <td className="px-4 py-2">{v.chucVu}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{v.coQuan}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{v.dienThoai || <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-2">{v.email || <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => edit(v)}><Pencil className="h-3 w-3" /></Button>
                        <Button
                          variant="outline" size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive hover:text-white border-destructive/30"
                          onClick={() => window.confirm(`Xoá ${v.hoTen}?`) && del.mutate(v._id)}
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
