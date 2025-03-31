import PyPDF2

def extract_text_from_pdf(filepath):
    """
    Extract text content from a PDF file.
    
    Args:
        filepath (str): Path to the PDF file
        
    Returns:
        str: Extracted text content
    """
    text = ""
    
    try:
        with open(filepath, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Iterate through all pages and extract text
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
                
        return text
    
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""
