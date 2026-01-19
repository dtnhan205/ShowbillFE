# Cấu hình Environment Variables

## Tạo file `.env` trong thư mục `ShowbillFE`

Tạo file `.env` với nội dung sau:

```env
# Backend API URL (cho API calls)
VITE_API_URL=http://localhost:5000

# Backend Image Base URL (cho hiển thị hình ảnh)
# Nếu backend serve static files ở cùng domain/port với API, dùng cùng giá trị
VITE_IMAGE_BASE_URL=http://localhost:5000
```

## Giải thích

- **VITE_API_URL**: URL của backend API (dùng cho các API calls)
- **VITE_IMAGE_BASE_URL**: URL của backend để hiển thị hình ảnh (có thể khác với API URL nếu bạn serve static files ở domain/port khác)

## Ví dụ cho production

```env
VITE_API_URL=https://api.yourdomain.com
VITE_IMAGE_BASE_URL=https://cdn.yourdomain.com
```

## Lưu ý

- File `.env` không được commit vào git (đã có trong `.gitignore`)
- Sau khi tạo/sửa file `.env`, cần **restart dev server** để áp dụng thay đổi
- Tất cả biến môi trường trong Vite phải bắt đầu bằng `VITE_`

