import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zwjvdafbcgseirmdtsbq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3anZkYWZiY2dzZWlybWR0c2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjM3NDIsImV4cCI6MjA2OTg5OTc0Mn0.7QTb9hSq0lV3ILOe_zsIfgPY2yfR-kBXCyGNSLOWXoA';
export const supabase = createClient(supabaseUrl, supabaseKey); 