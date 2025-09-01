import React, { useState, useEffect, useRef } from 'react';
import type { Photo } from '../types';

interface PolaroidPhotoProps {
  photo: Photo;
  onClick: () => void;
  onUpdate: (updates: Partial<Photo>) => void;
  size?: 'small' | 'medium' | 'large';
  isVideoSquare?: boolean;
}

const PolaroidPhoto: React.FC<PolaroidPhotoProps> = ({
  photo,
  onClick,
  onUpdate,
  size = 'medium',
  isVideoSquare = false
}) => {
  const [dimensions, setDimensions] = useState({ width: 250, height: 250 });
  const [gridRowSpan, setGridRowSpan] = useState(25); // Default span for masonry
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const MAX_WIDTH = 250;

  useEffect(() => {
    if (photo.type === 'video') {
      const video = document.createElement('video');
      video.src = photo.url;
      video.onloadedmetadata = () => {
        const aspectRatio = video.videoWidth / video.videoHeight;
        calculateDimensions(aspectRatio);
      };
    } else if (imgRef.current && imgRef.current.complete) {
      handleImageLoad();
    }
  }, [photo.url, photo.type]);

  const calculateDimensions = (aspectRatio: number) => {
    let width = MAX_WIDTH;
    let height = width / aspectRatio;
    
    // Handle extreme aspect ratios
    if (height > MAX_WIDTH * 1.5) {
      // Very tall images/videos
      height = MAX_WIDTH * 1.5;
      width = height * aspectRatio;
    } else if (height < MAX_WIDTH * 0.6) {
      // Very wide images/videos  
      height = MAX_WIDTH * 0.6;
      width = height * aspectRatio;
    }
    
    // Calculate grid row span for masonry layout (10px per row + gap)
    const totalHeight = height + 45; // Include polaroid frame padding
    const rowSpan = Math.ceil(totalHeight / 10);
    
    setDimensions({ width, height });
    setGridRowSpan(rowSpan);
  };

  const handleImageLoad = () => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      if (naturalHeight > 0) {
        const aspectRatio = naturalWidth / naturalHeight;
        calculateDimensions(aspectRatio);
      }
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  const randomRotation = () => {
    return photo.rotation || (Math.random() - 0.5) * 6; // -3 to +3 degrees
  };

  return (
    <div 
      ref={containerRef}
      className={`polaroid-photo ${size}`}
      style={{
        transform: `rotate(${randomRotation()}deg)`,
        zIndex: 1,
        gridRowEnd: `span ${gridRowSpan}`,
        width: 'fit-content'
      }}
    >
      <div className="polaroid-frame">
        <div 
          className="photo-container"
          onClick={onClick}
          style={{ 
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            position: 'relative'
          }}
        >
          {photo.type === 'video' ? (
            <div className="video-container">
              {photo.thumbnail ? (
                <img 
                  src={photo.thumbnail}
                  alt={photo.name}
                  className="photo-image"
                  loading="lazy"
                  style={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <video 
                  src={photo.url}
                  className="photo-image"
                  muted
                  preload="metadata"
                  style={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              )}
              <div className="video-overlay">
                <div className="play-button">▶</div>
                {photo.duration && (
                  <div className="video-duration">
                    {formatDuration(photo.duration)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <img 
              ref={imgRef}
              src={photo.url} 
              alt={photo.name}
              className="photo-image"
              loading="lazy"
              onLoad={handleImageLoad}
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          )}
          <div className="photo-overlay">
            <button 
              className="star-button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdate({ isFavorite: !photo.isFavorite });
              }}
            >
              {photo.isFavorite ? '⭐' : '☆'}
            </button>
          </div>
        </div>

      </div>

      <div className="polaroid-shadow"></div>
    </div>
  );
};

export default PolaroidPhoto;