import React, { useCallback } from 'react';
import type { Photo } from '../types';

interface PhotoUploadProps {
  onPhotosUploaded: (photos: Photo[]) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotosUploaded }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const photoPromises = Array.from(files).map((file) => {
      return new Promise<Photo>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const photo: Photo = {
            id: `${Date.now()}-${Math.random()}`,
            file,
            url: reader.result as string,
            type: 'photo',
            name: file.name,
            size: file.size,
            uploadedAt: new Date(),
          };
          resolve(photo);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(photoPromises).then(onPhotosUploaded);
  }, [onPhotosUploaded]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    
    const photoPromises = Array.from(files).map((file) => {
      return new Promise<Photo>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const photo: Photo = {
            id: `${Date.now()}-${Math.random()}`,
            file,
            url: reader.result as string,
            type: 'photo',
            name: file.name,
            size: file.size,
            uploadedAt: new Date(),
          };
          resolve(photo);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(photoPromises).then(onPhotosUploaded);
  }, [onPhotosUploaded]);

  return (
    <div className="photo-upload">
      <div
        className="upload-zone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
          id="photo-input"
        />
        <label htmlFor="photo-input" className="upload-label">
          <div className="upload-content">
            <div className="upload-icon">📸</div>
            <h3>Upload Photos</h3>
            <p>Drag and drop photos here or click to select</p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PhotoUpload;