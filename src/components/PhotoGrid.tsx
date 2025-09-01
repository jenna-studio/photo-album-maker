import React from 'react';
import type { Photo } from '../types';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick }) => {
  return (
    <div className="photo-grid">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="photo-item"
          onClick={() => onPhotoClick?.(photo)}
        >
          <img
            src={photo.url}
            alt={photo.name}
            className="photo-image"
            loading="lazy"
          />
          <div className="photo-info">
            <span className="photo-name">{photo.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;