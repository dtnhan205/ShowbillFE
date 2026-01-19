export interface Product {
  _id: string;
  name: string;
  imageUrl?: string; // URL path: /uploads/products/filename.jpg
  imageBase64?: string; // Backward compatibility
  createdAt: string;
  isHidden: boolean;
  obVersion?: string;
  category?: string;
  views?: number;
}

export interface AdminLoginResponse {
  message: string;
  token: string;
  admin: {
    id: string;
    username: string;
    role?: 'super' | 'admin';
  };
}

export interface AdminUserItem {
  _id: string;
  username: string;
  email: string;
  role: 'super' | 'admin';
  displayName?: string;
  bio?: string;
  avatarUrl?: string; // URL path: /uploads/avatars/filename.jpg
  avatarBase64?: string; // Backward compatibility
  bannerUrl?: string; // URL path: /uploads/banners/filename.jpg
  bannerBase64?: string; // Backward compatibility
  isActive?: boolean;
  package?: 'basic' | 'pro' | 'premium' | 'vip' | 'custom';
  packageExpiry?: string;
  activePackage?: 'basic' | 'pro' | 'premium' | 'vip' | 'custom';
  ownedPackages?: Array<{
    packageType: string;
    expiryDate?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
