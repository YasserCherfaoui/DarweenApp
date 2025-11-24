import { useEffect } from 'react'
import { loadRecaptcha, cleanupRecaptcha } from '@/lib/recaptcha'

/**
 * Hook to load reCAPTCHA on auth pages
 * Automatically loads on mount and cleans up on unmount
 * Only use this hook on authentication pages (login, register, etc.)
 */
export const useRecaptcha = () => {
  useEffect(() => {
    // Load reCAPTCHA when component mounts
    loadRecaptcha().catch((error) => {
      console.error('Failed to load reCAPTCHA:', error)
    })

    // Cleanup: Remove reCAPTCHA script when component unmounts
    return () => {
      cleanupRecaptcha()
    }
  }, [])
}



