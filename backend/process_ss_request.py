#Complex MS to process new scam spotter request session
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import requests

app = Flask(__name__)
CORS(app)

ss_email_url = "http://172.31.17.239:5010"
ss_session_url = "http://172.31.17.239:5020"
user_url = "http://172.31.17.239:5002"
ss_handler_url = "http://172.31.17.239:5050"

def has_active_session(user_id):
    try:
        print("inside has active session")
        # status_code, active_session_check = invoke_http(ss_session_url + "/get_active_session/" + user_id, method='GET') 
        url = ss_session_url + "/session/get_active_session/" + str(user_id)
        response = requests.get(url)

        print(response.json())     

        # No active session so we return
        if response.status_code == 404:
            # return that there is no active session
            print("no active session")
            return jsonify({"hasActiveSession":False})

        #More than 1 session - we close both
        elif response.status_code == 400:
            print("there is more than 1 active session")
            #close the sessions
            active_ids = response['id_list']
            for active in active_ids:
                #deactivate the session
                deactivate_url = ss_session_url + "/close_session/" + active
                response = requests.put(deactivate_url)
                print(response)
                code = response.status_code
                if code != 200:
                    return(response["error"])
            return jsonify({"hasActiveSession":False})
        
        return jsonify({"hasActiveSession":True, "activeSession":response["active_session"]})

    
    except Exception as e :
        return jsonify({"error": str(e)}),500
        

@app.route('/process_ss_request', methods=['PUT'])
@cross_origin(origins="http://172.31.17.239:5173")  
def process_session_request():
    print("inside process session request")
    user_id = request.json.get('user_id')

    #1. CHECK IF THERE IS AN ACTIVE SESSION
    try:
        res = has_active_session(user_id).get_json()
        if res["hasActiveSession"]:
            #There is one active session, so we prompt the user whether they want to continue
            return jsonify({"message": "You have an existing existing session. Would you like to terminate that session and start a new one?"}), 409

        #2. RETRIEVE USER XP 
        user_detail_url = user_url + "/get_user_details_home/" + str(user_id)
        res = requests.get(user_detail_url).json()
        print("retrieved user details")
        ss_xp = res["spotterXP"]

        
        # 3. RETRIEVE EMAILS ACCORDING TO LOGIC
        session_email_url = ss_email_url + "/fetch_ss_daily"
        params = {"xp":ss_xp}
        session_emails = requests.put(session_email_url, json =params)
        print("retrieved session emails")
    
        # 4. CREATE SESSION OBJECT
        # Extract email IDs
        email_id_list= session_emails.json()
        create_session_url = ss_session_url + "/session/create_session"
        params = {"emails":email_id_list, "user_id":user_id, "session_type":"daily"}
        res = requests.post(create_session_url, json=params)
        print("created session object")
            # {
            #     "session_id": 1,
            #     "status_code": 201
            # }
        #5. PASS SESSION OBJECT TO SESSION HANDLER COMPLEX MS
        print(res.json())
        session_handler_url = ss_handler_url + "/handle_ss_session"
        res = requests.post(session_handler_url, json=res.json()).json()
        file_path  = res["session_file_path"]
        return jsonify({"message": "New/cached session successfully created/restored", "file_path": file_path})
            

    except Exception as e :
        return jsonify({"error": str(e)}),500

if __name__ == '__main__':
    app.run(debug=True, port=5030, host="0.0.0.0")
