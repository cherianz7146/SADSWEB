import requests
import json
import time

# Demo setup script
BACKEND_URL = "http://localhost:5002"

def create_demo_user():
    """Create a demo manager user"""
    data = {
        "name": "Demo Manager",
        "email": "demo@sads.local", 
        "password": "Demo123!",
        "role": "manager"
    }
    
    try:
        # First try to login
        login_data = {"email": "demo@sads.local", "password": "Demo123!"}
        r = requests.post(f"{BACKEND_URL}/api/auth/login", json=login_data)
        if r.status_code == 200:
            return r.json()['token']
    except:
        pass
    
    # If login fails, try to register
    try:
        r = requests.post(f"{BACKEND_URL}/api/auth/register", json=data)
        if r.status_code == 201:
            # Login after registration
            login_data = {"email": "demo@sads.local", "password": "Demo123!"}
            r = requests.post(f"{BACKEND_URL}/api/auth/login", json=login_data)
            if r.status_code == 200:
                return r.json()['token']
    except:
        pass
    
    return None

def create_demo_property(token):
    """Create a demo property"""
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "name": "Demo Property",
        "address": "123 Demo Street",
        "cameraCount": 1,
        "managerId": "demo_manager_id"  # This will be updated with actual manager ID
    }
    
    try:
        r = requests.post(f"{BACKEND_URL}/api/properties", json=data, headers=headers)
        if r.status_code == 201:
            return r.json()['_id']
    except:
        pass
    
    return "demo_property_id"

if __name__ == "__main__":
    print("Setting up demo data...")
    time.sleep(3)  # Wait for backend to start
    
    token = create_demo_user()
    if token:
        print(f"Demo user created. Token: {token[:20]}...")
        property_id = create_demo_property(token)
        print(f"Demo property ID: {property_id}")
        print(f"\nUse these values:")
        print(f"ML_AUTH_TOKEN={token}")
        print(f"ML_PROPERTY_ID={property_id}")
    else:
        print("Failed to create demo user. Please create manually in the frontend.")








