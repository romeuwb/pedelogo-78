import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  user_id: string
  role: 'client' | 'restaurant_owner' | 'admin'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

interface AuthActions {
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      profile: null,
      session: null,
      loading: false,
      initialized: false,

      // Actions
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),

      signIn: async (email: string, password: string) => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            return { error: error.message }
          }

          if (data.user) {
            set({ user: data.user, session: data.session })
            
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()

            if (profile) {
              set({ profile })
            }
          }

          return {}
        } catch (error) {
          return { error: 'Erro inesperado ao fazer login' }
        } finally {
          set({ loading: false })
        }
      },

      signUp: async (email: string, password: string, fullName?: string) => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              }
            }
          })

          if (error) {
            return { error: error.message }
          }

          if (data.user) {
            // Create user record
            await supabase
              .from('users')
              .upsert({
                id: data.user.id,
                email: data.user.email!,
                full_name: fullName || null,
              })

            // Create profile record
            const { data: profile } = await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                user_id: data.user.id,
                role: 'client',
              })
              .select()
              .single()

            set({ 
              user: data.user, 
              session: data.session, 
              profile: profile || null 
            })
          }

          return {}
        } catch (error) {
          return { error: 'Erro inesperado ao criar conta' }
        } finally {
          set({ loading: false })
        }
      },

      signOut: async () => {
        set({ loading: true })
        try {
          await supabase.auth.signOut()
          set({ user: null, profile: null, session: null })
        } finally {
          set({ loading: false })
        }
      },

      initialize: async () => {
        set({ loading: true })
        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            set({ 
              user: session.user, 
              session, 
              profile: profile || null 
            })
          }
        } finally {
          set({ loading: false, initialized: true })
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            set({ 
              user: session.user, 
              session, 
              profile: profile || null 
            })
          } else if (event === 'SIGNED_OUT') {
            set({ user: null, session: null, profile: null })
          }
        })
      },

      updateProfile: async (updates) => {
        const { user, profile } = get()
        if (!user || !profile) {
          return { error: 'Usuário não autenticado' }
        }

        set({ loading: true })
        try {
          const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single()

          if (error) {
            return { error: error.message }
          }

          set({ profile: data })
          return {}
        } catch (error) {
          return { error: 'Erro ao atualizar perfil' }
        } finally {
          set({ loading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
      }),
    }
  )
)