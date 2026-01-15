#!/usr/bin/env python3
"""
TimeLov Admin Panel Backend API Tests - Phase 3
Tests authentication, dashboard, pages, posts, settings, and audit logs API endpoints
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get backend URL from frontend .env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("ERROR: Could not get REACT_APP_BACKEND_URL from frontend/.env")
    sys.exit(1)

API_URL = f"{BASE_URL}/api"
print(f"Testing API at: {API_URL}")

# Test credentials from backend .env
ADMIN_EMAIL = "admin@timelov.pl"
ADMIN_PASSWORD = "Admin123!@#"

# Global variables for tokens and IDs
access_token = None
refresh_token = None
page_id = None
post_id = None

def print_test_header(test_name):
    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print(f"{'='*60}")

def print_result(success, message, response=None):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    if response and not success:
        print(f"Response: {response.status_code} - {response.text}")
    print("-" * 60)

def test_health_check():
    """Test basic health check endpoint"""
    print_test_header("Health Check")
    
    try:
        response = requests.get(f"{API_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Health check passed: {data}")
            return True
        else:
            print_result(False, "Health check failed", response)
            return False
    except Exception as e:
        print_result(False, f"Health check error: {e}")
        return False

def test_setup_admin():
    """Setup initial admin user if needed"""
    print_test_header("Setup Admin User")
    
    try:
        response = requests.post(f"{API_URL}/auth/setup", timeout=10)
        if response.status_code == 200:
            print_result(True, "Admin user setup successful")
            return True
        elif response.status_code == 400:
            print_result(True, "Admin user already exists")
            return True
        else:
            print_result(False, "Admin setup failed", response)
            return False
    except Exception as e:
        print_result(False, f"Admin setup error: {e}")
        return False

def test_login():
    """Test login with valid credentials"""
    print_test_header("Login Authentication")
    
    global access_token, refresh_token
    
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
        "remember_me": False
    }
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            access_token = data.get("access_token")
            refresh_token = data.get("refresh_token")
            
            if access_token and refresh_token:
                print_result(True, f"Login successful. Token type: {data.get('token_type')}")
                print(f"Access token (first 20 chars): {access_token[:20]}...")
                return True
            else:
                print_result(False, "Login response missing tokens")
                return False
        else:
            print_result(False, "Login failed", response)
            return False
    except Exception as e:
        print_result(False, f"Login error: {e}")
        return False

def test_dashboard():
    """Test dashboard stats endpoint"""
    print_test_header("Dashboard Stats")
    
    if not access_token:
        print_result(False, "No access token available")
        return False
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{API_URL}/cms/dashboard", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Dashboard stats retrieved successfully")
            print(f"Pages: {data.get('pages', {})}")
            print(f"Posts: {data.get('posts', {})}")
            print(f"Widgets: {data.get('widgets', {})}")
            print(f"Audit logs: {data.get('audit_logs', 0)}")
            return True
        else:
            print_result(False, "Failed to get dashboard stats", response)
            return False
    except Exception as e:
        print_result(False, f"Dashboard error: {e}")
        return False

def test_list_pages_empty():
    """Test listing pages (should be empty initially)"""
    print_test_header("List Pages (Empty)")
    
    if not access_token:
        print_result(False, "No access token available")
        return False
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{API_URL}/cms/pages", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Pages list retrieved: {len(data)} pages found")
            return True
        else:
            print_result(False, "Failed to list pages", response)
            return False
    except Exception as e:
        print_result(False, f"List pages error: {e}")
        return False

def test_create_page():
    """Test creating a new page"""
    print_test_header("Create Page")
    
    global page_id
    
    if not access_token:
        print_result(False, "No access token available")
        return False
    
    page_data = {
        "slug": "/o-nas",
        "title": "O nas",
        "content": "Test content for about us page",
        "status": "draft",
        "meta_description": "Test meta description"
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/cms/pages",
            json=page_data,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            page_id = data.get("id")
            print_result(True, f"Page created successfully. ID: {page_id}")
            print(f"Title: {data.get('title')}")
            print(f"Slug: {data.get('slug')}")
            print(f"Status: {data.get('status')}")
            return True
        else:
            print_result(False, "Failed to create page", response)
            return False
    except Exception as e:
        print_result(False, f"Create page error: {e}")
        return False

def test_list_pages_with_data():
    """Test listing pages after creation"""
    print_test_header("List Pages (With Data)")
    
    if not access_token:
        print_result(False, "No access token available")
        return False
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{API_URL}/cms/pages", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Found {len(data)} pages")
            for page in data:
                print(f"  - {page.get('title')} ({page.get('slug')}) - Status: {page.get('status')}")
            return True
        else:
            print_result(False, "Failed to list pages", response)
            return False
    except Exception as e:
        print_result(False, f"List pages error: {e}")
        return False

def test_publish_page():
    """Test publishing a page"""
    print_test_header("Publish Page")
    
    if not access_token or not page_id:
        print_result(False, "No access token or page ID available")
        return False
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.patch(
            f"{API_URL}/cms/pages/{page_id}/publish",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Page published: {data.get('message')}")
            return True
        else:
            print_result(False, "Failed to publish page", response)
            return False
    except Exception as e:
        print_result(False, f"Publish page error: {e}")
        return False

def test_delete_page():
    """Test deleting a page"""
    print_test_header("Delete Page")
    
    if not access_token or not page_id:
        print_result(False, "No access token or page ID available")
        return False
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.delete(
            f"{API_URL}/cms/pages/{page_id}",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Page deleted: {data.get('message')}")
            return True
        else:
            print_result(False, "Failed to delete page", response)
            return False
    except Exception as e:
        print_result(False, f"Delete page error: {e}")
        return False

def test_list_posts():
    """Test listing posts"""
    print_test_header("List Posts")
    
    if not access_token:
        print_result(False, "No access token available")
        return False
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{API_URL}/cms/posts", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Posts list retrieved: {len(data)} posts found")
            return True
        else:
            print_result(False, "Failed to list posts", response)
            return False
    except Exception as e:
        print_result(False, f"List posts error: {e}")
        return False

def test_create_post():
    """Test creating a new post"""
    print_test_header("Create Post")
    
    global post_id
    
    if not access_token:
        print_result(False, "No access token available")
        return False
    
    post_data = {
        "title": "Test Post",
        "category": "news",
        "content": "Test content for news post",
        "excerpt": "Test excerpt",
        "status": "draft"
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/cms/posts",
            json=post_data,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            post_id = data.get("id")
            print_result(True, f"Post created successfully. ID: {post_id}")
            print(f"Title: {data.get('title')}")
            print(f"Category: {data.get('category')}")
            print(f"Status: {data.get('status')}")
            return True
        else:
            print_result(False, "Failed to create post", response)
            return False
    except Exception as e:
        print_result(False, f"Create post error: {e}")
        return False

def test_publish_post():
    """Test publishing a post"""
    print_test_header("Publish Post")
    
    if not access_token or not post_id:
        print_result(False, "No access token or post ID available")
        return False
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.patch(
            f"{API_URL}/cms/posts/{post_id}/publish",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Post published: {data.get('message')}")
            return True
        else:
            print_result(False, "Failed to publish post", response)
            return False
    except Exception as e:
        print_result(False, f"Publish post error: {e}")
        return False

def test_delete_post():
    """Test deleting a post"""
    print_test_header("Delete Post")
    
    if not access_token or not post_id:
        print_result(False, "No access token or post ID available")
        return False
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.delete(
            f"{API_URL}/cms/posts/{post_id}",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Post deleted: {data.get('message')}")
            return True
        else:
            print_result(False, "Failed to delete post", response)
            return False
    except Exception as e:
        print_result(False, f"Delete post error: {e}")
        return False

def test_get_settings():
    """Test getting site settings"""
    print_test_header("Get Settings")
    
    if not access_token:
        print_result(False, "No access token available")
        return False
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{API_URL}/cms/settings", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Settings retrieved successfully")
            print(f"Site name: {data.get('site_name')}")
            print(f"Site description: {data.get('site_description')}")
            print(f"Maintenance mode: {data.get('maintenance_mode')}")
            return True
        else:
            print_result(False, "Failed to get settings", response)
            return False
    except Exception as e:
        print_result(False, f"Get settings error: {e}")
        return False

def test_update_settings():
    """Test updating site settings"""
    print_test_header("Update Settings")
    
    if not access_token:
        print_result(False, "No access token available")
        return False
    
    settings_data = {
        "site_name": "TimeLov Test"
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.patch(
            f"{API_URL}/cms/settings",
            json=settings_data,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Settings updated: {data.get('message')}")
            return True
        else:
            print_result(False, "Failed to update settings", response)
            return False
    except Exception as e:
        print_result(False, f"Update settings error: {e}")
        return False

def test_list_audit_logs():
    """Test listing audit logs"""
    print_test_header("List Audit Logs")
    
    if not access_token:
        print_result(False, "No access token available")
        return False
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{API_URL}/cms/audit-logs", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Audit logs retrieved: {len(data)} logs found")
            if data:
                print(f"Recent log: {data[0].get('action')} by {data[0].get('admin_email')}")
            return True
        else:
            print_result(False, "Failed to list audit logs", response)
            return False
    except Exception as e:
        print_result(False, f"List audit logs error: {e}")
        return False

def test_audit_logs_stats():
    """Test audit logs statistics"""
    print_test_header("Audit Logs Stats")
    
    if not access_token:
        print_result(False, "No access token available")
        return False
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{API_URL}/cms/audit-logs/stats", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Audit stats retrieved successfully")
            print(f"Total logs: {data.get('total')}")
            print(f"By action: {data.get('by_action', {})}")
            print(f"By entity: {data.get('by_entity', {})}")
            return True
        else:
            print_result(False, "Failed to get audit stats", response)
            return False
    except Exception as e:
        print_result(False, f"Audit stats error: {e}")
        return False

# Old widget test functions removed - focusing on Phase 3 endpoints

def main():
    """Run all tests"""
    print(f"TimeLov Admin Panel Backend API Tests - Phase 3")
    print(f"Started at: {datetime.now()}")
    print(f"Testing against: {API_URL}")
    
    tests = [
        ("Health Check", test_health_check),
        ("Setup Admin", test_setup_admin),
        ("Login", test_login),
        ("Dashboard Stats", test_dashboard),
        ("List Pages (Empty)", test_list_pages_empty),
        ("Create Page", test_create_page),
        ("List Pages (With Data)", test_list_pages_with_data),
        ("Publish Page", test_publish_page),
        ("Delete Page", test_delete_page),
        ("List Posts", test_list_posts),
        ("Create Post", test_create_post),
        ("Publish Post", test_publish_post),
        ("Delete Post", test_delete_post),
        ("Get Settings", test_get_settings),
        ("Update Settings", test_update_settings),
        ("List Audit Logs", test_list_audit_logs),
        ("Audit Logs Stats", test_audit_logs_stats),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print_result(False, f"Test {test_name} crashed: {e}")
            failed += 1
    
    print(f"\n{'='*60}")
    print(f"TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Total Tests: {passed + failed}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
    
    if failed > 0:
        print(f"\n❌ {failed} test(s) failed")
        sys.exit(1)
    else:
        print(f"\n✅ All tests passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()