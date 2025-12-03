
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || 'https://ionoburxknruxedgivno.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlvbm9idXJ4a25ydXhlZGdpdm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTY3MzQsImV4cCI6MjA4MDI3MjczNH0.yu72hL7wURNg62gKHSVehTlCIq637wjrmzGd5sv76MY';

export const supabase = createClient(url, key);
