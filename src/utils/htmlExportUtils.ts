import type { Album, AlbumPage } from '../types';

// Convert image/video to base64 data URL
export const convertToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = url;
  });
};

// Convert video to base64 data URL (thumbnail)
export const convertVideoToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.currentTime = video.duration * 0.5; // Middle of video
    });
    
    video.addEventListener('seeked', () => {
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    });
    
    video.addEventListener('error', () => {
      reject(new Error('Could not load video'));
    });
    
    video.src = url;
    video.load();
  });
};

// Get all CSS styles from the current page
export const extractCSS = (): string => {
  let css = '';
  
  // Get styles from all stylesheets
  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      const styleSheet = document.styleSheets[i];
      if (styleSheet.cssRules) {
        for (let j = 0; j < styleSheet.cssRules.length; j++) {
          css += styleSheet.cssRules[j].cssText + '\n';
        }
      }
    } catch (e) {
      // Skip stylesheets that can't be accessed (CORS)
      console.warn('Could not access stylesheet:', e);
    }
  }
  
  return css;
};

// Create HTML template with embedded styles and JavaScript
export const createHTMLTemplate = (
  albumName: string,
  pagesData: string,
  css: string
): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${albumName} - Photo Album</title>
    <style>
        ${css}
        
        /* Additional offline-specific styles */
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
        }
        
        .offline-notice {
            background: linear-gradient(135deg, #87ceeb 0%, #b0c4de 100%);
            color: white;
            text-align: center;
            padding: 0.5rem;
            font-size: 0.9rem;
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        
        /* Override book page background to use only horizontal lines */
        .book-page {
            background-image: linear-gradient(rgba(176, 196, 222, 0.1) 1px, transparent 1px) !important;
            background-size: 20px 20px !important;
        }
    </style>
</head>
<body>
    <div class="offline-notice">
        📱 Offline Photo Album: ${albumName} | Use arrow keys or click navigation buttons to browse
    </div>
    
    <div id="album-container"></div>
    
    <script>
        // Album data embedded in JavaScript
        const albumData = ${pagesData};
        let currentPageIndex = 0;
        let isMobile = window.innerWidth < 768;
        let selectedPhoto = null;
        
        // Check if mobile for responsive layout
        function checkMobile() {
            isMobile = window.innerWidth < 768;
            renderCurrentPage();
        }
        
        // Modal functions
        function openPhotoModal(photo) {
            selectedPhoto = photo;
            renderPhotoModal();
        }
        
        function closePhotoModal() {
            selectedPhoto = null;
            const modal = document.getElementById('photo-modal');
            if (modal) {
                modal.remove();
            }
        }
        
        // Render photo modal
        function renderPhotoModal() {
            if (!selectedPhoto) return;
            
            const existingModal = document.getElementById('photo-modal');
            if (existingModal) {
                existingModal.remove();
            }
            
            const modal = document.createElement('div');
            modal.id = 'photo-modal';
            modal.className = 'photo-modal-overlay';
            modal.onclick = (e) => {
                if (e.target === modal) closePhotoModal();
            };
            
            const capturedDate = selectedPhoto.capturedAt ? new Date(selectedPhoto.capturedAt).toLocaleString() : 'Unknown';
            const fileSize = selectedPhoto.fileSize ? formatFileSize(selectedPhoto.fileSize) : 'Unknown';
            
            modal.innerHTML = \`
                <div class="photo-modal">
                    <button class="modal-close" onclick="closePhotoModal()">×</button>
                    <div class="modal-content">
                        <div class="modal-image-container">
                            <img src="\${selectedPhoto.dataUrl}" alt="\${selectedPhoto.name}" class="modal-image">
                        </div>
                        <div class="modal-sidebar">
                            <h2 class="photo-title">\${selectedPhoto.name}</h2>
                            
                            <div class="detail-group">
                                <label>Location</label>
                                <div class="detail-display">\${selectedPhoto.location || 'No location available'}</div>
                            </div>
                            
                            <div class="detail-group">
                                <label>Description</label>
                                <div class="detail-display">\${selectedPhoto.description || 'No description available'}</div>
                            </div>
                            
                            <div class="metadata">
                                <div class="metadata-item">
                                    <span class="label">Captured:</span>
                                    <span class="value">\${capturedDate}</span>
                                </div>
                                <div class="metadata-item">
                                    <span class="label">File Size:</span>
                                    <span class="value">\${fileSize}</span>
                                </div>
                                <div class="metadata-item">
                                    <span class="label">Type:</span>
                                    <span class="value">Photo</span>
                                </div>
                                \${selectedPhoto.isFavorite ? \`
                                    <div class="metadata-item">
                                        <span class="label">Status:</span>
                                        <span class="value">⭐ Favorite</span>
                                    </div>
                                \` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            \`;
            
            document.body.appendChild(modal);
        }
        
        // Format file size
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        window.addEventListener('resize', checkMobile);
        
        // Navigation functions
        function goToPage(index) {
            if (index >= 0 && index < albumData.pages.length) {
                currentPageIndex = index;
                renderCurrentPage();
            }
        }
        
        function nextPage() {
            if (isMobile) {
                goToPage(currentPageIndex + 1);
            } else {
                goToPage(currentPageIndex + 2);
            }
        }
        
        function prevPage() {
            if (isMobile) {
                goToPage(currentPageIndex - 1);
            } else {
                goToPage(currentPageIndex - 2);
            }
        }
        
        // Render current page(s)
        function renderCurrentPage() {
            const container = document.getElementById('album-container');
            const totalPages = albumData.pages.length;
            const leftPage = albumData.pages[currentPageIndex];
            const rightPage = isMobile ? null : albumData.pages[currentPageIndex + 1];
            
            container.innerHTML = \`
                <div class="album-book">
                    <header class="album-header">
                        <button class="back-button" onclick="alert('This is an offline export of your photo album!')">
                            📖 Offline Album
                        </button>
                        <h1 class="album-title">\${albumData.albumName}</h1>
                        <div class="page-indicator">
                            \${isMobile 
                                ? \`Page \${currentPageIndex + 1} of \${totalPages}\`
                                : \`Page \${currentPageIndex + 1}-\${Math.min(currentPageIndex + 2, totalPages)} of \${totalPages}\`
                            }
                        </div>
                    </header>
                    
                    <div class="book-container">
                        <div class="book-spread \${isMobile ? 'mobile-view' : ''}">
                            \${!isMobile ? '<div class="book-spine"></div>' : ''}
                            \${renderPage(leftPage, isMobile ? 'single' : 'left')}
                            \${!isMobile && rightPage ? renderPage(rightPage, 'right') : ''}
                        </div>
                        
                        <div class="navigation-controls">
                            <button class="nav-button prev" onclick="prevPage()" \${currentPageIndex === 0 ? 'disabled' : ''}>
                                ←
                            </button>
                            <button class="nav-button next" onclick="nextPage()" \${currentPageIndex >= totalPages - (isMobile ? 1 : 2) ? 'disabled' : ''}>
                                →
                            </button>
                        </div>
                    </div>
                </div>
            \`;
        }
        
        // Render individual page
        function renderPage(page, position) {
            if (!page) return '';
            
            const isIndexPage = page.isIndexPage;
            const isFavoritesPage = page.id.startsWith('favorites-');
            const isVideosPage = page.id.startsWith('videos-');
            
            if (isIndexPage) {
                return \`
                    <div class="book-page \${position === 'single' ? 'single-page' : position === 'left' ? 'left-page' : 'right-page'}">
                        <div class="index-page">
                            <div class="index-title">
                                <h1>\${page.dateHeader}</h1>
                            </div>
                        </div>
                    </div>
                \`;
            }
            
            let pageHeader = '';
            if (page.dateHeader && !isFavoritesPage && !isVideosPage) {
                pageHeader = \`
                    <div class="page-header">
                        <h2 class="date-header">\${page.dateHeader}</h2>
                        <div class="page-number">\${page.pageNumber}</div>
                    </div>
                \`;
            }
            
            if (isFavoritesPage) {
                pageHeader = \`
                    <div class="page-header">
                        <div class="favorites-header">
                            <h2 class="date-header">My Favorite Photos</h2>
                        </div>
                    </div>
                \`;
            }
            
            const photosHtml = page.photos.map((photo, index) => \`
                <div class="polaroid-photo medium" style="transform: rotate(\${photo.rotation || 0}deg);">
                    <div class="polaroid-frame">
                        <div class="photo-container" style="width: 250px; height: 250px; cursor: pointer;" onclick="openPhotoModal(albumData.pages.find(p => p.id === '\${page.id}').photos[\${index}])">
                            <img src="\${photo.dataUrl}" alt="\${photo.name}" class="photo-image" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div class="polaroid-caption">
                            <div class="caption-content">
                                \${photo.location ? \`<div class="location-text">\${photo.location}</div>\` : ''}
                                \${photo.description ? \`<div class="description-text">\${photo.description}</div>\` : ''}
                                \${!photo.location && !photo.description ? '<div class="empty-caption">Click to add caption</div>' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            \`).join('');
            
            return \`
                <div class="book-page \${position === 'single' ? 'single-page' : position === 'left' ? 'left-page' : 'right-page'}">
                    \${pageHeader}
                    <div class="photos-grid masonry-grid">
                        \${photosHtml}
                    </div>
                </div>
            \`;
        }
        
        // Format video duration
        function formatDuration(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && selectedPhoto) {
                closePhotoModal();
            } else if (!selectedPhoto) {
                if (e.key === 'ArrowLeft') prevPage();
                if (e.key === 'ArrowRight') nextPage();
            }
        });
        
        // Touch/swipe support for mobile
        let touchStartX = null;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        
        document.addEventListener('touchend', (e) => {
            if (touchStartX === null) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextPage(); // Swipe left
                else prevPage(); // Swipe right
            }
            
            touchStartX = null;
        });
        
        // Initialize the album
        renderCurrentPage();
    </script>
</body>
</html>`;
};

// Main export function
export const exportAlbumToHTML = async (album: Album, pages: AlbumPage[]): Promise<void> => {
  try {
    // Filter out video pages and convert all photos to base64
    const photoOnlyPages = pages.filter(page => 
      !page.id.startsWith('videos-') // Remove video pages entirely
    );
    
    const processedPages = await Promise.all(
      photoOnlyPages.map(async (page) => ({
        ...page,
        // Filter out any videos that might be in regular pages
        photos: await Promise.all(
          page.photos.filter(photo => photo.type !== 'video').map(async (photo) => {
            try {
              // For photos only, convert to base64
              const dataUrl = await convertToBase64(photo.url);
              
              return {
                ...photo,
                dataUrl,
                // Keep original URLs for reference but they won't be used in offline mode
                originalUrl: photo.url,
                // Ensure metadata is preserved
                fileSize: photo.fileSize || 0,
                capturedAt: photo.capturedAt || photo.uploadedAt
              };
            } catch (error) {
              console.warn('Failed to convert media to base64:', photo.name, error);
              return {
                ...photo,
                dataUrl: photo.url, // Fallback to original URL
                originalUrl: photo.url
              };
            }
          })
        )
      }))
    );
    
    // Extract CSS styles
    const css = extractCSS();
    
    // Create album data object
    const albumData = {
      albumName: album.name,
      pages: processedPages
    };
    
    // Generate HTML
    const html = createHTMLTemplate(
      album.name,
      JSON.stringify(albumData),
      css
    );
    
    // Create download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${album.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_album.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    console.log('Album exported successfully!');
  } catch (error) {
    console.error('Failed to export album:', error);
    alert('Failed to export album. Please try again.');
  }
};