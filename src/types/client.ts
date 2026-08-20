export type NavigationPage = 
  | 'dashboard'
  | 'analysis'
  | 'inventory'
  | 'batches'
  | 'recommendations'
  | 'sustainability'
  | 'environmental'
  | 'history'
  | 'reports'
  | 'presentation'
  | 'notifications'
  | 'admin'
  | 'profile'
  | 'settings';

export type UserRole = 
  | 'admin' 
  | 'operator' 
  | 'sustainability' 
  | 'manufacturer' 
  | 'manager' 
  | 'analyst' 
  | 'viewer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleName?: string;
  avatar?: string;
  department?: string;
  status: 'active' | 'inactive';
  joinedDate: string;
}
