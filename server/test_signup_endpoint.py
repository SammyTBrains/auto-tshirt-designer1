"""
Test the /api/auth/register endpoint
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_signup():
    print("Testing user signup endpoint...")
    print("-" * 60)
    
    # Test data
    user_data = {
        "email": f"newuser{hash('test')}@example.com",  # Unique email
        "username": f"newuser{hash('test')}",
        "full_name": "New Test User",
        "password": "SecurePassword123"
    }
    
    print(f"\nAttempting to register user:")
    print(f"  Email: {user_data['email']}")
    print(f"  Username: {user_data['username']}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=user_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            print("\n✅ SUCCESS! User registered successfully!")
            user_info = response.json()
            print(f"\nUser Details:")
            print(f"  ID: {user_info.get('id')}")
            print(f"  Email: {user_info.get('email')}")
            print(f"  Username: {user_info.get('username')}")
            print(f"  Full Name: {user_info.get('full_name')}")
            print(f"  Store Credits: {user_info.get('store_credits')}")
            print(f"  Role: {user_info.get('role')}")
            return True
        else:
            print(f"\n❌ FAILED! Status code: {response.status_code}")
            try:
                error_detail = response.json()
                print(f"Error detail: {json.dumps(error_detail, indent=2)}")
            except:
                print(f"Response text: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to server at", BASE_URL)
        print("Make sure the server is running: python server/main.py")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_signup()
    print("\n" + "=" * 60)
    if success:
        print("✅ Signup endpoint is working correctly!")
    else:
        print("❌ Signup endpoint test failed!")
    print("=" * 60)
