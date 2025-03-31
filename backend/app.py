from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from pdf_processor import extract_text_from_pdf
from latex_processor import extract_text_from_latex
from llm_service import get_llm_response

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'tex'}  # Now accepting .tex files too

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Store the extracted content from files
file_contents = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Determine file type and extract text accordingly
        if filename.endswith('.pdf'):
            extracted_text = extract_text_from_pdf(filepath)
        elif filename.endswith('.tex'):
            extracted_text = extract_text_from_latex(filepath)
        else:
            return jsonify({'error': 'Unsupported file type'}), 400
            
        file_contents[filename] = extracted_text
        
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename
        })
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/ask', methods=['POST'])
def ask_question():
    data = request.json
    if not data or 'question' not in data:
        return jsonify({'error': 'Question is required'}), 400
    
    question = data['question']
    
    # Combine all file contents as context
    context = ""
    for content in file_contents.values():
        context += content + "\n\n"
    
    if not context:
        return jsonify({'error': 'No content available. Please upload files first.'}), 400
    
    # Get response from LLM
    response = get_llm_response(question, context)
    
    return jsonify({
        'answer': response
    })

@app.route('/api/files', methods=['GET'])
def list_files():
    return jsonify({
        'files': list(file_contents.keys())
    })

@app.route('/api/list-context-files', methods=['GET'])
def list_context_files():
    """List all files in the context directory"""
    context_dir = os.path.join(os.path.dirname(__file__), 'context')
    try:
        # Get all .tex files from the context directory
        files = [f for f in os.listdir(context_dir) if f.endswith('.tex')]
        return jsonify({
            'files': files,
            'success': True
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/select-context-files', methods=['POST'])
def select_context_files():
    """Set selected files as the context for questions"""
    data = request.json
    selected_files = data.get('selected_files', [])
    
    if not selected_files:
        return jsonify({
            'error': 'No files selected',
            'success': False
        }), 400
    
    # Clear previous file contents to avoid using old context
    file_contents.clear()
    
    # Process each selected file
    context_dir = os.path.join(os.path.dirname(__file__), 'context')
    processed_files = []
    
    for filename in selected_files:
        filepath = os.path.join(context_dir, filename)
        
        if not os.path.exists(filepath):
            return jsonify({
                'error': f'File not found: {filename}',
                'success': False
            }), 404
        
        # Extract text from the file
        if filename.endswith('.pdf'):
            extracted_text = extract_text_from_pdf(filepath)
        elif filename.endswith('.tex'):
            extracted_text = extract_text_from_latex(filepath)
        else:
            continue  # Skip unsupported file types
        
        # Store the extracted text in file_contents
        file_contents[filename] = extracted_text
        processed_files.append(filename)
    
    return jsonify({
        'message': f'Selected and processed {len(processed_files)} files as context',
        'selected_files': processed_files,
        'success': True
    })

if __name__ == '__main__':
    app.run(debug=True)
