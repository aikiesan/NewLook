@echo off
REM ============================================================================
REM SUPABASE REST API TEST SCRIPT
REM Run this after each SQL fix to verify API access
REM ============================================================================

echo.
echo ============================================================================
echo TESTING SUPABASE REST API ACCESS
echo ============================================================================
echo.

set SUPABASE_URL=https://zyuxkzfhkueeipokyhgw.supabase.co
set SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dXhremZoa3VlZWlwb2t5aGd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM0Mjc5MSwiZXhwIjoyMDc4OTE4NzkxfQ.C684xLDDSrrpznNS_UV-UQBVO5BFvuxplKEo8To9ePM
set ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dXhremZoa3VlZWlwb2t5aGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNDI3OTEsImV4cCI6MjA3ODkxODc5MX0.hDozt0JQVQdXf_QcZabJM_SCf4HbARGIawmgUDquOLA

echo Test 1: Testing with SERVICE_ROLE key (should have full access)...
echo.
curl -X GET "%SUPABASE_URL%/rest/v1/municipalities?select=id,municipality_name&limit=3" ^
  -H "apikey: %SERVICE_KEY%" ^
  -H "Authorization: Bearer %SERVICE_KEY%" ^
  -H "Content-Type: application/json" ^
  -w "\n\nHTTP Status: %%{http_code}\n"

echo.
echo ============================================================================
echo.

echo Test 2: Testing with ANON key (public access)...
echo.
curl -X GET "%SUPABASE_URL%/rest/v1/municipalities?select=id,municipality_name&limit=3" ^
  -H "apikey: %ANON_KEY%" ^
  -H "Authorization: Bearer %ANON_KEY%" ^
  -H "Content-Type: application/json" ^
  -w "\n\nHTTP Status: %%{http_code}\n"

echo.
echo ============================================================================
echo.

echo Test 3: Testing scientific_references table...
echo.
curl -X GET "%SUPABASE_URL%/rest/v1/scientific_references?select=id,title&limit=3" ^
  -H "apikey: %SERVICE_KEY%" ^
  -H "Authorization: Bearer %SERVICE_KEY%" ^
  -H "Content-Type: application/json" ^
  -w "\n\nHTTP Status: %%{http_code}\n"

echo.
echo ============================================================================
echo.

echo Test 4: Testing count query...
echo.
curl -X GET "%SUPABASE_URL%/rest/v1/municipalities?select=count" ^
  -H "apikey: %SERVICE_KEY%" ^
  -H "Authorization: Bearer %SERVICE_KEY%" ^
  -H "Content-Type: application/json" ^
  -H "Prefer: count=exact" ^
  -w "\n\nHTTP Status: %%{http_code}\n"

echo.
echo ============================================================================
echo EXPECTED RESULTS:
echo - HTTP Status: 200 (Success)
echo - JSON data returned (not "Access denied")
echo.
echo IF SEEING 403:
echo 1. Go to Supabase Dashboard -^> SQL Editor
echo 2. Run the next section from fix_supabase_403.sql
echo 3. Run this test script again
echo ============================================================================
echo.

pause
