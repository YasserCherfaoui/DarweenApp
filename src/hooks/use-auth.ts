import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { login as loginApi, register as registerApi, logout as logoutApi } from '@/lib/auth'
import { authStore } from '@/stores/auth-store'
import type { LoginRequest, RegisterRequest } from '@/types/api'
import { toast } from 'sonner'

export const useAuth = () => {
  const authState = useStore(authStore)
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: () => {
      toast.success('Login successful!')
      navigate({ to: '/companies' })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed')
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => registerApi(data),
    onSuccess: () => {
      toast.success('Registration successful!')
      navigate({ to: '/companies' })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed')
    },
  })

  const logout = () => {
    logoutApi()
    toast.success('Logged out successfully')
    navigate({ to: '/login' })
  }

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  }
}



