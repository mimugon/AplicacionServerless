import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hjctrphrsicftdlwexxj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqY3RycGhyc2ljZnRkbHdleHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMzk2MzksImV4cCI6MjA5MjYxNTYzOX0.pzIuT6MNC2Xvb6ku1Q10fyg_pOjlPp4w1gkt1YAKF2w'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)