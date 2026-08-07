import { create } from 'zustand'

export type UserProfile = {
  id: string
  email: string
  full_name: string | null
  phone?: string | null
  avatar: string | null
  role: 'CUSTOMER' | 'ADMIN'
  created_at?: string
}

interface UserState {
  profile: UserProfile | null
  setProfile: (profile: UserProfile | null) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
}))
