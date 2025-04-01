from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import json
import requests
import os
import random

app = Flask(__name__)
CORS(app)

ss_session_url = "http://172.31.17.239:5020"
ss_email_url = "http://172.31.17.239:5010"

# Use a relative temp directory inside the project
# TEMP_DIR = os.path.join(os.getcwd(), "temp_ss_session")

# Ensure the temp directory exists
# os.makedirs(TEMP_DIR, exist_ok=True)

TEMP_DIR = './temp_ss_session'

@app.route('/handle_ss_session', methods=['POST'])
def handle_session():
    try:
        data = request.get_json()
        session_id = data["session_id"]

        # Define the temp file path based on session_id
        temp_file_path = os.path.join(TEMP_DIR, f"session_{session_id}.json")

        # If the file already exists, return the stored data
        if os.path.exists(temp_file_path):
            with open(temp_file_path, 'r') as existing_file:
                cached_data = json.load(existing_file)
            return jsonify({
                "message": "Returning cached email data",
                "session_file_path": temp_file_path
            }), 200

        # 1. FETCH EMAILS AND STORE IN TEMP FILE
        get_session_url = f"{ss_session_url}/session/{session_id}"
        response = requests.get(get_session_url).json()
        print(response)
        email_ids = response["emails"]

        fetch_email_url = f"{ss_email_url}/fetch_emails"
        emails_data = requests.put(fetch_email_url, json={"email_ids": email_ids}).json()

        # 2. STORE IN TEMP FILE
        with open(temp_file_path, 'w') as temp_file:
            json.dump(emails_data, temp_file, indent=4)

        return jsonify({
            "message": "Emails data stored",
            "session_file_path": temp_file_path
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/fetch_email", methods=['PUT'])
def fetch_email(): 
    try:   
        res = request.get_json()
        file_path, number, time, hints = res["file_path"], res["number"], res["time_elapsed"], res["hints_used"]

        # Convert \ to / for Windows paths
        file_path = file_path.replace("\\", "/")

        #Check if file exists
        if not os.path.exists(file_path):
            return jsonify({"message": "Error, file does not exist!"}), 404
        
        # Load the JSON file
        with open(file_path, 'r') as temp_file:
            data = json.load(temp_file)
        
        # Validate 'emails' key exists
        if "emails" not in data or not isinstance(data["emails"], list):
            return jsonify({"message": "Invalid file format!"}), 400

        if number >= len(data["emails"]):
            #1. CLOSE SESSION
            session_number = file_path.split("temp_ss_session/session_")[1][:-5]
            print("printing time", time)
            try:
                # Directly use the response from end_completed_session
                response = end_completed_session(session_number, time, hints)
            
                # Access the values directly from the response data
                compliment = response["compliment"]
                bonus_scores = response["bonus_scores"]
                accuracy = (response["raw_score"] / len(data["emails"] ) * 10)
                time_compliment = response["time_compliment"]

                print(compliment, bonus_scores, accuracy, time_compliment)
                
                return jsonify({"response_type": "session_closure","compliment": compliment, "bonus_xps": bonus_scores, "accuracy": str(accuracy) + "%", "time_compliment": time_compliment, "raw_score": response["raw_score"]}), 200        
                
            except Exception as e:
                jsonify({"error": str(e)}), 500


        # Validate the requested email index
        if number < 0:
            return jsonify({"message": "Invalid email index!"}), 400

        return jsonify(data["emails"][number])

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/check_answer", methods=['POST'])
@cross_origin(origins="http://172.31.17.239:5173")  
def check_answer():
    try:
        res = request.get_json()
        print(res)
        file_path, number, user_answer = res["file_path"], res["number"],bool(res["answer"])
        #Check if file exists
        if not os.path.exists(file_path):
            return jsonify({"message": "cError, file does not exist!"}), 404

        with open(file_path, 'r') as temp_file:
            data = json.load(temp_file)
        
        model_answer = data["emails"][number]["is_scam"]
        # print(model_answer)
        # print(model_answer == user_answer)
        
        if (model_answer != user_answer):
             return jsonify({"type": "wrong"}), 200
    
        return jsonify({"type": "correct"}), 200
    

    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def end_completed_session(session_number, time_taken, hints):
    try:
        #1. CLOSE SESSION
        close_session_url = f"http://172.31.17.239:5020/session/close_session/{session_number}"
        res = requests.put(close_session_url)
        
        if res.status_code != 200:
            print(f"Failed to close session, status code: {res.status_code}")
            return jsonify({"error": "Failed to close session"}), 500
        else:
            print("Session closed successfully")

        #2. UPDATE TIME
        update_time_url = f"http://172.31.17.239:5020/session/update_time/{session_number}"
        print(f"Updating time with request: {update_time_url}")
        res = requests.put(update_time_url, json={"time_taken": time_taken})
        
        if res.status_code != 200:
            print(f"Failed to update time, status code: {res.status_code}")
            return jsonify({"error": "Failed to update time"}), 500
        else:
            print(f"Time updated successfully with time_taken: {time_taken}")
        
        #3. GET PERFORMANCE VERDICT FROM TIME TAKEN, SCORE AND LEVEL
        score = res.json().get("score", 0)
        if score == 0:
            print("No score received, defaulting to 0")
        print(f"Score received: {score}")

        # Get the extra score from scoring system file
        scoring_file = os.path.join(TEMP_DIR, "scoring_system.json")
        if not os.path.exists(scoring_file):
            print("Scoring system file not found")
            return jsonify({"error": "Scoring system file missing"}), 500

        print(f"Scoring file path: {scoring_file}")
        
        with open(scoring_file, 'r') as temp_file:
            data = json.load(temp_file)
        
        # Extra XPs and compliments
        compliment_list = []
        bonus_score_xp = data["scoring_system"].get(str(score), {}).get("bonus_xp", 0)
        compliment_list += data["scoring_system"].get(str(score), {}).get("compliments", [])

        # Handle bonus time XP
        bonus_time_xp = 0
        for time in data["time_scoring"]:
            if time == "others":
                compliment_list += data["others"]["compliments"]
            if int(time_taken) <= int(time):
                bonus_time_xp = data["time_scoring"][time]["bonus_xp"]
                compliment_list += data["time_scoring"][str(time)].get("compliments", [])
                response_time_compliment = data["time_scoring"][time]["title"]
                break
        
        random_compliment = random.choice(compliment_list) if compliment_list else "Great job!"
        
        #4. UPDATE SESSION SCORES WITH BONUS SCORES
        update_session_scores_url = f"http://172.31.17.239:5020/session/update_score/{session_number}"
        print(f"Making request to update score: {update_session_scores_url}")
        res = requests.put(update_session_scores_url, json={"score": bonus_time_xp + bonus_score_xp - (hints * 5)})
        
        if res.status_code != 200:
            print(f"Failed to update session score, status code: {res.status_code}")
            return jsonify({"error": "Failed to update session score"}), 500

        #5. GET USER ID FROM SESSION AND UPDATE USER SCORE
        get_user_id_url = f"http://172.31.17.239:5020/session/{session_number}"
        res = requests.get(get_user_id_url)
        
        if res.status_code != 200:
            print(f"Failed to get user id, status code: {res.status_code}")
            return jsonify({"error": "Failed to retrieve user ID"}), 500

        userId = res.json().get("user_id")
        if not userId:
            print("User ID not found in session")
            return jsonify({"error": "User ID not found"}), 500

        print(f"user_id: {userId}")

        update_user_scores_url = f"http://172.31.17.239:5002/update_spotter_xp/{userId}"
        res = requests.put(update_user_scores_url, json={"spotterXP": bonus_score_xp + bonus_time_xp+ score - (hints * 5)})
        if res.status_code != 200:
            print(f"Failed to update user score, status code: {res.status_code}")
            return jsonify({"error": "Failed to update user score"}), 500

        #5. REMOVE TEMP SESSION FILE FROM DIR
        temp_file_path = os.path.join(TEMP_DIR, f"session_{session_number}.json")
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            print(f"File {temp_file_path} has been removed.")
        else:
            print(f"File {temp_file_path} does not exist.")

        return {"compliment": random_compliment, "bonus_scores": bonus_score_xp + bonus_time_xp,"raw_score":score, "time_compliment":response_time_compliment}

    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True, port=5050)
