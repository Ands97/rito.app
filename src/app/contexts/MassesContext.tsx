'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { type Mass } from '@/types'
import { useAuth } from '@/context/AuthContext'

interface MassesContextType {
  masses: Mass[]
  loading: boolean
  createMass: (data: Partial<Mass>) => Promise<Mass>
  removeMass: (id: string) => Promise<void>
  refetch: () => Promise<void>
  canEditMass: (mass: Mass) => boolean
}

const MassesContext = createContext<MassesContextType>({
  masses: [],
  loading: true,
  createMass: () => Promise.reject(new Error('Context not initialized')),
  removeMass: () => Promise.reject(new Error('Context not initialized')),
  refetch: () => Promise.reject(new Error('Context not initialized')),
  canEditMass: () => false
})

export function MassesProvider({ children }: { children: React.ReactNode }) {
  const [masses, setMasses] = useState<Mass[]>([])
  const [loading, setLoading] = useState(true)
  const auth = useAuth();
  const user = auth?.user;

  const refetch = useCallback(async () => {
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
    if (!user) {
      throw new Error('Você precisa estar logado para criar uma missa')
    }

    const { data, error } = await supabase
      .from('masses')
      .insert([
        {
          ...massData,
          user_id: user.id,
          company_id: user.company_id
        }
      ])
      .select()
      .single()

    if (error) throw error
    setMasses(prev => [data, ...prev])
    return data
  }

  const removeMass = async (id: string) => {
    if (!user) {
      throw new Error('Você precisa estar logado para remover uma missa')
    }

    const { data: massData, error: fetchError } = await supabase
      .from('masses')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    if (!massData) throw new Error('Missa não encontrada')
    if (massData.user_id !== user.id) {
      throw new Error('Você só pode remover missas que você criou')
    }

    const { error } = await supabase
      .from('masses')
      .delete()
      .eq('id', id)

    if (error) throw error
    setMasses(prev => prev.filter(m => m.id !== id))
  }

  const canEditMass = (mass: Mass): boolean => {
    return user?.id === mass.user_id;
  };

  return (
    <MassesContext.Provider
      value={{
        masses,
        loading,
        createMass,
        removeMass,
        refetch,
        canEditMass
      }}
    >
      {children}
    </MassesContext.Provider>
  );
}

export const useMasses = () => {
  const context = useContext(MassesContext)
  if (!context) {
    throw new Error('useMasses must be used within a MassesProvider')
  }
  return context
}
