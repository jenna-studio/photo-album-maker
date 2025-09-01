import { useState, useCallback, useEffect } from "react";
import "./App.css";
import LandingPage from "./components/LandingPage";
import AlbumBook from "./components/AlbumBook";
import type { Photo, Album, AlbumPage } from "./types";
import {
    createAlbumsFromPhotos,
    createAlbumPages,
    generateRandomRotation,
    extractEXIFData,
    getLocationFromFilename,
    createVideoThumbnail,
    getMediaDuration,
    isVideoFile,
} from "./utils/albumUtils";

function App() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [album, setAlbum] = useState<Album>({
        id: "main-album",
        name: "",
        photos: [],
        createdAt: new Date(),
        isOpen: false,
    });
    const [albumPages, setAlbumPages] = useState<AlbumPage[]>([]);

    useEffect(() => {
        console.log("=== Album update effect triggered ===");
        console.log("Current photos state:", photos);
        console.log("Photos count:", photos.length);

        const updatedAlbums = createAlbumsFromPhotos(photos);
        console.log("Updated albums:", updatedAlbums);

        if (updatedAlbums.length > 0) {
            setAlbum((prev) => {
                const newAlbum = { ...updatedAlbums[0], isOpen: prev.isOpen };
                console.log("Setting new album:", newAlbum);
                console.log("Album photos count:", newAlbum.photos.length);
                return newAlbum;
            });
            const pages = createAlbumPages(photos);
            console.log("Created album pages:", pages);
            setAlbumPages(pages);
        }
    }, [photos]);

    useEffect(() => {
        const handleResize = () => {
            // Recreate pages when window is resized to adjust for new grid layout
            if (photos.length > 0) {
                setAlbumPages(createAlbumPages(photos));
            }
        };

        window.addEventListener("album-resize", handleResize);
        return () => window.removeEventListener("album-resize", handleResize);
    }, [photos]);

    const handlePhotosUploaded = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("=== Photo upload started ===");
        console.log("File input triggered");
        const files = event.target.files;
        console.log("Files selected:", files);
        if (!files) return;

        console.log("Number of files:", files.length);

        const mediaPromises = Array.from(files).map((file) => {
            const isVideo = isVideoFile(file);

            return new Promise<Photo>((resolve) => {
                const processFile = async () => {
                    try {
                        let mediaUrl = "";
                        let thumbnail = "";
                        let duration = 0;

                        if (isVideo) {
                            // For videos, create object URL and thumbnail
                            mediaUrl = URL.createObjectURL(file);
                            thumbnail = await createVideoThumbnail(file);
                            duration = await getMediaDuration(file);
                        } else {
                            // For images, use FileReader
                            const reader = new FileReader();
                            await new Promise<void>((readResolve) => {
                                reader.onload = () => {
                                    mediaUrl = reader.result as string;
                                    readResolve();
                                };
                                reader.readAsDataURL(file);
                            });
                        }

                        // Extract EXIF data (only for images)
                        let exifData: Record<string, unknown> = {};
                        let locationName = "";
                        let actualCapturedAt = new Date(); // Default fallback

                        if (!isVideo) {
                            console.log("Processing image file for EXIF data...");
                            const exifResult = await extractEXIFData(file);
                            console.log("EXIF result received:", exifResult);
                            exifData = exifResult.exifData;

                            // Use EXIF location if available, otherwise try filename
                            locationName =
                                exifResult.location || getLocationFromFilename(file.name) || "";
                            console.log("Final location name assigned:", locationName);

                            // Use EXIF capture date if available
                            if (exifResult.capturedAt) {
                                actualCapturedAt = exifResult.capturedAt;
                                console.log("Using EXIF capture date:", actualCapturedAt);
                            }
                        }

                        const mediaItem: Photo = {
                            id: `${Date.now()}-${Math.random()}`,
                            file,
                            url: mediaUrl,
                            type: isVideo ? "video" : "photo",
                            name: file.name,
                            size: file.size,
                            uploadedAt: new Date(),
                            capturedAt: actualCapturedAt,
                            rotation: isVideo ? 0 : generateRandomRotation(),
                            exifData: !isVideo ? exifData : undefined,
                            location: locationName || undefined,
                            duration: isVideo ? duration : undefined,
                            thumbnail: isVideo ? thumbnail : undefined,
                        };

                        console.log("Created mediaItem:", mediaItem);
                        console.log("MediaItem location field:", mediaItem.location);
                        resolve(mediaItem);
                    } catch (error) {
                        console.error("Error processing media file:", error);
                        // Create a basic media item even if processing fails
                        const basicItem: Photo = {
                            id: `${Date.now()}-${Math.random()}`,
                            file,
                            url: URL.createObjectURL(file),
                            type: isVideo ? "video" : "photo",
                            name: file.name,
                            size: file.size,
                            uploadedAt: new Date(),
                            capturedAt: new Date(),
                            rotation: 0,
                        };
                        resolve(basicItem);
                    }
                };

                processFile();
            });
        });

        Promise.all(mediaPromises)
            .then((newMedia) => {
                console.log("=== Processing completed ===");
                console.log("Number of processed items:", newMedia.length);
                setPhotos((prev) => {
                    const updated = [...prev, ...newMedia];
                    console.log("Total photos count:", updated.length);
                    return updated;
                });
            })
            .catch((error) => {
                console.error("=== Error in Promise.all ===");
                console.error("Error processing media files:", error);
            });
    }, []);

    const handleAlbumNameChange = useCallback((name: string) => {
        setAlbum((prev) => ({ ...prev, name }));
    }, []);

    const handleOpenAlbum = useCallback(() => {
        setAlbum((prev) => ({ ...prev, isOpen: true }));
    }, []);

    const handleBackToLanding = useCallback(() => {
        setAlbum((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const handlePhotoUpdate = useCallback((photoId: string, updates: Partial<Photo>) => {
        setPhotos((prev) =>
            prev.map((photo) => (photo.id === photoId ? { ...photo, ...updates } : photo))
        );
    }, []);

    console.log("=== Render decision ===");
    console.log("album.isOpen:", album.isOpen);
    console.log("photos.length:", photos.length);
    console.log("album.photos.length:", album.photos.length);

    if (album.isOpen && photos.length > 0) {
        console.log("Rendering AlbumBook");
        return (
            <AlbumBook
                album={album}
                pages={albumPages}
                onBackToLanding={handleBackToLanding}
                onPhotoUpdate={handlePhotoUpdate}
            />
        );
    }

    console.log("Rendering LandingPage");

    return (
        <LandingPage
            album={album}
            onAlbumNameChange={handleAlbumNameChange}
            onOpenAlbum={handleOpenAlbum}
            onPhotosUploaded={handlePhotosUploaded}
        />
    );
}

export default App;
