from flask import Flask, render_template, redirect, url_for, request, jsonify, session, Response
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
from contextlib import contextmanager
import psycopg2
import requests

#IMPORTS FOR EMAIL VERIFICATION
from flask_mail import Mail, Message
import secrets

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = "secret"
login_manager = LoginManager(app)
login_manager.login_view = 'login'
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config["MAIL_USERNAME"] = "scamwiser@gmail.com"
#THIS PASSWORD BELOW IS AN AUTH APP PASSWORD, NOT THE ACTUAL PASSWORD
app.config["MAIL_PASSWORD"] = "uzhk bort djql bydb"
mail = Mail(app)

@contextmanager
def get_db_connection():
    # CONNECT TO LOCALISED POSTGRES DATABASE
    connection = psycopg2.connect(
    dbname="scamwise",  
    user="postgres",
    password='password',
    host="localhost",
    port="5432",
    # sslmode="require"
    )
    try:
        yield connection
    finally:
        connection.close()


class User(UserMixin):
    def __init__(self, id, username, password):
        self.id = id
        self.username = username
        self.password = password

""" ------------------------------------- FUNCTIONS FOR USER MANAGEMENT --------------------------------- """

@app.route("/register_action", methods=["GET", "POST"])
def register_action():
    try:
        # username = str(request.form.get('username'))
        # email = str(request.form.get('email'))
        # password = str(request.form.get('password'))
        # confirm_password = str(request.form.get('confirm_password'))

        username = request.json.get('username')
        email = request.json.get('email')
        password = request.json.get('password')
        confirm_password = request.json.get('confirm_password')

        # Check if password and confirm password match
        if password != confirm_password:
            return jsonify({'success': False, 'message': 'Passwords do not match'})

        # Check if username already exists
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                query = """SELECT user_id FROM "user" WHERE username = %s"""
                cursor.execute(query, (username,))
                existing_user = cursor.fetchone()
                if existing_user:
                    return jsonify({'success': False, 'message': 'Username already exists'})
                
        #Generate a verification token
        verification_token = secrets.token_urlsafe(32)
        verification_token_expiry = datetime.now() + timedelta(days=1)  # Token expires in 24 hours

        # If username doesn't exist and passwords match, proceed with registration
        hashed_password = generate_password_hash(password)

        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                query = """INSERT INTO "user" (username, email, password_hash, verification_token, verification_token_expiry) VALUES (%s, %s, %s, %s, %s)"""
                hashed_password = generate_password_hash(password)
                cursor.execute(query, (username, email, hashed_password, verification_token, verification_token_expiry))
                connection.commit()
            
        # Send verification email
        verification_link = url_for('verify_email', token=verification_token, _external=True)
        print(verification_link)
        send_verification_email(email, verification_link)
        print("Verification email sent successfully")
        
        # return redirect(url_for('awaiting_verification'))
        return jsonify({'success': True, 'message': 'Registration successful. Please check your email to verify your account.'})

    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'An error occurred during registration'})

@app.route("/verify_email/<token>", methods=["GET"])
def verify_email(token):
    try:
        # Retrieve the user record associated with the verification token
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                query = """SELECT * FROM "user" WHERE verification_token = %s"""
                cursor.execute(query, (token,))
                user = cursor.fetchone()

                # If no user found with the given token, return failure response
                if not user:
                    return jsonify({'success': False, 'message': 'Invalid verification token or token has expired.'})

                # Check if the token has expired
                token_expiry = user[6]  # assuming verification_token_expiry is at index 5
                token_expiry = token_expiry.replace(tzinfo=timezone.utc)

                if token_expiry and token_expiry < datetime.now(timezone.utc):
                    return jsonify({'success': False, 'message': 'Verification token has expired.'})

                # Mark the user's account as verified in the database
                with connection.cursor() as cursor:
                    query = """UPDATE "user" SET verified = true WHERE user_id = %s"""
                    cursor.execute(query, (user[0],))  # assuming user_id is at index 0
                    connection.commit()

                return redirect(url_for('email_verification_success'))

    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'An error occurred during email verification.'})

# Generate a random token
def generate_verification_token():
    return secrets.token_urlsafe(32)

@app.route("/registration_success", methods=["GET", "POST"])
def registration_success():
    return "Registration successful. Please check your email to verify your account."

@app.route(("/verification_success"), methods=["GET", "POST"])
def verification_success():
    return "Email verification successful. You can now log in at https://checkmate1.azurewebsites.net/login"

@app.route("/password_reset_request", methods=["GET", "POST"])
def password_reset_request():
    return "Password reset request successful. Please check your email to reset your password."

@app.route("/password_reset_confirmation", methods=["GET", "POST"])
def password_reset_confirmation():
    return "Password reset has been sent to your email. Please check your email to reset your password."

@app.route("/password_reset_successful", methods=["GET", "POST"])
def password_reset_successful():
    return "Password reset successful. You can now log in at checkmate."

# Send verification email
def send_verification_email(email, verification_link):
    msg = Message('Welcome new Scamwise user, verify your email', sender='jarvisverify@gmail.com', recipients=[email])
    msg.body = f'Dear User, \n\n Welcome to ScamWise. Please click the following link to verify your email: {verification_link}'
    mail.send(msg)

@app.route("/awaiting_verification")
def awaiting_verification():
    return render_template("awaiting_verification.html")

# Reset password endpoint
@app.route("/reset_password/<token>", methods=["GET", "POST"])
def reset_password(token):
    try:
        if request.method == "GET":
            # Check if reset token is valid and not expired
            with get_db_connection() as connection:
                with connection.cursor() as cursor:
                    query = """SELECT * FROM "user" WHERE reset_token = %s"""
                    cursor.execute(query, (token,))
                    user = cursor.fetchone()

                    if not user:
                        return "Invalid reset password token or token has expired."

                    reset_token_expiry = user[8]  # Assuming reset_token_expiry is the 6th column
                    reset_token_expiry = reset_token_expiry.replace(tzinfo=timezone.utc)
                

                    if reset_token_expiry and reset_token_expiry < datetime.now(timezone.utc):
                        return "Reset password token has expired."

            # Render password reset form
            return render_template("reset_password.html", token=token)

        elif request.method == "POST":
            print("POST request received")
            # Reset password
            new_password = request.json.get('new_password')
            print(new_password)
            confirm_new_password = request.json.get('confirm_new_password')
            print(confirm_new_password)

            if new_password != confirm_new_password:
                return "Passwords do not match."

            print("passwords match")
            # Hash the new password
            hashed_password = generate_password_hash(confirm_new_password)
            print("test")
            print(hashed_password)
            print(token)
            # Update user's password in the database
            with get_db_connection() as connection:
                with connection.cursor() as cursor:
                    query = """UPDATE "user" SET password_hash = %s, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = %s"""
                    cursor.execute(query, (hashed_password, token,))
                    connection.commit()
                    print("Password reset successfully z.")

            print("test 2")
            return "Password reset successfully."

    except Exception as e:
        print(e)
        return "An error occurred during password reset."
    
# Send reset password email
def send_reset_password_email(email, reset_link):
    msg = Message('J-BYD Reset your password', sender='jarvisverify@gmail.com', recipients=[email])
    msg.body = f'Dear User, \n\n You have requested for a password reset. Please click the following link to reset your password: {reset_link}'
    mail.send(msg)

@app.route("/email_verification_success", methods=["GET", "POST"])
def email_verification_success():
    # Direct user to the login page at 172.31.17.239:5173/verify-email
    return redirect("http://172.31.17.239:5173/verify-email")

@login_manager.user_loader
def load_user(user_id):
    try:
        print("Connected to PostgreSQL database")

        # Use the context manager to get a database connection
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                query = """SELECT user_id, username, password_hash FROM "user" WHERE user_id = %s"""
                cursor.execute(query, (user_id,))
                user_data = cursor.fetchone()
                if user_data:
                    user = User(user_data[0], user_data[1], user_data[2])
                    return user
                else:
                    return None

    except Exception as e:
        print(e)
        return None  # Handle the error appropriately, for example, by logging or returning None
    
class User(UserMixin):
    def __init__(self, id, username, password):
        self.id = id
        self.username = username
        self.password = password

@app.route('/initialise', methods=["GET","POST"])
def initialise(): #Initialising everything
    print("initialise triggered")
    try: 
        return jsonify({'success': True, 'message': 'Initialization successful'})
    except Exception as e:
        return jsonify({'success': False, 'error_message': str(e)})

@app.route('/login_action', methods=["POST"])
def login_action():
    try:
        print("login action triggered")
        email = request.json.get('email')
        username = request.json.get('username')
        password = request.json.get('password')
        print(email)
        # Check the user credentials in the database
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                query = """SELECT user_id, email, password_hash, verified, first_time_login FROM "user" WHERE email = %s"""
                cursor.execute(query, (email,))
                user_data = cursor.fetchone()

                if user_data:
                    print("User found")
                    user_id, email, password_hash, verified, first_time_login = user_data
                    if verified:
                        # Verify password hash
                        if check_password_hash(password_hash, password):
                            user = User(user_id, email, password_hash)
                            login_user(user)

                            # Get User Role from endpoint
                            endpoint = f"http://172.31.17.239:5002/get_user_role/{user_id}"
                            response = requests.get(endpoint)
                            print(response.json())
                            role = response.json()["role"]

                            # check if this is the first time that the user has logged in
                            if first_time_login:

                                print("First time login")                         
                                
                                return jsonify({'success': True, 'message': 'First time login', 'firstTimeLogin': True, 'user_id': user_id, 'role': role})
                            else:

                                return jsonify({'success': True, 'message': 'Login successful', 'firstTimeLogin': False, 'user_id': user_id, 'role': role})
                        else:
                            return jsonify({'success': False, 'message': 'Invalid credentials'})
                    else:
                        print("User email not verified")
                        return jsonify({'success': False, 'message': 'User email not verified'})
                else:
                    return jsonify({'success': False, 'message': 'User not found'})

    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'An error occurred during login'})
    
@app.route('/logout')
@login_required
def logout():
    logout_user()
    # Clear the vector database instance upon logout
    global vectordb
    vectordb = None
    #clear the session
    session.clear()
    return redirect(url_for('login'))


if __name__ == '__main__':
    app.run(debug=True, port=5001, host="0.0.0.0")

