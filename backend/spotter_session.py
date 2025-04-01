from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ARRAY

app = Flask(__name__)
CORS(app)

# DATABASE CONFIGURATION
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "scamwise"
DB_USER = "postgres"
DB_PASSWORD = "password"

app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class SpotterSession(db.Model):
    __tablename__ = "spotter_session"
    session_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    emails=db.Column(ARRAY(db.Integer))
    time_taken = db.Column(db.Integer, nullable=False, default=0)
    total_points = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False)
    sessionType = db.Column(db.String, nullable=False)
    active_email = db.Column(db.Integer)

    def __init__(self, user_id, emails, time_taken, total_points, is_active, sessionType):
        self.user_id = user_id
        self.emails = emails
        self.time_taken = time_taken
        self.total_points = total_points
        self.is_active = is_active
        self.sessionType = sessionType
        self.active_email = None
    
    def to_dict(self):
         return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "emails": self.emails,
            "time_taken": self.time_taken,
            "total_points": self.total_points,
            "is_active": self.is_active,
            "sessionType": self.sessionType,
            "active_email": self.active_email
        }

@app.route('/session/<session_id>', methods=['GET'])
def get_session(session_id):
    try:
        curr_session = SpotterSession.query.filter_by(session_id=session_id).first()
        if curr_session is None:
            return jsonify({"error": f"Session {session_id} not found"}), 404

        return jsonify(curr_session.to_dict()),200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/session/<session_id>', methods=['POST'])
def set_active_session(session_id):
    try:
        curr_session = SpotterSession.query.filter_by(session_id=session_id).first()
        if curr_session is None:
            return jsonify({"error": f"Session {session_id} not found"}), 404

        return jsonify(curr_session.to_dict()),200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#Find active session for a given user id
@app.route('/session/get_active_session/<user_id>', methods=['GET'])
def get_active_session(user_id):
    try:
        active_session = SpotterSession.query.filter_by(user_id=user_id,is_active=True).all()
        if active_session == []:
            return jsonify({"message": f"No active session found for user with user id {user_id}","status_code":404}), 404
        #Error where there is more than 1 active session where there shouldn't be
        if len(active_session) > 1:
            active_ids = []
            for session in active_session:
                active_ids.append(session.session_id)
            #Complex MS to handle this and call the other API end point
            return jsonify({"id_list": active_ids,"error":"There is more than 1 active session and that is not allowed, we have closed both sessions."}), 400

        return jsonify({"active_session": active_session[0].to_dict(), "status_code": 200}), 200

    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/session/create_session', methods=['POST'])
def create_session():
    try:
        session_emails = request.json['emails']
        session_user = request.json['user_id']
        session_type = request.json['session_type']

        # Create session instance
        session = SpotterSession(
            user_id=session_user, 
            emails=session_emails, 
            time_taken=0,
            total_points=0, 
            is_active=True, 
            sessionType=session_type
        )

        db.session.add(session)
        db.session.commit()  # Commit to generate session_id

        # Return the new session ID
        return jsonify({"session_id": session.session_id, "status_code":201}), 201  # 201 Created status

    except Exception as e:
        db.session.rollback() 
        return jsonify({"error": str(e)}), 500
    
#Set active email
@app.route("/session/set_active_email", methods=['PUT'])
def set_active():
    email = request.json['active_email']
    session = request.json['session_id']
    
    #Get the current session and update its active email
    curr_session = SpotterSession.query.filter_by(session_id=session).first()
    if curr_session is None:
        return jsonify({"error": "Session not found", "status_code":404}),404

    try:
        curr_session.active_email = email
        db.session.commit()
        return jsonify({"message": f"Active email for session {session} updated successfully"}), 201  
    
    except Exception as e:
        db.session.rollback()  
        return jsonify({"error": str(e)}), 500


#Update score and time after each email is done
@app.route("/session/update_score/<session_id>", methods=["PUT"])
@cross_origin(origins="http://172.31.17.239:5173")  
def update_score(session_id):
    try:
        # time = request.json['time']
        score = request.json['score']
        curr_session = SpotterSession.query.filter_by(session_id=session_id).first()
        if curr_session is None:
            return jsonify({"error": "Session not found","status_code":404}),404

        # curr_session.time_taken += time
        curr_session.total_points += score
        db.session.commit()
        return jsonify({"message": f"Current score of {curr_session.total_points} has been recorded for session {session_id} successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500     

@app.route("/session/update_time/<session_id>", methods=["PUT"])
def update_time(session_id):
    try:
        # time = request.json['time']
        time = request.json['time_taken']
        print("printing time inside update time", time)
        curr_session = SpotterSession.query.filter_by(session_id=session_id).first()
        if curr_session is None:
            return jsonify({"error": "Session not found","status_code":404}),404

        # curr_session.time_taken += time
        curr_session.time_taken += time
        db.session.commit()
        return jsonify({"message": f"Time taken for {curr_session.time_taken} has been recorded for session {session_id} successfully", "score": curr_session.total_points}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500     


#Close session
@app.route("/session/close_session/<session_id>",methods=['PUT'])
def close_session(session_id):
    try:
        curr_session = SpotterSession.query.filter_by(session_id=session_id).first()
        if curr_session is None:
            return jsonify({"error": "Session not found", "status_code":404}),404
        
        curr_session.is_active = False
        db.session.commit()
        return jsonify({"message": f"Session {session_id} has been closed successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Create the table when the MS is started
with app.app_context():
    db.drop_all()
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5020, host="0.0.0.0")
