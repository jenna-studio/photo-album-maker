import React, { useState, useEffect } from 'react';
import type { Photo } from '../types';

interface PhotoModalProps {
  photo: Photo;
  onClose: () => void;
  onUpdate: (updates: Partial<Photo>) => void;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ photo, onClose, onUpdate }) => {
  const [description, setDescription] = useState(photo.description || '');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleSave = () => {
    onUpdate({ description });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="photo-modal-overlay" onClick={onClose}>
      <div className="photo-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-content">
          <div className="modal-image-container">
            {photo.type === 'video' ? (
              <video 
                src={photo.url} 
                controls 
                className="modal-image"
                autoPlay={false}
              />
            ) : (
              <img src={photo.url} alt={photo.name} className="modal-image" />
            )}
          </div>
          
          <div className="modal-sidebar">
            <div className="photo-details">
              
              {photo.type === 'photo' && (
                <div className="detail-group">
                  <label>Location</label>
                  <div className="detail-display">
                    {photo.location || 'No location data available'}
                  </div>
                </div>
              )}
              
              <div className="detail-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add description..."
                  className="detail-textarea"
                  maxLength={500}
                  rows={4}
                />
                <div className="character-count">
                  {description.length}/500
                </div>
              </div>
              
              <div className="metadata">
                <div className="metadata-item">
                  <span className="label">Type:</span>
                  <span className="value">{photo.type === 'video' ? 'Video' : 'Photo'}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Uploaded:</span>
                  <span className="value">{formatDate(photo.uploadedAt)}</span>
                </div>
                {photo.capturedAt && (
                  <div className="metadata-item">
                    <span className="label">Captured:</span>
                    <span className="value">{formatDate(photo.capturedAt)}</span>
                  </div>
                )}
                <div className="metadata-item">
                  <span className="label">Size:</span>
                  <span className="value">{formatFileSize(photo.size)}</span>
                </div>
                {photo.duration && (
                  <div className="metadata-item">
                    <span className="label">Duration:</span>
                    <span className="value">{formatDuration(photo.duration)}</span>
                  </div>
                )}
                {photo.exifData?.camera && (
                  <div className="metadata-item">
                    <span className="label">Camera:</span>
                    <span className="value">{photo.exifData.camera}</span>
                  </div>
                )}
                {photo.exifData?.settings && (
                  <div className="metadata-item">
                    <span className="label">Settings:</span>
                    <span className="value">{photo.exifData.settings}</span>
                  </div>
                )}
              </div>
              
              <button className="save-changes-button" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;