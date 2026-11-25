import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Loader2, X, Landmark, MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ImageUploadField from '@/components/ImageUploadField'
import { toast } from 'sonner'

// Tra cứu Di tích lịch sử trên MiniApp (màn /di-tich, khối Di tích ở Văn hóa & Du lịch).
const EMPTY = {
  ten: '', capDiTich: 'Cấp tỉnh', loaiHinh: 'Lịch sử', quyetDinh: '', diaChi: '', tomTat: '',
  moTa: '', duongDen: '', lat: '', lng: '', image: '', nguonAnh: '', thuTu: '',
}
const toNum = (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v))

export default function DiTichPage() {
  const qc = useQueryClient()
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const { data, isLoading } = useQuery({
    queryKey: ['di-tich'],
    queryFn: () => api.get('/api/di-tich').then((r) => r.data),
  })
  const items = data?.items ?? []

  const save = useMutation({
    mutationFn: (p) => (editingId ? api.put(`/api/di-tich/${editingId}`, p) : api.post('/api/di-tich', p)),
    onSuccess: () => {
      toast.success(editingId ? 'Đã cập nhật di tích' : 'Đã thêm di tích')
      reset()
      qc.invalidateQueries({ queryKey: ['di-tich'] })
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Lỗi lưu dữ liệu'),
  })
  const del = useMutation({
    mutationFn: (id) => api.delete(`/api/di-tich/${id}`),
    onSuccess: () => {
      toast.success('Đã xoá di tích')
      qc.invalidateQueries({ queryKey: ['di-tich'] })
    },
  })

  function reset() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY)
  }
  function edit(v) {
    setEditingId(v._id)
    setForm({ ...EMPTY, ...v, lat: v.lat ?? '', lng: v.lng ?? '', thuTu: v.thuTu ?? '' })
    setShowForm(true)
  }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function submit(e) {
    e.preventDefault()
    if (!form.ten.trim()) return toast.error('Vui lòng nhập tên di tích')
    save.mutate({
      ...Object.fromEntries(['ten', 'capDiTich', 'loaiHinh', 'quyetDinh', 'diaChi', 'tomTat', 'moTa', 'duongDen', 'image', 'nguonAnh'].map((k) => [k, String(form[k] || '').trim()])),
      lat: toNum(form.lat),
      lng: toNum(form.lng),
      thuTu: form.thuTu === '' ? items.length + 1 : Number(form.thuTu),
    })
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Landmark className="h-6 w-6 text-primary" /> Di tích lịch sử</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} di tích — tra cứu trên MiniApp (màn Di tích, mục Văn hóa và Du lịch)</p>
        </div>
        <Button size="sm" onClick={() => { reset(); setShowForm(true) }}><Plus className="h-4 w-4 mr-1" /> Thêm di tích</Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{editingId ? `Sửa: ${form.ten}` : 'Thêm di tích'}</h2>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={reset}><X className="h-4 w-4" /></Button>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1 md:col-span-2"><Label className="text-xs">Tên di tích *</Label><Input value={form.ten} onChange={set('ten')} required /></div>
            <div className="space-y-1"><Label className="text-xs">Cấp di tích</Label><Input value={form.capDiTich} onChange={set('capDiTich')} list="cap-di-tich" />
              <datalist id="cap-di-tich"><option value="Quốc gia đặc biệt" /><option value="Quốc gia" /><option value="Cấp tỉnh" /></datalist></div>
            <div className="space-y-1"><Label className="text-xs">Loại hình</Label><Input value={form.loaiHinh} onChange={set('loaiHinh')} /></div>
            <div className="space-y-1"><Label className="text-xs">Quyết định xếp hạng</Label><Input value={form.quyetDinh} onChange={set('quyetDinh')} placeholder="VD: 774/QĐ-BT ngày 21/6/1993" /></div>
            <div className="space-y-1"><Label className="text-xs">Thứ tự hiển thị</Label><Input type="number" min="0" value={form.thuTu} onChange={set('thuTu')} /></div>
            <div className="space-y-1 md:col-span-2"><Label className="text-xs">Địa chỉ</Label><Input value={form.diaChi} onChange={set('diaChi')} /></div>
            <div className="space-y-1 md:col-span-2"><Label className="text-xs">Tóm tắt (1 câu, hiện ở danh sách)</Label><Input value={form.tomTat} onChange={set('tomTat')} /></div>
            <div className="space-y-1 md:col-span-2"><Label className="text-xs">Mô tả di tích (xuống dòng để tách đoạn)</Label><Textarea rows={5} value={form.moTa} onChange={set('moTa')} /></div>
            <div className="space-y-1 md:col-span-2"><Label className="text-xs">Đường đến di tích</Label><Textarea rows={3} value={form.duongDen} onChange={set('duongDen')} /></div>
            <div className="space-y-1"><Label className="text-xs">Vĩ độ (lat, WGS84)</Label><Input value={form.lat} onChange={set('lat')} placeholder="VD: 17.7975" /></div>
            <div className="space-y-1"><Label className="text-xs">Kinh độ (lng, WGS84)</Label><Input value={form.lng} onChange={set('lng')} placeholder="VD: 106.276944" /></div>
            <p className="md:col-span-2 text-xs text-muted-foreground -mt-1">Có toạ độ thì nút "Chỉ đường" dẫn đúng vị trí; để trống thì bản đồ tìm theo tên + địa chỉ.</p>
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs">Ảnh di tích</Label>
              <ImageUploadField value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} uploadUrl="/api/di-tich/upload" />
            </div>
            <div className="space-y-1 md:col-span-2"><Label className="text-xs">Nguồn ảnh (hiện dưới ảnh, vd "Báo Quảng Trị")</Label><Input value={form.nguonAnh} onChange={set('nguonAnh')} /></div>
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
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">Chưa có di tích nào</div>
        ) : (
          <div className="divide-y">
            {items.map((v) => (
              <div key={v._id} className="flex gap-3 p-3 hover:bg-gray-50">
                <div className="h-16 w-24 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                  {v.image && <img src={v.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{v.thuTu}. {v.ten}</p>
                  <p className="text-xs text-muted-foreground">{v.capDiTich} · {v.loaiHinh}{v.quyetDinh ? ` · QĐ ${v.quyetDinh}` : ''}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {v.diaChi || '—'}{v.lat != null && v.lng != null ? ` (${v.lat}, ${v.lng})` : ' · chưa có toạ độ'}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => edit(v)}><Pencil className="h-3 w-3" /></Button>
                  <Button
                    variant="outline" size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive hover:text-white border-destructive/30"
                    onClick={() => window.confirm(`Xoá ${v.ten}?`) && del.mutate(v._id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
