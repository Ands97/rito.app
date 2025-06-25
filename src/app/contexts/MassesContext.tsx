'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Mass } from '@/types'

interface MassesContextType {
  masses: Mass[]
  loading: boolean
  createMass: (data: Partial<Mass>) => Promise<Mass>
  removeMass: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

const MassesContext = createContext<MassesContextType | null>(null)

export function MassesProvider({ children }: { children: React.ReactNode }) {
  const [masses, setMasses] = useState<Mass[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMasses = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('masses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMasses(data || [])
    } catch (error) {
      console.error('Error fetching masses:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const createMass = async (massData: Partial<Mass>) => {
    const { data, error } = await supabase
      .from('masses')
      .insert([massData])
      .select()
      .single()

    if (error) throw error
    setMasses(prev => [data, ...prev])
    return data
  }

  const removeMass = async (id: string) => {
    const { error } = await supabase
      .from('masses')
      .delete()
      .eq('id', id)

    if (error) throw error
    setMasses(prev => prev.filter(mass => mass.id !== id))
  }

  return (
    <MassesContext.Provider
      value={{ masses, loading, createMass, removeMass, refetch: fetchMasses }}
    >
      {children}
    </MassesContext.Provider>
  )
}

export const useMasses = () => {
  const ctx = useContext(MassesContext)
  if (!ctx) throw new Error('useMasses must be used inside MassesProvider')
  return ctx
}
