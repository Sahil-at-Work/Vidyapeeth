import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  })
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Database = {
  public: {
    Tables: {
      universities: {
        Row: {
          id: string
          name: string
          short_name: string | null
          location: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          short_name?: string | null
          location?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_name?: string | null
          location?: string | null
          created_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          code: string
          university_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          university_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          university_id?: string
          created_at?: string
        }
      }
      semesters: {
        Row: {
          id: string
          number: number
          department_id: string
          created_at: string
        }
        Insert: {
          id?: string
          number: number
          department_id: string
          created_at?: string
        }
        Update: {
          id?: string
          number?: number
          department_id?: string
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          code: string
          credits: number | null
          semester_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          credits?: number | null
          semester_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          credits?: number | null
          semester_id?: string
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          university_id: string | null
          department_id: string | null
          semester_id: string | null
          profile_completed: boolean | null
          created_at: string
          updated_at: string
          subscription_id: string | null
          display_name: string | null
          phone_number: string | null
          date_of_birth: string | null
          profile_image: string | null
          bio: string | null
          location: string | null
        }
        Insert: {
          id: string
          university_id?: string | null
          department_id?: string | null
          semester_id?: string | null
          profile_completed?: boolean | null
          created_at?: string
          updated_at?: string
          subscription_id?: string | null
          display_name?: string | null
          phone_number?: string | null
          date_of_birth?: string | null
          profile_image?: string | null
          bio?: string | null
          location?: string | null
        }
        Update: {
          id?: string
          university_id?: string | null
          department_id?: string | null
          semester_id?: string | null
          profile_completed?: boolean | null
          created_at?: string
          updated_at?: string
          subscription_id?: string | null
          display_name?: string | null
          phone_number?: string | null
          date_of_birth?: string | null
          profile_image?: string | null
          bio?: string | null
          location?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: 'free' | 'trial' | 'pro'
          status: 'active' | 'expired' | 'cancelled'
          trial_start_date: string | null
          trial_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type?: 'free' | 'trial' | 'pro'
          status?: 'active' | 'expired' | 'cancelled'
          trial_start_date?: string | null
          trial_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: 'free' | 'trial' | 'pro'
          status?: 'active' | 'expired' | 'cancelled'
          trial_start_date?: string | null
          trial_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subject_materials: {
        Row: {
          id: string
          subject_id: string
          syllabus: string | null
          drive_link: string | null
          gate_questions: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          syllabus?: string | null
          drive_link?: string | null
          gate_questions?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject_id?: string
          syllabus?: string | null
          drive_link?: string | null
          gate_questions?: any
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          status: 'not_started' | 'in_progress' | 'completed'
          xp_points: number
          study_streak: number
          last_activity: string
          completion_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          status?: 'not_started' | 'in_progress' | 'completed'
          xp_points?: number
          study_streak?: number
          last_activity?: string
          completion_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          status?: 'not_started' | 'in_progress' | 'completed'
          xp_points?: number
          study_streak?: number
          last_activity?: string
          completion_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      leaderboard_competitors: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          total_xp: number
          current_streak: number
          is_ai: boolean
          personality_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          avatar_url?: string | null
          total_xp?: number
          current_streak?: number
          is_ai?: boolean
          personality_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          total_xp?: number
          current_streak?: number
          is_ai?: boolean
          personality_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_type: 'first_subject' | 'streak_7' | 'streak_30' | 'top_performer' | 'gate_master'
          title: string
          description: string | null
          xp_reward: number
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_type: 'first_subject' | 'streak_7' | 'streak_30' | 'top_performer' | 'gate_master'
          title: string
          description?: string | null
          xp_reward?: number
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_type?: 'first_subject' | 'streak_7' | 'streak_30' | 'top_performer' | 'gate_master'
          title?: string
          description?: string | null
          xp_reward?: number
          earned_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      news: {
        Row: {
          id: string
          title: string
          description: string
          url: string
          image_url: string | null
          published_at: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          url: string
          image_url?: string | null
          published_at?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          url?: string
          image_url?: string | null
          published_at?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}