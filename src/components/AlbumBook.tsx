import React, { useState, useEffect, useCallback } from 'react';
import type { Album, AlbumPage, Photo } from '../types';
import PolaroidPhoto from './PolaroidPhoto';
import PhotoModal from './PhotoModal';
import FavoritesPage from './FavoritesPage';
import { exportAlbumToHTML } from '../utils/htmlExportUtils';

interface AlbumBookProps {
  album: Album;
  pages: AlbumPage[];
  onBackToLanding: () => void;
  onPhotoUpdate: (photoId: string, updates: Partial<Photo>) => void;
}

const AlbumBook: React.FC<AlbumBookProps> = ({
  album,
  pages,
  onBackToLanding,
  onPhotoUpdate
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [, setGridScale] = useState(1);

  // Check if mobile for single page view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalPages = isMobile ? pages.length : Math.ceil(pages.length / 2);
  const leftPage = isMobile ? pages[currentPageIndex] : pages[currentPageIndex * 2];
  const rightPage = isMobile ? null : pages[currentPageIndex * 2 + 1];
  
  // Get all favorites for export
  const allFavorites = album.photos.filter(photo => photo.isFavorite);

  // Handle HTML export
  const handleHTMLExport = async () => {
    try {
      await exportAlbumToHTML(album, pages);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export album. Please try again.');
    }
  };

  const handlePageTurn = useCallback((direction: 'next' | 'prev') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (direction === 'next' && currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
    
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, currentPageIndex, totalPages]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentPageIndex < totalPages - 1) {
      handlePageTurn('next');
    }
    if (isRightSwipe && currentPageIndex > 0) {
      handlePageTurn('prev');
    }
  };

  // Auto-scale polaroids when content overflows
  useEffect(() => {
    const calculateScale = () => {
      const grids = document.querySelectorAll('.photos-grid');
      grids.forEach(grid => {
        const gridElement = grid as HTMLElement;
        const container = gridElement.closest('.book-page') as HTMLElement;
        
        if (container && gridElement) {
          // Reset any existing transforms first
          gridElement.style.transform = '';
          gridElement.style.gap = '';
          
          // Allow content to flow naturally first
          const containerHeight = container.clientHeight - 80; // More padding for header
          const gridHeight = gridElement.scrollHeight;
          
          // Only scale if significantly overflowing
          if (gridHeight > containerHeight * 1.1) {
            // Calculate scale needed to fit content with some buffer
            const scale = Math.max(0.7, (containerHeight * 0.9) / gridHeight);
            
            // Apply scale to the entire grid
            gridElement.style.transform = `scale(${scale})`;
            gridElement.style.transformOrigin = 'top center';
            
            // Reduce gap when scaled to save space
            const originalGap = 8; // 0.5rem in pixels
            const scaledGap = Math.max(4, originalGap * scale);
            gridElement.style.gap = `${scaledGap}px`;
            
            setGridScale(scale);
          } else {
            setGridScale(1);
            gridElement.style.transform = '';
            gridElement.style.gap = '0.5rem';
          }
        }
      });
    };

    // Calculate scale after a longer delay for masonry layout to settle
    const timeoutId = setTimeout(calculateScale, 500);
    
    return () => clearTimeout(timeoutId);
  }, [currentPageIndex, pages]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePageTurn('prev');
      if (e.key === 'ArrowRight') handlePageTurn('next');
      if (e.key === 'Escape') setSelectedPhoto(null);
    };

    const handleResize = () => {
      // Force re-pagination when window is resized
      window.dispatchEvent(new CustomEvent('album-resize'));
      
      // Recalculate scale on resize
      setTimeout(() => {
        const grids = document.querySelectorAll('.photos-grid');
        grids.forEach(grid => {
          const gridElement = grid as HTMLElement;
          const container = gridElement.closest('.book-page') as HTMLElement;
          
          if (container && gridElement) {
            // Reset any existing transforms first
            gridElement.style.transform = '';
            gridElement.style.gap = '';
            
            const containerHeight = container.clientHeight - 80;
            const gridHeight = gridElement.scrollHeight;
            
            // Only scale if significantly overflowing
            if (gridHeight > containerHeight * 1.1) {
              const scale = Math.max(0.7, (containerHeight * 0.9) / gridHeight);
              
              // Apply scale to the entire grid
              gridElement.style.transform = `scale(${scale})`;
              gridElement.style.transformOrigin = 'top center';
              
              // Reduce gap when scaled
              const originalGap = 8;
              const scaledGap = Math.max(4, originalGap * scale);
              gridElement.style.gap = `${scaledGap}px`;
            } else {
              gridElement.style.transform = '';
              gridElement.style.gap = '0.5rem';
            }
          }
        });
      }, 200);
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('resize', handleResize);
    };
  }, [handlePageTurn]);

  const renderPage = (page: AlbumPage | null, position: 'left' | 'right' | 'single' = 'left') => {
    if (!page) return null;

    const isFavoritesPage = page.id.startsWith('favorites-');
    const isVideosPage = page.id.startsWith('videos-');
    const isIndexPage = page.isIndexPage;
    
    return (
      <div className={`book-page ${isMobile ? 'single-page' : position === 'left' ? 'left-page' : 'right-page'}`}>
        {isIndexPage ? (
          <div className="index-page">
            <div className="index-title">
              <h1>{page.dateHeader}</h1>
            </div>
          </div>
        ) : isFavoritesPage ? (
          <FavoritesPage
            page={page}
            albumName={album.name}
            onPhotoClick={(photo) => setSelectedPhoto(photo)}
            onPhotoUpdate={onPhotoUpdate}
            allFavorites={allFavorites}
          />
        ) : isVideosPage ? (
          <>
            <div className="photos-grid masonry-grid">
              {page.photos.map((photo) => (
                <PolaroidPhoto
                  key={photo.id}
                  photo={photo}
                  onClick={() => setSelectedPhoto(photo)}
                  onUpdate={(updates) => onPhotoUpdate(photo.id, updates)}
                  size="medium"
                />
              ))}
            </div>
          </>
        ) : (
          <>
            {page.dateHeader && (
              <div className="page-header">
                <h2 className="date-header">{page.dateHeader}</h2>
                <div className="page-number">{page.pageNumber}</div>
              </div>
            )}
            <div className="photos-grid masonry-grid">
              {page.photos.map((photo) => (
                <PolaroidPhoto
                  key={photo.id}
                  photo={photo}
                  onClick={() => setSelectedPhoto(photo)}
                  onUpdate={(updates) => onPhotoUpdate(photo.id, updates)}
                  size="medium"
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="album-book">
      <header className="album-header">
        <div className="header-left">
          <button className="back-button" onClick={onBackToLanding}>
            ← Back to Album
          </button>
        </div>
        <h1 className="album-title">{album.name}</h1>
        <div className="header-right">
          <button className="export-button export-html" onClick={handleHTMLExport} title="Export as offline HTML file">
            Export HTML
          </button>
          <div className="page-indicator">
            {isMobile 
              ? `Page ${currentPageIndex + 1} of ${pages.length}`
              : `Page ${currentPageIndex * 2 + 1}-${Math.min(currentPageIndex * 2 + 2, pages.length)} of ${pages.length}`
            }
          </div>
        </div>
      </header>

      <div 
        className="book-container"
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      >
        <div className={`book-spread ${isAnimating ? 'turning' : ''} ${isMobile ? 'mobile-view' : ''}`}>
          {!isMobile && <div className="book-spine"></div>}
          
          {isMobile ? (
            // Mobile: Single page view
            renderPage(leftPage, 'single')
          ) : (
            // Desktop: Dual page view
            <>
              {renderPage(leftPage, 'left')}
              {renderPage(rightPage, 'right')}
            </>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="navigation-controls">
          <button
            className="nav-button prev"
            onClick={() => handlePageTurn('prev')}
            disabled={currentPageIndex === 0 || isAnimating}
          >
            ←
          </button>
          <button
            className="nav-button next"
            onClick={() => handlePageTurn('next')}
            disabled={currentPageIndex >= totalPages - 1 || isAnimating}
          >
            →
          </button>
        </div>
      </div>

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onUpdate={(updates) => onPhotoUpdate(selectedPhoto.id, updates)}
        />
      )}
    </div>
  );
};

export default AlbumBook;