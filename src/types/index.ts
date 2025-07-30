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

export interface RelatedPostSlide {
  title: string
  image: string
  description: string
  key_points: string[]
}

export interface RelatedPost {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_time: string
  slides: RelatedPostSlide[]
}

export interface VideoTopic {
  title: string
  description: string
  thumbnail: string
  video_url: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface VideoChapter {
  chapter: string
  description: string
  topics: VideoTopic[]
}

export interface PracticeQuestion {
  question_image: string
  options: string[]
  correct_answer: number
  explanation: string
}

export interface PracticeTest {
  title: string
  description: string
  duration: string
  questions: PracticeQuestion[]
}

export interface SubjectMaterial {
  id: string
  subject_id: string
  syllabus: string | null
  syllabus_json: any | null
  drive_link: string | null
  gate_questions: GateQuestion[]
  dpp_materials: DPPChapter[]
  related_posts: RelatedPost[]
  video_resources: VideoChapter[]
  practice_tests: PracticeTest[]
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

export interface PlacementRecord {
  id: string
  company_name: string
  job_title: string
  job_description: string
  job_type: 'internship' | 'placement' | 'both'
  posting_date: string
  deadline: string
  salary_range: string | null
  location: string | null
  requirements: string | null
  application_link: string | null
  contact_email: string | null
  is_official: boolean
  posted_by: string
  views: number
  applications_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PlacementComment {
  id: string
  placement_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface DoubtScore {
  id: string
  user_id: string
  total_score: number
  doubts_asked: number
  doubts_answered: number
  upvotes_received: number
  best_answers: number
  streak_days: number
  last_activity_date: string
  created_at: string
  updated_at: string
}

export interface DoubtScoreTransaction {
  id: string
  user_id: string
  doubt_id: string | null
  reply_id: string | null
  transaction_type: 'ask_doubt' | 'answer_doubt' | 'doubt_upvote' | 'reply_upvote' | 'best_answer' | 'quality_bonus' | 'streak_bonus'
  points_earned: number
  description: string | null
  created_at: string
}

export interface DriveResource {
  title: string
  description: string
  drive_link: string
  category: string
  file_type: 'folder' | 'document' | 'spreadsheet' | 'presentation' | 'other'
}

export interface PDFResource {
  title: string
  description: string
  pdf_link: string
  category: string
  file_size?: string
  pages?: number
}

export interface PremiumResources {
  drive_links: DriveResource[]
  pdf_files: PDFResource[]
  access_note?: string
  last_updated?: string
}