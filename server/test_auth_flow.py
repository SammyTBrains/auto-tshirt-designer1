import requests
import json
import random

def test_full_auth_flow():
    """Test complete authentication flow: register then login"""
    base_url = "http://localhost:8000/api/auth"
    
    # Generate unique credentials
    random_id = random.randint(1, 999999)
    email = f"testauth{random_id}@example.com"
    username = f"testauth{random_id}"
    password = "TestPassword123!"
    
    print("Testing Complete Authentication Flow")
    print("=" * 60)
    
    # Step 1: Register
    print("\n📝 Step 1: Registering new user...")
    register_data = {
        "email": email,
        "username": username,
        "password": password,
        "full_name": "Test Auth User"
    }
    
    try:
        register_response = requests.post(f"{base_url}/register", json=register_data, timeout=10)
        print(f"  Status: {register_response.status_code}")
        
        if register_response.status_code != 201:
            print(f"  ❌ Registration failed: {register_response.text}")
            return False
        
        user_data = register_response.json()
        print(f"  ✅ User registered successfully!")
        print(f"  User ID: {user_data['id']}")
        print(f"  Email: {user_data['email']}")
        
    except Exception as e:
        print(f"  ❌ Registration error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    # Step 2: Login with same credentials
    print("\n🔐 Step 2: Logging in with same credentials...")
    login_data = {
        "email": email,
        "password": password
    }
    
    try:
        login_response = requests.post(f"{base_url}/login", json=login_data, timeout=10)
        print(f"  Status: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print(f"  ❌ Login failed: {login_response.text}")
            print(f"\n  Debug info:")
            print(f"    Email used: {email}")
            print(f"    Password used: {password}")
            return False
        
        token_data = login_response.json()
        print(f"  ✅ Login successful!")
        print(f"  Access Token: {token_data['access_token'][:50]}...")
        print(f"  Token Type: {token_data['token_type']}")
        
    except Exception as e:
        print(f"  ❌ Login error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    print("\n" + "=" * 60)
    print("✅ Complete authentication flow working correctly!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = test_full_auth_flow()
    exit(0 if success else 1)
