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
      dataset_column_presence: {
        Row: {
          created_at: string
          dataset_id: number
          dimension_id: number
        }
        Insert: {
          created_at?: string
          dataset_id: number
          dimension_id: number
        }
        Update: {
          created_at?: string
          dataset_id?: number
          dimension_id?: number
        }
      }
      dataset_tree_associations: {
        Row: {
          created_at: string
          dataset_id: number
          evaluated_at: string
          id: string
          metadata: Json | null
          results_jsonb: Json | null
          tree_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dataset_id: number
          evaluated_at?: string
          id?: string
          metadata?: Json | null
          results_jsonb?: Json | null
          tree_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          dataset_id?: number
          evaluated_at?: string
          id?: string
          metadata?: Json | null
          results_jsonb?: Json | null
          tree_id?: string
          user_id?: string
        }
      }
      dataset_upload_status: {
        Row: {
          created_at: string
          dataset_id: number | null
          error_message: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dataset_id?: number | null
          error_message?: string | null
          id?: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dataset_id?: number | null
          error_message?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
      }
      datasets: {
        Row: {
          aligned_file_path: string | null
          aligned_web_url: string | null
          alignment_mapping: Json | null
          arabic_columns: number | null
          claim_category: string
          columns: number
          country: string
          created_at: string
          date_period: string | null
          file_name: string | null
          id: number
          insurance_company: string
          nickname: string | null
          raw_file_path: string | null
          raw_web_url: string | null
          rows: number
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          aligned_file_path?: string | null
          aligned_web_url?: string | null
          alignment_mapping?: Json | null
          arabic_columns?: number | null
          claim_category?: string
          columns: number
          country: string
          created_at?: string
          date_period?: string | null
          file_name?: string | null
          id?: number
          insurance_company: string
          nickname?: string | null
          raw_file_path?: string | null
          raw_web_url?: string | null
          rows: number
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          aligned_file_path?: string | null
          aligned_web_url?: string | null
          alignment_mapping?: Json | null
          arabic_columns?: number | null
          claim_category?: string
          columns?: number
          country?: string
          created_at?: string
          date_period?: string | null
          file_name?: string | null
          id?: number
          insurance_company?: string
          nickname?: string | null
          raw_file_path?: string | null
          raw_web_url?: string | null
          rows?: number
          uploaded_at?: string | null
          user_id?: string | null
        }
      }
      dimensions: {
        Row: {
          category: string
          claim_category: string
          created_at: string
          data_type: string
          description: string | null
          display_name: string
          id: number
          is_critical: boolean | null
          name: string
        }
        Insert: {
          category: string
          claim_category: string
          created_at?: string
          data_type: string
          description?: string | null
          display_name: string
          id?: number
          is_critical?: boolean | null
          name: string
        }
        Update: {
          category?: string
          claim_category?: string
          created_at?: string
          data_type?: string
          description?: string | null
          display_name?: string
          id?: number
          is_critical?: boolean | null
          name?: string
        }
      }
      rule_sets: {
        Row: {
          created_at: string | null
          dataset_id: number | null
          id: string
          last_edited_at: string | null
          name: string
          rule_count: number | null
          rules: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dataset_id?: number | null
          id?: string
          last_edited_at?: string | null
          name: string
          rule_count?: number | null
          rules?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dataset_id?: number | null
          id?: string
          last_edited_at?: string | null
          name?: string
          rule_count?: number | null
          rules?: Json
          updated_at?: string | null
          user_id?: string | null
        }
      }
      trees: {
        Row: {
          created_at: string
          id: string
          name: string
          structure: Json
          tree_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          structure: Json
          tree_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          structure?: Json
          tree_type?: string
          user_id?: string | null
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

// Claim category type used across the application
export type ClaimCategory = 'medical' | 'motor';
