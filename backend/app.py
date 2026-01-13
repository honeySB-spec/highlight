import os
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import fitz  # PyMuPDF
import werkzeug.utils
import sys
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    filename = werkzeug.utils.secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    
    return jsonify({'message': 'File uploaded successfully', 'filename': filename}), 200

@app.route('/analyze', methods=['POST'])
def analyze_pdf():
    data = request.json
    filename = data.get('filename')
    
    if not filename:
        return jsonify({'error': 'Filename is required'}), 400
        
    input_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(input_path):
        return jsonify({'error': 'File not found'}), 404
        
    try:
        from analyzer import analyze_page
    except ImportError:
         return jsonify({'error': 'Analyzer module not found or dependencies missing'}), 500

    def generate_analysis_progress():
        try:
            doc = fitz.open(input_path)
            total_pages = len(doc)
            total_matches = 0
            all_highlights = []
            
            # Yield initial progress
            yield json.dumps({
                'type': 'progress', 
                'current': 0, 
                'total': total_pages, 
                'message': 'Starting analysis...'
            }) + '\n'

            for page_num, page in enumerate(doc):
                # Update progress for current page
                yield json.dumps({
                    'type': 'progress',
                    'current': page_num + 1,
                    'total': total_pages,
                    'message': f'Analyzing page {page_num + 1} of {total_pages}...'
                }) + '\n'

                text = page.get_text()
                if not text.strip():
                    continue
                    
                # Small delay to help avoid rate limits between pages
                import time
                time.sleep(1)
                
                # Get phrases to highlight from Gemini
                try:
                    items_to_highlight = analyze_page(text)
                except Exception as e:
                    print(f"Error analyzing page {page_num+1}: {e}")
                    yield json.dumps({
                        'type': 'error',
                        'message': f"Analysis failed on page {page_num+1}: {str(e)}"
                    }) + '\n'
                    return # Stop processing on fatal error

                # Highlight each phrase
                for item in items_to_highlight:
                    phrase = item.get('phrase')
                    if not phrase:
                        continue
                        
                    # Search for the phrase (case-insensitive by default in newer PyMuPDF, but let's be sure)
                    text_instances = page.search_for(phrase)

                    if not text_instances:
                        print(f"Warning: Phrase not found on page {page_num+1}: '{phrase}'")
                    else:
                        print(f"Highlighted on page {page_num+1}: '{phrase}' ({len(text_instances)} matches)")

                    # Add highlight annotation for each instance
                    for inst in text_instances:
                        highlight = page.add_highlight_annot(inst)
                        highlight.update()
                        total_matches += 1
                    
                    # Store for frontend
                    all_highlights.append({
                        'phrase': phrase,
                        'details': item.get('details', 'No details available'),
                        'page': page_num + 1
                    })
                    
            output_filename = f"analyzed_{filename}"
            output_path = os.path.join(PROCESSED_FOLDER, output_filename)
            doc.save(output_path)
            doc.close()
            
            # Yield completion result
            yield json.dumps({
                'type': 'complete',
                'data': {
                    'message': 'Analysis complete',
                    'matches': total_matches,
                    'download_url': f'/download/{output_filename}',
                    'highlights': all_highlights
                }
            }) + '\n'

        except Exception as e:
            print(f"Error during analysis: {e}")
            yield json.dumps({
                'type': 'error',
                'message': str(e)
            }) + '\n'

    from flask import Response, stream_with_context
    return Response(stream_with_context(generate_analysis_progress()), mimetype='application/json')

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    file_path = os.path.join(PROCESSED_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    return send_file(file_path, as_attachment=True)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')
