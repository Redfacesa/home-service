import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://aspunxptvtulyokwuaqt.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjlkYjM3YWEzLWM4ODAtNDI1YS04MDMxLTQzYzYyYTc3NzE3MyJ9.eyJwcm9qZWN0SWQiOiJhc3B1bnhwdHZ0dWx5b2t3dWFxdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzczMDQ2MTQzLCJleHAiOjIwODg0MDYxNDMsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0._Wekw3lCTnJ-7ycutrTatg5qeJMUEgqGZmILKt3XRPM';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };