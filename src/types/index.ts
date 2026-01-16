export interface Product {
  _id: string;
  name: string;
  imageBase64: string;
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
  avatarBase64?: string;
  isActive?: boolean;
  package?: 'basic' | 'pro' | 'premium';
  packageExpiry?: string;
  createdAt: string;
  updatedAt: string;
}
