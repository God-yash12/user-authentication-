'use client'

import { Link, useNavigate } from "react-router-dom"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '../schemas/register'
import { useRef, useState, useEffect } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from "../api/client"
import { Eye, EyeOff } from 'lucide-react'

const SITE_KEY = '6LcDeEkrAAAAAMk9XAW3gp96xhTXVyZgwrOSiEB5'

// Enhanced Password Strength Analysis
interface PasswordStrength {
  score: number // 0-5
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong'
  feedback: string[]
  entropy: number
  color: string
  percentage: number
}

interface PasswordRequirement {
  label: string
  test: (password: string, username?: string) => boolean
  weight: number // For strength calculation
}

const passwordRequirements: PasswordRequirement[] = [
  {
    label: 'At least 12 characters',
    test: (password) => password.length >= 12,
    weight: 1
  },
  {
    label: 'One uppercase letter',
    test: (password) => /[A-Z]/.test(password),
    weight: 1
  },
  {
    label: 'One lowercase letter',
    test: (password) => /[a-z]/.test(password),
    weight: 1
  },
  {
    label: 'One number',
    test: (password) => /[0-9]/.test(password),
    weight: 1
  },
  {
    label: 'One special character',
    test: (password) => /[^A-Za-z0-9]/.test(password),
    weight: 1
  },
  {
    label: 'Cannot be the same as username',
    test: (password, username) => username ? password !== username : true,
    weight: 1
  },
  {
    label: 'At least 12 characters (recommended)',
    test: (password) => password.length >= 12,
    weight: 0.5
  },
  {
    label: 'No common patterns (123, abc, etc.)',
    test: (password) => !hasCommonPatterns(password),
    weight: 1
  },
  {
    label: 'No repetitive characters (aaa, 111)',
    test: (password) => !hasRepetitiveChars(password),
    weight: 1
  }
]

// Common patterns detection
function hasCommonPatterns(password: string): boolean {
  const commonPatterns = [
    /123456/i, /654321/i, /abcdef/i, /qwerty/i, /password/i,
    /admin/i, /login/i, /welcome/i, /hello/i, /test/i,
    /12345/i, /54321/i, /abc/i, /xyz/i
  ]
  return commonPatterns.some(pattern => pattern.test(password))
}

// Repetitive characters detection
function hasRepetitiveChars(password: string): boolean {
  return /(.)\1{2,}/.test(password) // 3 or more same characters in a row
}

// Calculate password entropy
function calculateEntropy(password: string): number {
  let charSpace = 0
  if (/[a-z]/.test(password)) charSpace += 26
  if (/[A-Z]/.test(password)) charSpace += 26
  if (/[0-9]/.test(password)) charSpace += 10
  if (/[^A-Za-z0-9]/.test(password)) charSpace += 32

  return password.length * Math.log2(charSpace)
}

// Enhanced password strength calculation
function calculatePasswordStrength(password: string, username: string = ''): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      strength: 'Very Weak',
      feedback: ['Enter a password'],
      entropy: 0,
      color: '#ef4444',
      percentage: 0
    }
  }

  let score = 0
  let maxScore = 0
  const feedback: string[] = []

  // Calculate score based on requirements
  passwordRequirements.forEach(requirement => {
    maxScore += requirement.weight
    if (requirement.test(password, username)) {
      score += requirement.weight
    } else {
      feedback.push(requirement.label)
    }
  })

  // Additional scoring factors
  const entropy = calculateEntropy(password)

  // Bonus points for length
  if (password.length >= 16) score += 1
  if (password.length >= 20) score += 0.5
  maxScore += 1.5

  // Penalty for common passwords (basic check)
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'welcome']
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    score -= 2
    feedback.push('Avoid common passwords')
  }

  // Calculate final percentage and strength
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100))

  let strength: PasswordStrength['strength']
  let color: string

  if (percentage < 20) {
    strength = 'Very Weak'
    color = '#ef4444' // red-500
  } else if (percentage < 40) {
    strength = 'Weak'
    color = '#f97316' // orange-500
  } else if (percentage < 60) {
    strength = 'Fair'
    color = '#eab308' // yellow-500
  } else if (percentage < 80) {
    strength = 'Good'
    color = '#22c55e' // green-500
  } else if (percentage < 95) {
    strength = 'Strong'
    color = '#16a34a' // green-600
  } else {
    strength = 'Very Strong'
    color = '#15803d' // green-700
  }

  return {
    score,
    strength,
    feedback: feedback.slice(0, 5), // Limit feedback items
    entropy: Math.round(entropy),
    color,
    percentage: Math.round(percentage)
  }
}

// Password Strength Meter Component
interface PasswordStrengthMeterProps {
  password: string
  username: string
  isVisible: boolean
}

function PasswordStrengthMeter({ password, username, isVisible }: PasswordStrengthMeterProps) {
  if (!isVisible) return null

  const strength = calculatePasswordStrength(password, username)

  return (
    <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      {/* Strength Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Password Strength:</span>
        <span
          className="text-sm font-bold"
          style={{ color: strength.color }}
        >
          {strength.strength}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{
              width: `${strength.percentage}%`,
              backgroundColor: strength.color
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Weak</span>
          <span>Strong</span>
        </div>
      </div>

      {/* Entropy Display */}
      {password && (
        <div className="mb-3 text-xs text-gray-600">
          <span>Password Entropy: {strength.entropy} bits</span>
        </div>
      )}

      {/* Requirements List */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
        <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
          {passwordRequirements.slice(0, 6).map((requirement, index) => {
            const isValid = requirement.test(password, username)
            return (
              <div key={index} className="flex items-center text-xs">
                <span className={`mr-2 font-bold ${isValid ? 'text-green-600' : 'text-gray-400'}`}>
                  {isValid ? '✓' : '○'}
                </span>
                <span className={isValid ? 'text-green-600' : 'text-gray-600'}>
                  {requirement.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Feedback Messages */}
        {strength.feedback.length > 0 && password && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-1">Suggestions:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {strength.feedback.slice(0, 3).map((feedback, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-1 text-orange-500">•</span>
                  {feedback}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export function RegisterForm() {
  const navigate = useNavigate()
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const api = apiClient;
  const [showPasswordMeter, setShowPasswordMeter] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [usernameValue, setUsernameValue] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
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

  // Calculate current password strength for form validation
  const currentStrength = calculatePasswordStrength(passwordValue, usernameValue)

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

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
        <label htmlFor="firstName" className="block text-gray-700 mb-2">
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          {...register('firstName')}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
          disabled={isLoading}
        />
        {errors.firstName && (
          <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="lastName" className="block text-gray-700 mb-2">
          Last Name
        </label>
        <input
          id="lastName"
          type="text"
          {...register('lastName')}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
          disabled={isLoading}
        />
        {errors.lastName && (
          <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
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
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register('password')}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            disabled={isLoading}
            onFocus={() => {
              setShowPasswordMeter(true)
            }}
            onBlur={() => {
              setShowPasswordMeter(false)
            }}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}

        {/* Enhanced Password Strength Meter */}
        <PasswordStrengthMeter
          password={passwordValue}
          username={usernameValue}
          isVisible={showPasswordMeter}
        />

        {/* Fallback simple requirements for mobile or when meter is hidden */}
        {!showPasswordMeter && passwordValue && (
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <div
                className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{ backgroundColor: currentStrength.color, opacity: 0.3 }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: currentStrength.color }}
              >
                {currentStrength.strength}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <ReCAPTCHA
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || SITE_KEY}
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
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-bold">Login Now</Link>
      </p>

      <p className="mt-4 text-sm text-gray-600 text-center">
        By registering, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  )
}