import React, { useState } from 'react';
import type { Album } from '../types';

interface LandingPageProps {
  album: Album;
  onAlbumNameChange: (name: string) => void;
  onOpenAlbum: () => void;
  onPhotosUploaded: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  album,
  onAlbumNameChange,
  onOpenAlbum,
  onPhotosUploaded
}) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="album-cover-container">
          <div 
            className={`album-cover ${isHovering ? 'hover' : ''}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {album.coverPhoto ? (
              <div className="cover-photo">
                <img src={album.coverPhoto.url} alt="Album cover" />
                <div className="photo-count">{album.photos.length} photos</div>
              </div>
            ) : (
              <div className="empty-cover">
                <div className="cover-icon">📸</div>
                <p>Your photo album</p>
              </div>
            )}
            <div className="vintage-overlay"></div>
          </div>
        </div>

        <div className="album-info">
          <input
            type="text"
            value={album.name}
            onChange={(e) => onAlbumNameChange(e.target.value)}
            className="album-title-input"
            placeholder="My Album Title"
            maxLength={50}
          />
          
          <p className="album-subtitle">
            Create beautiful memories with your photos and videos
          </p>

          {album.photos.length === 0 ? (
            <div className="upload-section">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={onPhotosUploaded}
                className="file-input"
                id="landing-upload"
              />
              <label htmlFor="landing-upload" className="upload-button">
                Add Photos & Videos to Begin
              </label>
            </div>
          ) : (
            <button 
              className="open-album-button"
              onClick={onOpenAlbum}
            >
              <span className="button-text">Open Album</span>
              <span className="button-icon">→</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default LandingPage;