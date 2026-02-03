import os
import datetime
from functools import wraps
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
# PyJWT is used to sign and verify JSON Web Tokens (JWTs).
# Tokens represent authenticated sessions and should be short-lived.
import jwt
from bson.objectid import ObjectId

# Load environment variables from a .env file (if present).
# Required environment variables:
#   - MONGO_URI: MongoDB connection string
#   - JWT_SECRET: secret key used to sign JWTs; keep this secret and do not commit it
load_dotenv()

MONGO_URI = os.environ.get('MONGO_URI')
JWT_SECRET = os.environ.get('JWT_SECRET')
# IMPORTANT: JWT_SECRET must be kept private and stable. Rotating this value will invalidate all existing tokens.
if not MONGO_URI:
    raise RuntimeError('MONGO_URI not set. Copy .env.example to .env and set MONGO_URI')
if not JWT_SECRET:
    raise RuntimeError('JWT_SECRET not set. Set JWT_SECRET in .env for signing tokens')

client = MongoClient(MONGO_URI)
db = client['Personal-info-updates']
users_col = db['user-info']
expenses_col = db['daily-expenses']

# initialize Flask app and enable CORS for the Angular frontend
app = Flask(__name__)
CORS(app, origins=["http://localhost:4200"])

# Decorator to protect endpoints that require authentication.
# Expects header: Authorization: Bearer <token>
# Verifies the token signature and expiry using JWT_SECRET. On success it sets `g.current_user_id`.
# On failure it returns HTTP 401 with a short error message.
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header missing'}), 401
        token = auth_header.split(' ')[1]
        try:
            # Decode token; this will raise if the token is expired or invalid
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            g.current_user_id = payload.get('user_id')
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'message': str(e)}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/expenses', methods=['GET'])
@token_required
def get_expenses():
    docs = expenses_col.find().sort('created_at', -1)
    expenses = []
    for d in docs:
        expenses.append({
            'id': str(d.get('_id')),
            'category': d.get('category'),
            'price': float(d.get('price')) if d.get('price') is not None else None,
            'notes': d.get('notes'),
            'date': d.get('date').isoformat() if d.get('date') else None,
            'created_at': d.get('created_at').isoformat() if d.get('created_at') else None,
        })
    return jsonify(expenses), 200


@app.route('/login', methods=['POST'])
# Login endpoint: verifies credentials and returns a signed JWT access token.
# Token payload contains minimal information (user_id, email) and an expiration time (`exp`).
# Tokens are signed with HS256 using JWT_SECRET. The client should store this token securely and send it
# in the `Authorization: Bearer <token>` header for subsequent protected requests.
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    print("user:", data)
    if not email or not password:
        return jsonify({'error': 'email and password are required'}), 400

    # Lookup user and verify password (stored as a hash).
    user = users_col.find_one({'email': email})
    print("user:", user)
    if not user or not check_password_hash(user.get('password', ''), password):
        # Return a generic message to avoid revealing which field was incorrect.
        return jsonify({'error': 'Invalid credentials'}), 401

    # Create token payload and set a reasonable expiration time.
    payload = {
        'user_id': str(user.get('_id')),
        'email': user.get('email'),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
    } 
    
    print("Login attempt for email:", payload)
    # Sign the token (PyJWT returns a compact JWT string).
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')

    return jsonify({'access_token': token}), 200


@app.route('/me', methods=['GET'])
# Returns basic information about the authenticated user.
# The `token_required` decorator ensures g.current_user_id is set from the validated token.
@token_required
def me():
    try:
        user = users_col.find_one({'_id': ObjectId(g.current_user_id)})
    except Exception:
        user = None
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'id': str(user.get('_id')),
        'email': user.get('email'),
        'created_at': user.get('created_at').isoformat() if user.get('created_at') else None,
    }), 200


@app.route('/expenses', methods=['POST'])
@token_required
def create_expense():
    data = request.get_json() or {}
    category = data.get('category')
    date_str = data.get('date')
    price = data.get('price')
    notes = data.get('notes')

    if not category or date_str is None or price is None:
        return jsonify({'error': 'category, date, and price are required'}), 400

    try:
        date = datetime.datetime.fromisoformat(date_str)
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use ISO format.'}), 400

    try:
        price_val = float(price)
    except (TypeError, ValueError):
        return jsonify({'error': 'price must be a number'}), 400

    doc = {
        'category': category,
        'price': price_val,
        'notes': notes,
        'date': date,
        'created_at': datetime.datetime.utcnow(),
    }
    result = expenses_col.insert_one(doc)

    return jsonify({'id': str(result.inserted_id)}), 201

@app.route('/user-info', methods=['GET'])
# Protected endpoint: returns registered users (requires a valid JWT).
@token_required
def get_users():
    docs = users_col.find({}, {'age': 0}).sort('created_at', -1)
    print("Fetched user documents:", list(docs))
    users = []
    for d in docs:
        users.append({
            'id': str(d.get('_id')),
            'email': d.get('email'),
            'created_at': d.get('created_at').isoformat() if d.get('created_at') else None,
        })
    return jsonify(users), 200


@app.route('/user-info', methods=['POST'])
def create_user():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'email and password are required'}), 400

    # Prevent duplicate registrations for the same email address
    existing = users_col.find_one({'email': email})
    if existing:
        return jsonify({'error': 'User already exists'}), 409

    # Store the password as a secure hash
    hashed = generate_password_hash(password)
    doc = {
        'email': email,
        'password': hashed,
        'created_at': datetime.datetime.utcnow(),
    }
    result = users_col.insert_one(doc)

    return jsonify({'id': str(result.inserted_id)}), 201


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=(os.environ.get('FLASK_ENV') == 'development'))
