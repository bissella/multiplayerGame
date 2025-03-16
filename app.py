from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-testing')

# Always use SQLite
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///game.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
socketio = SocketIO(app, cors_allowed_origins="*")

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    x_position = db.Column(db.Integer, default=50)
    y_position = db.Column(db.Integer, default=50)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# User loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('game'))
        
        return render_template('login.html', error='Invalid username or password')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return render_template('register.html', error='Username already exists')
        
        new_user = User(username=username)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/game')
@login_required
def game():
    return render_template('game.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

# API Routes
@app.route('/api/position', methods=['GET', 'POST'])
@login_required
def position():
    if request.method == 'POST':
        data = request.json
        current_user.x_position = data.get('x', current_user.x_position)
        current_user.y_position = data.get('y', current_user.y_position)
        db.session.commit()
        return jsonify({'success': True})
    
    return jsonify({
        'x': current_user.x_position,
        'y': current_user.y_position
    })

# SocketIO events
online_users = {}

@socketio.on('connect')
def handle_connect():
    if current_user.is_authenticated:
        user_data = {
            'id': current_user.id,
            'username': current_user.username,
            'x': current_user.x_position,
            'y': current_user.y_position
        }
        online_users[current_user.id] = user_data
        join_room('game_world')
        emit('user_connected', user_data, to='game_world')
        emit('world_state', list(online_users.values()), to=request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    if current_user.is_authenticated and current_user.id in online_users:
        del online_users[current_user.id]
        emit('user_disconnected', {'id': current_user.id}, to='game_world')

@socketio.on('move')
def handle_move(data):
    if current_user.is_authenticated:
        x = data.get('x', current_user.x_position)
        y = data.get('y', current_user.y_position)
        
        # Update user position
        current_user.x_position = x
        current_user.y_position = y
        current_user.last_seen = datetime.utcnow()
        db.session.commit()
        
        # Update online users and broadcast position
        if current_user.id in online_users:
            online_users[current_user.id]['x'] = x
            online_users[current_user.id]['y'] = y
            
        emit('player_moved', {
            'id': current_user.id,
            'x': x,
            'y': y
        }, to='game_world')

# Create database
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    socketio.run(app, debug=False, host='0.0.0.0', port=port)
