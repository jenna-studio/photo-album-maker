import React from 'react';
import type { Photo, AlbumPage } from '../types';
import PolaroidPhoto from './PolaroidPhoto';

interface VideosPageProps {
  page: AlbumPage;
  albumName: string;
  onPhotoClick: (photo: Photo) => void;
  onPhotoUpdate: (photoId: string, updates: Partial<Photo>) => void;
  allVideos: Photo[];
}

const VideosPage: React.FC<VideosPageProps> = ({
  page,
  onPhotoClick,
  onPhotoUpdate
}) => {
  return (
    <div className="videos-page">
      {page.photos.length > 0 ? (
        <div className="photos-grid videos-grid">
          {page.photos.map((photo) => (
            <PolaroidPhoto
              key={photo.id}
              photo={photo}
              onClick={() => onPhotoClick(photo)}
              onUpdate={(updates) => onPhotoUpdate(photo.id, updates)}
              size="medium"
              isVideoSquare={true}
            />
          ))}
        </div>
      ) : (
        <div className="empty-videos">
          <div className="empty-videos-icon">🎥</div>
          <h3>No Videos Yet</h3>
          <p>Upload some videos to see them here</p>
        </div>
      )}
    </div>
  );
};

export default VideosPage;