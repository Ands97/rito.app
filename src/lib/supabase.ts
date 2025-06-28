import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          order_index: number
          created_at: string
        }
      }
      songs: {
        Row: {
          id: string
          title: string
          artist: string | null
          lyrics: string | null
          chords: string | null
          audio_url: string | null
          youtube_url: string | null
          cifraclub_url: string | null
          category_id: string | null
          created_at: string
        }
      }
      masses: {
        Row: {
          id: string
          title: string
          description: string | null
          mass_date: string
          liturgical_context: string | null
          company_id: string | null
          created_at: string
        }
      }
      mass_songs: {
        Row: {
          id: string
          mass_id: string
          song_id: string
          category_id: string
          order_index: number
          notes: string | null
        }
      },
      users: {
        Row: {
          id: string
          nome: string
          company_id: string
          created_at: string
        }
      },
      companies: {
        Row: {
          id: string
          name: string
          created_at: string
        }
      }
    }
  }
}