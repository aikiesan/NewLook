"""
Test using Supabase Python client instead of direct psycopg2
"""
from supabase import create_client, Client
import sys

print("=" * 60)
print("Supabase Client Connection Test")
print("=" * 60)
print()

# Supabase configuration
url = "https://zyuxkzfhkueeipokyhgw.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dXhremZoa3VlZWlwb2t5aGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNDI3OTEsImV4cCI6MjA3ODkxODc5MX0.hDozt0JQVQdXf_QcZabJM_SCf4HbARGIawmgUDquOLA"

print("[Step 1] Creating Supabase client...")
print(f"  URL: {url}")
print(f"  Key: {key[:50]}...")
print()

try:
    supabase: Client = create_client(url, key)
    print("[OK] Client created")
    
    print()
    print("[Step 2] Testing database query...")
    
    # Try to query municipalities table
    response = supabase.table('municipalities').select('*').limit(5).execute()
    
    print(f"[OK] Query successful!")
    print(f"  Records returned: {len(response.data)}")
    
    if response.data:
        print()
        print("Sample record:")
        sample = response.data[0]
        for key, value in list(sample.items())[:5]:
            print(f"  {key}: {value}")
    
    print()
    print("=" * 60)
    print("[SUCCESS] Supabase client works!")
    print("=" * 60)
    sys.exit(0)
    
except Exception as e:
    print(f"[FAIL] Error: {type(e).__name__}")
    print(f"  Message: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

