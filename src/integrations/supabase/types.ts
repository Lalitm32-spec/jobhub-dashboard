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
      ai_usage: {
        Row: {
          created_at: string
          date: string
          id: string
          provider: string
          tokens: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          provider: string
          tokens: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          provider?: string
          tokens?: number
          user_id?: string
        }
        Relationships: []
      }
      cold_email_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gmail_integrations: {
        Row: {
          created_at: string
          gmail_token: string | null
          id: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gmail_token?: string | null
          id?: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gmail_token?: string | null
          id?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_emails: {
        Row: {
          category: string | null
          company_name: string | null
          created_at: string
          email_content: string | null
          email_id: string
          id: string
          is_read: boolean | null
          job_id: string | null
          message_id: string | null
          position: string | null
          received_at: string
          sender: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          company_name?: string | null
          created_at?: string
          email_content?: string | null
          email_id: string
          id?: string
          is_read?: boolean | null
          job_id?: string | null
          message_id?: string | null
          position?: string | null
          received_at: string
          sender: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          company_name?: string | null
          created_at?: string
          email_content?: string | null
          email_id?: string
          id?: string
          is_read?: boolean | null
          job_id?: string | null
          message_id?: string | null
          position?: string | null
          received_at?: string
          sender?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_emails_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_search_queries: {
        Row: {
          created_at: string
          id: string
          query: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          company: string
          created_at: string
          date: string | null
          id: string
          position: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          date?: string | null
          id?: string
          position: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          date?: string | null
          id?: string
          position?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          provider: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          provider?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          provider?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      resume_optimizations: {
        Row: {
          cold_email: string | null
          cover_letter: string | null
          created_at: string
          id: string
          job_description: string
          optimized_resume_path: string | null
          original_resume_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cold_email?: string | null
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_description: string
          optimized_resume_path?: string | null
          original_resume_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cold_email?: string | null
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_description?: string
          optimized_resume_path?: string | null
          original_resume_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resume_processing: {
        Row: {
          cold_email: string | null
          cover_letter: string | null
          created_at: string | null
          error_message: string | null
          google_docs_link: string | null
          id: string
          job_description: string
          optimized_resume: string | null
          original_file_url: string
          status: Database["public"]["Enums"]["processing_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cold_email?: string | null
          cover_letter?: string | null
          created_at?: string | null
          error_message?: string | null
          google_docs_link?: string | null
          id?: string
          job_description: string
          optimized_resume?: string | null
          original_file_url: string
          status?: Database["public"]["Enums"]["processing_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cold_email?: string | null
          cover_letter?: string | null
          created_at?: string | null
          error_message?: string | null
          google_docs_link?: string | null
          id?: string
          job_description?: string
          optimized_resume?: string | null
          original_file_url?: string
          status?: Database["public"]["Enums"]["processing_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      states: {
        Row: {
          created_at: string | null
          id: string
          state: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          state: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          state?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      processing_status: "pending" | "processing" | "completed" | "error"
      subscription_plan_type: "trial" | "basic" | "pro" | "enterprise"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
