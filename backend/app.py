import os
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')
load_dotenv('.env')

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# --- AUTH ROUTES ---
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    payload = {
        "email": data.get('email'), 
        "password": data.get('password'),
        "data": {"role": data.get('role', 'member')}
    }
    res = requests.post(f"{SUPABASE_URL}/auth/v1/signup", headers=headers, json=payload)
    if res.status_code >= 400:
        return jsonify(res.json()), res.status_code
    return jsonify(res.json()), 200

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    res = requests.post(f"{SUPABASE_URL}/auth/v1/token?grant_type=password", headers=headers, json={"email": data.get('email'), "password": data.get('password')})
    if res.status_code >= 400:
        return jsonify(res.json()), res.status_code
    return jsonify(res.json()), 200

# --- PROJECTS ROUTES ---
@app.route('/api/projects', methods=['GET'])
def get_projects():
    res = requests.get(f"{SUPABASE_URL}/rest/v1/projects?order=created_at.desc", headers=headers)
    return jsonify(res.json()), res.status_code

@app.route('/api/projects', methods=['POST'])
def create_project():
    data = request.json
    payload = {"name": data.get('name'), "board_type": data.get('board_type', 'kanban')}
    res = requests.post(f"{SUPABASE_URL}/rest/v1/projects", headers=headers, json=payload)
    data_res = res.json()
    return jsonify(data_res[0] if isinstance(data_res, list) and len(data_res)>0 else data_res), res.status_code

@app.route('/api/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    res = requests.delete(f"{SUPABASE_URL}/rest/v1/projects?id=eq.{project_id}", headers=headers)
    return jsonify({"message": "Deleted"}), 200

# --- TASKS ROUTES ---
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    res = requests.get(f"{SUPABASE_URL}/rest/v1/tasks?order=created_at.desc", headers=headers)
    return jsonify(res.json()), res.status_code

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    payload = {
        "title": data.get('title'),
        "project_id": data.get('project_id'),
        "status": 'todo'
    }
    if data.get('due_date'):
        payload['due_date'] = data.get('due_date')
    if data.get('assigned_to'):
        payload['assigned_to'] = data.get('assigned_to')
        
    res = requests.post(f"{SUPABASE_URL}/rest/v1/tasks", headers=headers, json=payload)
    data_res = res.json()
    return jsonify(data_res[0] if isinstance(data_res, list) and len(data_res)>0 else data_res), res.status_code

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    res = requests.patch(f"{SUPABASE_URL}/rest/v1/tasks?id=eq.{task_id}", headers=headers, json=data)
    data_res = res.json()
    return jsonify(data_res[0] if isinstance(data_res, list) and len(data_res)>0 else data_res), res.status_code

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    res = requests.delete(f"{SUPABASE_URL}/rest/v1/tasks?id=eq.{task_id}", headers=headers)
    return jsonify({"message": "Deleted"}), 200

# --- PROFILES ROUTES ---
@app.route('/api/profiles', methods=['GET'])
def get_profiles():
    res = requests.get(f"{SUPABASE_URL}/rest/v1/profiles", headers=headers)
    return jsonify(res.json()), res.status_code

if __name__ == '__main__':
    app.run(debug=True, port=5000)
