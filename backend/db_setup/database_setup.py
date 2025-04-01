import psycopg2
from psycopg2 import sql
import json
import os
from psycopg2.extras import Json

# CONNECT TO POSTGRES DATABASE
connection = psycopg2.connect(
    dbname="scamwise",
    user="postgres",
    password='password',
    host="localhost",
    port="5432",
    # sslmode="require"
)

print(connection)
cursor = connection.cursor()

# Create Users table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS "user" (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expiry TIMESTAMPTZ,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMPTZ,
    fullName VARCHAR(100),
    about TEXT,
    profilePicturePath VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    saved_articles INT[] DEFAULT '{}',
    saved_quizzes INT[] DEFAULT '{}',
    spotter_xp INT DEFAULT 0,
    quiz_xp INT DEFAULT 0,
    activity_streak INT DEFAULT 0,
    daily_streak_checker BOOLEAN DEFAULT FALSE,
    num_quizzes INT DEFAULT 0,
    first_time_login BOOLEAN DEFAULT TRUE
    );
""")
print("Users table created successfully.")

# Clear the table
# cursor.execute("DELETE FROM \"user\"")
print("Users table cleared successfully.")

########################################################################################################

################################################ SIMULATION EMAIL ####################################
# Create SimulationEmail table
cursor.execute("""
   CREATE TABLE IF NOT EXISTS "simulation_email" (
    email_id SERIAL PRIMARY KEY,
    is_scam BOOLEAN NOT NULL,
    email_content JSON NOT NULL,
    email_header JSON NOT NULL,
    email_auth JSON NOT NULL,
    persona JSON NOT NULL,
    scam_indicators VARCHAR(255)[],
    check_indicators VARCHAR(255)[],
    is_user_created BOOLEAN NOT NULL,
    average_rating INT,
    logo_src VARCHAR(255),
    explanations JSONB NOT NULL
);
""")
print("SimulationEmail table created successfully.")

# Clear the table
cursor.execute("DELETE FROM \"simulation_email\"")
print("SimulationEmail table cleared successfully.")

########################################################################################################

################################################ SPOTTER SESSION ####################################
# Create SpotterSession table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS "spotter_session" (
    session_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    session_type VARCHAR(50) NOT NULL,
    emails INT[] NOT NULL,
    time_taken INT NOT NULL,
    total_points INT NOT NULL,
    is_active BOOLEAN NOT NULL,
    active_email INT,
    time_created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
""")
print("SpotterSession table created successfully.")

# Clear the table
# cursor.execute("DELETE FROM \"spotter_session\"")
print("SpotterSession table cleared successfully.")
########################################################################################################
################################################ QUIZZES & QUESTIONS ####################################
# Create Quiz table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS "quiz" (
    quiz_id SERIAL PRIMARY KEY,
    created_by_user_id INT NOT NULL,
    is_user_created BOOLEAN NOT NULL,
    created_date DATE NOT NULL,
    topic VARCHAR(255) NOT NULL,
    subtopic VARCHAR(255),
    difficulty VARCHAR(50),
    quiz_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    has_been_attempted BOOLEAN DEFAULT FALSE,
    has_been_rated BOOLEAN DEFAULT FALSE,
    average_rating INT DEFAULT 0,
    total_attempts INT DEFAULT 0,
    xp INT DEFAULT 0
    );
""")
print("Quiz table created successfully.")

# Clear the table
cursor.execute("DELETE FROM \"quiz\"")
print("Quiz table cleared successfully.")

# Create Questions table

cursor.execute("""
    CREATE TABLE IF NOT EXISTS "question" (
    question_id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL,
    question TEXT NOT NULL,
    choices JSON NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    hint TEXT,
    correct_feedback TEXT,
    wrong_feedback TEXT
    );
""")
print("Questions table created successfully.")

# Clear the table
cursor.execute("DELETE FROM \"question\"")
print("Questions table cleared successfully.")

########################################################################################################

################################################ QUIZ SESSION ##########################################

# Create QuizSession table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS "quiz_session" (
    session_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    time_taken INT NOT NULL,
    topic VARCHAR(255) NOT NULL,
    subtopic VARCHAR(255) NOT NULL,
    user_answers JSON NOT NULL,
    number_correct INT NOT NULL,
    session_xp INT NOT NULL,
    time_created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
""")

print("QuizSession table created successfully.")

# Clear the table
# cursor.execute("DELETE FROM \"quiz_session\"")
print("QuizSession table cleared successfully.")
########################################################################################################
################################################ BADGES ################################################

# Create Badges table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS "badge" (
    badge_id SERIAL PRIMARY KEY,
    badge_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    badge_type VARCHAR(100) NOT NULL,
    tier VARCHAR(50) NOT NULL,
    threshold INT NOT NULL,
    icon VARCHAR(255) NOT NULL
    );
""")
print("Badges table created successfully.")

# Clear the table
cursor.execute("DELETE FROM \"badge\"")
print("Badges table cleared successfully.")

########################################################################################################

############################################ EMAIL_RECORDS ############################################

# Create Email Records table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS email_records (
            user_id INTEGER NOT NULL REFERENCES "user"(user_id),
            record_date DATE NOT NULL,
            emails_scanned INTEGER DEFAULT 0,
            phishing_emails INTEGER DEFAULT 0,
            UNIQUE (user_id, record_date)
        );
""")
print("Email Records table created successfully.")

# Clear the table
cursor.execute("DELETE FROM email_records")
print("Email Records table cleared successfully.")

########################################################################################################

############################################ SUSPICIOUS_EMAILS ############################################

# Create Suspicious emails table
cursor.execute("""
            CREATE TABLE IF NOT EXISTS suspicious_emails (
            email_id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES "user"(user_id),
            scanned_at TIMESTAMPTZ DEFAULT NOW(),
            score INTEGER NOT NULL,
            layer TEXT NOT NULL CHECK (layer IN ('layer_1', 'layer_2')),
            sender TEXT,
            subject TEXT,
            body TEXT,
            hyperlinks TEXT[],
            analysis_summary TEXT
        );
""")
print("Suspicious Emails table created successfully.")

# Clear the table
cursor.execute("DELETE FROM suspicious_emails")
print("Suspicious Emails table cleared successfully.")

########################################################################################################

############################################ NEWS ARTICLES ############################################

# Create NewsArticles table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS "news_articles" (
    news_id SERIAL PRIMARY KEY,
    topic_category VARCHAR(1000) NOT NULL,
    date VARCHAR(1000) NOT NULL,
    title VARCHAR(1000) NOT NULL,
    content_summary VARCHAR(1000) NOT NULL,
    url_path VARCHAR(1000) NOT NULL
    );
""")
print("NewsArticles table created successfully.")

# Clear the table
cursor.execute("DELETE FROM \"news_articles\"")
print("NewsArticles table cleared successfully.")

########################################################################################################

connection.commit()
############################################ POPULATE DATABASE ########################################

# Add Simulation Emails from mock data
mock_emails = './db_setup/mock_data/emails.json'

with open(mock_emails, encoding="utf-8") as json_file:
    mock_email_db = json.load(json_file)

for email_data in mock_email_db:
    try:
        cursor.execute("""
        INSERT INTO simulation_email (
            is_scam, email_content, email_header, email_auth, persona, 
            scam_indicators, check_indicators, is_user_created, average_rating, logo_src, explanations
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
        """, (
            email_data["is_scam"],
            json.dumps(email_data["email_content"]),  # JSON fields
            json.dumps(email_data["email_header"]),
            json.dumps(email_data["email_auth"]),
            json.dumps(email_data["persona"]),
            email_data["scam_indicators"] or [],  # Array fields
            email_data["check_indicators"] or [],  # Array fields
            email_data["is_user_created"],
            email_data["average_rating"],
            email_data["logo_src"],
            Json(email_data["explanations"])
        ))

        print(f"Successfully inserted email with ID: {email_data.get('email_header', {}).get('id', 'Unknown')}")

    except Exception as e:
        print(f"Error inserting email with ID: {email_data.get('email_header', {}).get('id', 'Unknown')}. Error: {e}")

print("Simulation Emails added successfully.")

# Add Quizzes and Questions from mock data
mock_quizzes = './db_setup/mock_data/quiz.json'
with open(mock_quizzes, encoding="utf-8") as json_file:
    mock_quiz_db = json.load(json_file)

for quiz_data in mock_quiz_db:
    cursor.execute("""INSERT INTO quiz (created_by_user_id, is_user_created, created_date, topic, subtopic, difficulty, quiz_name, status, has_been_attempted, has_been_rated, average_rating, total_attempts, xp)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""", (quiz_data["createdByUserId"], quiz_data["isUserCreated"], quiz_data["createdDate"], quiz_data["topic"], quiz_data["subtopic"], quiz_data["difficulty"], quiz_data["quizName"], quiz_data["status"], quiz_data["hasBeenAttempted"], quiz_data["hasBeenRated"], quiz_data["averageRating"], quiz_data["totalAttempts"], quiz_data["xp"]))

    for question_data in quiz_data["questions"]:
        
        # Get the quiz_id of the quiz that was just added
        cursor.execute("SELECT quiz_id FROM quiz ORDER BY quiz_id DESC LIMIT 1")
        quiz_id = cursor.fetchone()[0]
        cursor.execute("""INSERT INTO question (quiz_id, question, choices, correct_answer, hint, correct_feedback, wrong_feedback)
        VALUES (%s, %s, %s, %s, %s, %s, %s)""", (quiz_id, question_data["question"], json.dumps(question_data["choices"]), question_data["correctAnswer"], question_data["hint"], question_data["correctFeedback"], question_data["wrongFeedback"]))
print("Quizzes and Questions added successfully.")


# Add Badges from mock data
mock_badges = './db_setup/mock_data/badge.json'
with open(mock_badges, encoding="utf-8") as json_file:
    mock_badge_db = json.load(json_file)

for badge_data in mock_badge_db:
    cursor.execute("""INSERT INTO badge (badge_code, name, description, badge_type, tier, threshold, icon)
    VALUES (%s, %s, %s, %s, %s, %s, %s)""", (badge_data["badgeCode"], badge_data["name"], badge_data["description"], badge_data["badge_type"], badge_data["tier"], badge_data["threshold"], badge_data["icon"]))
print("Badges added successfully.")

# Add News Articles from mock data
mock_news_article = './db_setup/mock_data/news_articles.json'
with open(mock_news_article, encoding="utf-8") as json_file:
    news_articles = json.load(json_file)

for article in news_articles:
    cursor.execute("""
        INSERT INTO news_articles (topic_category, date, title, content_summary, url_path)
        VALUES (%s, %s, %s, %s, %s)
        """, (article["topicCategory"], article["date"], article["title"], article["contentSummary"], article["urlPath"]))
print("News Articles added successfully.")


# Add email_records
mock_email_records = './db_setup/mock_data/email_records.json'
with open(mock_email_records, encoding="utf-8") as json_file:
    email_records = json.load(json_file)

for record in email_records:
    cursor.execute("""
        INSERT INTO email_records (user_id, record_date, emails_scanned, phishing_emails)
        VALUES (%s, %s, %s, %s)
        """, (record["user_id"], record["record_date"], record["emails_scanned"], record["phishing_emails"]))
print("Email Records added successfully.")

# Close the cursor and connection
connection.commit()
cursor.close()
connection.close()

