export interface MediaItem {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  type: 'photo' | 'video';
  uploadedAt: Date;
  capturedAt?: Date;
  description?: string;
  location?: string;
  exifData?: ExifData;
  rotation?: number;
  duration?: number; // For videos
  thumbnail?: string; // For videos
  isFavorite?: boolean; // For favorites functionality
}

// Keep Photo for backward compatibility
export type Photo = MediaItem;

export interface ExifData {
  camera?: string;
  lens?: string;
  settings?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Album {
  id: string;
  name: string;
  photos: MediaItem[];
  createdAt: Date;
  coverPhoto?: MediaItem;
  isOpen: boolean;
}

export interface AlbumPage {
  id: string;
  dateHeader: string;
  photos: MediaItem[];
  pageNumber: number;
  isIndexPage?: boolean;
}