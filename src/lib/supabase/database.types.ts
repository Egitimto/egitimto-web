export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          amac_ilkeler_en: string
          amac_ilkeler_tr: string
          id: number
          tuzuk_pdf_url: string | null
          updated_at: string
        }
        Insert: {
          amac_ilkeler_en?: string
          amac_ilkeler_tr?: string
          id?: number
          tuzuk_pdf_url?: string | null
          updated_at?: string
        }
        Update: {
          amac_ilkeler_en?: string
          amac_ilkeler_tr?: string
          id?: number
          tuzuk_pdf_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          id: string
          pdf_url: string
          sort_order: number
          title: string
          type: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          pdf_url: string
          sort_order?: number
          title: string
          type: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          pdf_url?: string
          sort_order?: number
          title?: string
          type?: string
          year?: number
        }
        Relationships: []
      }
      events: {
        Row: {
          apply_button_url: string | null
          content_en: string
          content_tr: string
          cover_image: string | null
          created_at: string
          event_date: string | null
          id: string
          is_published: boolean
          location: string | null
          published_at: string | null
          show_apply_button: boolean
          slug: string
          title_en: string
          title_tr: string
          updated_at: string
        }
        Insert: {
          apply_button_url?: string | null
          content_en?: string
          content_tr?: string
          cover_image?: string | null
          created_at?: string
          event_date?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          published_at?: string | null
          show_apply_button?: boolean
          slug: string
          title_en: string
          title_tr: string
          updated_at?: string
        }
        Update: {
          apply_button_url?: string | null
          content_en?: string
          content_tr?: string
          cover_image?: string | null
          created_at?: string
          event_date?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          published_at?: string | null
          show_apply_button?: boolean
          slug?: string
          title_en?: string
          title_tr?: string
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          apply_button_url: string | null
          content_en: string
          content_tr: string
          cover_image: string | null
          created_at: string
          id: string
          is_published: boolean
          published_at: string | null
          show_apply_button: boolean
          slug: string
          title_en: string
          title_tr: string
          updated_at: string
        }
        Insert: {
          apply_button_url?: string | null
          content_en?: string
          content_tr?: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          show_apply_button?: boolean
          slug: string
          title_en: string
          title_tr: string
          updated_at?: string
        }
        Update: {
          apply_button_url?: string | null
          content_en?: string
          content_tr?: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          show_apply_button?: boolean
          slug?: string
          title_en?: string
          title_tr?: string
          updated_at?: string
        }
        Relationships: []
      }
      partnerships: {
        Row: {
          id: string
          logo_url: string
          name: string
          project_description_en: string
          project_description_tr: string
          sort_order: number
        }
        Insert: {
          id?: string
          logo_url: string
          name: string
          project_description_en?: string
          project_description_tr?: string
          sort_order?: number
        }
        Update: {
          id?: string
          logo_url?: string
          name?: string
          project_description_en?: string
          project_description_tr?: string
          sort_order?: number
        }
        Relationships: []
      }
      team_categories: {
        Row: {
          id: string
          name_en: string
          name_tr: string
          sort_order: number
        }
        Insert: {
          id?: string
          name_en: string
          name_tr: string
          sort_order?: number
        }
        Update: {
          id?: string
          name_en?: string
          name_tr?: string
          sort_order?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          category_id: string
          email: string | null
          full_name: string
          id: string
          photo_url: string | null
          role_en: string
          role_tr: string
          social_links: Json
          sort_order: number
        }
        Insert: {
          category_id: string
          email?: string | null
          full_name: string
          id?: string
          photo_url?: string | null
          role_en: string
          role_tr: string
          social_links?: Json
          sort_order?: number
        }
        Update: {
          category_id?: string
          email?: string | null
          full_name?: string
          id?: string
          photo_url?: string | null
          role_en?: string
          role_tr?: string
          social_links?: Json
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_members_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "team_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
