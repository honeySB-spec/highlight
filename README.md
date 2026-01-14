# LINK: https://highlight-ai.vercel.app/

# Highlight

Highlight is an intelligent PDF analysis and study companion that uses Google's Gemini AI to automatically identify and highlight key concepts in your documents. It provides a modern, distraction-free environment for reviewing and studying materials.

## Features

- **AI-Powered Analysis**: Automatically detects important concepts and phrases using Gemini 1.5 Flash.
- **Smart Highlighting**: Applies highlights directly to your PDF documents.
- **Detailed summaries**: Provides context and explanation for each highlighted phrase.
- **Modern UI**: Clean, minimalist interface with dark/light mode support.
- **Secure Payments**: Integrated Stripe subscription for premium features.
- **Authentication**: Secure user management via Clerk.

## Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4, Radix UI, Lucide React
- **PDF Rendering**: React-PDF
- **Auth**: Clerk

### Backend
- **Server**: Python (Flask)
- **AI**: Google Gemini API
- **PDF Processing**: PyMuPDF (fitz)
- **Payment**: Stripe

## Prerequisites

- Node.js (v18+)
- Python 3.9+
- Gemini API Key
- Stripe Account (for payments)
- Clerk Account (for auth)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd highlight
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRICE_ID=your_stripe_price_id
```

Start the backend server:
```bash
python app.py
```
The server will run on `http://localhost:5001`.

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:5001
```

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## Usage

1. **Sign Up/Login**: Create an account or log in.
2. **Upload PDF**: Drag & drop or select a PDF file to upload.
3. **Analyze**: Click "Start Analysis" to begin processing.
4. **Review**: View the highlighted document in the integrated viewer.
5. **Download**: Download the analyzed PDF with highlights embedded.

## License

[MIT](LICENSE)
