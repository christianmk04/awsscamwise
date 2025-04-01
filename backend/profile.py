from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from sqlalchemy.orm.attributes import flag_modified
from apscheduler.schedulers.background import BackgroundScheduler

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
app.config['UPLOAD_FOLDER'] = 'public'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

db = SQLAlchemy(app)

# Define the User model
class User(db.Model):
    __tablename__ = 'user'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(255))
    verification_token_expiry = db.Column(db.TIMESTAMP)
    reset_token = db.Column(db.String(255))
    reset_token_expiry = db.Column(db.TIMESTAMP)
    fullname = db.Column(db.String(100))
    about = db.Column(db.Text)
    profilepicturepath = db.Column(db.String(255))
    role = db.Column(db.String(50), default='user')
    saved_articles = db.Column(db.ARRAY(db.Integer), default=[])
    saved_quizzes = db.Column(db.ARRAY(db.Integer), default=[])
    spotter_xp = db.Column(db.Integer, default=0)
    quiz_xp = db.Column(db.Integer, default=0)
    activity_streak = db.Column(db.Integer, default=0)
    daily_streak_checker = db.Column(db.Boolean, default=False)
    num_quizzes = db.Column(db.Integer, default=0)
    first_time_login = db.Column(db.Boolean, default=True)

# Route to Reset User Details for all users
# This is for testing purposes
@app.route('/reset_user_details', methods=['POST'])
def reset_user_details():
    all_users = User.query.all()

    for user in all_users:
        user.saved_articles = None
        user.saved_quizzes = None
        user.spotter_xp = 0
        user.quiz_xp = 0
        user.activity_streak = 0
        user.num_quizzes = 0

    db.session.commit()

    return jsonify({"message": "All user details reset successfully."}) 

@app.route('/initialise_profile_mock/<userId>', methods=['POST'])
def initialise_profile(userId):
    mock_user_details = {
        "saved_articles" : [4, 16, 21],
        "saved_quizzes" : [1, 3, 5],
        "spotter_xp" : 2050,
        "quiz_xp": 1200,
        "activity_streak" : 5,
        "num_quizzes" : 3    
    }

    # Check if user exists
    user = User.query.filter_by(user_id=userId).first()
    if user is None:
        return jsonify({"error": "User not found"})
    
    # Update user details
    user.saved_articles = mock_user_details["saved_articles"]
    user.spotter_xp = mock_user_details["spotter_xp"]
    user.quiz_xp = mock_user_details["quiz_xp"]
    user.activity_streak = mock_user_details["activity_streak"]
    user.num_quizzes = mock_user_details["num_quizzes"]

    db.session.commit()

    return jsonify({"message": "Profile initialised successfully."})


# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/first_time_details/<user_id>', methods=['POST'])
def first_time_details(user_id):
    file = request.files['profilePicture']
    base64_image = request.form.get('base64Image')
    full_name = request.form['fullName']
    about = request.form['about']

    # Define the absolute path to the 'frontend/public' folder
    frontend_path = os.path.join(os.path.dirname(os.getcwd()), 'frontend', 'public')

    # Ensure the 'frontend/public' folder exists
    if not os.path.exists(frontend_path):
        print("Creating frontend_path")
        os.makedirs(frontend_path)


    if file and allowed_file(file.filename):

        print(f"Received File {file.filename}")

        # Save the uploaded file directly
        filename = secure_filename(file.filename)
        file.save(f'../frontend/public/{filename}')  # Use Flask's `save` method for uploaded files

        # Update the user in the database (example database operation)
        user = User.query.get(user_id)
        if user:
            user.fullname = full_name
            user.about = about
            user.profilepicturepath = f"/{filename}"  # Relative path for the frontend
            user.first_time_login = False
            db.session.commit()
            return jsonify({'message': 'User updated successfully'}), 200
        else:
            return jsonify({'error': 'User not found'}), 404
        

    else:
        return jsonify({'error': 'Invalid file type or missing data'}), 400
    
# Route to update user's full name
@app.route('/update_full_name', methods=['POST'])
def update_full_name():
    data = request.get_json()
    user_id = data['userId']
    new_full_name = data['fullName']

    user = User.query.filter_by(user_id=user_id).first()
    if user:
        user.fullname = new_full_name
        db.session.commit()
        return jsonify({"message": "Full name updated successfully"})
    else:
        return jsonify({"error": "User not found"}), 404

# Route to update user's about me
@app.route('/update_bio', methods=['POST'])
def update_about_me():
    data = request.get_json()
    user_id = data['userId']
    new_about_me = data['bio']

    user = User.query.filter_by(user_id=user_id).first()
    if user:
        user.about = new_about_me
        db.session.commit()
        return jsonify({"message": "About me updated successfully"})
    else:
        return jsonify({"error": "User not found"}), 404

# Route to update user's profile picture
@app.route('/update_profile_picture', methods=['POST'])
def update_profile_picture():
    file = request.files['profilePicture']
    user_id = request.form['userId']

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(f'../frontend/public/{filename}')

        user = User.query.filter_by(user_id=user_id).first()
        if user:
            user.profilepicturepath = f"/{filename}"
            db.session.commit()
            return jsonify({"message": "Profile picture updated successfully"})
        else:
            return jsonify({"error": "User not found"}), 404
    else:
        return jsonify({"error": "Invalid file type or missing data"}), 400

# Get user role based on user_id
@app.route('/get_user_role/<userId>', methods=['GET'])
def get_user_role(userId):
    user = User.query.filter_by(user_id=userId).first()
    print(user)
    if user:
        return jsonify({'role': user.role})
    else:
        return jsonify({'error': 'User not found'}), 404

# Get user profile details based on user_id for Navbar
@app.route('/get_account_details/<userId>', methods=['GET'])
def get_account_details(userId):

    curr_user = User.query.filter_by(user_id=userId).first()
    
    if curr_user is not None:
        account_details = {
            "fullName" : curr_user.fullname,
            "email" : curr_user.email,
            "about": curr_user.about,
            "profilePicturePath" : curr_user.profilepicturepath,
        }

        return jsonify(account_details)
    else:
        return jsonify({"error": "User not found"})

# Get an array of user details for multiple user_ids
@app.route('/get_multiple_account_details', methods=['POST'])
def get_multiple_account_details():
    data = request.get_json()
    user_ids = data['user_ids']

    account_details = []

    for user_id in user_ids:
        curr_user = User.query.filter_by(user_id=user_id).first()
        if curr_user is not None:
            account_details.append({
                "user_id" : curr_user.user_id,
                "fullName" : curr_user.fullname,
                "email" : curr_user.email,
                "about": curr_user.about,
                "profilePicturePath" : curr_user.profilepicturepath,
            })
        else:
            return jsonify({"error": "User not found"})

    return jsonify(account_details)   

# Get user profile details based on user_id
@app.route('/get_profile_details/<userId>', methods=['GET'])
def get_profile_details(userId):

    curr_user = User.query.filter_by(user_id=userId).first()

    if curr_user is None:
        return jsonify({"error": "User not found"})

    # Calculate overall XP
    overallXP = curr_user.spotter_xp + curr_user.quiz_xp

    # Calculate level - To implement better logic later, for now we can do increments of 250
    level = overallXP // 250

    # Get Title - To implement logic later -- Maybe can implement similar to badge, they can unlock titles as they level up
    # Give me 15 different titles, each title is unlocked at a certain level
    title_names = ["Novice", "Novice Inspector", "Novice Detective", "Amateur Inspector", "Amateur Detective", "Detective", "Inspector", "Senior Inspector", "Senior Detective", "Master Detective", "Master Inspector", "Grandmaster Detective", "Grandmaster Inspector", "Legendary Detective", "Legendary Inspector", "Supreme Detective", "Supreme Inspector"]
    if level < 17:
        title = title_names[level]
    else:
        title = title_names[16]
    
    profile_details = {
        "fullName" : curr_user.fullname,
        "profilePicturePath" : curr_user.profilepicturepath,
        "role" : curr_user.role,
        "overallXP" : overallXP,
        "quizXP" : curr_user.quiz_xp,
        "spotterXP" : curr_user.spotter_xp,
        "level" : level,
        "title" : title,
        "savedArticles" : curr_user.saved_articles,
        "activityStreak" : curr_user.activity_streak,
    }

    return jsonify(profile_details)


# Get User Details for Home Page
@app.route('/get_user_details_home/<userId>', methods=['GET'])    
def get_user_details_home(userId):
    userId = int(userId)
    curr_user = User.query.filter_by(user_id=userId).first()

    # Get user progress for the badges --> badge service is 172.31.17.239:5008, pass in spotterXP and quizXP and numQuizzes
    # progress_service_url = "http://172.31.17.239:5008/get_progress"
    # progress_service_payload = {
    #     "spotterXP": curr_user.spotter_xp,
    #     "quizXP": curr_user.quiz_xp,
    #     "numQuizzes":  curr_user.num_quizzes
    # }
    # user_progress = requests.post(progress_service_url, json=progress_service_payload).json()

    user_details = {
        "fullName" : curr_user.fullname,
        "activityStreak" : curr_user.activity_streak,
        "spotterXP" : curr_user.spotter_xp,
        "quizXP" : curr_user.quiz_xp,
        "savedArticles" : curr_user.saved_articles,
        "savedQuizzes" : curr_user.saved_quizzes,
        "role" : curr_user.role,
    }

    return jsonify(user_details)

# Route to update quizXP based on user_id
@app.route('/update_quiz_xp/<userId>', methods=['POST'])
def update_quiz_xp(userId):
    data = request.get_json()
    quiz_xp = data['quizXP']

    curr_user = User.query.filter_by(user_id=userId).first()

    # Add the quiz XP to the user's current quiz XP
    curr_user.quiz_xp += quiz_xp

    db.session.commit()

    return jsonify({"message": "Quiz XP updated successfully"})

@app.route('/update_spotter_xp/<userId>', methods=['PUT'])
def update_spotter_xp(userId):
    data = request.get_json()
    spotter_xp = data['spotterXP']

    curr_user = User.query.filter_by(user_id=userId).first()

    # Add the quiz XP to the user's current quiz XP
    curr_user.spotter_xp += spotter_xp

    db.session.commit()

    return jsonify({"message": "Spotter XP updated successfully"}), 200

# Route to get all of the user's saved quizzes
@app.route('/get_saved_quizzes/<userId>', methods=['GET'])
def get_saved_quizzes(userId):
    curr_user = User.query.filter_by(user_id=userId).first()

    # Return array of saved quizzes ID
    saved_quizzes = curr_user.saved_quizzes

    # If no saved quizzes, return empty array
    if saved_quizzes is None:
        saved_quizzes = []

    return jsonify(saved_quizzes)

# Route to add saved quiz to user's saved quizzes
@app.route('/add_saved_quiz', methods=['POST'])
def add_saved_quiz():
    data = request.get_json()
    userId = data['userId']
    quiz_id = data['quizId']

    curr_user = User.query.filter_by(user_id=userId).first()

    if curr_user.saved_quizzes is None:
        curr_user.saved_quizzes = []
        curr_user.saved_quizzes.append(quiz_id)

        # Explicitly mark the column as modified
        flag_modified(curr_user, "saved_quizzes")
        db.session.commit()

        return jsonify({"message": "Quiz saved successfully"})

    # Add the quiz to the user's saved quizzes
    if quiz_id not in curr_user.saved_quizzes:
        curr_user.saved_quizzes.append(quiz_id)

        # Explicitly mark the column as modified
        flag_modified(curr_user, "saved_quizzes")
        db.session.commit()

        return jsonify({"message": "Quiz saved successfully"})
    else:
        return jsonify({"error": "Quiz already saved"}), 400
    
# Route to remove saved quiz from user's saved quizzes
@app.route('/remove_saved_quiz', methods=['POST'])
def remove_saved_quiz():
    data = request.get_json()
    userId = data['userId']
    quiz_id = data['quizId']

    curr_user = User.query.filter_by(user_id=userId).first()

    if not curr_user:
        return jsonify({"error": "User not found"}), 404

    # Ensure saved_quizzes is an array and remove the quiz
    if quiz_id in curr_user.saved_quizzes:
        curr_user.saved_quizzes.remove(quiz_id)

        # Explicitly mark the column as modified
        flag_modified(curr_user, "saved_quizzes")

        db.session.commit()
        return jsonify({"message": "Quiz removed successfully"})
    else:
        return jsonify({"error": "Quiz not found in saved quizzes"}), 400


# Route to get all of the user's saved articles
@app.route('/get_saved_articles/<userId>', methods=['GET'])
def get_saved_articles(userId):
    curr_user = User.query.filter_by(user_id=userId).first()

    # Return array of saved articles ID
    saved_articles = curr_user.saved_articles

    # If no saved articles, return empty array
    if saved_articles is None:
        saved_articles = []

    return jsonify(saved_articles)


# Route to add saved article to user's saved articles
@app.route('/add_saved_article', methods=['POST'])
def add_saved_article():
    data = request.get_json()
    userId = data['userId']
    article_id = data['articleId']

    curr_user = User.query.filter_by(user_id=userId).first()

    if curr_user.saved_articles is None:
        curr_user.saved_articles = []
        curr_user.saved_articles.append(article_id)

        # Explicitly mark the column as modified
        flag_modified(curr_user, "saved_articles")
        db.session.commit()

        return jsonify({"message": "Article saved successfully"})
    
    
    else:

        # Add the article to the user's saved articles
        if article_id not in curr_user.saved_articles:
            curr_user.saved_articles.append(article_id)

            # Explicitly mark the column as modified
            flag_modified(curr_user, "saved_articles")
            db.session.commit()

            return jsonify({"message": "Article saved successfully"})
        else:
            return jsonify({"error": "Article already saved"}), 400

# Route to remove saved article from user's saved articles
@app.route('/remove_saved_article', methods=['POST'])
def remove_saved_article():
    data = request.get_json()
    userId = data['userId']
    article_id = data['articleId'] 

    curr_user = User.query.filter_by(user_id=userId).first()

    if not curr_user:
        return jsonify({"error": "User not found"}), 404

    # Ensure saved_articles is an array and remove the article
    if article_id in curr_user.saved_articles:
        curr_user.saved_articles.remove(article_id)

        # Explicitly mark the column as modified
        flag_modified(curr_user, "saved_articles")

        db.session.commit()
        return jsonify({"message": "Article removed successfully"})
    else:
        return jsonify({"error": "Article not found in saved articles"}), 400

# Route to clear deleted quiz from all user's saved quizzes
@app.route('/clear_deleted_quiz', methods=['POST'])
def clear_deleted_quiz():
    data = request.get_json()
    quiz_id = data['quizId']
    print(quiz_id)

    # Get all users with the role user
    all_users = User.query.filter_by(role='user').all()

    for user in all_users:

        if user.saved_quizzes is None or quiz_id not in user.saved_quizzes:
            continue
        
        print(user.saved_quizzes)

       
        user.saved_quizzes.remove(quiz_id)

        # Explicitly mark the column as modified
        flag_modified(user, "saved_quizzes")
        db.session.commit()

    return jsonify({"message": "Deleted quiz cleared from all users' saved quizzes"})


# Route to clear deleted news article from all user's saved articles
@app.route('/clear_deleted_article/<articleId>', methods=['POST'])
def clear_deleted_article(articleId):

    print("Removing article", articleId)

    articleId = int(articleId)

    # Get all users with role user
    all_users = User.query.filter_by(role='user').all()

    for user in all_users:

        print(articleId in user.saved_articles)

        if user.saved_articles is None or articleId not in user.saved_articles:
            continue

        user.saved_articles.remove(articleId)

        flag_modified(user, "saved_articles")
        db.session.commit()

    return jsonify({"message": "Deleted article cleared from all users' saved articles"})


# Route to manage user streak - mode sent in request
@app.route('/manage_streak/<userId>', methods=['POST'])
def manage_streak(userId):
    data = request.get_json()
    mode = data['mode']

    curr_user = User.query.filter_by(user_id=userId).first()

    print(curr_user.daily_streak_checker)

    # Check daily_streak_checker - if True, then don't update the streak
    if curr_user.daily_streak_checker == True:
        return jsonify({"message": "User has already attempted a quiz today. Streak not updated.", "mode": mode, "streak":curr_user.activity_streak, "updated": False})
    
    if mode == "increment":
        curr_user.activity_streak += 1
        curr_user.daily_streak_checker = True
    elif mode == "reset":
        curr_user.activity_streak = 0

    db.session.commit()

    return jsonify({"message": "Streak updated successfully", "mode": mode, "streak": curr_user.activity_streak, "updated": True})


# Function to check streaks at the end of the day
def check_streaks():
    print("Checking Streaks & Resetting users who have daily_streak_checker still as False")
    with app.app_context():
        all_users = User.query.all()

        for user in all_users:
            if user.daily_streak_checker == False:
                user.activity_streak = 0
                db.session.commit()
            
            user.daily_streak_checker = False

        db.session.commit()

        return "Streaks checked successfully"



if __name__ == '__main__':
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_streaks, 'cron', hour = 23, minute = 59)
    # scheduler.add_job(check_streaks, 'interval', seconds=10)
    scheduler.start()

    for job in scheduler.get_jobs():
        # To check when the job is scheduled to run next
        print(job)

    app.run(debug=True, port=5002, use_reloader=False, host="0.0.0.0")