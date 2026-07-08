# HoiKroos Portfolio – Next.js + Supabase Admin

Portfolio CNTT có trang quản trị và dữ liệu thật trên Supabase.

## Chức năng

- Trang chủ đọc dự án công khai từ Supabase
- Trang chi tiết dự án theo slug
- Trang kỹ năng đọc dữ liệu từ Supabase
- Admin đăng nhập bằng Supabase Auth
- CRUD dự án, bật/tắt hiển thị
- Tải ảnh bìa dự án lên Supabase Storage
- Quản lý kỹ năng
- Tải tài liệu PDF, DOCX, ZIP lên Storage
- Row Level Security: khách chỉ đọc, Admin mới được ghi dữ liệu

## 1. Cài đặt

```bash
npm install
```

## 2. Tạo Supabase database

1. Tạo project tại Supabase.
2. Mở **SQL Editor**.
3. Chạy toàn bộ file `supabase/schema.sql`.
4. Vào **Authentication > Users** và tạo tài khoản Admin.
5. Chạy lệnh sau trong SQL Editor, thay email nếu cần:

```sql
update public.profiles
set is_admin = true
where email = 'vodinhhoi1@gmail.com';
```

## 3. Cấu hình môi trường

Sao chép `.env.example` thành `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Không đưa `service_role` key vào code phía trình duyệt.

## 4. Chạy project

```bash
npm run dev
```

- Website: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`
- Quản lý dự án: `/admin/projects`
- Quản lý kỹ năng: `/admin/skills`
- Quản lý tài liệu: `/admin/documents`

## Lưu ý

Hai bucket `portfolio-images` và `portfolio-documents` được tạo tự động khi chạy SQL. File đang để public để khách có thể xem hoặc tải xuống; quyền thêm, sửa, xóa chỉ dành cho Admin.
