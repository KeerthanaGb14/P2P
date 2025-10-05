import { useState, useEffect } from 'react'
import { User as AuthUser } from '@supabase/supabase-js'
import { supabase, User, isSupabaseConfigured } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If Supabase is not configured, set loading to false and return
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured')
      setLoading(false)
      return
    }

    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth...')
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          if (mounted) setLoading(false)
          return
        }

        console.log('Session:', session)
        
        if (mounted) {
          setUser(session?.user ?? null)
        }

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          if (mounted) setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        
        if (mounted) {
          setUser(session?.user ?? null)
        }

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          if (mounted) {
            setProfile(null)
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (authId: string) => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }
    
    try {
      console.log('📋 Fetching profile for:', authId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          console.log('Profile not found, creating...')
          await createProfile(authId)
        } else {
          console.error('Error fetching profile:', error)
          setLoading(false)
        }
      } else {
        console.log('Profile found:', data)
        setProfile(data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      setLoading(false)
    }
  }

  const createProfile = async (authId: string) => {
    if (!isSupabaseConfigured()) return
    
    try {
      // Get the current user to access email
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        throw new Error('No user found for profile creation')
      }
  
      // FIRST: Check if a profile already exists for this auth_id
      const { data: existingProfile, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .maybeSingle() // Use maybeSingle instead of single to avoid throwing if no profile exists
  
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows
        throw checkError
      }
  
      // If profile already exists, return it
      if (existingProfile) {
        console.log('Profile already exists, returning existing profile')
        return existingProfile
      }
  
      // Only create a new profile if one doesn't exist
      console.log('Creating new profile for auth user:', authId)
      
      // Generate a unique username
      const baseUsername = currentUser.email?.split('@')[0] || 'researcher'
      const uniqueUsername = `${baseUsername}_${Math.random().toString(36).substr(2, 6)}`
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          auth_id: authId,
          username: uniqueUsername,
          full_name: currentUser.user_metadata?.full_name || baseUsername,
          role: 'researcher'
        })
        .select()
        .single()
  
      if (error) {
        console.error('Error creating profile:', error)
        return null
      }
      
      console.log('Profile created successfully:', data.id)
      return data
    } catch (error) {
      console.error('Error in createProfile:', error)
      return null
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured. Please set up your environment variables.' } }
    }
    
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      setLoading(false)
    }
    
    return { error }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured. Please set up your environment variables.' } }
    }
    
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    
    if (error) {
      setLoading(false)
    }
    
    return { error }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      return { error: null }
    }
    
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    setLoading(false)
    return { error }
  }

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut
  }
}