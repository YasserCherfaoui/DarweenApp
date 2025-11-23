import { env } from '@/env'

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

/**
 * Loads the Google reCAPTCHA v3 script
 */
export const loadRecaptcha = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.grecaptcha) {
      resolve()
      return
    }

    const siteKey = env.VITE_RECAPTCHA_SITE_KEY
    if (!siteKey) {
      // If no site key, resolve without loading (for development)
      console.warn('reCAPTCHA site key not configured')
      resolve()
      return
    }

    // Check if script is already in the DOM
    const existingScript = document.querySelector(
      `script[src*="recaptcha/api.js"]`
    )
    if (existingScript) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.grecaptcha) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!window.grecaptcha) {
          reject(new Error('reCAPTCHA script failed to load'))
        }
      }, 5000)
      return
    }

    // Create and load script
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.defer = true

    script.onload = () => {
      // Wait for grecaptcha to be available
      window.grecaptcha.ready(() => {
        resolve()
      })
    }

    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA script'))
    }

    document.head.appendChild(script)
  })
}

/**
 * Executes reCAPTCHA v3 and returns a token
 * @param action - The action name (e.g., 'login', 'register')
 * @returns Promise that resolves to the reCAPTCHA token
 */
export const executeRecaptcha = async (action: string = 'submit'): Promise<string | null> => {
  const siteKey = env.VITE_RECAPTCHA_SITE_KEY

  if (!siteKey) {
    // If no site key configured, return null (for development)
    console.warn('reCAPTCHA site key not configured, skipping verification')
    return null
  }

  try {
    // Ensure reCAPTCHA is loaded
    await loadRecaptcha()

    if (!window.grecaptcha) {
      console.error('reCAPTCHA not available')
      return null
    }

    // Execute reCAPTCHA
    const token = await window.grecaptcha.execute(siteKey, { action })
    return token
  } catch (error) {
    console.error('reCAPTCHA execution failed:', error)
    return null
  }
}

/**
 * Cleans up reCAPTCHA script from the DOM
 * Call this when leaving auth pages to remove the script
 */
export const cleanupRecaptcha = (): void => {
  // Find and remove reCAPTCHA script
  const script = document.querySelector('script[src*="recaptcha/api.js"]')
  if (script) {
    script.remove()
  }

  // Clear grecaptcha from window (optional, but helps with cleanup)
  // Note: We don't delete it completely as it might be used elsewhere
  // The script removal is sufficient to prevent it from loading on non-auth pages
}

