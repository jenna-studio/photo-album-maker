import type { MediaItem, Album, AlbumPage } from '../types';
import exifr from 'exifr';

export const createAlbumsFromPhotos = (photos: MediaItem[]): Album[] => {
  if (photos.length === 0) {
    return [{
      id: 'main-album',
      name: '',
      photos: [],
      createdAt: new Date(),
      isOpen: false
    }];
  }

  return [{
    id: 'main-album',
    name: '',
    photos: photos.sort((a, b) => (a.capturedAt || a.uploadedAt).getTime() - (b.capturedAt || b.uploadedAt).getTime()),
    createdAt: new Date(),
    coverPhoto: photos[0],
    isOpen: false
  }];
};

export const createAlbumPages = (photos: MediaItem[]): AlbumPage[] => {
  if (photos.length === 0) return [];

  const pages: AlbumPage[] = [];
  
  // Separate photos and videos
  const photoItems = photos.filter(item => item.type === 'photo');
  const videoItems = photos.filter(item => item.type === 'video');
  
  const favoritePhotos = photoItems.filter(photo => photo.isFavorite);
  const groupedByDate = new Map<string, MediaItem[]>();

  // Group ONLY PHOTOS by date (excluding videos)
  photoItems.forEach(photo => {
    const date = photo.capturedAt || photo.uploadedAt;
    const dateKey = date.toDateString();
    
    if (!groupedByDate.has(dateKey)) {
      groupedByDate.set(dateKey, []);
    }
    groupedByDate.get(dateKey)!.push(photo);
  });

  let pageNumber = 1;
  
  // Create pages from grouped dates
  Array.from(groupedByDate.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .forEach(([dateString, datePhotos]) => {
      const date = new Date(dateString);
      
      // First create an index page for this date
      pages.push({
        id: `index-${pageNumber}`,
        dateHeader: formatDateIndexHeader(date),
        photos: [],
        pageNumber,
        isIndexPage: true
      });
      pageNumber++;
      
      // Then create photo pages for this date
      const photosPerPage = getPhotosPerPage();
      for (let i = 0; i < datePhotos.length; i += photosPerPage) {
        const pagePhotos = datePhotos.slice(i, i + photosPerPage);
        
        pages.push({
          id: `page-${pageNumber}`,
          dateHeader: '', // No date header on photo pages
          photos: pagePhotos,
          pageNumber
        });
        
        pageNumber++;
      }
    });

  // Add videos section if there are any videos
  if (videoItems.length > 0) {
    // Add videos index page
    pages.push({
      id: `videos-index`,
      dateHeader: 'Videos',
      photos: [],
      pageNumber,
      isIndexPage: true
    });
    pageNumber++;
    
    // Sort videos by date/time (newest first)
    const sortedVideos = videoItems.sort((a, b) => {
      const dateA = a.capturedAt || a.uploadedAt;
      const dateB = b.capturedAt || b.uploadedAt;
      return dateB.getTime() - dateA.getTime();
    });
    
    const videosPerPage = getPhotosPerPage(); // Use same limit (4)
    for (let i = 0; i < sortedVideos.length; i += videosPerPage) {
      const pageVideos = sortedVideos.slice(i, i + videosPerPage);
      
      pages.push({
        id: `videos-${Math.ceil((i + 1) / videosPerPage)}`,
        dateHeader: '',
        photos: pageVideos,
        pageNumber
      });
      pageNumber++;
    }
  }

  // Add favorites section at the end if there are any favorites (duplicated from original sections)
  if (favoritePhotos.length > 0) {
    // Add favorites index page
    pages.push({
      id: `favorites-index`,
      dateHeader: 'Favorites',
      photos: [],
      pageNumber,
      isIndexPage: true
    });
    pageNumber++;
    
    const photosPerPage = getPhotosPerPage();
    for (let i = 0; i < favoritePhotos.length; i += photosPerPage) {
      const pagePhotos = favoritePhotos.slice(i, i + photosPerPage);
      
      pages.push({
        id: `favorites-${Math.ceil((i + 1) / photosPerPage)}`,
        dateHeader: '',
        photos: pagePhotos,
        pageNumber
      });
      pageNumber++;
    }
  }

  return pages;
};

export const getPhotosPerPage = (): number => {
  // Always return 4 photos/videos per page maximum
  return 4;
};

export const formatDateHeader = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

export const formatDateIndexHeader = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Fallback city lookup for common coordinate ranges
const getCityFromCoordinates = (lat: number, lon: number): string | null => {
  // Philippines regions (based on your photo coordinates)
  if (lat >= 14.0 && lat <= 15.0 && lon >= 120.5 && lon <= 121.5) {
    if (lat >= 14.4 && lat <= 14.8 && lon >= 120.9 && lon <= 121.1) {
      return 'Manila, Philippines';
    }
    return 'Metro Manila, Philippines';
  }
  
  // Add more regions as needed
  if (lat >= 40.4 && lat <= 40.9 && lon >= -74.3 && lon <= -73.7) {
    return 'New York, NY';
  }
  
  if (lat >= 34.0 && lat <= 34.3 && lon >= -118.5 && lon <= -118.2) {
    return 'Los Angeles, CA';
  }
  
  if (lat >= 37.7 && lat <= 37.8 && lon >= -122.5 && lon <= -122.3) {
    return 'San Francisco, CA';
  }
  
  // Add more city ranges as needed
  return null;
};

// Reverse geocoding to get location name from coordinates
const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
  try {
    console.log(`Attempting reverse geocoding for: ${lat}, ${lon}`);
    
    // Using OpenStreetMap Nominatim API (free, no API key required)
    // Adding User-Agent header as recommended
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PhotoAlbumMaker/1.0 (photo-album-app@example.com)'
        }
      }
    );
    
    console.log('Reverse geocoding response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Reverse geocoding data:', data);
      
      // Extract meaningful location components
      const address = data.address || {};
      
      // Try different location components in order of preference
      const city = address.city || address.town || address.village || 
                  address.municipality || address.suburb || address.neighbourhood;
      const state = address.state || address.region || address.province;
      const country = address.country;
      
      console.log('Extracted components:', { city, state, country });
      
      // Build location string with city and state/country
      let locationParts = [];
      
      if (city) {
        locationParts.push(city);
      }
      
      if (state && country) {
        // For US locations, show "City, State" 
        if (country.toLowerCase().includes('united states') || country.toLowerCase().includes('usa')) {
          if (state) locationParts.push(state);
        } else {
          // For international locations, show "City, Country"
          locationParts.push(country);
        }
      } else if (state) {
        locationParts.push(state);
      } else if (country) {
        locationParts.push(country);
      }
      
      const finalLocation = locationParts.length > 0 ? locationParts.join(', ') : null;
      console.log('Final location:', finalLocation);
      
      return finalLocation;
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
  }
  
  return null;
};

export const extractEXIFData = async (file: File): Promise<{
  exifData: Record<string, unknown>;
  location?: string;
  capturedAt?: Date;
}> => {
  console.log('=== Starting EXIF extraction for:', file.name, 'Type:', file.type);
  
  try {
    if (!file.type.startsWith('image/')) {
      console.log('File is not an image, skipping EXIF extraction');
      return { 
        exifData: {},
        capturedAt: file.lastModified ? new Date(file.lastModified) : new Date()
      };
    }

    console.log('File is an image, attempting GPS extraction...');
    
    // Extract GPS data using exifr.gps()
    const gps = await exifr.gps(file);
    console.log('GPS extraction result:', gps);
    
    let location: string | undefined;
    
    if (gps && typeof gps === 'object' && gps.latitude && gps.longitude) {
      console.log('✓ Found GPS coordinates:', gps.latitude, gps.longitude);
      
      // First try coordinate-based city lookup (fast and reliable)
      const cityName = getCityFromCoordinates(gps.latitude, gps.longitude);
      if (cityName) {
        location = cityName;
        console.log('✓ Matched city from coordinates:', location);
      } else {
        // Fallback to coordinates
        location = `${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)}`;
        console.log('→ Using GPS coordinates as location:', location);
      }
      
      // Try reverse geocoding in background for future improvements (non-blocking)
      console.log('Attempting reverse geocoding in background...');
      reverseGeocode(gps.latitude, gps.longitude)
        .then(locationName => {
          if (locationName) {
            console.log('✓ Background geocoding successful:', locationName);
            // Could be used to update coordinate lookup database in future
          } else {
            console.log('→ Background geocoding returned no name');
          }
        })
        .catch(geoError => {
          console.log('→ Background geocoding failed (non-blocking):', geoError.message);
        });
        
    } else {
      console.log('✗ No GPS data found in image');
    }

    // If no GPS data, try filename extraction
    if (!location) {
      console.log('Attempting filename-based location extraction...');
      location = getLocationFromFilename(file.name) || undefined;
      console.log('Location from filename:', location || 'None found');
    }

    // Extract capture date
    let capturedAt: Date | undefined;
    try {
      console.log('Extracting capture date from EXIF...');
      const exifData = await exifr.parse(file, ['DateTimeOriginal', 'DateTime', 'CreateDate']);
      console.log('EXIF date data:', exifData);
      
      if (exifData?.DateTimeOriginal) {
        capturedAt = new Date(exifData.DateTimeOriginal);
        console.log('✓ Using DateTimeOriginal:', capturedAt);
      } else if (exifData?.DateTime) {
        capturedAt = new Date(exifData.DateTime);
        console.log('✓ Using DateTime:', capturedAt);
      } else if (exifData?.CreateDate) {
        capturedAt = new Date(exifData.CreateDate);
        console.log('✓ Using CreateDate:', capturedAt);
      } else {
        console.log('✗ No EXIF date found');
      }
    } catch (dateError) {
      console.log('✗ Could not extract date from EXIF:', dateError);
    }
    
    if (!capturedAt) {
      capturedAt = file.lastModified ? new Date(file.lastModified) : new Date();
      console.log('→ Using file modification date as fallback:', capturedAt);
    }
    
    const result = {
      exifData: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        gps: gps || undefined
      },
      location,
      capturedAt
    };
    
    console.log('=== Final extraction result:', result);
    return result;
    
  } catch (error) {
    console.error('=== Critical error during EXIF extraction:', error);
    
    // Fallback to filename extraction and file date
    const fallbackResult = {
      exifData: {},
      location: getLocationFromFilename(file.name) || undefined,
      capturedAt: file.lastModified ? new Date(file.lastModified) : new Date()
    };
    
    console.log('=== Using fallback result:', fallbackResult);
    return fallbackResult;
  }
};

// Enhanced location extraction from filename patterns
export const getLocationFromFilename = (filename: string): string | null => {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  // Look for common location patterns in filename
  const locationPatterns = [
    /IMG[_-](\d+)[_-]([A-Za-z\s]+)/i,     // IMG_123_Paris, IMG-123-Paris
    /DSC[_-]([A-Za-z\s]+)[_-]/i,           // DSC_London_123, DSC-London-123
    /([A-Za-z\s]+)[_-]\d+/,                // Paris_123, Paris-123
    /([A-Za-z\s]+)[_-](\d{4})/,            // Paris_2024, Paris-2024
    /^([A-Za-z\s]{3,})$/,                   // Just location name like "Paris"
    /([A-Za-z\s]+)[_-](photo|pic|img)/i,    // Paris_photo, London_pic
    /^([A-Za-z\s]+)[_-]/,                   // Paris_, London-
    /[_-]([A-Za-z\s]+)$/,                   // _Paris, -London
  ];
  
  for (const pattern of locationPatterns) {
    const match = nameWithoutExt.match(pattern);
    if (match) {
      const location = match[1] || match[2];
      if (location && location.length > 2 && location.length < 30) {
        // Clean up the location name
        const cleaned = location
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase()) // Title case
          .trim();
        
        // Skip if it looks like a date, number, or common camera terms
        if (!/^\d+$/.test(cleaned) && 
            !/\b(photo|pic|img|image|dsc|camera)\b/i.test(cleaned) &&
            !/^\d{4}$/.test(cleaned)) {
          return cleaned;
        }
      }
    }
  }
  
  return null;
};

export const generateRandomRotation = (): number => {
  return (Math.random() - 0.5) * 8; // -4 to +4 degrees
};

export const createVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Seek to middle of video for better representative thumbnail
      video.currentTime = video.duration * 0.5;
    });
    
    video.addEventListener('seeked', () => {
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnail);
      } else {
        reject(new Error('Could not get canvas context'));
      }
      
      // Cleanup
      URL.revokeObjectURL(video.src);
    });
    
    video.addEventListener('error', () => {
      reject(new Error('Error loading video'));
    });
    
    video.src = URL.createObjectURL(file);
    video.load();
  });
};

export const getMediaDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    
    video.addEventListener('loadedmetadata', () => {
      resolve(video.duration);
      URL.revokeObjectURL(video.src);
    });
    
    video.addEventListener('error', () => {
      resolve(0);
    });
    
    video.src = URL.createObjectURL(file);
    video.load();
  });
};

export const isVideoFile = (file: File): boolean => {
  return file.type.startsWith('video/');
};