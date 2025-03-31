# Teaching Companion

Teaching Companion is an interactive tool designed to help students and educators engage with course materials. Users can select course lecture files (in LaTeX format) and ask questions about the content.

## Features

- Select existing lecture files from the context directory
- Legacy support for uploading additional PDF or LaTeX files
- AI-powered question answering about course materials
- Clean, intuitive interface

## Project Structure

Teaching Companion/ 
├── backend/ # Flask backend 
│ ├── app.py # Main application file 
│ ├── context/ # Pre-loaded lecture files 
│ ├── pdf_processor.py # PDF text extraction 
│ ├── latex_processor.py # LaTeX text extraction 
│ ├── llm_service.py # LLM integration 
│ └── uploads/ # User uploaded files 
└── frontend/ # React frontend 
    ├── public/ # Static files 
    └── src/ # React source code 
        ├── components/ # React components 
        ├── services/ # API services 
        ├── App.js # Main React component 
        └── index.js # Entry point

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv source venv/bin/activate # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install flask flask-cors werkzeug openai
```

Note: Additional dependencies may be required depending on your setup.

4. Ensure you have a `context` directory with lecture files:
```bash
mkdir -p context
```

5. Start the Flask server:
```bash
python app.py
```
The backend will be available at http://localhost:5000

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at http://localhost:3000

## Using the Application

1. **Select Context Files**: 
- Choose the lecture files you want to use as context for your questions
- Click "Use Selected Files as Context"

2. **Ask Questions**:
- Type your question in the input field
- Press "Ask" to get an answer based on the selected lecture files

3. **Legacy Upload** (optional):
- Click "Show Legacy Upload Feature" to upload additional materials
- Select a PDF or LaTeX file and click "Upload File"

## Adding New Course Materials

Place new LaTeX lecture files in the `/backend/context/` directory to make them available for selection.

## Development

- Backend API endpoints are defined in `app.py`
- The frontend communicates with the backend via the API service in `frontend/src/services/api.js`
- The main components are:
  - `ContextFileSelector`: For selecting lecture files
  - `ChatInterface`: For asking questions and displaying answers
  - `FileUploaderArchived`: For the legacy upload feature

## Troubleshooting

- If you encounter CORS issues, ensure the backend server is running and CORS is properly configured
- If file selection doesn't work, check that the files exist in the `/backend/context/` directory
- For upload issues, verify that the `/backend/uploads/` directory exists and is writable

## License

TBC