import os
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import fitz  # PyMuPDF
import werkzeug.utils

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

@app.route('/highlight', methods=['POST'])
def highlight_pdf():
    data = request.json
    filename = data.get('filename')
    search_term = data.get('search_term')
    
    if not filename or not search_term:
        return jsonify({'error': 'Filename and search term are required'}), 400
        
    input_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(input_path):
        return jsonify({'error': 'File not found'}), 404
        
    doc = fitz.open(input_path)
    total_matches = 0
    
    for page in doc:
        # Search for the text
        text_instances = page.search_for(search_term)
        
        # Add highlight annotation for each instance
        for inst in text_instances:
            highlight = page.add_highlight_annot(inst)
            highlight.update()
            total_matches += 1
            
    output_filename = f"highlighted_{filename}"
    output_path = os.path.join(PROCESSED_FOLDER, output_filename)
    doc.save(output_path)
    doc.close()
    
    return jsonify({
        'message': 'Highlighting complete',
        'matches': total_matches,
        'download_url': f'/download/{output_filename}'
    }), 200

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
    app.run(debug=True, port=5001)
