from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta, timezone
import requests


app = Flask(__name__)
CORS(app)

DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "scamwise"
DB_USER = "postgres"
DB_PASSWORD = "password"

# Configure the database connection
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define the QuizSession model
class QuizSession(db.Model):
    __tablename__ = 'quiz_session'

    session_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    quiz_id = db.Column(db.Integer, nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    subtopic = db.Column(db.String(255), nullable=False)
    time_taken = db.Column(db.Integer, nullable=False)
    user_answers = db.Column(db.JSON, nullable=False)
    number_correct = db.Column(db.Integer, nullable=False)
    session_xp = db.Column(db.Integer, nullable=False)
    time_created = db.Column(db.DateTime, default=datetime.now)

    def __init__(self, user_id, quiz_id, topic, subtopic, time_taken, user_answers, number_correct, session_xp, time_created):
        self.user_id = user_id
        self.quiz_id = quiz_id
        self.topic = topic
        self.subtopic = subtopic
        self.time_taken = time_taken
        self.user_answers = user_answers
        self.number_correct = number_correct
        self.session_xp = session_xp
        self.time_created = time_created

    def to_dict(self):
        return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "quiz_id": self.quiz_id,
            "topic": self.topic,
            "subtopic": self.subtopic,
            "time_taken": self.time_taken,
            "user_answers": self.user_answers,
            "number_correct": self.number_correct,
            "session_xp": self.session_xp,
            "time_created": self.time_created.strftime("%Y-%m-%d %H:%M:%S")
        }

# Route to handle quiz session creation
@app.route('/add_quiz_session', methods=['POST'])
def add_quiz_session():
    data = request.get_json()
    user_id = data['user_id']
    quiz_id = data['quiz_id']
    time_taken = data['time_taken']
    user_answers = data['user_answers']
    num_correct = data['num_correct']
    quiz_xp = data['quizXP']
    topic = data['topic']
    subtopic = data['subtopic']

    # Calculate the session_XP earned
    # 1. If all answers are correct and no previous attempts, total_xp = quiz.xp 
    # 2. If all answers are correct and previous attempts, total_xp = quiz.xp / (number of previous attempts * 2), rounded up to the nearest 10
    # 3. If not all answers are correct, total_xp = 0
    # 4. Check if there has been any previous attempts where all answers were correct - if so, no XP is awarded

    session_xp = 0
    quiz_session = QuizSession.query.filter_by(user_id=user_id, quiz_id=quiz_id).all()

    if num_correct == len(user_answers):
        if not quiz_session:
            session_xp = quiz_xp
        else:
            all_correct_attempts = [session for session in quiz_session if session.number_correct == len(session.user_answers)]
            if not all_correct_attempts:
                session_xp = quiz_xp // (len(quiz_session) * 2)
                session_xp = session_xp - (session_xp % 10)
    else:
        session_xp = 0

    new_session = QuizSession(
        user_id=user_id, 
        quiz_id=quiz_id, 
        topic=topic,
        subtopic=subtopic,
        time_taken=time_taken, 
        user_answers=user_answers, 
        number_correct=num_correct, 
        session_xp=session_xp, 
        time_created=datetime.now()
    )

    db.session.add(new_session)
    db.session.commit()

    # Streak Management - Check if user has attempted a quiz in the past 24 hours, if yes then don't update the streak, else update the streak
    
    # Send streakXP to 172.31.17.239:5002/update_streak_xp/<userId> with streak_xp as the payload
    endpoint = f"http://172.31.17.239:5002/manage_streak/{user_id}"
    payload = {
        "mode": "increment"
    }
    response = requests.post(endpoint, json=payload)
    print(response.json)
    
    
    return jsonify({"message": "Quiz session added successfully", "session_xp": session_xp})

# Get session by id
@app.route('/get_quiz_session/<session_id>', methods=['GET'])
def get_quiz_session(session_id):
    session = QuizSession.query.filter_by(session_id=session_id).first()
    if not session:
        return jsonify({"message": "Session not found"}), 404
    return jsonify(session.to_dict())

# Get all sessions for a user
@app.route('/get_user_quiz_sessions/<user_id>', methods=['GET'])
def get_user_sessions(user_id):

    sessions = QuizSession.query.filter_by(user_id=user_id).all()

    if sessions == []:
        return []
    elif not sessions:
        return jsonify({"message": "No sessions found"}), 404
    
    # Return an array of session objects
    session_objects = [session.to_dict() for session in sessions]
    return session_objects

# Get leaderboard for a quiz
@app.route('/get_quiz_leaderboard/<quiz_id>', methods=['GET'])
def get_quiz_leaderboard(quiz_id):
    sessions = QuizSession.query.filter_by(quiz_id=quiz_id).all()
    if not sessions:
        return jsonify({"message": "No sessions found"}), 404
    
    # Sort by session_xp from highest to lowest followed by time taken from lowest to highest
    leaderboard = sorted(sessions, key=lambda x: (-x.session_xp, x.time_taken))

    # Narrow down to the top 5 if there are more than 5 sessions, else return all
    if len(leaderboard) > 5:
        leaderboard = leaderboard[:5]

    # For each session, get the user's name and profile picture from 
    # 172.31.17.239:5002/get_user_profile/<userId> and add to the session object

    # Get all unique user ids
    user_ids = list(set([session.user_id for session in leaderboard]))
    
    # Get user profiles
    user_profiles = []
    endpoint = "http://172.31.17.239:5002/get_multiple_account_details"
    payload = {
        "user_ids": user_ids
    }
    response = requests.post(endpoint, json=payload)
    user_profiles = response.json()

    # Add user profiles to the leaderboard
    return_leaderboard = []
    for session in leaderboard:
        session_temp = session.to_dict()
        for profile in user_profiles:
            if session.user_id == profile['user_id']:
                session_temp['fullName'] = profile['fullName']
                session_temp['profilePicturePath'] = profile['profilePicturePath']
                return_leaderboard.append(session_temp)
                break
        
    return jsonify(return_leaderboard)

# Delete all sessions for a quiz
@app.route('/delete_quiz_sessions/<quiz_id>', methods=['DELETE'])
def delete_quiz_sessions(quiz_id):
    sessions = QuizSession.query.filter_by(quiz_id=quiz_id).all()
    if not sessions:
        return jsonify({"message": "No sessions found"}), 404
    for session in sessions:
        db.session.delete(session)
    db.session.commit()
    return jsonify({"message": "Sessions deleted successfully"})


if __name__ == '__main__':
    app.run(port=5006, debug=True, host="0.0.0.0")