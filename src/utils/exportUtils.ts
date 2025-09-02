import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import type { Photo } from '../types';

// Landscape book dimensions (like A4 landscape but wider for book spread)
const BOOK_SPREAD_WIDTH = 1600; // Full spread width (matches album)
const BOOK_PAGE_WIDTH = 800;    // Single page width 
const BOOK_PAGE_HEIGHT = 600;   // Page height
const PHOTOS_PER_SPREAD = 6;    // 3 photos per page, 2 pages per spread

const calculateCaptionHeight = (photo: Photo, maxWidth: number): number => {
  // Calculate height needed for caption based on content
  const hasLocation = !!photo.location;
  const hasDescription = !!photo.description;
  
  if (!hasLocation && !hasDescription) {
    return 25; // Default height for "✨ Favorite Memory"
  }

  let estimatedLines = 0;
  const charPerLine = Math.floor(maxWidth / 8); // Rough estimate based on font size

  if (hasLocation) {
    estimatedLines += Math.ceil((photo.location?.length || 0 + 2) / charPerLine); // +2 for icon
  }
  
  if (hasDescription) {
    estimatedLines += Math.ceil((photo.description?.length || 0) / charPerLine);
  }

  // Add some padding between lines and ensure minimum height
  return Math.max(25, estimatedLines * 16 + 10);
};

const createStyledPolaroid = async (photo: Photo, maxWidth: number = 220): Promise<HTMLElement> => {
  // Calculate dynamic caption height
  const captionHeight = calculateCaptionHeight(photo, maxWidth);

  // Create polaroid container with album styling
  const polaroidContainer = document.createElement('div');
  polaroidContainer.className = 'polaroid-photo medium';
  polaroidContainer.style.cssText = `
    position: relative;
    cursor: default;
    margin: 0.5rem;
    width: fit-content;
    max-width: ${maxWidth}px;
    box-sizing: border-box;
    transform: rotate(${(Math.random() - 0.5) * 6}deg);
  `;

  // Create polaroid frame with dynamic height
  const frame = document.createElement('div');
  frame.className = 'polaroid-frame';
  frame.style.cssText = `
    background: white;
    padding: 12px 12px ${captionHeight + 12}px 12px;
    border: none;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(135, 206, 235, 0.2);
    position: relative;
    width: fit-content;
    max-width: ${maxWidth}px;
    display: flex;
    flex-direction: column;
    align-items: center;
  `;

  // Create photo container
  const photoContainer = document.createElement('div');
  photoContainer.className = 'photo-container';
  photoContainer.style.cssText = `
    position: relative;
    overflow: hidden;
    border-radius: 1px;
    width: 100%;
  `;

  // Create image element
  const img = document.createElement('img');
  img.src = photo.type === 'video' ? photo.thumbnail || photo.url : photo.url;
  img.className = 'photo-image';
  img.style.cssText = `
    width: 100%;
    height: 160px;
    object-fit: cover;
    display: block;
    background: #f8f8f8;
    border-radius: 4px;
    border: none;
  `;

  // Wait for image to load
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  photoContainer.appendChild(img);
  frame.appendChild(photoContainer);

  // Create caption with location and description
  const caption = document.createElement('div');
  caption.className = 'polaroid-caption';
  caption.style.cssText = `
    position: absolute;
    bottom: 12px;
    left: 12px;
    right: 12px;
    height: ${captionHeight}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  `;

  const captionContent = document.createElement('div');
  captionContent.className = 'caption-content';
  captionContent.style.cssText = `
    text-align: center;
    font-family: "Courier New", monospace;
    font-size: 0.75rem;
    color: #333;
    width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    line-height: 1.3;
  `;

  let captionHTML = '';
  if (photo.location) {
    captionHTML += `<div style="font-weight: bold; margin-bottom: 2px;">📍 ${photo.location}</div>`;
  }
  if (photo.description) {
    captionHTML += `<div style="font-style: italic;">${photo.description}</div>`;
  }
  if (!photo.location && !photo.description) {
    captionHTML = '<div>✨ Favorite Memory</div>';
  }

  captionContent.innerHTML = captionHTML;
  caption.appendChild(captionContent);
  frame.appendChild(caption);
  polaroidContainer.appendChild(frame);

  return polaroidContainer;
};

const createBookSpread = async (leftPhotos: Photo[], rightPhotos: Photo[], spreadTitle: string): Promise<HTMLElement> => {
  // Create book spread container (landscape)
  const spreadContainer = document.createElement('div');
  spreadContainer.style.cssText = `
    width: ${BOOK_SPREAD_WIDTH}px;
    height: ${BOOK_PAGE_HEIGHT}px;
    background: #ffffe0;
    color: #2c3e50;
    position: relative;
    display: flex;
    box-sizing: border-box;
    font-family: "Inter", sans-serif;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
  `;

  // Create left page
  const leftPage = document.createElement('div');
  leftPage.style.cssText = `
    width: ${BOOK_PAGE_WIDTH}px;
    height: ${BOOK_PAGE_HEIGHT}px;
    background: #ffffe0;
    background-image: linear-gradient(rgba(176, 196, 222, 0.2) 1px, transparent 1px);
    background-size: 20px 20px;
    padding: 2rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(176, 196, 222, 0.3);
    position: relative;
  `;

  // Create right page
  const rightPage = document.createElement('div');
  rightPage.style.cssText = `
    width: ${BOOK_PAGE_WIDTH}px;
    height: ${BOOK_PAGE_HEIGHT}px;
    background: #ffffe0;
    background-image: linear-gradient(rgba(176, 196, 222, 0.2) 1px, transparent 1px);
    background-size: 20px 20px;
    padding: 2rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    position: relative;
  `;

  // Add book spine shadow
  const spine = document.createElement('div');
  spine.style.cssText = `
    position: absolute;
    top: 0;
    left: ${BOOK_PAGE_WIDTH}px;
    width: 1px;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%);
    z-index: 10;
  `;

  // Add title to left page if it's the first spread
  if (spreadTitle) {
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid rgba(176, 196, 222, 0.2);
      padding-bottom: 1rem;
    `;

    const title = document.createElement('h1');
    title.textContent = spreadTitle;
    title.style.cssText = `
      font-size: 1.5rem;
      color: #2c3e50;
      margin: 0;
      font-family: "Inter", sans-serif;
      font-weight: 600;
      text-align: center;
    `;

    header.appendChild(title);
    leftPage.appendChild(header);
  }

  // Create photo grids for both pages
  const createPhotoGrid = () => {
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 1rem;
      justify-content: center;
      align-items: center;
      flex: 1;
      width: 100%;
      padding: 0.5rem;
    `;

    return grid;
  };

  const leftGrid = createPhotoGrid();
  const rightGrid = createPhotoGrid();

  // Add photos to left page (max 3)
  for (let i = 0; i < Math.min(leftPhotos.length, 3); i++) {
    const polaroidElement = await createStyledPolaroid(leftPhotos[i], 200);
    leftGrid.appendChild(polaroidElement);
  }

  // Add photos to right page (max 3)  
  for (let i = 0; i < Math.min(rightPhotos.length, 3); i++) {
    const polaroidElement = await createStyledPolaroid(rightPhotos[i], 200);
    rightGrid.appendChild(polaroidElement);
  }

  leftPage.appendChild(leftGrid);
  rightPage.appendChild(rightGrid);

  spreadContainer.appendChild(leftPage);
  spreadContainer.appendChild(spine);
  spreadContainer.appendChild(rightPage);

  return spreadContainer;
};

export const exportFavoritesToPDF = async (favorites: Photo[], albumName: string): Promise<void> => {
  try {
    console.log('Starting PDF export for', favorites.length, 'favorites');

    if (favorites.length === 0) {
      alert('No favorites to export!');
      return;
    }

    // Create PDF in landscape format
    const pdf = new jsPDF('landscape', 'pt', [BOOK_SPREAD_WIDTH, BOOK_PAGE_HEIGHT]);
    let isFirstSpread = true;

    // Process photos in groups of 6 (3 per page, 2 pages per spread)
    for (let i = 0; i < favorites.length; i += PHOTOS_PER_SPREAD) {
      const spreadPhotos = favorites.slice(i, i + PHOTOS_PER_SPREAD);
      const leftPhotos = spreadPhotos.slice(0, 3);
      const rightPhotos = spreadPhotos.slice(3, 6);
      
      const spreadTitle = isFirstSpread ? `${albumName || 'Album'} - Favorites` : '';

      // Create styled book spread
      const spreadContainer = await createBookSpread(leftPhotos, rightPhotos, spreadTitle);
      
      // Add to DOM temporarily for rendering
      spreadContainer.style.position = 'absolute';
      spreadContainer.style.top = '-9999px';
      spreadContainer.style.left = '-9999px';
      document.body.appendChild(spreadContainer);

      // Wait for images to load
      const images = spreadContainer.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(null);
          } else {
            img.onload = () => resolve(null);
            img.onerror = () => resolve(null);
          }
        });
      }));

      // Generate canvas from spread
      const canvas = await html2canvas(spreadContainer, {
        width: BOOK_SPREAD_WIDTH,
        height: BOOK_PAGE_HEIGHT,
        useCORS: true,
        background: '#ffffe0'
      });

      // Add spread to PDF
      if (!isFirstSpread) {
        pdf.addPage();
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      pdf.addImage(imgData, 'JPEG', 0, 0, BOOK_SPREAD_WIDTH, BOOK_PAGE_HEIGHT);

      // Clean up
      document.body.removeChild(spreadContainer);
      isFirstSpread = false;
    }

    // Save PDF
    const filename = `${albumName || 'Album'}-favorites.pdf`;
    pdf.save(filename);

    console.log('PDF export completed successfully');

  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Failed to export PDF. Please try again.');
  }
};

export const exportFavoritesToJPEG = async (favorites: Photo[], albumName: string): Promise<void> => {
  try {
    console.log('Starting JPEG export for', favorites.length, 'favorites');

    if (favorites.length === 0) {
      alert('No favorites to export!');
      return;
    }

    // Create ZIP file for multiple spreads
    const zip = new JSZip();
    let spreadNumber = 1;

    // Process photos in groups of 6 (3 per page, 2 pages per spread)
    for (let i = 0; i < favorites.length; i += PHOTOS_PER_SPREAD) {
      const spreadPhotos = favorites.slice(i, i + PHOTOS_PER_SPREAD);
      const leftPhotos = spreadPhotos.slice(0, 3);
      const rightPhotos = spreadPhotos.slice(3, 6);
      
      const spreadTitle = spreadNumber === 1 ? `${albumName || 'Album'} - Favorites` : '';

      // Create styled book spread
      const spreadContainer = await createBookSpread(leftPhotos, rightPhotos, spreadTitle);
      
      // Add to DOM temporarily for rendering
      spreadContainer.style.position = 'absolute';
      spreadContainer.style.top = '-9999px';
      spreadContainer.style.left = '-9999px';
      document.body.appendChild(spreadContainer);

      // Wait for images to load
      const images = spreadContainer.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(null);
          } else {
            img.onload = () => resolve(null);
            img.onerror = () => resolve(null);
          }
        });
      }));

      // Generate canvas from spread
      const canvas = await html2canvas(spreadContainer, {
        width: BOOK_SPREAD_WIDTH,
        height: BOOK_PAGE_HEIGHT,
        useCORS: true,
        background: '#ffffe0'
      });

      // Convert canvas to blob
      const imageBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', 0.9);
      });

      // Add to ZIP
      const filename = `spread-${spreadNumber.toString().padStart(2, '0')}.jpg`;
      zip.file(filename, imageBlob);

      // Clean up
      document.body.removeChild(spreadContainer);
      spreadNumber++;
    }

    // Generate and download ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${albumName || 'Album'}-favorites-spreads.zip`;
    link.click();

    // Clean up
    URL.revokeObjectURL(link.href);

    console.log('JPEG export completed successfully');

  } catch (error) {
    console.error('Error exporting to JPEG:', error);
    alert('Failed to export JPEG. Please try again.');
  }
};