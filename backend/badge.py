from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

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

# Define the Badge model
class Badge(db.Model):
    __tablename__ = 'badge'

    badge_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    badge_code = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    badge_type = db.Column(db.String(100), nullable=False)
    tier = db.Column(db.String(50), nullable=False)
    threshold = db.Column(db.Integer, nullable=False)
    icon = db.Column(db.String(255), nullable=False)

    def __init__(self, badge_code, name, description, badge_type, tier, threshold, icon):
        self.badge_code = badge_code
        self.name = name
        self.description = description
        self.badge_type = badge_type
        self.tier = tier
        self.threshold = threshold
        self.icon = icon

    def __repr__(self):
        return f"Badge {self.badge_code}"

# Get all the badges that a user has based on the XP they have earned and the number of quizzes they have contributed
@app.route('/get_badges', methods=['POST'])
def get_badges():

    spotter_xp = request.json["spotterXP"]
    quiz_xp = request.json["quizXP"]
    num_quizzes = request.json["numQuizzes"]

    user_badges = []

    # get all the badges from the database
    all_badges = Badge.query.all()

    badge_list = [
        {
            "badgeCode": badge.badge_code,
            "name": badge.name,
            "description": badge.description,
            "badge_type": badge.badge_type,
            "tier": badge.tier,
            "threshold": badge.threshold,
            "icon": badge.icon
        }
        for badge in all_badges
    ]
    

    for badge in badge_list:
        if badge["badge_type"] == "scam_spotter" and spotter_xp >= badge["threshold"]:
            user_badges.append(badge)
        elif badge["badge_type"] == "quiz_master" and quiz_xp >= badge["threshold"]:
            user_badges.append(badge)
        elif badge["badge_type"] == "quizzes_contributed" and num_quizzes >= badge["threshold"]:
            user_badges.append(badge)
    
    return jsonify(user_badges)


# Calculate current tier based on XP and number of quizzes contributed, and how far away the user is from the next tier
@app.route('/get_progress', methods=['POST'])
def get_progress():

    spotter_xp = request.json["spotterXP"]
    quiz_xp = request.json["quizXP"]
    num_quizzes = request.json["numQuizzes"]

    # Create a response structure for each badge type
    badge_types = {
        "scam_spotter": spotter_xp,
        "quiz_master": quiz_xp,
        "quizzes_contributed": num_quizzes
    }

    # Prepare the response
    result = {}

    # get all the badges from the database
    all_badges = Badge.query.all()

    badge_list = [
        {
            "badgeCode": badge.badge_code,
            "name": badge.name,
            "description": badge.description,
            "badge_type": badge.badge_type,
            "tier": badge.tier,
            "threshold": badge.threshold,
            "icon": badge.icon
        }
        for badge in all_badges
    ]

    # Process each badge type
    for badge_type, current_value in badge_types.items():

        # Filter badges for the current badge type and sort by threshold
        relevant_badges = [badge for badge in badge_list if badge["badge_type"] == badge_type]
        sorted_badges = sorted(relevant_badges, key=lambda x: x["threshold"])

        current_tier = None
        next_tier = None
        next_threshold = None

        # Find current and next tier based on the user's value
        for i in range(len(sorted_badges)):
            if current_value >= sorted_badges[i]["threshold"]:
                current_tier = sorted_badges[i]["tier"]
            elif current_value < sorted_badges[i]["threshold"] and not next_tier:
                next_tier = sorted_badges[i]["tier"]
                next_threshold = sorted_badges[i]["threshold"]

        # Calculate XP left to reach the next tier
        xp_left = next_threshold - current_value if next_tier else 0

        # Prepare the response for this badge type
        result[badge_type] = {
            "name": badge_type.replace("_", " ").title(),
            "current_tier": current_tier,
            "next_tier": next_tier,
            "current_value": current_value,
            "value_left": xp_left
        }

    # Return the complete response
    return result



if __name__ == '__main__':
    app.run(debug=True, port=5008)