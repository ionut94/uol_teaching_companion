# Teaching Companion

Teaching Companion is an interactive tool designed to help students and educators engage with course materials. Users can select course lecture files (in LaTeX format) and ask questions about the content.

## Features

- Select existing lecture files from the context directory
- Legacy support for uploading additional PDF or LaTeX files
- AI-powered question answering about course materials
- User authentication system with secure login and registration
- Chat history persistence for registered users
- Multiple LLM provider support (Ollama local model and Google Gemini)
- Dark/light theme with automatic system preference detection
- Text-to-speech support for accessibility
- Responsive design with collapsible sidebar
- Clean, intuitive interface

## Project Structure
```
Teaching Companion/ 
├── backend/ # Flask backend 
│ ├── app.py # Main application file 
│ ├── auth.py # Authentication services
│ ├── models.py # Database models
│ ├── context/ # Pre-loaded lecture files 
│ ├── pdf_processor.py # PDF text extraction 
│ ├── latex_processor.py # LaTeX text extraction 
│ ├── llm_service.py # LLM integration 
│ └── uploads/ # User uploaded files 
└── frontend/ # React frontend 
    ├── public/ # Static files 
    └── src/ # React source code 
        ├── components/ # React components 
        │   ├── auth/ # Authentication components
        │   ├── LLMToggle/ # LLM provider toggle
        │   ├── Settings/ # User settings
        │   ├── Sidebar/ # Navigation sidebar
        │   ├── TextToSpeech/ # Accessibility feature
        │   └── ThemeToggle/ # Theme switcher
        ├── context/ # Context providers
        ├── services/ # API services 
        ├── App.js # Main React component 
        └── index.js # Entry point
```

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn
- SQLite (included in Python standard library)
- Ollama (optional, for local LLM support)
- Google Gemini API key (optional, for Gemini support)

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv 
source venv/bin/activate # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Ensure you have a `context` directory with lecture files:
```bash
mkdir -p context
```

5. Set up environment variables (optional for Gemini):
```bash
export GEMINI_API_KEY=your_api_key_here
```

6. Start the Flask server:
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

1. **Register or Login**:
- Create a new account or log in to an existing one
- Teacher accounts have additional privileges

2. **Select Context Files**: 
- Choose the lecture files you want to use as context for your questions
- Click "Select All" to use all files or select individual files
- Click "Deselect All" to clear your selection

3. **Ask Questions**:
- Type your question in the input field
- Press "Ask" to get an answer based on the selected lecture files
- Toggle between Ollama (local) and Gemini AI models using the selector

4. **Chat History**:
- Your conversations are saved automatically when logged in
- Access previous chats from the sidebar
- Create new chat sessions with the "New Chat" button
- Delete unwanted chat histories

5. **Customize Experience**:
- Toggle between dark and light themes
- Access settings for display preferences
- Use text-to-speech functionality for AI responses

6. **Legacy Upload** (optional):
- Click "Show Legacy Upload Feature" to upload additional materials
- Select a PDF or LaTeX file and click "Upload File"

## Adding New Course Materials

Place new LaTeX lecture files in the `/backend/context/` directory to make them available for selection.

## Development

- Backend API endpoints are defined in `app.py`
- Authentication logic is in `auth.py` with database models in `models.py`
- The frontend communicates with the backend via the API service in `frontend/src/services/api.js`
- Theme context is managed in `frontend/src/context/ThemeContext.js`
- The main components are:
  - `ContextFileSelector`: For selecting lecture files
  - `ChatInterface`: For asking questions and displaying answers
  - `Sidebar`: For navigation and chat history management
  - `Auth`: For user authentication
  - `Settings`: For user preferences
  - `LLMToggle`: For switching between AI providers

## Troubleshooting

- If you encounter CORS issues, ensure the backend server is running and CORS is properly configured
- If file selection doesn't work, check that the files exist in the `/backend/context/` directory
- For upload issues, verify that the `/backend/uploads/` directory exists and is writable
- If authentication fails, ensure the database file exists and has the correct permissions
- For LLM provider issues, check that Ollama is running locally or that your Gemini API key is properly set

## License

TBC