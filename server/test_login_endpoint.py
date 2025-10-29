import requests
import json

def test_login():
    """Test the login endpoint"""
    url = "http://localhost:8000/api/auth/login"
    
    # Test with the user that was created during signup
    login_data = {
        "email": "temitopeorido02@gmail.com",
        "password": "password123"
    }
    
    print("Testing login endpoint...")
    print("=" * 60)
    print(f"\nAttempting to login with:")
    print(f"  Email: {login_data['email']}")
    print(f"  Password: {'*' * len(login_data['password'])}")
    
    try:
        response = requests.post(url, json=login_data, timeout=10)
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ SUCCESS! User logged in successfully!")
            print(f"\nAccess Token: {result['access_token'][:50]}...")
            print(f"Token Type: {result['token_type']}")
            print("\n" + "=" * 60)
            print("✅ Login endpoint is working correctly!")
            print("=" * 60)
            return True
        else:
            print(f"\n❌ FAILED! Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print(f"Exception type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_login()
    exit(0 if success else 1)
