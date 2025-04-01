from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime


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

# Define the Question model
class Question(db.Model):
    __tablename__ = 'question'

    question_id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, nullable=False)
    question = db.Column(db.String, nullable=False)
    choices = db.Column(db.JSON, nullable=False)
    correct_answer = db.Column(db.String, nullable=False)
    hint = db.Column(db.String)
    correct_feedback = db.Column(db.String)
    wrong_feedback = db.Column(db.String)

    def __init__(self, quiz_id, question, choices, correct_answer, hint, correct_feedback, wrong_feedback):
        self.quiz_id = quiz_id
        self.question = question
        self.choices = choices
        self.correct_answer = correct_answer
        self.hint = hint
        self.correct_feedback = correct_feedback
        self.wrong_feedback = wrong_feedback

@app.route('/get_quiz_questions/<int:quizId>', methods=['GET'])
def get_quiz_questions(quizId):

    # Get all questions for a specific quiz
    quiz_questions = Question.query.filter_by(quiz_id=quizId).all()

    quiz_questions_list = [
        {
            "questionId": question.question_id,
            "quizId": question.quiz_id,
            "question": question.question,
            "choices": question.choices,
            "correctAnswer": question.correct_answer,
            "hint": question.hint,
            "correctFeedback": question.correct_feedback,
            "wrongFeedback": question.wrong_feedback
        }
        for question in quiz_questions
    ]

    return jsonify(quiz_questions_list)


# Route to add questions to the database
@app.route('/add_question', methods=['POST'])
def add_question():
    data = request.get_json()
    quizId = data['quizId']
    question = data['question']
    choices = data['choices']
    correctAnswer = data['correctAnswer']
    hint = data['hint']
    if hint == "": hint = "No hint available"
    correctFeedback = data['correctFeedback']
    wrongFeedback = data['wrongFeedback']

    new_question = Question(quiz_id=quizId, question=question, choices=choices, correct_answer=correctAnswer, hint=hint, correct_feedback=correctFeedback, wrong_feedback=wrongFeedback)
    db.session.add(new_question)
    db.session.commit()

    return jsonify({"message": "Question added successfully"})

# Route to update a question in the database
@app.route('/update_question', methods=['PUT'])
def update_question():
    data = request.get_json()
    questionId = data['questionId']
    question = data['question']
    choices = data['choices']
    correctAnswer = data['correctAnswer']
    hint = data['hint']
    if hint == "": hint = "No hint available"
    correctFeedback = data['correctFeedback']
    wrongFeedback = data['wrongFeedback']

    question_to_update = Question.query.filter_by(question_id=questionId).first()
    question_to_update.question = question
    question_to_update.choices = choices
    question_to_update.correct_answer = correctAnswer
    question_to_update.hint = hint
    question_to_update.correct_feedback = correctFeedback
    question_to_update.wrong_feedback = wrongFeedback
    db.session.commit()

    return jsonify({"message": "Question updated successfully"})


# Route to delete a question from the database
@app.route('/delete_questions/<int:quizId>', methods=['DELETE'])
def delete_questions(quizId):
    
    # Get all questions for a specific quiz
    quiz_questions = Question.query.filter_by(quiz_id=quizId).all()

    # Delete all questions for a specific quiz
    for question in quiz_questions:
        db.session.delete(question)
        db.session.commit()

    return jsonify({"message": "Questions deleted successfully"})


if __name__ == '__main__':
    app.run(debug=True, port=5005)