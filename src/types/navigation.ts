export type PageId = 'keccak' | 'rho';

export interface NavigationItem {
  id: PageId;
  label: string;
  icon: 'grid' | 'route';
}
