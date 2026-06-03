import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uiphffkasqjoxefalfhw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpcGhmZmthc3Fqb3hlZmFsZmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NjI2NjQsImV4cCI6MjA5NjAzODY2NH0.4mDybz8Laz3eB9GePXYYqLcKEXpLw9qqO49VTrtV6wA'

export const supabase = createClient(supabaseUrl, supabaseKey)
