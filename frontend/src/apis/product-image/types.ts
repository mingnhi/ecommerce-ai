export interface ProductImage {
  id: string;
  imageUrl: string;
  type: 'THUMBNAIL' | 'GALLERY' | 'ZOOM';
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}