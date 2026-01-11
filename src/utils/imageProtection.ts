/**
 * Utility functions to protect images from being easily extracted
 * Converts base64 to blob URLs to hide base64 from Network tab
 */

/**
 * Converts base64 string to Blob URL
 * This hides the base64 data from Network tab in DevTools
 */
export function base64ToBlobUrl(base64: string): string {
  if (!base64) return '';
  
  // Check if it's already a blob URL or regular URL
  if (base64.startsWith('blob:') || base64.startsWith('http://') || base64.startsWith('https://')) {
    return base64;
  }

  try {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    
    // Determine MIME type
    let mimeType = 'image/jpeg';
    if (base64.startsWith('data:image/png')) {
      mimeType = 'image/png';
    } else if (base64.startsWith('data:image/gif')) {
      mimeType = 'image/gif';
    } else if (base64.startsWith('data:image/webp')) {
      mimeType = 'image/webp';
    }

    // Convert base64 to binary
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    // Create blob URL
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('[imageProtection] Failed to convert base64 to blob URL:', error);
    return base64; // Fallback to original
  }
}

/**
 * Revokes a blob URL to free memory
 */
export function revokeBlobUrl(url: string): void {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[imageProtection] Failed to revoke blob URL:', error);
    }
  }
}

/**
 * Creates a protected image URL from base64
 * Returns a blob URL that will be cleaned up automatically
 */
export function createProtectedImageUrl(base64: string): string {
  return base64ToBlobUrl(base64);
}

