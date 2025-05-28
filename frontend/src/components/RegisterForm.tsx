'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '../schemas/register'
import { useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import axios from 'axios'
import  { useNavigate } from "react-router-dom"

const SITE_KEY = '6LcDeEkrAAAAAMk9XAW3gp96xhTXVyZgwrOSiEB5'

export function RegisterForm() {
  const navigate = useNavigate()
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      console.log('Making API call with data:', data)
      const response = await axios.post("http://localhost:3001/api/auth", data)
      return response.data
    },
    onSuccess: (data) => {
      console.log('Registration successful:', data)
      reset()
      recaptchaRef.current?.reset()
      toast.success("User registered successfully")
      
      // Redirect to dashboard after successful registration
      setTimeout(() => {    
        navigate('/dashboard')
      }, 1500) 
    },
    onError: (error: any) => {
      console.error("Registration failed:", error)
      const message = error?.response?.data?.message || "Failed to register user"
      toast.error(message)
      recaptchaRef.current?.reset()
    },
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
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.username ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
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
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
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
      >
        {isLoading ? 'Registering...' : 'Register'}
      </button>

      <p className="mt-4 text-sm text-gray-600 text-center">
        By registering, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  )
}