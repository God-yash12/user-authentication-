'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '../schemas/register'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const navigate = useNavigate()

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
      const response = await axios.post('http://localhost:3001/api/auth', data)
      return response.data
    },
    onSuccess: (data) => {
      toast.success('User registered successfully!', data)
      reset()
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Registration failed!'
      toast.error(message)
    },
  })

  const onSubmit = (data: RegisterFormData) => {
    mutate(data)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded"
    >
      <h2 className="text-2xl font-bold text-center mb-4">Register</h2>

      <div className="mb-4">
        <label htmlFor="username" className="block font-medium">Username</label>
        <input
          type="text"
          id="username"
          {...register('username')}
          className={`w-full border px-3 py-2 rounded ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.username && (
          <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block font-medium">Password</label>
        <input
          type="password"
          id="password"
          {...register('password')}
          className={`w-full border px-3 py-2 rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending || isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}
