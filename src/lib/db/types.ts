export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      trees: {
        Row: {
          created_at: string
          id: string
          name: string
          structure: Json
          tree_type: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          structure: Json
          tree_type: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          structure?: Json
          tree_type?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
