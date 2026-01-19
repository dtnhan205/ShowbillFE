/**
 * Utility để lấy base URL cho hình ảnh từ backend
 * Sử dụng VITE_IMAGE_BASE_URL nếu có, fallback về VITE_API_URL
 */
export function getImageBaseUrl(): string {
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL || import.meta.env.VITE_API_URL || '';
  // Remove trailing slash
  return imageBaseUrl.replace(/\/$/, '');
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
  
  return `${baseUrl}${normalizedPath}`;
}

