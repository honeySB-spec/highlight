import os
import jwt
from flask import request, jsonify, g
from functools import wraps
import requests
from jwt.algorithms import RSAAlgorithm
import json

# Cache for JWKS
jwks_cache = {}

def get_jwks_url():
    # Typically https://<clerk-domain>/.well-known/jwks.json
    # Or we can construct it if we have CLERK_ISSUER
    issuer = os.getenv('CLERK_ISSUER')
    if issuer:
        return f"{issuer}/.well-known/jwks.json"
    return os.getenv('CLERK_JWKS_URL')

def get_public_key(kid):
    global jwks_cache
    jwks_url = get_jwks_url()
    
    if not jwks_url:
        print("Warning: CLERK_ISSUER or CLERK_JWKS_URL not set.")
        return None

    if not jwks_cache:
        try:
            response = requests.get(jwks_url)
            if response.status_code == 200:
                jwks_cache = response.json()
            else:
                print(f"Failed to fetch JWKS: {response.status_code}")
                return None
        except Exception as e:
            print(f"Error fetching JWKS: {e}")
            return None

    for key in jwks_cache.get('keys', []):
        if key.get('kid') == kid:
            return RSAAlgorithm.from_jwk(json.dumps(key))
            
    # If not found, maybe refresh cache once
    return None

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if os.getenv('DISABLE_AUTH') == 'true':
             return f(*args, **kwargs)

        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Missing Authorization Header'}), 401
        
        try:
            scheme, token = auth_header.split(" ")
            if scheme.lower() != 'bearer':
                raise ValueError("Invalid scheme")
                
            header = jwt.get_unverified_header(token)
            kid = header.get('kid')
            
            public_key = get_public_key(kid)
            if not public_key:
                 # Fallback if no JWKS configured (dev mode helper) or key not found
                 return jsonify({'error': 'Public key not found or Auth not configured'}), 500

            payload = jwt.decode(token, public_key, algorithms=['RS256'], audience=os.getenv('CLERK_AUDIENCE'))
            g.user_id = payload.get('sub')
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            print(f"Auth error: {e}")
            return jsonify({'error': 'Authentication failed'}), 401
            
        return f(*args, **kwargs)
    return decorated_function
