import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import type { RegisterFormData } from '../schemas/register'
import toast from 'react-hot-toast'

export const useRegister = () => {
    return useMutation({
        mutationFn: (data: RegisterFormData) =>
            apiClient.post('api/auth', data).then(res => res.data),
        onSuccess: () => {
            toast.success('Registration successful!')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Registration failed')
        },
    })
}