/**
 * Utility để lấy base URL cho hình ảnh từ backend
 * Sử dụng VITE_IMAGE_BASE_URL nếu có, nếu không thì dùng empty string (relative path)
 */
export function getImageBaseUrl(): string {
  // Nếu có VITE_IMAGE_BASE_URL, dùng nó
  if (import.meta.env.VITE_IMAGE_BASE_URL) {
    return import.meta.env.VITE_IMAGE_BASE_URL.replace(/\/$/, '');
  }
  
  // Nếu không có, trả về empty string để dùng relative path
  // Images sẽ được serve trực tiếp từ Nginx /uploads, không qua /api
  return '';
}

/**
 * Tạo full URL cho hình ảnh từ path
 * @param imagePath - Path của hình ảnh (ví dụ: /uploads/products/filename.jpg)
 * @returns Full URL để hiển thị hình ảnh
 */
export function getImageUrl(imagePath: string | undefined | null): string {
  if (!imagePath) return '';
  
  const baseUrl = getImageBaseUrl();
  // Đảm bảo path bắt đầu bằng /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Nếu baseUrl rỗng, trả về path trực tiếp (relative path)
  // Nếu có baseUrl, nối với path
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

