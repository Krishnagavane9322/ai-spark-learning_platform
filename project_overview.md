# NeuralPath: Comprehensive Project Overview

Welcome to the **NeuralPath** overview document. This file provides a simple, clean, and step-by-step breakdown of everything that makes this AI-powered learning platform tick—from its core features and cutting-edge tech stack to the intelligent algorithms powering the user experience.

---

## 🌟 1. Core Features

**NeuralPath** is designed to transform the way users learn by making education highly personalized, engaging, and interactive.

1. **AI-Powered Personalized Learning Paths**
   - **How it works:** When users sign up, they take an initial assessment quiz. Based on their selected interests (e.g., Web Dev, Data Science) and current skill level, the platform dynamically generates a customized step-by-step roadmap specifically for them.
2. **"Smart Notes" with Automated Study Tools**
   - **How it works:** Users can upload PDF documents or images of their notes. The platform automatically reads the text and generates interactive study tools like Flashcards and Mindmaps to accelerate learning.
3. **Gamification & Progression System**
   - **How it works:** To combat learner fatigue, the platform rewards actions with Experience Points (XP). Completing steps, passing assessments, and enrolling in courses grant XP, unlocking achievements and maintaining daily streaks.
4. **Interactive Course Catalog & Secure Payments**
   - **How it works:** Users can browse free and premium courses. Paid enrollments are handled seamlessly via Razorpay directly in the app, instantly granting access and bonus XP upon success.
5. **Real-time Social "Peers" Hub**
   - **How it works:** Users can connect with other learners based on matched interests, encouraging collaborative project building and networking.

---

## 🚀 2. Modern Technology Stack

The project utilizes a fast, modern **MERN** stack (MongoDB, Express, React, Node.js) paired with next-generation build tools and libraries to ensure a premium, glassmorphism UI.

### Frontend (Client-Side)
- **Vite & React 18:** Ultra-fast build tool and modern component-based UI rendering.
- **Tailwind CSS & Framer Motion:** Tailwind handles rapid, responsive styling using utility classes, while Framer Motion powers the incredibly smooth, dynamic micro-animations and page transitions.
- **Radix UI & Shadcn/ui:** Provides highly accessible, unstyled UI primitives (like dropdowns, modals, and accordions) that are custom-styled to fit the dark-mode aesthetic.
- **Recharts:** Used for painting beautiful, interactive charts on the User Dashboard (like weekly activity).
- **React Query (TanStack):** Handles sophisticated asynchronous state management and server data caching.

### Backend (Server-Side)
- **Node.js & Express:** Lightweight, scalable runtime and routing framework for the RESTful APIs.
- **MongoDB & Mongoose:** NoSQL database handling flexible document schemas for Users, Courses, Notes, and Notifications.
- **Razorpay Integration:** Secure, seamless third-party payment gateway for course monetization.
- **Google Auth Library:** Provides OAuth 2.0 capabilities for rapid single sign-on (SSO).
- **Multer:** Handles multipart/form-data for robust file parsing during note uploads.

### Disruptive "New" Technologies Included
- **Tesseract.js:** A port of Google's Optical Character Recognition (OCR) engine used to read text directly out of image formats right on the server.
- **PDF-Parse:** Extracts raw text buffers from uploaded PDF files, feeding the generative study algorithms.

---

## 🧠 3. Built-in Intelligent Algorithms

Behind the scenes, NeuralPath relies on lightweight heuristic models and processing algorithms to deliver its "AI" features natively, reducing external API costs.

### A. The Path Generation Algorithm (Adaptive Learning)
- **Step 1:** Ingests user `interests` and `skillLevel` from the onboarding quiz.
- **Step 2:** Iterates over a core `pathDatabase` matrix.
- **Step 3:** Applies adaptive trimming—if the user is "Intermediate", the algorithm skips foundational steps; if "Advanced", it skips straight to complex paradigms. 
- **Step 4:** Sequences the modules and assigns dynamic IDs to generate an interactive roadmap tracking node-by-node completion.

### B. Flashcard Generation Algorithm (Heuristic Text Parsing)
- **Step 1:** Cleans OCR/PDF text by normalizing whitespaces and structure.
- **Step 2:** Splits the text into logical candidate sentences using delimiters (periods, bullets).
- **Step 3:** Applies **Heuristic Q&A Logic** by looking for trigger words like `" is "`, `" are "`, or `":"`. 
  - *(e.g., "Photosynthesis is the process..." safely splits into `Question: What is Photosynthesis?` and `Answer: the process...`)*
- **Step 4:** Caps results at 10 items and enforces character limits (max 200 chars) to ensure cards remain readable and focused.

### C. Mindmap Keyword Extraction Algorithm (TF-IDF Light)
- **Step 1:** Tokenizes the document by finding all strings over 4 characters long.
- **Step 2:** Counts the "Term Frequency" (TF) of each word across the entire document.
- **Step 3:** Runs the results against a strict "Stop Word Filter" array, instantly discarding low-value conjunctions (e.g., "that", "which", "would").
- **Step 4:** Sorts the remaining conceptual keywords by frequency length. The #1 most used word becomes the `center` (Main Idea), and the next 8 highly-ranked words form the conceptual `branches`.

### D. Cryptographic & Security Algorithms
- **Bcrypt (Blowfish Cipher):** Utilizes randomized salts and key stretching to irreversibly hash user passwords, protecting the database against brute-force and dictionary attacks.
- **JWT (HMAC SHA256):** Generates and signs secure, stateless session tokens confirming user identity across distributed frontend requests.
