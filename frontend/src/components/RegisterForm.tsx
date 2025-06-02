'use client'

import { useNavigate } from "react-router-dom"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '../schemas/register'
import { useRef, useState, useEffect } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from "../api/client"

const SITE_KEY = '6LcDeEkrAAAAAMk9XAW3gp96xhTXVyZgwrOSiEB5'

interface PasswordRequirement {
  label: string
  test: (password: string, username?: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    test: (password) => password.length >= 8
  },
  {
    label: 'One uppercase letter',
    test: (password) => /[A-Z]/.test(password)
  },
  {
    label: 'One lowercase letter',
    test: (password) => /[a-z]/.test(password)
  },
  {
    label: 'One number',
    test: (password) => /[0-9]/.test(password)
  },
  {
    label: 'One special character',
    test: (password) => /[^A-Za-z0-9]/.test(password)
  },
  {
    label: 'Cannot be the same as username',
    test: (password, username) => username ? password !== username : true
  }
]

interface PasswordRequirementsProps {
  password: string
  username: string
  isVisible: boolean
}

function PasswordRequirements({ password, username, isVisible }: PasswordRequirementsProps) {
  if (!isVisible) return null

  return (
    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
      <ul className="space-y-1">
        {passwordRequirements.map((requirement, index) => {
          const isValid = requirement.test(password, username)
          return (
            <li key={index} className="flex items-center text-sm">
              <span className={`mr-2 ${isValid ? 'text-green-600' : 'text-gray-400'}`}>
                {isValid ? '✓' : '○'}
              </span>
              <span className={isValid ? 'text-green-600' : 'text-gray-600'}>
                {requirement.label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function RegisterForm() {
  const navigate = useNavigate()
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const api = apiClient;
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [usernameValue, setUsernameValue] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  // Watch form values for real-time validation
  const watchedPassword = watch('password', '')
  const watchedUsername = watch('username', '')

  useEffect(() => {
    setPasswordValue(watchedPassword || '')
    setUsernameValue(watchedUsername || '')
  }, [watchedPassword, watchedUsername])

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      console.log('Making API call with data:', data)
      const response = await api.post("register/initiate", data)
      return response.data
    },
    onSuccess: (data, formData) => {
      console.log('Registration successful:', data)
      reset()
      recaptchaRef.current?.reset()

      // Display success message from backend or default
      const successMessage = data?.message || "OTP has been sent successfully to your email"
      toast.success(successMessage)

      // Redirect to VerifyOTP after successful registration with all form data
      setTimeout(() => {
        navigate('/VerifyOTP', {
          state: {
            email: formData.email,
            username: formData.username,
            password: formData.password
          }
        })
      }, 500)
    },
    onError: (error: any) => {
      console.error("Registration failed:", error)

      // Extract error message from different possible locations
      const message = error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to register user"

      console.log('Error message:', message)

      // Handle specific error types and show field-specific errors
      if (message.toLowerCase().includes('username') && message.toLowerCase().includes('already')) {
        setError('username', {
          type: 'server',
          message: 'This username is already taken. Please choose another.'
        })
      } else if (message.toLowerCase().includes('username') && message.toLowerCase().includes('invalid')) {
        setError('username', {
          type: 'server',
          message: message
        })
      } else if (message.toLowerCase().includes('email') && message.toLowerCase().includes('already')) {
        setError('email', {
          type: 'server',
          message: 'This email is already registered. Please use a different email.'
        })
      } else if (message.toLowerCase().includes('email') && message.toLowerCase().includes('invalid')) {
        setError('email', {
          type: 'server',
          message: message
        })
      } else if (message.toLowerCase().includes('password')) {
        setError('password', {
          type: 'server',
          message: message
        })
      } else if (message.toLowerCase().includes('recaptcha')) {
        toast.error('Please complete the reCAPTCHA verification')
      } else {
        // General error message
        toast.error(message)
      }

      recaptchaRef.current?.reset()
    }
  })

  // Fix the onSubmit function signature to match react-hook-form expectations
  const onSubmit = async (data: RegisterFormData) => {
    console.log('Form submitted with data:', data)

    try {
      // Get reCAPTCHA token
      const token = await recaptchaRef.current?.getValue()

      if (!token) {
        console.log('No reCAPTCHA token, showing error')
        toast.error('Please complete the reCAPTCHA')
        return
      }

      console.log('Calling mutate with token:', token)
      mutate({ ...data, recaptchaToken: token })
    } catch (error) {
      console.error('Error in onSubmit:', error)
      toast.error('An error occurred during submission')
    }
  }

  const isLoading = isPending || isSubmitting

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

      <div className="mb-4">
        <label htmlFor="username" className="block text-gray-700 mb-2">
          Username
        </label>
        <input
          id="username"
          type="text"
          {...register('username')}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.username ? 'border-red-500' : 'border-gray-300'
            }`}
          disabled={isLoading}
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
          disabled={isLoading}
          onFocus={() => setShowPasswordRequirements(true)}
          onBlur={() => setShowPasswordRequirements(false)}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
        <PasswordRequirements
          password={passwordValue}
          username={usernameValue}
          isVisible={showPasswordRequirements}
        />
      </div>

      <div className="mb-6">
        <ReCAPTCHA
          sitekey={SITE_KEY}
          ref={recaptchaRef}
          theme="light"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        disabled={isLoading}
      >
        {isLoading ? 'Registering...' : 'Register'}
      </button>

      <p className="mt-4 text-sm text-gray-600 text-center">
        By registering, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  )
}