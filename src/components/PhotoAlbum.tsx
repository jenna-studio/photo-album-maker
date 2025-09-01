import React from 'react';
import type { Album, Photo } from '../types';
import PhotoGrid from './PhotoGrid';

interface PhotoAlbumProps {
  album: Album;
  onPhotoClick?: (photo: Photo) => void;
}

const PhotoAlbum: React.FC<PhotoAlbumProps> = ({ album, onPhotoClick }) => {
  return (
    <div className="photo-album">
      <div className="album-header">
        <h2 className="album-title">{album.name}</h2>
        <div className="album-info">
          <span className="photo-count">{album.photos.length} photos</span>
          <span className="album-date">
            Created {album.createdAt.toLocaleDateString()}
          </span>
        </div>
      </div>
      <PhotoGrid photos={album.photos} onPhotoClick={onPhotoClick} />
    </div>
  );
};

export default PhotoAlbum;