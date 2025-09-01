import React from 'react';
import type { AlbumPage, Photo } from '../types';
import PolaroidPhoto from './PolaroidPhoto';
import { exportFavoritesToPDF, exportFavoritesToJPEG } from '../utils/exportUtils';

interface FavoritesPageProps {
  page: AlbumPage;
  albumName: string;
  onPhotoClick: (photo: Photo) => void;
  onPhotoUpdate: (photoId: string, updates: Partial<Photo>) => void;
  allFavorites: Photo[]; // All favorite photos for export
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ 
  page, 
  albumName, 
  onPhotoClick, 
  onPhotoUpdate, 
  allFavorites 
}) => {
  const handleExportPDF = async () => {
    if (allFavorites.length === 0) {
      alert('No favorites to export!');
      return;
    }
    await exportFavoritesToPDF(allFavorites, albumName);
  };

  const handleExportJPEG = async () => {
    if (allFavorites.length === 0) {
      alert('No favorites to export!');
      return;
    }
    await exportFavoritesToJPEG(allFavorites, albumName);
  };

  return (
    <>
      <div className="export-buttons" style={{ marginBottom: '1rem', textAlign: 'center', paddingTop: '0.5rem' }}>
        <button 
          onClick={handleExportPDF}
          className="export-button export-pdf"
          title="Export favorites as PDF"
        >
          📄 Export PDF
        </button>
        <button 
          onClick={handleExportJPEG}
          className="export-button export-jpeg"
          title="Export favorites as JPEG"
        >
          🖼️ Export JPEG
        </button>
      </div>

      <div className="photos-grid masonry-grid">
        {page.photos.map((photo) => (
          <PolaroidPhoto
            key={photo.id}
            photo={photo}
            onClick={() => onPhotoClick(photo)}
            onUpdate={(updates) => onPhotoUpdate(photo.id, updates)}
            size="medium"
          />
        ))}
      </div>

      {page.photos.length === 0 && (
        <div className="empty-favorites">
          <div className="empty-favorites-icon">⭐</div>
          <h3>No Favorites Yet</h3>
          <p>Star your favorite photos to see them here!</p>
        </div>
      )}
    </>
  );
};

export default FavoritesPage;