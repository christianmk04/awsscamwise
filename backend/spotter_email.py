from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import json
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.dialects.postgresql import JSONB

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

class SimulationEmail(db.Model):
    __tablename__ = "simulation_email"
    email_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    is_scam = db.Column(db.Boolean, nullable=False)
    email_content = db.Column(db.JSON, nullable=False)
    email_header = db.Column(db.JSON, nullable=False)
    email_auth = db.Column(db.JSON, nullable=False)
    persona = db.Column(db.JSON, nullable=False)
    scam_indicators = db.Column(ARRAY(db.String))
    check_indicators = db.Column(ARRAY(db.String), nullable=False)
    is_user_created = db.Column(db.Boolean, nullable=False)
    average_rating = db.Column(db.Integer)
    logo_src = db.Column(db.String)
    explanations = db.Column(JSONB, nullable=False)

    def __init__(self, is_scam, email_content, email_header, persona, scam_indicators, check_indicators, is_user_created, average_rating, email_auth, logo_src, explanations):
        self.is_scam = is_scam
        self.email_content = email_content
        self.email_header = email_header
        self.persona = persona
        self.scam_indicators = scam_indicators
        self.check_indicators = check_indicators
        self.is_user_created = is_user_created
        self.average_rating = average_rating
        self.email_auth = email_auth
        self.logo_src = logo_src
        self.explanations = explanations
    
    def to_dict(self):
        return {
            "email_id": self.email_id,
            "email_auth": self.email_auth,
            "persona_details" : {
                "persona_email": self.persona,
            },
            "is_scam": self.is_scam,
            "is_user_created": self.is_user_created,
            "email_content": self.email_content,
            "email_header": self.email_header,
            "scam_indicators": self.scam_indicators,
            "check_indicators": self.check_indicators,
            "logo_src": self.logo_src,
            "average_rating": self.average_rating,
            "explanations": self.explanations
        }

#Fetch emails (json is array of ids)
@app.route("/fetch_emails", methods=['PUT'])
def get_emails():
    email_ids = request.json.get('email_ids', [])

    if not email_ids:
        return jsonify({"error": "No email IDs provided"}), 400

    # Fetch all emails in one query
    emails = SimulationEmail.query.filter(SimulationEmail.email_id.in_(email_ids)).all()

    # Convert to a list of dictionaries for JSON response
    email_data = [email.to_dict() for email in emails]

    return jsonify({"emails": email_data})


# Fetch the daily exercise
@app.route('/fetch_daily_scam_spotter', methods=['GET'])
def fetch_daily_scam_spotter():

    # Eventually to add logic to fetch the daily scam spotter email via name (i.e "Daily Scam Spotter #14")

    # For now, we just fetch the last email in the database
    last_email = SimulationEmail.query.order_by(SimulationEmail.email_id.desc()).first()
    return jsonify({
        "email_id": last_email.email_id,
        "email_auth": last_email.email_auth,
        "persona_details" : {
            "persona_email": last_email.persona,
        },
        "is_scam": last_email.is_scam,
        "is_user_created": last_email.is_user_created,
        "email_content": last_email.email_content,
        "email_header": last_email.email_header,
        "scam_indicators": last_email.scam_indicators,
        "check_indicators": last_email.check_indicators,
        "logo_src": last_email.logo_src,
        "average_rating": last_email.average_rating,
        "footer": {
            "text": "Thank you for using Scam Watcher. Stay safe!",
            "unsubscribe": "https://your-app.com/unsubscribe"
        }
    })


#Email logic
@app.route("/fetch_ss_daily", methods=['PUT'])
def fetch_daily_ss():
    try:
        user_XP = request.json['xp']
        # Determine number of emails based on XP
        num_questions = 5 if user_XP <= 500 else 10

        # Fetch random emails from DB
        emails = SimulationEmail.query.order_by(db.func.random()).limit(num_questions).all()

        # Convert to JSON response
        email_ids = [email.email_id for email in emails]
        return jsonify(email_ids)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/file_metadata', methods=['POST'])
def file_metadata():
    data = request.json
    file_path = data.get('file_path')
    
    try:
        with open(file_path, 'r') as file:
            file_data = json.load(file)
            total_emails = len(file_data.get('emails', []))
            
            return jsonify({
                'total_emails': total_emails,
                'file_path': file_path
            })
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True, port=5010)