import os
from dotenv import load_dotenv

load_dotenv()


from flask import Flask, request, jsonify, send_file, send_from_directory, g
from flask_cors import CORS
import fitz  # PyMuPDF
import werkzeug.utils
import sys
import stripe
import json
from auth import login_required

app = Flask(__name__)
# Allow CORS for all domains for now, or strictly from FRONTEND_URL
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
CORS(app, resources={r"/*": {"origins": "*"}}) # Keeping generous CORS for now to avoid issues, but good to know

UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
@login_required
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

@app.route('/extract-text', methods=['POST'])
@login_required
def extract_text():
    data = request.json
    filename = data.get('filename')
    
    if not filename:
        return jsonify({'error': 'Filename is required'}), 400
        
    input_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(input_path):
        return jsonify({'error': 'File not found'}), 404

    try:
        doc = fitz.open(input_path)
        pages_data = []
        
        for page_num, page in enumerate(doc):
            text = page.get_text()
            # Basic cleanup
            text = " ".join(text.split())
            if text:
                pages_data.append({
                    'page': page_num + 1,
                    'text': text
                })
        
        doc.close()
        return jsonify({'pages': pages_data}), 200

    except Exception as e:
        print(f"Error extracting text: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    file_path = os.path.join(PROCESSED_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    return send_file(file_path, as_attachment=True)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/create-checkout-session', methods=['POST'])
@login_required
def create_checkout_session():
    stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    'price': os.getenv('STRIPE_PRICE_ID'),
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=f'{frontend_url}/?success=true',
            cancel_url=f'{frontend_url}/?canceled=true',
            metadata={
                 'user_id': getattr(g, 'user_id', 'unknown')
            }
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 403

    return jsonify({'url': checkout_session.url})

@app.route('/webhook', methods=['POST'])
def webhook():
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

    if not endpoint_secret:
         return 'Webhook secret not set', 500

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        return 'Invalid payload', 400
    except stripe.error.SignatureVerificationError as e:
        return 'Invalid signature', 400

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('metadata', {}).get('user_id')
        print(f"Payment successful for user: {user_id}")

    return '', 200

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')
