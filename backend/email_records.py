from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

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

# Define the EmaiLRecord model
class EmailRecord(db.Model):
    __tablename__ = 'email_records'

    user_id = db.Column(db.Integer, primary_key=True)
    record_date = db.Column(db.Date, primary_key=True)
    emails_scanned = db.Column(db.Integer, default=0)
    phishing_emails = db.Column(db.Integer, default=0)

    def __init__(self, user_id, record_date, emails_scanned=0, phishing_emails=0):
        self.user_id = user_id
        self.record_date = record_date
        self.emails_scanned = emails_scanned
        self.phishing_emails = phishing_emails

    def __repr__(self):
        return f"EmailRecord(user_id={self.user_id}, record_date={self.record_date}, emails_scanned={self.emails_scanned}, phishing_emails={self.phishing_emails})"
    
@app.route('/get_email_records/<int:userId>', methods=['GET'])
def get_email_records(userId):
    # Get email records for a specific user
    email_records = EmailRecord.query.filter_by(user_id=userId).all()
    email_records_list = [
        {
            # "user_id": record.user_id,
            "date": record.record_date.strftime("%Y-%m-%d"),
            "emails_scanned": record.emails_scanned,
            "phishing_emails": record.phishing_emails
        }
        for record in email_records
    ]

    return email_records_list
    

if __name__ == '__main__':
    app.run(debug=True, port=5015, host="0.0.0.0")  # Start the Flask application on port 5000