from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta, datetime
from models import db, User, ChatHistory, Message

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    
    # Validate input
    if not data or not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409
    
    # Create new user
    new_user = User(
        username=data['username'],
        email=data['email'],
        is_teacher=data.get('is_teacher', False)
    )
    new_user.set_password(data['password'])
    
    # Add to database
    db.session.add(new_user)
    db.session.commit()
    
    # Generate access token - Fix: Convert user ID to string
    access_token = create_access_token(
        identity=str(new_user.id),  # Convert to string to prevent "Subject must be a string" error
        additional_claims={'is_teacher': new_user.is_teacher},
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'message': 'User registered successfully',
        'user': new_user.to_dict(),
        'access_token': access_token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    
    # Validate input
    if not data or not all(k in data for k in ('username', 'password')):
        return jsonify({'error': 'Missing username or password'}), 400
    
    # Find user
    user = User.query.filter_by(username=data['username']).first()
    
    # Check credentials
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Generate access token - Fix: Convert user ID to string
    access_token = create_access_token(
        identity=str(user.id),  # Convert to string to prevent "Subject must be a string" error
        additional_claims={'is_teacher': user.is_teacher},
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token
    })

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    # Get current user
    user_id = get_jwt_identity()
    # Convert to int since we're storing as string in token
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid user ID format'}), 400
        
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': user.to_dict()
    })

@auth_bp.route('/chat-history', methods=['GET'])
@jwt_required()
def get_chat_history():
    # Get current user
    user_id = get_jwt_identity()
    
    try:
        # Convert to int since we're storing as string in token
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid user ID format'}), 400
            
        # Debug info about request
        print(f"GET /chat-history - User ID: {user_id}")
        print(f"Request headers: {dict(request.headers)}")
        
        # Get all chat histories for the user
        chat_histories = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.updated_at.desc()).all()
        
        # Print debug info
        print(f"Found {len(chat_histories)} chat histories for user {user_id}")
        
        # Log the chat histories for debugging
        chat_histories_data = [chat.to_dict() for chat in chat_histories]
        print(f"Chat histories: {chat_histories_data}")
        
        return jsonify({
            'chat_histories': chat_histories_data
        })
    except Exception as e:
        print(f"Error in get_chat_history: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/chat-history/<int:chat_id>', methods=['GET'])
@jwt_required()
def get_chat_messages(chat_id):
    # Get current user
    user_id = get_jwt_identity()
    
    try:
        # Convert to int since we're storing as string in token
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid user ID format'}), 400
    
    # Check if chat history exists and belongs to user
    chat_history = ChatHistory.query.filter_by(id=chat_id, user_id=user_id).first()
    
    if not chat_history:
        return jsonify({'error': 'Chat history not found or unauthorized'}), 404
    
    # Get all messages in the chat
    messages = Message.query.filter_by(chat_history_id=chat_id).order_by(Message.created_at).all()
    
    return jsonify({
        'chat': chat_history.to_dict(),
        'messages': [msg.to_dict() for msg in messages]
    })

@auth_bp.route('/chat-history', methods=['POST'])
@jwt_required()
def create_chat_history():
    # Get current user
    user_id = get_jwt_identity()
    
    try:
        # Convert to int since we're storing as string in token
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid user ID format'}), 400
        
    data = request.json
    
    # Create new chat history
    new_chat = ChatHistory(
        user_id=user_id,
        title=data.get('title', 'Untitled Chat')
    )
    
    db.session.add(new_chat)
    db.session.commit()
    
    return jsonify({
        'message': 'Chat history created',
        'chat': new_chat.to_dict()
    }), 201

@auth_bp.route('/chat-history/<int:chat_id>/message', methods=['POST'])
@jwt_required()
def add_message(chat_id):
    # Get current user
    user_id = get_jwt_identity()
    
    try:
        # Convert to int since we're storing as string in token
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid user ID format'}), 400
        
    data = request.json
    
    # Check if chat history exists and belongs to user
    chat_history = ChatHistory.query.filter_by(id=chat_id, user_id=user_id).first()
    
    if not chat_history:
        return jsonify({'error': 'Chat history not found or unauthorized'}), 404
    
    # Validate input
    if not data or 'content' not in data:
        return jsonify({'error': 'Message content is required'}), 400
    
    # Create new message
    new_message = Message(
        chat_history_id=chat_id,
        content=data['content'],
        is_user=data.get('is_user', True)
    )
    
    db.session.add(new_message)
    
    # Update chat history's updated_at timestamp
    chat_history.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Message added',
        'chat_message': new_message.to_dict()
    }), 201

@auth_bp.route('/chat-history/<int:chat_id>', methods=['PUT'])
@jwt_required()
def update_chat_title(chat_id):
    # Get current user
    user_id = get_jwt_identity()
    
    try:
        # Convert to int since we're storing as string in token
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid user ID format'}), 400
        
    data = request.json
    
    # Check if chat history exists and belongs to user
    chat_history = ChatHistory.query.filter_by(id=chat_id, user_id=user_id).first()
    
    if not chat_history:
        return jsonify({'error': 'Chat history not found or unauthorized'}), 404
    
    # Validate input
    if not data or 'title' not in data:
        return jsonify({'error': 'Title is required'}), 400
    
    # Update chat title
    chat_history.title = data['title']
    db.session.commit()
    
    return jsonify({
        'message': 'Chat title updated',
        'chat': chat_history.to_dict()
    })

@auth_bp.route('/chat-history/<int:chat_id>', methods=['DELETE'])
@jwt_required()
def delete_chat_history(chat_id):
    # Get current user
    user_id = get_jwt_identity()
    
    try:
        # Convert to int since we're storing as string in token
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid user ID format'}), 400
    
    # Check if chat history exists and belongs to user
    chat_history = ChatHistory.query.filter_by(id=chat_id, user_id=user_id).first()
    
    if not chat_history:
        return jsonify({'error': 'Chat history not found or unauthorized'}), 404
    
    # Delete chat history (cascade will delete all messages)
    db.session.delete(chat_history)
    db.session.commit()
    
    return jsonify({
        'message': 'Chat history deleted'
    })