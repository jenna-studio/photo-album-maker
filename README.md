# 📸 Photo Album Maker

A beautiful, interactive web application for creating and viewing digital photo albums with your memories. Built with React, TypeScript, and modern web technologies.

![Photo Album Maker](https://img.shields.io/badge/React-18+-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue) ![Vite](https://img.shields.io/badge/Vite-7+-green)

## ✨ Features

### 🎨 **Beautiful Design**
- Modern, clean interface with vibrant pink, sky blue, and yellow color scheme
- Glass-morphism effects and smooth animations
- Responsive design that works on desktop, tablet, and mobile devices

### 📱 **Media Support**
- **Photos**: Upload and display JPEG, PNG, GIF images
- **Videos**: Support for MP4, WebM, and other video formats with automatic thumbnail generation
- **Aspect Ratios**: Maintains original aspect ratios for all media

### 🏷️ **Smart Organization**
- **Automatic Date Sorting**: Photos organized by capture date from EXIF data
- **Location Detection**: Automatic GPS location extraction from photo metadata
- **Favorites System**: Mark photos/videos as favorites with star system
- **Separate Video Section**: Dedicated pages for video content

### 📖 **Album Experience**
- **Book-Style Layout**: Beautiful page-turning interface like a real photo album
- **Polaroid Frames**: Each photo displayed in classic polaroid-style frames
- **Navigation**: Easy page flipping with prominent navigation arrows
- **Index Pages**: Date-based section dividers for easy browsing

### 🔧 **Advanced Features**
- **EXIF Data Processing**: Extracts capture date, location, and technical details
- **Export Options**: Save albums as PDF or high-quality JPEG collections
- **Photo Editing**: Add descriptions and edit location information
- **Masonry Layout**: Smart grid layout that adapts to different image sizes

## 🚀 Live Demo

Visit the live application: **[https://jenna-studio.github.io/photo-album-maker](https://jenna-studio.github.io/photo-album-maker)**

## 📱 How to Use

1. **Create Your Album**
   - Enter a custom album title
   - Upload your photos and videos (supports multiple file selection)

2. **View Your Album**
   - Click "Open Album" to view your memories
   - Navigate between pages using the arrow buttons or keyboard arrows
   - Click on any photo/video for detailed view

3. **Organize & Edit**
   - Star your favorite memories
   - Add descriptions and location information
   - Photos are automatically sorted by date

4. **Export & Share**
   - Export your album as a PDF
   - Save individual photos or collections as JPEG files

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/jenna-studio/photo-album-maker.git
cd photo-album-maker

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5174`

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run preview      # Preview production build

# Building
npm run build        # Build for production
npm run lint         # Run ESLint

# Deployment
npm run deploy       # Deploy to GitHub Pages
```

## 🏗️ Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server

### Styling
- **CSS3** - Modern CSS with Grid, Flexbox, and animations
- **Inter Font** - Clean, readable typography
- **Responsive Design** - Works on all device sizes

### Libraries
- **exifr** - EXIF metadata extraction from photos
- **html2canvas** - Screenshot generation for exports  
- **jsPDF** - PDF generation for album exports

### Features
- **File API** - Handle photo/video uploads
- **Canvas API** - Image processing and thumbnail generation
- **CSS Grid Masonry** - Dynamic photo layouts
- **Local Storage** - Client-side file handling

## 📁 Project Structure

```
photo-album-maker/
├── src/
│   ├── components/          # React components
│   │   ├── AlbumBook.tsx   # Main album viewing interface
│   │   ├── LandingPage.tsx # Upload and title screen
│   │   ├── PolaroidPhoto.tsx # Individual photo frames
│   │   └── ...
│   ├── utils/              # Utility functions
│   │   ├── albumUtils.ts   # Photo processing and organization
│   │   └── exportUtils.ts  # Export functionality
│   ├── types.ts           # TypeScript type definitions
│   ├── App.tsx            # Main app component
│   └── main.tsx           # App entry point
├── public/                # Static assets
└── dist/                  # Built files (auto-generated)
```

## 🔒 Privacy & Security

- **Client-Side Only**: All photo processing happens in your browser
- **No Data Collection**: Photos and videos never leave your device
- **No Account Required**: Use immediately without sign-up
- **Local Processing**: EXIF data extraction and thumbnails generated locally

## 🌟 Browser Support

- **Chrome 88+** (recommended)
- **Firefox 85+** 
- **Safari 14+**
- **Edge 88+**

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Issues & Support

Found a bug or have a feature request? Please [open an issue](https://github.com/jenna-studio/photo-album-maker/issues) on GitHub.

---

Made with ❤️ by [Jenna Studio](https://github.com/jenna-studio)

**Enjoy creating beautiful photo albums with your memories!** ✨