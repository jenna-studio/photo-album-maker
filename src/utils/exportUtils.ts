import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { Photo } from '../types';

// A4 dimensions in pixels at 150 DPI
const A4_WIDTH = 1240;
const A4_HEIGHT = 1754;
const MAX_POLAROID_WIDTH = 500;


const createPolaroidElement = async (photo: Photo): Promise<HTMLElement> => {
  // Create polaroid container
  const polaroidContainer = document.createElement('div');
  polaroidContainer.style.backgroundColor = '#ffffff';
  polaroidContainer.style.padding = '15px';
  polaroidContainer.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.15)';
  polaroidContainer.style.transform = `rotate(${(Math.random() - 0.5) * 8}deg)`;
  polaroidContainer.style.borderRadius = '2px';
  polaroidContainer.style.width = 'fit-content';
  polaroidContainer.style.maxWidth = `${MAX_POLAROID_WIDTH}px`;
  polaroidContainer.style.position = 'relative';


  const img = document.createElement('img');
  img.src = photo.type === 'video' ? photo.thumbnail || photo.url : photo.url;

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const aspectRatio = img.naturalWidth / img.naturalHeight;
  const width = Math.min(img.naturalWidth, MAX_POLAROID_WIDTH - 30);
  const height = width / aspectRatio;

  img.style.width = `${width}px`;
  img.style.height = `${height}px`;
  img.style.display = 'block';

  polaroidContainer.appendChild(img);

  // No caption area needed anymore
  return polaroidContainer;
}


export const exportFavoritesToPDF = async (favorites: Photo[], albumName: string): Promise<void> => {
  try {
    // Create the same layout as JPEG export but convert to PDF
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = `${A4_WIDTH}px`;
    container.style.height = `${A4_HEIGHT}px`;
    container.style.backgroundColor = '#f5f1e8';
    container.style.padding = '50px';
    container.style.boxSizing = 'border-box';
    container.style.fontFamily = 'Georgia, serif';
    
    // Add title
    const title = document.createElement('h1');
    title.textContent = `${albumName} - Favorites`;
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    title.style.fontSize = '32px';
    title.style.color = '#2c1810';
    container.appendChild(title);
    
    const subtitle = document.createElement('p');
    subtitle.textContent = `Exported on ${new Date().toLocaleDateString()} • ${favorites.length} favorite${favorites.length !== 1 ? 's' : ''}`;
    subtitle.style.textAlign = 'center';
    subtitle.style.marginBottom = '40px';
    subtitle.style.fontSize = '16px';
    subtitle.style.color = '#6b4423';
    container.appendChild(subtitle);
    
    // Create grid for polaroid photos
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    grid.style.gap = '40px';
    grid.style.maxHeight = `${A4_HEIGHT - 200}px`;
    grid.style.overflow = 'hidden';
    grid.style.justifyItems = 'center';
    
    // Add photos to grid (up to 4 photos to fit A4)
    const photosToShow = favorites.slice(0, 4);
    
    for (const photo of photosToShow) {
      const polaroidElement = await createPolaroidElement(photo);
      grid.appendChild(polaroidElement);
    }
    
    container.appendChild(grid);
    document.body.appendChild(container);
    
    // Wait for images to load
    const images = container.querySelectorAll('img');
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
    
    // Generate canvas
    const canvas = await html2canvas(container, {
      width: A4_WIDTH,
      height: A4_HEIGHT
    });
    
    // Convert canvas to PDF
    const pdf = new jsPDF('p', 'pt', 'a4');
    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    
    // Clean up
    document.body.removeChild(container);
    
    pdf.save(`${albumName}-favorites.pdf`);

  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Failed to export PDF. Please try again.');
  }
};

export const exportFavoritesToJPEG = async (favorites: Photo[], albumName: string): Promise<void> => {
  try {
    // Create a temporary container for the collage
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = `${A4_WIDTH}px`;
    container.style.height = `${A4_HEIGHT}px`;
    container.style.backgroundColor = '#f5f1e8';
    container.style.padding = '50px';
    container.style.boxSizing = 'border-box';
    container.style.fontFamily = 'Georgia, serif';

    // Add title
    const title = document.createElement('h1');
    title.textContent = `${albumName} - Favorites`;
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    title.style.fontSize = '32px';
    title.style.color = '#2c1810';
    container.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.textContent = `Exported on ${new Date().toLocaleDateString()} • ${favorites.length} favorite${favorites.length !== 1 ? 's' : ''}`;
    subtitle.style.textAlign = 'center';
    subtitle.style.marginBottom = '40px';
    subtitle.style.fontSize = '16px';
    subtitle.style.color = '#6b4423';
    container.appendChild(subtitle);

    // Create grid for polaroid photos
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    grid.style.gap = '40px';
    grid.style.maxHeight = `${A4_HEIGHT - 200}px`;
    grid.style.overflow = 'hidden';
    grid.style.justifyItems = 'center';

    // Add photos to grid (up to 4 photos to fit A4)
    const photosToShow = favorites.slice(0, 4);

    for (const photo of photosToShow) {
      const polaroidElement = await createPolaroidElement(photo);
      grid.appendChild(polaroidElement);
    }

    container.appendChild(grid);
    document.body.appendChild(container);

    // Wait for images to load
    const images = container.querySelectorAll('img');
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

    // Generate canvas and download
    const canvas = await html2canvas(container, {
      width: A4_WIDTH,
      height: A4_HEIGHT
    });

    // Clean up
    document.body.removeChild(container);

    // Download as JPEG
    const link = document.createElement('a');
    link.download = `${albumName}-favorites.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();

  } catch (error) {
    console.error('Error exporting to JPEG:', error);
    alert('Failed to export JPEG. Please try again.');
  }
};