export type PlanType = 'FULL' | 'SINGLE_SUBJECT'
export type EntitlementType = 'FULL' | 'SUBJECT'
export type OrderStatus = 'created' | 'paid' | 'failed'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Language = 'en' | 'hi' | 'hinglish'

export interface Subject {
  id: string
  slug: string
  name: string
  description: string | null
  order_index: number
  is_active: boolean
  created_at: string
}

export interface Topic {
  id: string
  subject_id: string
  slug: string
  title: string
  order_index: number
  created_at: string
}

export interface TopicContent {
  id: string
  topic_id: string
  language: Language
  short_notes_md: string | null
  detailed_notes_md: string | null
  flowchart_mermaid: string | null
  updated_at: string
}

export interface TopicTable {
  id: string
  topic_id: string
  language: Language
  title: string
  table_json: {
    headers: string[]
    rows: string[][]
  }
}

export interface TopicDiagram {
  id: string
  topic_id: string
  image_url: string
  caption: string | null
  language: Language
  alt_text: string | null
}

export interface PYQ {
  id: string
  topic_id: string
  year: number
  question: string
  options: { A: string; B: string; C: string; D: string }
  answer: 'A' | 'B' | 'C' | 'D'
  explanation: string | null
  paper_source: string | null
  created_at: string
}

export interface Quiz {
  id: string
  topic_id: string
  quiz_no: number
  title: string | null
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question_no: number
  question: string
  options: { A: string; B: string; C: string; D: string }
  answer: 'A' | 'B' | 'C' | 'D'
  explanation: string | null
  difficulty: Difficulty
}

export interface Order {
  id: string
  user_id: string
  plan_type: PlanType
  subject_id: string | null
  amount_paise: number
  razorpay_order_id: string
  razorpay_payment_id: string | null
  status: OrderStatus
  created_at: string
}

export interface Entitlement {
  id: string
  user_id: string
  type: EntitlementType
  subject_id: string | null
  activated_at: string
}

export interface AiNotesCache {
  id: string
  user_id: string
  topic_id: string
  language: Language
  prompt_version: string
  content_md: string
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  user_id: string
  email: string | null
  phone: string | null
  created_at: string
}
