# Lensvik - Premium Eyewear E-Commerce Platform

A state-of-the-art Next.js e-commerce platform for premium eyewear with AI-powered virtual try-on and facial measurement features.

## 🌟 Features

### Core Features
- **Virtual Try-On (VTO)** - Real-time AR glasses overlay with MediaPipe face tracking
- **AI Size Finder** - Facial measurement analysis for perfect frame fit
- **Product Catalog** - Browse prescription glasses, sunglasses, and blue light filters
- **Shopping Cart** - Full cart management with persistent storage
- **Responsive Design** - Mobile-first, fully responsive UI

### Advanced Features
- **State-of-the-Art VTO**:
  - Kalman filtering for ultra-smooth tracking
  - Exponential moving average smoothing
  - Double buffering (zero blinking/flickering)
  - 10-frame pose persistence
  - 60 FPS optimization
  - Realistic soft shadows

- **AI Size Finder**:
  - Multi-reference calibration (eye fissure + nose width)
  - Dual-method IPD calculation
  - Median Absolute Deviation outlier rejection
  - Anthropometric validation
  - Confidence scoring
  - ±2mm IPD accuracy

## 🚀 Tech Stack

- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, Shadcn/ui
- **Animations**: Framer Motion
- **Database**: MongoDB with Mongoose
- **AI/ML**: 
  - MediaPipe Face Landmarker (VTO)
  - Face-API.js (Size Finder)
- **State Management**: React Context API
- **Deployment**: Vercel

## 📦 Installation

\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd lensvik

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your MongoDB URI

# Seed the database
npm run seed

# Run development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user and whitelist IP
4. Get connection string
5. Add to `.env.local`:
   \`\`\`
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lensvik
   \`\`\`

### Seed Products
\`\`\`bash
npm run seed
\`\`\`

This populates MongoDB with 5 premium eyewear products.

## 🌐 Deployment

### Deploy to Vercel

1. **Push to GitHub** (see instructions below)

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variable:
     - Name: `MONGODB_URI`
     - Value: Your MongoDB connection string
   - Deploy!

3. **Verify**:
   - Visit your deployed URL
   - Check `/api/products` returns MongoDB data

## 📁 Project Structure

\`\`\`
lensvik/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   └── products/      # Product endpoints
│   │   ├── products/[id]/     # Product detail pages
│   │   ├── collections/       # Shop page
│   │   └── category/[slug]/   # Category pages
│   ├── components/            # React components
│   │   ├── vto/              # Virtual Try-On
│   │   ├── size-finder/      # AI Size Finder
│   │   ├── products/         # Product components
│   │   └── ui/               # UI components
│   ├── context/              # React Context
│   ├── lib/                  # Utilities
│   ├── models/               # MongoDB models
│   └── data/                 # Mock data
├── scripts/                  # Utility scripts
│   └── seed.mjs             # Database seeding
└── public/                   # Static assets
    └── images/              # Product images
\`\`\`

## 🎨 Key Components

### Virtual Try-On (`src/components/vto/VirtualTryOn.tsx`)
- Real-time face tracking with MediaPipe
- 5-layer stabilization system
- Double buffering for smooth rendering
- Supports any glasses image

### AI Size Finder (`src/components/size-finder/SizeFinder.tsx`)
- 90-frame sampling with outlier rejection
- Kalman filtering + temporal smoothing
- Anthropometric validation
- Recommends frame size (Small/Medium/Large)

## 🔧 Available Scripts

\`\`\`bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npm run seed     # Seed database with products
\`\`\`

## 🌍 Environment Variables

\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lensvik
\`\`\`

## 📱 Features Breakdown

### Product Catalog
- 5 premium eyewear products
- Categories: Prescription, Sunglasses, Blue Light
- Frame types: Rectangle, Round
- Detailed measurements and descriptions

### Shopping Experience
- Product grid with filters
- Detailed product pages
- Virtual try-on integration
- AI-powered size recommendations
- Shopping cart with persistence

### Performance
- 60 FPS virtual try-on
- Optimized image loading
- Server-side rendering
- API route caching

## 🎯 Browser Support

- Chrome/Edge (recommended for VTO)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

Private - All Rights Reserved

## 🤝 Contributing

This is a private project. For questions or issues, contact the repository owner.

## 📞 Support

For technical support or questions, please open an issue in the repository.
