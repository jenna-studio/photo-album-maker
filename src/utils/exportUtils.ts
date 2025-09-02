import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import type { Photo } from '../types';

// Page dimensions to match album styling
const PAGE_WIDTH = 800;
const PAGE_HEIGHT = 600;
const PHOTOS_PER_PAGE = 4;

const createStyledPolaroid = async (photo: Photo): Promise<HTMLElement> => {
  // Create polaroid container with album styling
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

  // Create polaroid frame
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

  // Create caption with location and description
  const caption = document.createElement('div');
  caption.className = 'polaroid-caption';
  caption.style.cssText = `
    margin-top: 10px;
    height: auto;
    min-height: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `;

  const captionContent = document.createElement('div');
  captionContent.className = 'caption-content';
  captionContent.style.cssText = `
    text-align: center;
    font-family: "Courier New", monospace;
    font-size: 0.8rem;
    color: #333;
    width: 100%;
  `;

  let captionText = '';
  if (photo.location) {
    captionText += `📍 ${photo.location}\n`;
  }
  if (photo.description) {
    captionText += photo.description;
  }
  if (!photo.location && !photo.description) {
    captionText = '✨ Favorite Memory';
  }

  captionContent.innerText = captionText;
  caption.appendChild(captionContent);
  frame.appendChild(caption);
  polaroidContainer.appendChild(frame);

  return polaroidContainer;
};

const createStyledPage = async (photos: Photo[], pageTitle: string): Promise<HTMLElement> => {
  // Create page container with album styling
  const pageContainer = document.createElement('div');
  pageContainer.style.cssText = `
    width: ${PAGE_WIDTH}px;
    height: ${PAGE_HEIGHT}px;
    background: #ffffe0;
    color: #2c3e50;
    padding: 2rem;
    border: none;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    position: relative;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    font-family: "Inter", sans-serif;
    background-image: linear-gradient(rgba(176, 196, 222, 0.2) 1px, transparent 1px);
    background-size: 20px 20px;
  `;

  // Add page header if it's the first page
  if (pageTitle) {
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid rgba(176, 196, 222, 0.2);
      padding-bottom: 1rem;
    `;

    const title = document.createElement('h1');
    title.textContent = pageTitle;
    title.style.cssText = `
      font-size: 1.8rem;
      color: #2c3e50;
      margin: 0;
      font-family: "Inter", sans-serif;
      font-weight: 600;
    `;

    header.appendChild(title);
    pageContainer.appendChild(header);
  }

  // Create photos grid
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

  // Add photos to grid
  for (const photo of photos) {
    const polaroidElement = await createStyledPolaroid(photo);
    grid.appendChild(polaroidElement);
  }

  pageContainer.appendChild(grid);
  return pageContainer;
};

export const exportFavoritesToPDF = async (favorites: Photo[], albumName: string): Promise<void> => {
  try {
    console.log('Starting PDF export for', favorites.length, 'favorites');

    if (favorites.length === 0) {
      alert('No favorites to export!');
      return;
    }

    // Create PDF with multiple pages
    const pdf = new jsPDF('landscape', 'pt', [PAGE_WIDTH, PAGE_HEIGHT]);
    let isFirstPage = true;

    // Process photos in groups of 4 (PHOTOS_PER_PAGE)
    for (let i = 0; i < favorites.length; i += PHOTOS_PER_PAGE) {
      const pagePhotos = favorites.slice(i, i + PHOTOS_PER_PAGE);
      const pageTitle = isFirstPage ? `${albumName || 'Album'} - Favorites` : '';

      // Create styled page
      const pageContainer = await createStyledPage(pagePhotos, pageTitle);
      
      // Add to DOM temporarily for rendering
      pageContainer.style.position = 'absolute';
      pageContainer.style.top = '-9999px';
      pageContainer.style.left = '-9999px';
      document.body.appendChild(pageContainer);

      // Wait for images to load
      const images = pageContainer.querySelectorAll('img');
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

      // Generate canvas from page
      const canvas = await html2canvas(pageContainer, {
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        useCORS: true,
        background: '#ffffe0'
      });

      // Add page to PDF
      if (!isFirstPage) {
        pdf.addPage();
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      pdf.addImage(imgData, 'JPEG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);

      // Clean up
      document.body.removeChild(pageContainer);
      isFirstPage = false;
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

    // Create ZIP file for multiple pages
    const zip = new JSZip();
    let pageNumber = 1;

    // Process photos in groups of 4 (PHOTOS_PER_PAGE)
    for (let i = 0; i < favorites.length; i += PHOTOS_PER_PAGE) {
      const pagePhotos = favorites.slice(i, i + PHOTOS_PER_PAGE);
      const pageTitle = pageNumber === 1 ? `${albumName || 'Album'} - Favorites` : '';

      // Create styled page
      const pageContainer = await createStyledPage(pagePhotos, pageTitle);
      
      // Add to DOM temporarily for rendering
      pageContainer.style.position = 'absolute';
      pageContainer.style.top = '-9999px';
      pageContainer.style.left = '-9999px';
      document.body.appendChild(pageContainer);

      // Wait for images to load
      const images = pageContainer.querySelectorAll('img');
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

      // Generate canvas from page
      const canvas = await html2canvas(pageContainer, {
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
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
      const filename = `page-${pageNumber.toString().padStart(2, '0')}.jpg`;
      zip.file(filename, imageBlob);

      // Clean up
      document.body.removeChild(pageContainer);
      pageNumber++;
    }

    // Generate and download ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${albumName || 'Album'}-favorites-pages.zip`;
    link.click();

    // Clean up
    URL.revokeObjectURL(link.href);

    console.log('JPEG export completed successfully');

  } catch (error) {
    console.error('Error exporting to JPEG:', error);
    alert('Failed to export JPEG. Please try again.');
  }
};