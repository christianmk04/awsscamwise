from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import requests
import tempfile
import os
import shutil
import time
import re
import requests
from urllib.parse import urlparse
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from newspaper import Article
import openai
import chromadb
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


# Set up OpenAI API key
openai.api_key = "XXX"

# ChromaDB persistent storage path for the embeddings
DB_PATH = "./chroma_db"

# Clear previous embeddings before starting fresh
if os.path.exists(DB_PATH):
    shutil.rmtree(DB_PATH)  # Deletes the existing folder
os.makedirs(DB_PATH, exist_ok=True)

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path=DB_PATH)
collection = chroma_client.get_or_create_collection(name="articles")

# Selenium WebDriver setup
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")

# Fix: Use unique temporary user profile to avoid session conflict
temp_profile = tempfile.mkdtemp()
chrome_options.add_argument(f"--user-data-dir={temp_profile}")

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

def get_embedding(text):
    """Generate an embedding using OpenAI API."""
    response = openai.embeddings.create(input=text, model="text-embedding-ada-002")
    return response.data[0].embedding

def store_article(article_id, title, content, url):
    """Stores article data and its embedding in ChromaDB."""
    embedding = get_embedding(content)
    
    collection.add(
        ids=[article_id],  # Unique ID
        embeddings=[embedding],  # Vector
        metadatas=[{"title": title, "url": url}]  # Metadata
    )

def search_articles(query, top_k=5):
    """Search for similar articles based on a query."""
    query_embedding = get_embedding(query)
    
    results = collection.query(
        query_embeddings=[query_embedding], 
        n_results=top_k  # Return top_k closest matches
    )
    
    return results["metadatas"]  # Retrieve metadata of best matches

def strip_html_tags(text):
    return re.sub(r'<.*?>', '', text)

def is_valid_article_link(link):
    return 'google.com/maps' not in link and '/search?' not in link and urlparse(link).scheme and urlparse(link).netloc

def scrape_google_news(query):
    base_url = "https://www.google.com/search"
    params = {"q": query, "tbm": "nws", "num": 100, "tbs": "qdr:w"}  
    response = requests.get(base_url, params=params)
    
    links_and_titles = []
    if response.status_code == 200:
        matches = re.findall(r'<a href="/url\?q=(.*?)&amp;.*?">(.*?)</a>', response.text)
        for link, title in matches:
            title = strip_html_tags(title)[:-10]
            if is_valid_article_link(link):
                links_and_titles.append((link, title))
    return links_and_titles

def is_cloudflare_protected(content):
    """Detects if an article is blocked by Cloudflare or similar security measures."""
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Determine if the following webpage is protected by security features like Cloudflare. Reply 'YES' if blocked, otherwise 'NO'."},
                {"role": "user", "content": content[:2000]}  # Limit text to avoid overloading
            ]
        )
        return response.choices[0].message.content.strip().upper() == "YES"
    except Exception:
        return False

def scrape_url(url):
    result_dict = {}

    def clean_text(text):
        return re.sub(r'\[.*?\]', '', text)
    
    try:
        article = Article(url)
        article.download()
        article.parse()
        content = clean_text(article.text)
        title = article.title

        if len(content) > 100 and not is_cloudflare_protected(content):
            result_dict["url"] = url
            result_dict["content"] = content
            result_dict["title"] = title if title else ""
            return result_dict
    except Exception:
        pass
    
    try:
        driver.get(url)
        soup = BeautifulSoup(driver.page_source, "html.parser")
        paragraphs = soup.find_all("p")
        text = clean_text(" ".join([p.get_text() for p in paragraphs if len(p.get_text()) > 50]))
        title_tag = soup.find("title")
        title = title_tag.get_text().strip() if title_tag else ""

        if len(text) > 100 and not is_cloudflare_protected(text):
            result_dict["url"] = url
            result_dict["content"] = text
            result_dict["title"] = title
            return result_dict
    except Exception:
        pass
    
    return None

def summarize_text(text):
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[ 
                {"role": "system", "content": "Summarize the following article in a very short and concise manner. THE SUMMARY MUST BE STRICTLY NO LONGER THAN 50 WORDS."},
                {"role": "user", "content": text[:4000]}
            ]
        )
        return response.choices[0].message.content
    except Exception:
        return text[:1000]

def assign_category(text):
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Categorize the following article into: Awareness, Case Studies, Prevention, Policy and Legal, Education. If unsure, assign 'Awareness'. Return only the category."},
                {"role": "user", "content": text[:1000]}
            ]
        )
        category = response.choices[0].message.content.strip()
        allowed_categories = {"Awareness", "Case Studies", "Prevention", "Policy and Legal", "Education"}
        return category if category in allowed_categories else "Awareness"
    except Exception:
        return "Awareness"

def fetch_articles(query, required_count=25):
    stored_articles = []
    
    while len(stored_articles) < required_count:
        search_results = scrape_google_news(query)
        if not search_results:
            print("❌ No valid news articles found.")
            return []
        
        for link, _ in search_results:
            if len(stored_articles) >= required_count:
                break
            article_data = scrape_url(link)
            if article_data:
                stored_articles.append(article_data)
                store_article(article_data["url"], article_data["title"], article_data["content"], article_data["url"])
            time.sleep(2)
    
    return stored_articles


# Route to fetch latest phishing or scam tactics
@app.route('/fetch_latest_phishing', methods=['GET'])
def fetch_latest_phishing():
    try:
        query = 'Latest phishing or scam tactics'
        articles = fetch_articles(query, 25)

        if not articles:
            print("❌ No articles found.")
        else:
            for article_data in articles:
                category = assign_category(article_data["content"])
                summary = summarize_text(article_data["content"])
                title = article_data["title"]

                new_article = NewsArticle(
                    topic_category=category,
                    date=time.strftime("%Y-%m-%d"),
                    title=title,
                    content_summary=summary,
                    url_path=article_data["url"]
                )

                db.session.add(new_article)
                db.session.commit()


        return jsonify({"message": "Successfully fetched latest phishing or scam tactics"})
    except Exception as e:
        print(e)
        return jsonify({"message": "Failed to fetch latest phishing or scam tactics"})
    finally:
        driver.quit()
        
if __name__ == "__main__":
    scheduler = BackgroundScheduler()
    scheduler.add_job(fetch_latest_phishing, "interval", weeks=1)
    scheduler.start()

    for job in scheduler.get_jobs():
        # To check the scheduled jobs
        print(job)

    app.run(debug=True, port=5080, use_reloader=False)
