import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Upload, X } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

// Ô ảnh dùng chung: dán URL hoặc tải ảnh lên `uploadUrl` (route trả { url }).
export default function ImageUploadField({ value, onChange, uploadUrl, aspect = 'aspect-[4/3]' }) {
  const fileRef = useRef(null)
  const upload = useMutation({
    mutationFn: (file) => {
      const body = new FormData()
      body.append('file', file)
      return api.post(uploadUrl, body).then((r) => r.data)
    },
    onSuccess: (d) => {
      onChange(d.url)
      toast.success('Đã tải ảnh lên')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Lỗi tải ảnh'),
  })

  return (
    <div className="flex gap-3 items-start">
      <div className={`w-24 ${aspect} shrink-0 rounded-lg border bg-gray-50 overflow-hidden flex items-center justify-center text-[10px] text-muted-foreground`}>
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : 'Chưa có ảnh'}
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Dán URL ảnh hoặc tải lên" />
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) upload.mutate(f)
              e.target.value = ''
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={upload.isPending}>
            {upload.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
            Tải ảnh
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
              <X className="h-3.5 w-3.5 mr-1" /> Bỏ ảnh
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
