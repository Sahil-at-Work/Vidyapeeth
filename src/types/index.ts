export interface University {
  id: string
  name: string
  short_name: string | null
  location: string | null
  created_at: string
}

export interface Department {
  id: string
  name: string
  code: string
  university_id: string
  created_at: string
}

export interface Semester {
  id: string
  number: number
  department_id: string
  created_at: string
}

export interface Subject {
  id: string
  name: string
  code: string
  credits: number | null
  semester_id: string
  created_at: string
}

export interface UserProfile {
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
  academic_update_key: string | null
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: 'free' | 'trial' | 'pro'
  status: 'active' | 'expired' | 'cancelled'
  trial_start_date: string | null
  trial_end_date: string | null
  created_at: string
  updated_at: string
}

export interface DPPMaterial {
  title: string
  link: string
}

export interface DPPChapter {
  chapter: string
  dpps: DPPMaterial[]
}

export interface SubjectMaterial {
  id: string
  subject_id: string
  syllabus: string | null
  drive_link: string | null
  gate_questions: GateQuestion[]
  dpp_materials: DPPChapter[]
  created_at: string
  updated_at: string
}

export interface GateQuestion {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  year: number
}

export interface UserProgress {
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

export interface LeaderboardCompetitor {
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

export interface UserAchievement {
  id: string
  user_id: string
  achievement_type: 'first_subject' | 'streak_7' | 'streak_30' | 'top_performer' | 'gate_master'
  title: string
  description: string | null
  xp_reward: number
  earned_at: string
}

export interface News {
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

export interface QuestionnaireStep {
  step: number
  title: string
  completed: boolean
}

export interface UserSelection {
  university: University | null
  department: Department | null
  semester: Semester | null
  subjects: Subject[]
}

export interface ProfileFormData {
  display_name: string
  phone_number: string
  date_of_birth: string
  profile_image: string
  bio: string
  location: string
}
