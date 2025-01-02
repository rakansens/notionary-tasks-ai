export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          created_at: string
          id: number
          name: string
          order_position: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          name: string
          order_position?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          name?: string
          order_position?: number
          updated_at?: string
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          id: number
          title: string
          completed: boolean
          order_position: number
          group_id: number | null
          parent_id: number | null
          created_at: string
          updated_at: string
          hierarchy_level: number
          parent_title: string | null
        }
        Insert: {
          id?: never
          title: string
          completed?: boolean
          order_position?: number
          group_id?: number | null
          parent_id?: number | null
          created_at?: string
          updated_at?: string
          hierarchy_level?: number
          parent_title?: string | null
        }
        Update: {
          id?: never
          title?: string
          completed?: boolean
          order_position?: number
          group_id?: number | null
          parent_id?: number | null
          created_at?: string
          updated_at?: string
          hierarchy_level?: number
          parent_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: number
          title: string
          completed: boolean
          order_position: number
          group_id: number | null
          parent_id: number | null
          created_at: string
          updated_at: string
          hierarchy_level: number
        }
        Insert: {
          id?: never
          title: string
          completed?: boolean
          order_position?: number
          group_id?: number | null
          parent_id?: number | null
          created_at?: string
          updated_at?: string
          hierarchy_level?: number
        }
        Update: {
          id?: never
          title?: string
          completed?: boolean
          order_position?: number
          group_id?: number | null
          parent_id?: number | null
          created_at?: string
          updated_at?: string
          hierarchy_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "tasks_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "groups"
            referencedColumns: ["id"]
          }
        ]
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