# 📸 Photo Album Maker

A beautiful, interactive web application for creating stunning digital photo albums with your favorite memories. Built with React, TypeScript, and modern web technologies - featuring a gorgeous blue and yellow design theme with professional export capabilities.

![Photo Album Maker](https://img.shields.io/badge/React-19+-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue) ![Vite](https://img.shields.io/badge/Vite-7+-green) ![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-success)

## ✨ Features

### 🎨 **Stunning Visual Design**
- **Blue & Yellow Color Scheme**: Beautiful sky blue and golden yellow theme throughout
- **Cute & Modern Interface**: Friendly, approachable design with smooth animations
- **Polaroid-Style Frames**: Classic white frames with subtle blue shadows
- **Notebook Paper Background**: Lined paper texture for authentic album feel
- **Responsive Design**: Perfect on desktop, tablet, and mobile devices

### 📷 **Complete Media Support**
- **Photos**: JPEG, PNG, GIF, HEIC, and other image formats
- **Videos**: MP4, WebM, MOV with automatic thumbnail generation
- **Smart Thumbnails**: High-quality previews generated for all videos
- **Aspect Ratio Preservation**: Maintains original proportions for all media

### 🧠 **Intelligent Organization**
- **Automatic Date Sorting**: Photos organized chronologically using EXIF capture dates
- **Location Detection**: GPS coordinates extracted from photo metadata
- **Favorites System**: Star your best photos for easy access
- **Smart Sections**: 
  - Date-based photo pages with index dividers
  - Dedicated video section 
  - Special favorites collection at the end

### 📖 **Authentic Album Experience**
- **Book-Style Layout**: Realistic page-turning interface with book spine
- **2x2 Photo Grid**: 4 photos per page, perfectly arranged like a real album
- **Landscape Spreads**: Wide format for optimal photo presentation
- **Navigation Controls**: Intuitive page flipping with keyboard and touch support
- **Index Pages**: Beautiful section headers for dates and categories

### 🎯 **Professional Export Options**
- **PDF Export**: Multi-page landscape book with all favorites
- **JPEG Export**: ZIP file containing individual page spreads  
- **HTML Export**: Interactive offline album with photo popup details
- **Clean Design**: No text on photo frames - pure visual focus
- **Print-Ready**: Professional quality suitable for physical printing

### 🔧 **Advanced Capabilities**
- **EXIF Data Processing**: Comprehensive metadata extraction
- **Photo Editing**: Add descriptions and customize information
- **Location Services**: Fallback city lookup from GPS coordinates
- **Success Notifications**: User-friendly alerts for all actions
- **Dynamic Layouts**: Responsive grids that adapt to content

## 🚀 Live Demo

**[Try Photo Album Maker Now →](https://jenna-studio.github.io/photo-album-maker)**

Experience the full application in your browser - no downloads or accounts required!

## 📱 Quick Start Guide

### 1️⃣ **Create Your Album**
- Enter a custom album title (or leave blank for personalization)
- Upload photos and videos using the "Add Photos & Videos to Begin" button
- Supports drag-and-drop and multiple file selection

### 2️⃣ **Explore Your Album**  
- Click "Open Album" to view your organized memories
- Navigate with arrow buttons, keyboard arrows, or swipe on mobile
- Click any photo for detailed view with metadata and descriptions

### 3️⃣ **Organize & Personalize**
- Star your favorite photos using the ⭐ button
- Add custom descriptions to photos in the detail modal
- Photos automatically sort by capture date for chronological viewing

### 4️⃣ **Export & Share**
- **Export PDF**: Single file with all favorites in landscape book format
- **Export JPEG**: ZIP file with individual page spreads for printing
- **Export HTML**: Offline interactive album with all features intact

## 🛠️ Development Setup

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**

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

Open [http://localhost:5174](http://localhost:5174) to view the app in development mode.

### Available Scripts

```bash
# Development Commands
npm run dev          # Start development server with hot reload
npm run preview      # Preview production build locally

# Build Commands  
npm run build        # Create optimized production build
npm run lint         # Run ESLint for code quality

# Deployment Commands
npm run deploy       # Deploy to GitHub Pages
```

## 🏗️ Technology Stack

### **Core Framework**
- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety and enhanced developer experience  
- **Vite 7** - Lightning-fast build tool and development server

### **Styling & Design**
- **Modern CSS3** - Advanced Grid, Flexbox, and animations
- **Inter & Courier New Fonts** - Perfect typography pairing
- **Responsive Design** - Mobile-first approach with perfect scaling
- **CSS Custom Properties** - Dynamic theming capabilities

### **Key Libraries**
- **exifr** `^7.1.3` - Advanced EXIF metadata extraction
- **html2canvas** `^1.4.1` - High-quality screenshot generation
- **jsPDF** `^3.0.2` - Professional PDF document creation
- **JSZip** `^3.10.1` - ZIP file generation for multi-file exports

### **Browser APIs**
- **File API** - Secure client-side file handling
- **Canvas API** - Image processing and thumbnail generation
- **Web Storage API** - Client-side state management
- **Intersection Observer** - Performance-optimized scrolling

## 📁 Project Architecture

```
photo-album-maker/
├── src/
│   ├── components/              # React Components
│   │   ├── AlbumBook.tsx       # Main album interface with book layout
│   │   ├── LandingPage.tsx     # Landing page with upload functionality
│   │   ├── PolaroidPhoto.tsx   # Individual photo frame component
│   │   ├── PhotoModal.tsx      # Photo detail popup with editing
│   │   ├── FavoritesPage.tsx   # Favorites section with export buttons
│   │   └── ...
│   ├── utils/                   # Utility Functions
│   │   ├── albumUtils.ts       # Photo organization and processing
│   │   ├── exportUtils.ts      # PDF/JPEG export functionality  
│   │   └── htmlExportUtils.ts  # HTML export with embedded media
│   ├── types.ts                # TypeScript type definitions
│   ├── App.tsx                 # Main application component
│   ├── App.css                 # Global styles and theme
│   └── main.tsx                # Application entry point
├── public/                      # Static Assets
│   ├── favicon.svg             # Application icon
│   └── ...
├── dist/                       # Production Build (auto-generated)
└── README.md                   # This file
```

## 🔒 Privacy & Security

### **Complete Privacy Protection**
- **100% Client-Side**: All processing happens in your browser
- **No Data Transmission**: Photos and videos never leave your device
- **No Tracking**: Zero analytics, cookies, or user data collection
- **No Account Required**: Use immediately without any registration
- **Secure Processing**: EXIF extraction and thumbnails generated locally

### **Data Handling**
- **Temporary Storage**: Files processed in browser memory only
- **No Cloud Storage**: Nothing saved to external servers
- **Export Control**: You control what gets exported and where

## 🌍 Browser Compatibility

### **Fully Supported**
- **Chrome 88+** ⭐ (Recommended - best performance)
- **Firefox 85+** ✅ (Full feature support)
- **Safari 14+** ✅ (iOS and macOS compatible)
- **Edge 88+** ✅ (Windows optimized)

### **Key Requirements**
- **JavaScript ES2020+**
- **CSS Grid & Flexbox**
- **File API & Canvas API**
- **Modern image format support**

## 🎨 Design Philosophy

### **User Experience First**
- **Intuitive Interface**: No learning curve required
- **Visual Clarity**: Clean, uncluttered design focusing on photos
- **Performance**: Fast loading and smooth interactions
- **Accessibility**: Keyboard navigation and screen reader friendly

### **Authentic Feel**
- **Real Album Experience**: Mimics physical photo albums
- **Tactile Interactions**: Realistic page turning and photo handling
- **Nostalgic Elements**: Polaroid frames and notebook paper backgrounds
- **Modern Polish**: Contemporary design with classic charm

## 📊 Export Specifications

### **PDF Export**
- **Format**: Landscape orientation (1600×600px spreads)
- **Layout**: 4 photos per page in 2×2 grid
- **Quality**: High-resolution JPEG compression (90% quality)
- **Features**: Multi-page document with all favorites

### **JPEG Export** 
- **Format**: Individual page spreads in ZIP file
- **Naming**: Sequential (spread-01.jpg, spread-02.jpg, etc.)
- **Quality**: 90% JPEG compression for optimal file size
- **Use Case**: Perfect for printing or sharing individual pages

### **HTML Export**
- **Format**: Standalone HTML file with embedded media
- **Features**: Interactive photo modals with full metadata
- **Compatibility**: Works offline in any modern browser
- **Size**: Optimized with base64 encoding for portability

## 📄 License

This project is open source and available under the **MIT License**. 

### What this means:
- ✅ **Commercial Use**: Use in commercial projects
- ✅ **Modification**: Modify and customize as needed  
- ✅ **Distribution**: Share and redistribute freely
- ✅ **Private Use**: Use for personal projects
- ℹ️ **Attribution**: Please keep the license notice

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **Ways to Contribute**
- 🐛 **Bug Reports**: Found an issue? Let us know!
- ✨ **Feature Requests**: Have an idea? We'd love to hear it!
- 💻 **Code Contributions**: Submit pull requests
- 📖 **Documentation**: Help improve our guides
- 🎨 **Design**: Suggest UI/UX improvements

### **Getting Started**
1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 🐛 Support & Issues

### **Need Help?**
- 📋 **Bug Reports**: [Open an Issue](https://github.com/jenna-studio/photo-album-maker/issues)
- 💡 **Feature Requests**: [Start a Discussion](https://github.com/jenna-studio/photo-album-maker/issues)
- ❓ **Questions**: Check existing issues or create a new one

### **Before Reporting Issues**
- Check if the issue already exists
- Include browser version and steps to reproduce
- Attach screenshots if helpful
- Describe expected vs actual behavior

## 🌟 Acknowledgments

### **Built With Love Using**
- **React Team** - For the amazing React framework
- **TypeScript Team** - For excellent type safety
- **Vite Team** - For blazing fast development experience
- **Open Source Community** - For all the incredible libraries

### **Special Thanks**
- **Contributors** - Everyone who has helped improve this project
- **Beta Testers** - Users who provided valuable feedback
- **Photography Community** - For inspiring beautiful album layouts

---

## 💖 Show Your Support

If you find Photo Album Maker useful, please consider:

- ⭐ **Star the repository** on GitHub
- 🐦 **Share** with friends and family  
- 🔗 **Link** from your own projects
- 💝 **Contribute** to make it even better

---

**Made with ❤️ by [Jenna Studio](https://github.com/jenna-studio)**

**Create beautiful photo albums and preserve your memories forever!** ✨📸