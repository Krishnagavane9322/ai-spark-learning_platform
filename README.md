# NeuralPath - AI-Powered Learning Platform

## About

NeuralPath is an AI-powered learning platform that helps you master new skills through personalized learning paths. It makes education highly personalized, engaging, and interactive by generating customized roadmaps, offering smart notes with study tools, gamification, courses, and a real-time social peers hub.

## Core Features

1. **AI-Powered Personalized Learning Paths:** Dynamically generates a customized step-by-step roadmap based on an initial assessment.
2. **"Smart Notes" with Automated Study Tools:** Automatically reads uploaded notes and generates interactive study tools like Flashcards and Mindmaps.
3. **Gamification & Progression System:** Rewards actions with Experience Points (XP) to maintain daily streaks and unlock achievements.
4. **Interactive Course Catalog & Secure Payments:** Offers free and premium courses with secure Razorpay integration.
5. **Real-time Social "Peers" Hub:** Connects learners with similar interests for collaborative learning.

## Tech Stack

### Frontend
- Vite & React 18
- TypeScript
- Tailwind CSS & Framer Motion
- Radix UI & shadcn/ui
- Recharts & React Query (TanStack)

### Backend
- Node.js & Express
- MongoDB & Mongoose
- Razorpay Integration
- Google Auth Library
- Multer, Tesseract.js (OCR), PDF-Parse

## Algorithms Used

1. **Path Generation Algorithm (Adaptive Learning):** Dynamically customizes a learning roadmap based on user interests and skill level, skipping foundational steps for advanced users.
2. **Flashcard Generation Algorithm (Heuristic Text Parsing):** Cleans uploaded text and uses heuristic Q&A logic (trigger words like "is", "are") to automatically split sentences into Question/Answer flashcards.
3. **Mindmap Generation Algorithm (TF-IDF Light):** Extracts keywords from documents, filters out common stop words, and ranks terms by frequency to construct a visual mindmap tree.
4. **Optical Character Recognition (OCR) & Parsing Algorithms:** Integrates `pdf-parse` and `tesseract.js` to convert uploaded PDFs and images into raw machine-actionable text.
5. **Gamification Scoring Algorithm:** A condition-based weighted matrix that dynamically increments a user's XP score based on their activities (e.g., uploads, enrollments).
6. **Cryptographic & Security Algorithms:** Uses Bcrypt with randomized salts for irreversible password hashing, and JWT (HMAC SHA256) for secure session tokens.

## Getting Started

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Setup

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start the development server
npm run dev
```

## Deployment

You can deploy this project to any static hosting provider like Vercel, Netlify, or Render.

```sh
# Build for production
npm run build
```
