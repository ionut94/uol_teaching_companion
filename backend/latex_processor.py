import re

def extract_text_from_latex(filepath):
    """
    Extract text content from a LaTeX file.
    
    Args:
        filepath (str): Path to the LaTeX file
        
    Returns:
        str: Extracted text content
    """
    text = ""
    
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
            
            # Remove comments
            content = re.sub(r'%.*?\n', '\n', content)
            
            # Extract content from different environments
            # Remove commands like \begin{}, \end{}, \item, etc.
            content = re.sub(r'\\begin\{.*?\}', '', content)
            content = re.sub(r'\\end\{.*?\}', '', content)
            
            # Extract section headers
            section_headers = re.findall(r'\\(section|subsection|subsubsection)\{(.*?)\}', content)
            for header_type, header_text in section_headers:
                text += f"{header_text.strip()}\n\n"
            
            # Extract regular text (outside of commands)
            # This is a simplified approach; complete LaTeX parsing is complex
            paragraphs = re.findall(r'(?:\\par|\\\\|\n\n)(.*?)(?=\\par|\\\\|\n\n|$)', content, re.DOTALL)
            for para in paragraphs:
                # Clean up commands
                clean_para = re.sub(r'\\[a-zA-Z]+(\[.*?\])?(\{.*?\})?', '', para)
                clean_para = re.sub(r'\{|\}', '', clean_para)
                if clean_para.strip():
                    text += clean_para.strip() + "\n\n"
                
        return text
    
    except Exception as e:
        print(f"Error extracting text from LaTeX: {e}")
        return ""
