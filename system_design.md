# Spare Parts Matching System - System Design & Workflow

## 1. System Overview
A modern web application for managing and matching spare parts using image recognition (embeddings). The system emphasizes a clean, professional UI and a simplified backend architecture without complex ML model training.

## 2. Architecture Diagram
```mermaid
graph TD
    User[User] -->|Interacts| UI[Frontend (React + Tailwind)]
    UI -->|Uploads Image| API[Backend API (Node/Express)]
    API -->|Get Embedding| OpenAI[OpenAI/AWS Service]
    API -->|Store/Query| DB[(MongoDB)]
    
    subgraph "Add Part Flow"
    API -- Image --> OpenAI
    OpenAI -- Vector --> API
    API -- Data + Vector --> DB
    end
    
    subgraph "Match Part Flow"
    API -- Query Image --> OpenAI
    OpenAI -- Query Vector --> API
    API -- Cosine Similarity --> DB
    DB -- Top 3 Matches --> API
    end
```

## 3. UI Design & Workflow

### Color Palette & Typography
- **Primary**: Indigo-600 (`#4f46e5`) - Buttons, Active States (Modern, professional alternative to basic blue)
- **Secondary**: Slate-600 (`#475569`) - Text
- **Background**: Slate-50 (`#f8fafc`) - App Background
- **Surface**: White (`#ffffff`) - Cards, Sidebar
- **Font**: Inter or system-ui (Clean, sans-serif)

### Screens

#### 1️⃣ Dashboard
- **Layout**: Fixed Sidebar (Left), Main Content (Right).
- **Stats Cards**:
  - Total Parts: Indigo bg, White text.
  - Low Stock: White bg, Orange accent.
  - Recent Searches: White bg, Slate accent.
- **Recent Parts Table**: Clean rows, light borders, "Edit" button ghost style.

#### 2️⃣ Add Spare Part
- **Form Layout**: Single card, centered or max-width-2xl.
- **Fields**: Name, Number, Category, Stock, Description.
- **Image Upload**: Drag & drop zone with preview.
- **Action**: "Add Part" button (Primary color).

#### 3️⃣ Parts List
- **Features**: Search input (top right), Filter by Category.
- **Table**: Image thumbnail, Name, Number, Stock, Actions (Edit/Delete).
- **Pagination**: Simple Previous/Next if needed.

#### 4️⃣ Image Matching
- **Input**: Large, prominent drop-zone. "Drop image here to find matches".
- **Process**: Show loading state (skeleton or spinner) while fetching matches.
- **Results**: Grid of 3 cards.
  - **Card**: Image (top), Name (bold), Match Score (Green badge, e.g., "98% Match"), Stock Status.

## 4. Backend Architecture (The "Easy" Way)

### Core Concept: Vector Search
Instead of training a CNN, we use a pre-trained "Vision Transformer" or similar model via API to convert an image into a list of numbers (vector). Similar images produce mathematically similar vectors.

### Data Model (MongoDB)
```json
{
  "partName": "Brake Pad",
  "partNumber": "BP-2051",
  "category": "Brakes",
  "stock": 40,
  "description": "Ceramic brake pads...",
  "imageUrl": "https://...",
  "embedding": [0.12, -0.05, 0.88, ...] // Array of floats
}
```

### API Endpoints

#### `POST /api/parts`
1. Receive text data + image file.
2. Upload image to storage (local or cloud) -> Get URL.
3. Call Embedding API (e.g., OpenAI `embeddings` with image input, or a local python script if preferred, but API is easiest).
4. Save to MongoDB.

#### `POST /api/match`
1. Receive query image.
2. Generate embedding for query image.
3. Fetch all parts (or use MongoDB Vector Search if available).
4. **Calculate Cosine Similarity**:
   $$ Similarity = \frac{A \cdot B}{||A|| ||B||} $$
5. Sort by similarity (descending).
6. Return top 3.

## 5. Implementation Steps
1. **Setup**: React Vite project + Tailwind.
2. **Components**: Build Layout, Cards, Tables.
3. **Pages**: Assemble pages using components.
4. **Backend**: Express server stubs + Logic for embeddings.
