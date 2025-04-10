from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from apscheduler.schedulers.background import BackgroundScheduler
import random
from datetime import datetime
import re
import requests
import ast
from openai import OpenAI

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

# OpenAI API Key
client = OpenAI(api_key="XXX")

# Define the Quiz model
class Quiz(db.Model):
    __tablename__ = 'quiz'

    quiz_id = db.Column(db.Integer, primary_key=True)
    created_by_user_id = db.Column(db.Integer, nullable=False)
    is_user_created = db.Column(db.Boolean, nullable=False)
    created_date = db.Column(db.Date, nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    subtopic = db.Column(db.String(255))
    difficulty = db.Column(db.String(50))
    quiz_name = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    has_been_attempted = db.Column(db.Boolean, default=False)
    has_been_rated = db.Column(db.Boolean, default=False)
    average_rating = db.Column(db.Integer, default=0)
    total_attempts = db.Column(db.Integer, default=0)
    xp = db.Column(db.Integer, default=0)

    def __init__(self, created_by_user_id, is_user_created, created_date, topic, subtopic, difficulty, quiz_name, status, has_been_attempted, has_been_rated, average_rating, total_attempts, xp):
        self.created_by_user_id = created_by_user_id
        self.is_user_created = is_user_created
        self.created_date = created_date
        self.topic = topic
        self.subtopic = subtopic
        self.difficulty = difficulty
        self.quiz_name = quiz_name
        self.status = status
        self.has_been_attempted = has_been_attempted
        self.has_been_rated = has_been_rated
        self.average_rating = average_rating
        self.total_attempts = total_attempts
        self.xp = xp

# Route to get Quiz Details
@app.route('/get_quiz_details/<int:quizId>', methods=['GET'])
def get_quiz_details(quizId):
    
    # Find Quiz by ID
    quiz = Quiz.query.filter_by(quiz_id=quizId).first()

    quiz_details = {
        "quizId": quiz.quiz_id,
        "createdByUserId": quiz.created_by_user_id,
        "isUserCreated": quiz.is_user_created,
        "createdDate": quiz.created_date.strftime("%Y-%m-%d"),
        "topic": quiz.topic,
        "subtopic": quiz.subtopic,
        "difficulty": quiz.difficulty,
        "quizName": quiz.quiz_name,
        "status": quiz.status,
        "hasBeenAttempted": quiz.has_been_attempted,
        "hasBeenRated": quiz.has_been_rated,
        "averageRating": quiz.average_rating,
        "totalAttempts": quiz.total_attempts,
        "xp": quiz.xp,
    }

    return jsonify(quiz_details)
    
# Get all quizzes from the database that are not usercreated
@app.route('/get_custom_quizzes_details', methods=['GET'])
def get_custom_quizzes_details():

    # Find Quizzes not made by User - Extract Quizzes where is_user_created == False & status == 'accepted
    quizzes = Quiz.query.filter_by(is_user_created=False, status='accepted').all()

    result = [
        {
            "quizId": quiz.quiz_id,
            "quizName": quiz.quiz_name,
            "topic": quiz.topic,
            "subtopic": quiz.subtopic,
            "difficulty": quiz.difficulty,
            "xp": quiz.xp,
            "totalAttempts": quiz.total_attempts,
            "averageRating": quiz.average_rating,
            "hasbeenAttempted": quiz.has_been_attempted,
            "hasBeenRated": quiz.has_been_rated,
            "status": quiz.status,
        }
        for quiz in quizzes
    ]

    quiz_dictionary = {}
    
    # Get all main topics
    for quiz in result:
        if quiz["topic"] not in quiz_dictionary:
            quiz_dictionary[quiz["topic"]] = {}
        
        if quiz["subtopic"] not in quiz_dictionary[quiz["topic"]]:
            quiz_dictionary[quiz["topic"]][quiz["subtopic"]] = []

        quiz_dictionary[quiz["topic"]][quiz["subtopic"]].append(quiz)

    return_array = []

    # loop through the dictionary
    for key, value in quiz_dictionary.items():
        new_quiz_object = {}
        new_quiz_object["mainTopic"] = key

        new_quiz_object["subTopicList"] = []

        subtopics = value

        subtopic_temp_object = {}
        for key2, value2 in subtopics.items():
            subtopic_temp_object["subTopic"] = key2
            subtopic_temp_object["quizzes"] = value2
            new_quiz_object["subTopicList"].append(subtopic_temp_object)
            subtopic_temp_object = {}

        return_array.append(new_quiz_object)

    return jsonify(return_array)

# Get all quizzes from the database that are usercreated
@app.route('/get_user_quizzes_details', methods=['GET'])
def get_user_quizzes_details():
    
    # Find Quizzes made by User - Extract Quizzes where is_user_created == True and status == 'accepted'
    quizzes = Quiz.query.filter_by(is_user_created=True, status='accepted').all()

    result = [
        {
            "quizId": quiz.quiz_id,
            "quizName": quiz.quiz_name,
            "topic": quiz.topic,
            "subtopic": quiz.subtopic,
            "difficulty": quiz.difficulty,
            "xp": quiz.xp,
            "totalAttempts": quiz.total_attempts,
            "averageRating": quiz.average_rating,
            "createdByUserId": quiz.created_by_user_id,
        }
        for quiz in quizzes
    ]

    quiz_dictionary = {}
    
    # Get all main topics
    for quiz in result:
        if quiz["topic"] not in quiz_dictionary:
            quiz_dictionary[quiz["topic"]] = {}
        
        if quiz["subtopic"] not in quiz_dictionary[quiz["topic"]]:
            quiz_dictionary[quiz["topic"]][quiz["subtopic"]] = []

        quiz_dictionary[quiz["topic"]][quiz["subtopic"]].append(quiz)

    return_array = []

    # loop through the dictionary
    for key, value in quiz_dictionary.items():
        new_quiz_object = {}
        new_quiz_object["mainTopic"] = key

        new_quiz_object["subTopicList"] = []

        subtopics = value

        subtopic_temp_object = {}
        for key2, value2 in subtopics.items():
            subtopic_temp_object["subTopic"] = key2
            subtopic_temp_object["quizzes"] = value2
            new_quiz_object["subTopicList"].append(subtopic_temp_object)
            subtopic_temp_object = {}

        return_array.append(new_quiz_object)

    return jsonify(return_array)

# Find Quizzes made by User of ID
@app.route('/get_user_quizzes/<int:userId>', methods=['GET'])
def get_user_quizzes(userId):

    user_quizzes = Quiz.query.filter_by(created_by_user_id=userId).all()

    result = [
        {
            "quizId": quiz.quiz_id,
            "quizName": quiz.quiz_name,
            "topic": quiz.topic,
            "subtopic": quiz.subtopic,
            "difficulty": quiz.difficulty,
            "status": quiz.status,
            "hasBeenAttempted": quiz.has_been_attempted,
            "hasBeenRated": quiz.has_been_rated,
            "averageRating": quiz.average_rating,
            "totalAttempts": quiz.total_attempts,
            "createdDate": quiz.created_date.strftime("%Y-%m-%d"),
            "xp": quiz.xp,
        }
        for quiz in user_quizzes
    ]

    # If no quizzes are found, return an empty array
    if not result:
        result = []

    return jsonify(result)

############################################ CREATING CUSTOM QUIZ ROUTES ############################################
# Route to get all main topics and subtopics
@app.route('/get_topics', methods=['GET'])
def get_topics():

    # GET all main topics from quizzes in the database regardless of user created or not, but only accepted quizzes
    quizzes = Quiz.query.filter_by(status='accepted').all()

    # Make an object of all main topics and their subtopics
    topics = {}
    for quiz in quizzes:
        if quiz.topic not in topics:
            topics[quiz.topic] = []
        if quiz.subtopic not in topics[quiz.topic]:
            topics[quiz.topic].append(quiz.subtopic)

    return jsonify(topics)


# route to add quiz to database
@app.route('/add_quiz', methods=['POST'])
def add_quiz():
    
    # Get data from request
    data = request.get_json()

    # Extract quiz details
    user_id = data["user_id"]
    main_topic = data["main_topic"]
    sub_topic = data["sub_topic"]
    difficulty = data["difficulty"]
    quiz_name = data["quiz_name"]
    questions = data["questions"]

    # XP Calculation - Beginner: 25 XP, Intermediate: 50 XP, Advanced: 75 XP
    xp = 0
    if difficulty == 'Beginner':
        xp = 25
    elif difficulty == 'Intermediate':
        xp = 50
    elif difficulty == 'Advanced':
        xp = 75

    # Add the quiz to the database
    new_quiz = Quiz(
        created_by_user_id=user_id,
        is_user_created=True,
        created_date=datetime.now(),
        topic=main_topic,
        subtopic=sub_topic,
        difficulty=difficulty,
        quiz_name=quiz_name,
        status="pending",
        has_been_attempted=False,
        has_been_rated=False,
        average_rating=0,
        total_attempts=0,
        xp=xp,
    )

    db.session.add(new_quiz)
    db.session.commit()

    print(new_quiz)


    for question in questions:
        
        add_question_endpoint = f"http://172.31.35.32:5005/add_question"

        question_payload = {
            "quizId": new_quiz.quiz_id,
            "question": question["question"],
            "choices": question["choices"],
            "correctAnswer": question["correctAnswer"],
            "hint": question["hint"],
            "correctFeedback": question["correctFeedback"],
            "wrongFeedback": question["wrongFeedback"]
        }

        response = requests.post(add_question_endpoint, json=question_payload)

    return jsonify({"message": "Quiz added successfully!"})


# Route to edit quiz in database
@app.route('/edit_quiz', methods=['PUT'])
def edit_quiz():

    # Get data from request
    data = request.get_json()
    
    # Extract quiz details
    quiz_id = data["quiz_id"]
    main_topic = data["main_topic"]
    sub_topic = data["sub_topic"]
    difficulty = data["difficulty"]
    quiz_name = data["quiz_name"]
    questions = data["questions"]

    print(quiz_id)

    # Update the quiz in the database
    quiz = Quiz.query.filter_by(quiz_id=quiz_id).first()
    quiz.topic = main_topic
    quiz.subtopic = sub_topic
    quiz.difficulty = difficulty
    quiz.quiz_name = quiz_name

    db.session.commit()

    # Update the questions for the quiz in the database
    for question in questions:
        
        print(question)

        edit_question_endpoint = f"http://172.31.35.32:5005/update_question"

        question_payload = {
            "quizId": quiz_id,
            "questionId": question["question_id"],
            "question": question["question"],
            "choices": question["choices"],
            "correctAnswer": question["correctAnswer"],
            "hint": question["hint"],
            "correctFeedback": question["correctFeedback"],
            "wrongFeedback": question["wrongFeedback"]
        }

        response = requests.put(edit_question_endpoint, json=question_payload)

    return jsonify({"message": "Quiz edited successfully!"})

# Route to delete quiz from database
@app.route('/delete_quiz/<int:quizId>', methods=['DELETE'])
def delete_quiz(quizId):
    
    # Find Quiz by ID
    quiz = Quiz.query.filter_by(quiz_id=quizId).first()

    # Delete all questions associated with the quiz
    delete_questions_endpoint = f"http://172.31.35.32:5005/delete_questions/{quizId}"
    response = requests.delete(delete_questions_endpoint)

    # Clear all users saved_quizzes that have the quiz_id
    clear_saved_quizzes_endpoint = f"http://172.31.35.32:5002/clear_deleted_quiz"
    payload = {
        "quizId": quizId
    }
    response = requests.post(clear_saved_quizzes_endpoint, json=payload)

    # Delete all quiz_sessions that have the quiz_id
    delete_quiz_sessions_endpoint = f"http://172.31.35.32:5006/delete_quiz_sessions/{quizId}"
    response = requests.delete(delete_quiz_sessions_endpoint)

    # Delete Quiz
    db.session.delete(quiz)
    db.session.commit()

    return jsonify({"message": "Quiz deleted successfully!"})

############################################ DAILY QUIZ ############################################

def get_topics_for_daily_quiz():
    
    # GET all main topics from quizzes in the database, regardless of user created or not, but status is accepted
    quizzes = Quiz.query.filter_by(status='accepted').all()

    # Make an array of all main topics
    main_topics = []
    for quiz in quizzes:
        if quiz.topic not in main_topics:
            main_topics.append(quiz.topic)
    
    main_topics.append('New')

    # Randomly select a main topic
    # random_main_topic = random.choice(main_topics)
    random_main_topic = 'New'

    # If the main topic is 'New', generate a new quiz with GPT API
    if random_main_topic == 'New':
        # Generate a quiz with a new main topic and sub topic

        print("Getting new main topic and sub topic")

        prompt = f"""
            Generate a main topic, a sub topic and of the main topic, and a quiz name to be created for focusing on scam prevention, in particular email scam prevention, and safe online practices. The current main topics are: {main_topics[:-1]}. The main topic should not revolve around identifying tells in a scam email or website, but rather on how to prevent scams and safe online practices.

            Generate your response in this format: 

            main_topic: New Main Topic
            sub_topic: New Sub Topic
            quiz_name: New Quiz Name

            Skip the pleasantries and just give the response directly as per the format above.

        """

        # Generate main topic and sub topic with GPT API
        response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": "You are an AI assistant that generates quizzes which focuses on scam prevention, in particular email scam prevention, and safe online practices. "},
                        {"role": "user", "content": prompt}]
        )

        topics = response.choices[0].message.content
        main_topic = topics.split('\n')[0].split(': ')[1]
        sub_topic = topics.split('\n')[1].split(': ')[1]
        quiz_name = topics.split('\n')[2].split(': ')[1]

    # Else, randomly select a subtopic from the main topic
    else:
        # Get all subtopics for the main topic
        subtopics = Quiz.query.filter_by(topic=random_main_topic).all()

        # Make an array of all subtopics
        subtopic_list = []
        for subtopic in subtopics:
            if subtopic.subtopic not in subtopic_list:
                subtopic_list.append(subtopic.subtopic)
        
        subtopic_list.append('New')

        # Randomly select a subtopic
        random_subtopic = random.choice(subtopic_list)

        # If the subtopic is 'New', generate a new quiz with GPT API

        if random_subtopic == 'New':

            print("Getting new sub topic")

            prompt = f"""
            
                Generate a sub topic for the main topic, {random_main_topic}, and a quiz name for a quiz to be generated focusing on scam prevention, in particular email scam prevention, and safe online practices. The current sub-topics for this main topic are: {subtopic_list[:-1]}. The main topic should not revolve around identifying tells in a scam email or website, but rather on how to prevent scams and safe online practices.

                Generate your response in this format:

                main_topic: {random_main_topic}
                sub_topic: New Sub Topic
                quiz_name: New Quiz Name

                Skip the pleasantries and just give the response directly as per the format above.
                
            """

            # Generate main topic and sub topic with GPT API
            response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "system", "content": "You are an AI assistant that generates quizzes which focuses on scam prevention, in particular email scam prevention, and safe online practices."},
                            {"role": "user", "content": prompt}]
            )

            topics = response.choices[0].message.content
            main_topic = topics.split('\n')[0].split(': ')[1]
            sub_topic = topics.split('\n')[1].split(': ')[1]
            quiz_name = topics.split('\n')[2].split(': ')[1]

        # Else, randomly select a quiz from the subtopic
        else:

            print("Using existing main topic and sub topic")

            main_topic = random_main_topic
            sub_topic = random_subtopic

    print("Main Topic: ", main_topic)
    print("Sub Topic: ", sub_topic)
    print("Quiz Name: ", quiz_name)

    return {
        "main_topic": main_topic.strip("\"").strip(),
        "sub_topic": sub_topic.strip("\"").strip(),
        "quiz_name": quiz_name.strip("\"").strip()
    }

def generate_daily_quiz():

    with app.app_context():

        # Get main topic and sub topic for daily quiz
        topics = get_topics_for_daily_quiz()
        main_topic = topics["main_topic"]
        sub_topic = topics["sub_topic"]
        quiz_name = topics["quiz_name"]


        # Generate Random difficulty level
        difficulty_levels = ['Beginner', 'Intermediate', 'Advanced']
        random_difficulty = random.choice(difficulty_levels)

        question_format = """
        Question 1:
        {
            "questionId": 1,
            "question" "What is a phishing scam?",
            "choices": {
                "a": "A type of fishing competition",
                "b": "A type of online scam that uses deceptive emails",
                "c": "A type of social media platform",
                "d": "A type of online shopping website"
            },
            "correctAnswer": "b",
            "hint": "Phishing scams use deceptive emails to trick individuals into revealing personal information.",
            "correctFeedback": "Correct! Phishing scams use deceptive emails to trick individuals into revealing personal information.",
            "wrongFeedback": "Incorrect. Phishing scams are a type of online scam that uses deceptive emails."
        }

        Question 2:
        {
            "questionId": 2,
            "question" "What is a potential risk of interacting with a website with a fake certificate?",
            "choices": {
                "a": "Enhanced security and protection from online threats",
                "b": "Data interception, malware installation, and security vulnerabilities",
                "c": "Improved browsing experience and faster internet speeds",
                "d": "Protection from phishing attacks and unauthorized access"
            },
            "correctAnswer": "b",
            "hint": "Fake certificates can compromise your data and online security.",
            "correctFeedback": "Correct! Fake certificates can lead to data interception and other security risks.",
            "wrongFeedback": "Incorrect. Fake certificates pose significant risks to your online security."
        }

        And so on for the remaining questions.

        Skip the pleasantries and just give the response directly as per the format above.

        """

        # Generate questions for the daily quiz

        prompt = " Given the main topic: " + main_topic + " and its sub topic: " + sub_topic + " , the quiz name: " + quiz_name + " and the difficulty level: " + random_difficulty + " , generate 4 multiple choice questions for a quiz focusing on the main topic and sub topic, and should be adjusted to the difficulty level. \n\n For each questions, generate the question, 4 choices, the correct answer, a hint, correct feedback, and wrong feedback. \n\n Generate the questions in this format: \n\n" + question_format + "\n\n Skip the pleasantries and just give the response directly as per the format above."

        response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": "You are an AI assistant that generates quizzes which focuses on scam prevention, in particular email scam prevention, and safe online practices."},
                        {"role": "user", "content": prompt}]
        )
        
        questions_raw = response.choices[0].message.content
        print(questions_raw)

        # Extract the JSON portion of the response
        json_strings = re.findall(r'\{[^{}]+(?:\{[^{}]+\}[^{}]*)*\}', questions_raw)

        print(json_strings)

        # Convert to JSON format
        questions_list = [ast.literal_eval(q) for q in json_strings]

        # XP Calculation - Beginner: 25 XP, Intermediate: 50 XP, Advanced: 75 XP
        xp = 0
        if random_difficulty == 'Beginner':
            xp = 25
        elif random_difficulty == 'Intermediate':
            xp = 50
        elif random_difficulty == 'Advanced':
            xp = 75

        # Add the quiz to the database
        new_quiz = Quiz(
            created_by_user_id=0,
            is_user_created=False,
            created_date=datetime.now(),
            topic=main_topic,
            subtopic=sub_topic,
            difficulty=random_difficulty,
            quiz_name="Daily Quiz #" + str(len(Quiz.query.all()) + 1) + " - " + quiz_name,
            status="accepted",
            has_been_attempted=False,
            has_been_rated=False,
            average_rating=0,
            total_attempts=0,
            xp=xp
        )

        db.session.add(new_quiz)
        # db.session.flush()
        db.session.commit()

        for question in questions_list:

            add_question_endpoint = f"http://172.31.35.32:5005/add_question"

            question_payload = {
                "quizId": new_quiz.quiz_id,
                "question": question["question"],
                "choices": question["choices"],
                "correctAnswer": question["correctAnswer"],
                "hint": question["hint"],
                "correctFeedback": question["correctFeedback"],
                "wrongFeedback": question["wrongFeedback"]
            }

            response = requests.post(add_question_endpoint, json=question_payload)

        # Return the generated quiz
        return {
            "main_topic": main_topic,
            "sub_topic": sub_topic,
            "quiz_name": "Daily Quiz #" + str(len(Quiz.query.all()) + 1) + " - " + quiz_name,
            "difficulty": random_difficulty,
            "questions": questions_list,
            "json_strings": json_strings
        }

# Route to mock generate daily quiz - For Testing Purposes
@app.route('/generate_daily_quiz_mock', methods=['GET'])
def generate_daily_quiz_mock():
    
    quiz_details = generate_daily_quiz()

    return jsonify(quiz_details)

# Generate Daily Quiz
@app.route('/get_daily_quiz', methods=['GET'])
def get_daily_quiz():

    print("Retrieving Daily Quiz")

    # Find Daily Quiz: Get the latest quiz added to the database which has 'Daily Quiz' in its name
    daily_quiz = Quiz.query.filter(Quiz.quiz_name.like('%Daily Quiz%'))

    # Select the latest quiz
    daily_quiz = daily_quiz.order_by(Quiz.quiz_id.desc()).first()

    # Get main topic, sub topic, difficulty level, quiz_name, quiz_id
    main_topic = daily_quiz.topic
    sub_topic = daily_quiz.subtopic
    difficulty = daily_quiz.difficulty
    quiz_name = daily_quiz.quiz_name
    quiz_id = daily_quiz.quiz_id

    # Get all questions for the daily quiz
    endpoint = f"http://172.31.35.32:5005/get_quiz_questions/{quiz_id}"
    response = requests.get(endpoint)
    quiz_questions = response.json()

    questions = []
    for question in quiz_questions:
        curr_question = {
            "questionId": question["questionId"],
            "question": question["question"],
            "choices": question["choices"],
            "correctAnswer": question["correctAnswer"],
            "hint": question["hint"],
            "correctFeedback": question["correctFeedback"],
            "wrongFeedback": question["wrongFeedback"]
        }

        questions.append(curr_question)


    quiz_details = {
        "main_topic": main_topic,
        "sub_topic": sub_topic,
        "difficulty": difficulty,
        "quiz_name": quiz_name,
        "questions": questions,
        "quiz_id": quiz_id
    }
    
    return jsonify(quiz_details)


# Route to get the details of daily quizzes
@app.route('/get_daily_quiz_details', methods=['GET'])
def get_daily_quiz_details():

    # Find Daily Quizzes: Get all quizzes added to the database which have 'Daily Quiz' in their name
    daily_quizzes = Quiz.query.filter(Quiz.quiz_name.like('%Daily Quiz%')).all()

    result = [
        {
            "quizId": quiz.quiz_id,
            "quizName": quiz.quiz_name,
            "topic": quiz.topic,
            "subtopic": quiz.subtopic,
            "difficulty": quiz.difficulty,
            "status": quiz.status,
            "hasBeenAttempted": quiz.has_been_attempted,
            "hasBeenRated": quiz.has_been_rated,
            "averageRating": quiz.average_rating,
            "totalAttempts": quiz.total_attempts,
            "numQuestions": len(quiz.questions),
            "createdDate": quiz.created_date.strftime("%Y-%m-%d"),
            "xp": quiz.xp
        }
        for quiz in daily_quizzes
    ]

    return jsonify(result)

############################################ QUIZ SESSION MANAGEMENT ############################################

# Route to handle quiz session creation
@app.route('/new_quiz_submit', methods=['POST'])
def new_quiz_session():
    data = request.get_json()
    user_id = data['user_id']
    quiz_id = data['quiz_id']
    time_taken = data['time_taken']
    user_answers = data['user_answers']
    topic = data['topic']
    subtopic = data['sub_topic']

    # Get the quiz details
    quiz = Quiz.query.filter_by(quiz_id=quiz_id).first()

    # Update the total attempts for the quiz & 
    quiz.total_attempts += 1
    db.session.commit()

    # Get questions for the quiz
    quiz_questions_endpoint = f"http://172.31.35.32:5005/get_quiz_questions/{quiz_id}"
    response = requests.get(quiz_questions_endpoint)
    quiz_questions = response.json()

    # Calculate the number of correct answers
    num_correct = 0
    for question in quiz_questions:
        question_id = question["questionId"]
        correct_answer = question["correctAnswer"]

        if user_answers[str(question_id)] == correct_answer:
            num_correct += 1

    print("Number of correct answers: ", num_correct)

    # Initiate QuizSession Creation
    session_creation_endpoint = f"http://172.31.35.32:5006/add_quiz_session"
    session_payload = {
        "user_id": user_id,
        "quiz_id": quiz_id,
        "time_taken": time_taken,
        "topic": topic,
        "subtopic": subtopic,
        "user_answers": user_answers,
        "num_correct": num_correct,
        "quizXP": quiz.xp
    }

    response = requests.post(session_creation_endpoint, json=session_payload)
    session_xp = response.json()["session_xp"]

    # Send quizXP to 172.31.35.32:5002/update_quiz_xp/<userId> with total_xp as the payload
    endpoint = f"http://172.31.35.32:5002/update_quiz_xp/{user_id}"
    payload = {
        "quizXP": session_xp
    }
    response = requests.post(endpoint, json=payload)
    print(response.json())

    return jsonify({"message": "Quiz session created successfully!"})


###################################################### QUIZ RECOMMENDATIONS ######################################################

from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
import random
import pandas as pd
import requests

# ROUTE TO GET RECOMMENDED QUIZZES FOR A USER -- FOR CUSTOM QUIZZES
@app.route('/get_recommended_quizzes_custom/<int:userId>', methods=['GET'])
def get_recommended_quizzes(userId):
    # Get all quizzes from the database and filter them
    quiz_db = Quiz.query.filter_by(is_user_created=False, status='accepted').all()
    quiz_db = [
        {
            "quiz_id": quiz.quiz_id,
            "created_by_user_id": quiz.created_by_user_id,
            "topic": quiz.topic,
            "subtopic": quiz.subtopic,
            "difficulty": quiz.difficulty,
            "quiz_name": quiz.quiz_name,
            "average_rating": quiz.average_rating,
            "xp": quiz.xp
        }
        for quiz in quiz_db
    ]

    if len(quiz_db) <= 2:
        return quiz_db

    # Get user quiz sessions
    quiz_sessions_endpoint = f"http://172.31.35.32:5006/get_user_quiz_sessions/{userId}"
    response = requests.get(quiz_sessions_endpoint)
    user_quiz_sessions = response.json()

    if not user_quiz_sessions:
        return random.sample(quiz_db, 2)

    attempted_quizzes = {(session["topic"], session["subtopic"]) for session in user_quiz_sessions}
    attempted_quiz_ids = {session["quiz_id"] for session in user_quiz_sessions}

    # Identify topics where the user did poorly (total_points == 0)
    poor_performance_topics = {
        session["topic"] for session in user_quiz_sessions if session["session_xp"] == 0
    }

    # Filter out quizzes the user has already attempted
    unattempted_quizzes = [quiz for quiz in quiz_db if quiz["quiz_id"] not in attempted_quiz_ids]

    if len(unattempted_quizzes) == 0:
        return random.sample(quiz_db, 2)

    # Create a DataFrame for unattempted quizzes
    unattempted_df = pd.DataFrame(unattempted_quizzes)

    # Combine features for vectorization (topic, subtopic, difficulty, XP, average rating)
    unattempted_df["features"] = unattempted_df["topic"] + " " + unattempted_df["subtopic"] + \
                                 unattempted_df["difficulty"].astype(str) + " " + \
                                 unattempted_df["xp"].astype(str) + " " + \
                                 unattempted_df["average_rating"].astype(str)

    # Vectorize the features
    vectorizer = TfidfVectorizer()
    quiz_features = vectorizer.fit_transform(unattempted_df["features"])

    # Calculate cosine similarity
    similarity_matrix = cosine_similarity(quiz_features)

    # Use Nearest Neighbors to find the top N similar quizzes
    knn = NearestNeighbors(n_neighbors=3, metric='cosine')
    knn.fit(similarity_matrix)
    distances, indices = knn.kneighbors()

    # Recommended quizzes list
    recommended_quizzes = []
    
    # Prioritize quizzes from topics where the user performed poorly
    for idx in indices[0]:
        quiz = unattempted_df.iloc[idx]
        if quiz["topic"] in poor_performance_topics and quiz.to_dict() not in recommended_quizzes:
            recommended_quizzes.append(quiz.to_dict())
        if len(recommended_quizzes) >= 2:
            break
    
    # If not enough quizzes are found, recommend quizzes from other topics
    if len(recommended_quizzes) < 2:
        for idx in indices[0]:
            quiz = unattempted_df.iloc[idx]
            if quiz.to_dict() not in recommended_quizzes:
                recommended_quizzes.append(quiz.to_dict())
            if len(recommended_quizzes) >= 2:
                break

    return recommended_quizzes

# ROUTE TO GET RECOMMENDED QUIZZES FOR A USER -- FOR USER CREATED QUIZZES
@app.route('/get_recommended_quizzes_community/<int:userId>', methods=['GET'])
def get_recommended_quizzes_user(userId):
    print("Getting recommended quizzes for user" + str(userId))
    
    # Get all user-created quizzes from the database
    quiz_db = Quiz.query.filter_by(is_user_created=True, status='accepted').all()
    quiz_db = [
        {
            "quiz_id": quiz.quiz_id,
            "created_by_user_id": quiz.created_by_user_id,
            "topic": quiz.topic,
            "subtopic": quiz.subtopic,
            "difficulty": quiz.difficulty,
            "quiz_name": quiz.quiz_name,
            "average_rating": quiz.average_rating,
            "xp": quiz.xp
        }
        for quiz in quiz_db
    ]
    
    if len(quiz_db) <= 2:
        return quiz_db
    
    # Get user quiz sessions
    quiz_sessions_endpoint = f"http://172.31.35.32:5006/get_user_quiz_sessions/{userId}"
    response = requests.get(quiz_sessions_endpoint)
    user_quiz_sessions = response.json()
    
    if not user_quiz_sessions:
        return random.sample(quiz_db, 2)
    
    # Identify quizzes attempted by the user
    attempted_quizzes = {(session["topic"], session["subtopic"]) for session in user_quiz_sessions}
    attempted_quiz_ids = {session["quiz_id"] for session in user_quiz_sessions}
    
    # Identify topics where the user performed poorly (total_points == 0)
    poor_performance_topics = {
        session["topic"] for session in user_quiz_sessions if session["session_xp"] == 0
    }
    
    # Filter out quizzes already attempted
    unattempted_quizzes = [quiz for quiz in quiz_db if quiz["quiz_id"] not in attempted_quiz_ids]
    
    if len(unattempted_quizzes) == 0:
        return random.sample(quiz_db, 2)
    
    # Create DataFrame for unattempted quizzes
    unattempted_df = pd.DataFrame(unattempted_quizzes)
    
    # Combine features for vectorization (topic, subtopic, difficulty, XP, average rating)
    unattempted_df["features"] = unattempted_df["topic"] + " " + unattempted_df["subtopic"] + " " + \
                                 unattempted_df["difficulty"].astype(str) + " " + \
                                 unattempted_df["xp"].astype(str) + " " + \
                                 unattempted_df["average_rating"].astype(str)
    
    # Vectorize features
    vectorizer = TfidfVectorizer()
    quiz_features = vectorizer.fit_transform(unattempted_df["features"])
    
    # KNN for recommendation
    knn = NearestNeighbors(n_neighbors=3, metric='cosine')
    knn.fit(quiz_features)
    distances, indices = knn.kneighbors()
    
    recommended_quizzes = []
    
    # Prioritize quizzes from poorly performed topics
    for idx in indices[0]:
        quiz = unattempted_df.iloc[idx]
        if quiz["topic"] in poor_performance_topics and quiz.to_dict() not in recommended_quizzes:
            recommended_quizzes.append(quiz.to_dict())
        if len(recommended_quizzes) >= 2:
            break
    
    # If not enough quizzes are found, recommend others
    if len(recommended_quizzes) < 2:
        for idx in indices[0]:
            quiz = unattempted_df.iloc[idx]
            if quiz.to_dict() not in recommended_quizzes:
                recommended_quizzes.append(quiz.to_dict())
            if len(recommended_quizzes) >= 2:
                break
    
    return recommended_quizzes



############################################# PENDING QUIZZES MANAGEMENT #############################################

# Route to get all pending quizzes
@app.route('/get_pending_quizzes', methods=['GET'])
def get_pending_quizzes():

    pending_quizzes = Quiz.query.filter_by(status='pending').all()
    
    result = [
        {
            "quizId": quiz.quiz_id,
            "quizName": quiz.quiz_name,
            "topic": quiz.topic,
            "subtopic": quiz.subtopic,
            "difficulty": quiz.difficulty,
            "status": quiz.status,
            "hasBeenAttempted": quiz.has_been_attempted,
            "hasBeenRated": quiz.has_been_rated,
            "averageRating": quiz.average_rating,
            "totalAttempts": quiz.total_attempts,
            "xp": quiz.xp,
        }
        for quiz in pending_quizzes
    ]

    return jsonify(result)

# Route to accept a pending quiz
@app.route('/accept_pending_quiz/<int:quizId>', methods=['PUT'])
def accept_pending_quiz(quizId):

    # Find Quiz by ID
    quiz = Quiz.query.filter_by(quiz_id=quizId).first()

    # Update the status of the quiz to 'accepted'
    quiz.status = 'accepted'
    db.session.commit()

    return jsonify({"message": "Quiz accepted successfully!"})

# Route to reject a pending quiz
@app.route('/reject_pending_quiz/<int:quizId>', methods=['PUT'])
def reject_pending_quiz(quizId):

    # Find Quiz by ID
    quiz = Quiz.query.filter_by(quiz_id=quizId).first()

    # Update the status of the quiz to 'rejected'
    quiz.status = 'rejected'
    db.session.commit()

    return jsonify({"message": "Quiz rejected successfully!"})


if __name__ == '__main__':    
    scheduler = BackgroundScheduler()
    scheduler.add_job(generate_daily_quiz, 'cron', hour=0, minute=0)
    scheduler.start()

    for job in scheduler.get_jobs():
        # To check when the job is scheduled to run next
        print(job)

    app.run(debug=True, port=5004, use_reloader=False, host="0.0.0.0")
