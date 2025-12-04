import { apiClient } from './api-client'
import { setAuthUser } from '@/stores/auth-store'
import type { AuthResponse } from '@/types/api'

/**
 * Initiates Google OAuth flow by redirecting to backend OAuth endpoint
 */
export const initiateGoogleOAuth = async (): Promise<void> => {
  try {
    const response = await apiClient.auth.initiateGoogleOAuth()
    if (response.success && response.data?.url) {
      // Redirect to Google OAuth consent screen
      window.location.href = response.data.url
    } else {
      throw new Error('Failed to initiate Google OAuth')
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to initiate Google OAuth')
  }
}

/**
 * Handles OAuth callback by extracting token from URL and storing it
 * This is called from the OAuth callback route
 */
export const handleGoogleOAuthCallback = (): { token: string; user?: any } | null => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')

  if (!token) {
    return null
  }

  // Store token and user info
  // The backend redirects with token in query param
  // We'll need to fetch user info or it might be in the redirect
  return { token }
}

/**
 * Completes OAuth login by storing token and user info
 */
export const completeGoogleOAuthLogin = async (token: string): Promise<void> => {
  // Temporarily set token so getMe() can authenticate
  // setAuthUser will clear all localStorage data before setting new auth data
  try {
    // Set token temporarily for authentication
    localStorage.setItem('auth_token', token)
    
    // Fetch user info using the token
    const response = await apiClient.users.getMe()
    
    if (response.success && response.data) {
      // setAuthUser will clear localStorage (including the temp token) and set everything properly
      setAuthUser(response.data, token)
    } else {
      // Remove temp token if getMe failed
      localStorage.removeItem('auth_token')
      throw new Error('Failed to fetch user info after OAuth login')
    }
  } catch (error) {
    // If fetching user fails, remove temp token
    // User will need to login again
    localStorage.removeItem('auth_token')
    console.error('Failed to fetch user info after OAuth login:', error)
    throw error
  }
}

