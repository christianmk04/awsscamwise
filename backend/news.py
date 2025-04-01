from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
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

# Define the NewsArticle model
class NewsArticle(db.Model):
    __tablename__ = 'news_articles'

    news_id = db.Column(db.Integer, primary_key=True)
    topic_category = db.Column(db.String(1000), nullable=False)
    date = db.Column(db.String(1000), nullable=False)
    title = db.Column(db.String(1000), nullable=False)
    content_summary = db.Column(db.String(1000), nullable=False)
    url_path = db.Column(db.String(1000), nullable=False)
                        
    def __init__(self, topic_category, date, title, content_summary, url_path):
        self.topic_category = topic_category
        self.date = date
        self.title = title
        self.content_summary = content_summary
        self.url_path = url_path
    
    def __repr__(self):
        return f"NewsArticle {self.title}"

@app.route('/get_all_news', methods=['GET'])
def get_all_news():

    # Get all news articles from the database
    news_articles = NewsArticle.query.all()
    news_articles_list = [
        {
            "newsId": article.news_id,
            "topicCategory": article.topic_category,
            "date": article.date,
            "title": article.title,
            "contentSummary": article.content_summary,
            "urlPath": article.url_path
        }
        for article in news_articles
    ]

    # Sort news articles by date in descending order
    sorted_news = sorted(news_articles_list, key=lambda x: x['date'], reverse=True)
    return jsonify(sorted_news)

@app.route('/get_news_by_id/<newsId>', methods=['GET'])
def get_news_by_id(newsId):

    # Get the news article from the database
    news_article = NewsArticle.query.filter_by(news_id=newsId).first()
    news_article_dict = {
        "newsId": news_article.news_id,
        "topicCategory": news_article.topic_category,
        "date": news_article.date,
        "title": news_article.title,
        "contentSummary": news_article.content_summary,
        "urlPath": news_article.url_path
    }
    return jsonify(news_article_dict)

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from collections import Counter
import numpy as np

# News recommender
@app.route('/get_news_recommendation', methods=['POST'])
def get_news_recommendation():

    # Get bookmarkedArticles from the request
    data = request.get_json()

    if len(data) == 0:
        # Choose 3 random articles if no bookmarked articles
        news_articles = NewsArticle.query.all()
        news_articles_list = [
            {
                "newsId": article.news_id,
                "topicCategory": article.topic_category,
                "date": article.date,
                "title": article.title,
                "contentSummary": article.content_summary,
                "urlPath": article.url_path
            }
            for article in news_articles
        ]
        recommended_articles = np.random.choice(news_articles_list, 3, replace=False)
        return jsonify(recommended_articles.tolist())

    input_data = []
    for article in data:
        news_article = NewsArticle.query.filter_by(news_id=article).first()
        input_data.append({
            "newsId": news_article.news_id,
            "topicCategory": news_article.topic_category,
            "title": news_article.title,
            "contentSummary": news_article.content_summary
        })

    # Get all news articles from the database
    news_articles = NewsArticle.query.all()
    database_articles = [{
        "newsId": article.news_id,
        "topicCategory": article.topic_category,
        "title": article.title,
        "contentSummary": article.content_summary
    } for article in news_articles]

    # Filter out articles already in input_data
    input_ids = [article['newsId'] for article in input_data]
    filtered_database_articles = [article for article in database_articles if article['newsId'] not in input_ids]

    # Count occurrences of each topicCategory in input_data
    input_categories = [article['topicCategory'] for article in input_data]
    category_counts = Counter(input_categories)
    most_common_category = category_counts.most_common(1)[0][0]

    # Combine title and contentSummary for TF-IDF
    input_texts = [item['title'] + ' ' + item['contentSummary'] for item in input_data]
    database_texts = [item['title'] + ' ' + item['contentSummary'] for item in filtered_database_articles]

    # Create TF-IDF vectorizer
    vectorizer = TfidfVectorizer()

    # Fit and transform the data
    input_vectors = vectorizer.fit_transform(input_texts).toarray()
    database_vectors = vectorizer.transform(database_texts).toarray()

    # Calculate cosine similarity between input vectors and database vectors
    similarities = cosine_similarity(input_vectors, database_vectors)

    # Calculate category-based similarity (counting topicCategory matches)
    category_similarities = []
    for article in filtered_database_articles:
        category_similarities.append(1 if article['topicCategory'] == most_common_category else 0)

    # Weighted combination of content and category similarities
    weighted_similarities = []
    for idx, sim in enumerate(similarities.mean(axis=0)):
        weighted_similarity = 0.7 * sim + 0.3 * category_similarities[idx]
        weighted_similarities.append((filtered_database_articles[idx], weighted_similarity))

    # Sort by weighted similarity score
    recommended_articles = sorted(weighted_similarities, key=lambda x: x[1], reverse=True)[:3]

    # Get the full article details from the database
    recommended_articles_full = [{
        "newsId": article['newsId'],
        "topicCategory": article['topicCategory'],
        "date": article['date'],
        "title": article['title'],
        "contentSummary": article['contentSummary'],
        "urlPath": article['urlPath']
    } for article, _ in recommended_articles]

    return jsonify(recommended_articles_full)



# ADMIN TASKS

# DELETE news article
@app.route('/delete_news_article/<newsId>', methods=['DELETE'])
def delete_news_article(newsId):
    news_article = NewsArticle.query.filter_by(news_id=newsId).first()
    if not news_article:
        return jsonify({"message": "News article not found"}), 404
    
    # Remove news article from all users saved_articles
    endpoint = f"http://172.31.17.239:5002/clear_deleted_article/{newsId}"
    response = requests.post(endpoint)
    print(response.json)

    db.session.delete(news_article)
    db.session.commit()
    return jsonify({"message": "News article deleted successfully"})



if __name__ == '__main__':
    app.run(debug=True, port=5009, host="0.0.0.0")