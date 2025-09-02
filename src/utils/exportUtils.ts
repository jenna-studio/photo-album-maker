import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import type { Photo } from '../types';

// Book dimensions matching original album layout
const BOOK_SPREAD_WIDTH = 1600; // Full spread width (matches album)
const BOOK_PAGE_WIDTH = 800;    // Single page width 
const BOOK_PAGE_HEIGHT = 600;   // Page height
const PHOTOS_PER_SPREAD = 8;    // 4 photos per page, 2 pages per spread

const createStyledPolaroid = async (photo: Photo): Promise<HTMLElement> => {
  // Create polaroid container matching original album styling
  const polaroidContainer = document.createElement('div');
  polaroidContainer.className = 'polaroid-photo medium';
  polaroidContainer.style.cssText = `
    position: relative;
    cursor: default;
    margin: 0.25rem;
    width: fit-content;
    box-sizing: border-box;
    transform: rotate(${(Math.random() - 0.5) * 8}deg);
  `;

  // Create polaroid frame exactly like original album
  const frame = document.createElement('div');
  frame.className = 'polaroid-frame';
  frame.style.cssText = `
    background: white;
    padding: 12px;
    border: none;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(135, 206, 235, 0.2);
    position: relative;
    width: fit-content;
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
  `;

  // Create image element
  const img = document.createElement('img');
  img.src = photo.type === 'video' ? photo.thumbnail || photo.url : photo.url;
  img.className = 'photo-image';
  img.style.cssText = `
    width: 100%;
    height: 200px;
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

  // Create minimal caption space like original album (no text)
  const caption = document.createElement('div');
  caption.className = 'polaroid-caption';
  caption.style.cssText = `
    margin-top: 10px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

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

  // Create photo grids for both pages (2x2 grid like original album)
  const createPhotoGrid = () => {
    const grid = document.createElement('div');
    grid.className = 'photos-grid masonry-grid';
    grid.style.cssText = `
      display: grid;
      gap: 1rem;
      justify-items: center;
      align-items: center;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      justify-content: space-evenly;
      align-content: center;
      flex: 1;
      width: 100%;
      padding: 1rem;
    `;

    return grid;
  };

  const leftGrid = createPhotoGrid();
  const rightGrid = createPhotoGrid();

  // Add photos to left page (max 4 in 2x2 grid)
  for (let i = 0; i < Math.min(leftPhotos.length, 4); i++) {
    const polaroidElement = await createStyledPolaroid(leftPhotos[i]);
    leftGrid.appendChild(polaroidElement);
  }

  // Add photos to right page (max 4 in 2x2 grid)  
  for (let i = 0; i < Math.min(rightPhotos.length, 4); i++) {
    const polaroidElement = await createStyledPolaroid(rightPhotos[i]);
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

    // Process photos in groups of 8 (4 per page, 2 pages per spread)
    for (let i = 0; i < favorites.length; i += PHOTOS_PER_SPREAD) {
      const spreadPhotos = favorites.slice(i, i + PHOTOS_PER_SPREAD);
      const leftPhotos = spreadPhotos.slice(0, 4);
      const rightPhotos = spreadPhotos.slice(4, 8);
      
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

    // Process photos in groups of 8 (4 per page, 2 pages per spread)
    for (let i = 0; i < favorites.length; i += PHOTOS_PER_SPREAD) {
      const spreadPhotos = favorites.slice(i, i + PHOTOS_PER_SPREAD);
      const leftPhotos = spreadPhotos.slice(0, 4);
      const rightPhotos = spreadPhotos.slice(4, 8);
      
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