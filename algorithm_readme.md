# Algorithms Used in NeuralPath

This document outlines the key algorithmic logic, data processing heuristics, and security algorithms implemented throughout the NeuralPath project.

## 1. Path Generation Algorithm (Adaptive Learning)
**Location:** Assessment Module / System Design (`System_Design_Report.md`)  
**Purpose:** Generates a customized learning roadmap based on the user's initial onboarding assessment.
**How it works:**
- **Input:** Takes user `interests` (array) and `skillLevel` (string) as parameters.
- **Lookup:** Iterates through a predefined `pathDatabase` matching the selected interests.
- **Adaptive Trimming (Skill Level Adjustment):** Dynamically alters the array length based on skill. Foundational basics are trimmed for "intermediate" users, and both basics and mid-tier topics are skipped for "advanced" users.
- **Sequencing & State:** Iterates over the tailored steps to assign unique step IDs. The very first step defaults to `current`, while subsequent steps default to `locked`.
- **Skill Profiling Initialization:** Computes and assigns quantitative initial baseline skill metrics incorporating randomized sub-variances for a unique starting profile.

## 2. Flashcard Generation Algorithm (Heuristic Text Parsing)
**Location:** Notes Module (`server/routes/notes.js`)  
**Purpose:** Automatically generates study flashcards (Questions/Answers) from uploaded text.
**How it works:**
- **Text Cleansing:** Normalizes text, stripping excessive whitespace and irregular line breaks.
- **Chunking:** Splits the sanitized text safely into candidate sentences by identifying common delimiters such as periods, newlines, and bullet points.
- **Heuristic Q&A Logic:** Uses linguistic trigger markers (" is ", " are ", ":") to deterministically split sentences into the "Front" (Question) and "Back" (Answer) of the card.
  - *Example:* "Photosynthesis is the process..." is transformed dynamically into `Front: What is Photosynthesis?` and `Back: the process...`.
- **Constraints Management:** Enforces character limits (max 200 chars/card) and caps the output array to 10 cards per document to ensure manageable study material.

## 3. Mindmap Generation Algorithm (Keyword Extraction / TF-IDF Light)
**Location:** Notes Module (`server/routes/notes.js`)  
**Purpose:** Extracts top conceptual keywords from a document corpus to construct a visual mindmap tree.
**How it works:**
- **Tokenization:** Uses regular expressions to match and extract valid candidate words (configured to lengths of 4+ characters).
- **Term Frequency:** Generates a hashmap tallying the occurrence of each distinct word in the text.
- **Stop Word Filtering:** Operates against a predefined dictionary of common, low-value conjunctions/prepositions (e.g., "this", "that", "which", "would") and filters them out of the candidate pool.
- **Sorting & Node Assignment:** Sorts the resulting array by frequency descending. The most recurrent term assumes the `concept` or `center` node, while the subsequent highly-ranked words form the `branches`.

## 4. Optical Character Recognition (OCR) & Parsing Algorithms
**Location:** Notes Module (`server/routes/notes.js`)  
**Purpose:** Converts uploaded PDF and image files into raw machine-actionable text.
**How it works:**
- **PDF Parsing:** Integrates `pdf-parse` to traverse raw PDF document binary arrays and extract embedded string elements.
- **Image OCR:** Integrates `tesseract.js`, deploying neural network-based pattern recognition algorithms (specifically trained on the English language dataset) to read pixel data and infer textual strings.

## 5. Gamification Scoring Algorithm
**Location:** Global / Course Modules (`server/routes/courses.js`, `notes.js`)  
**Purpose:** Provides a deterministic points-scoring model to drive user engagement via XP.
**How it works:**
- Follows a condition-based weighted matrix to dynamically increment the User's XP score:
  - Document upload and parsing success = +30 XP
  - Free course enrollment = +50 XP
  - Premium course enrollment = +100 XP
- These numeric scalars feed into the frontend to deterministically compute leveling milestones or unlock progression steps.

## 6. Cryptographic & Security Algorithms
**Location:** Authentication Module (`server/routes/auth.js`)
**Purpose:** Protects platform infrastructure and user credentials.
**How it works:**
- **Bcrypt Hashing (Blowfish Cipher):** Implements key stretching algorithms internally utilizing randomized cryptographic salts to transform plaintext passwords into secure, irreversible hash arrays. Resists brute-force and dictionary attacks.
- **JSON Web Tokens (JWT / HMAC SHA256):** Generates and signs user sessions. The algorithm applies the HMAC SHA256 signature to the base64-encoded header and payload via a secure server secret key to guarantee token integrity across distributed requests.
- **OAuth 2.0 Flow:** Executes standardized delegation algorithms coordinating the exchange of consent codes for validation access tokens via the Google Auth Library.
