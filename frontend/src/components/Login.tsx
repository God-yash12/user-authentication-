import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const loginUser = async (data: LoginForm) => {
  const response = await apiClient.post("/login", data);
  return response.data;
};

const Login: React.FC = () => {
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  // React.useEffect(() => {
  //   const accessToken = sessionStorage.getItem("accessToken");
  //   if (accessToken) {
  //     navigate("/dashboard");
  //   }
  // }, [navigate]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("refreshToken", data.refreshToken);
      sessionStorage.setItem("accessToken", data.accessToken);
      navigate("/dashboard");
    },
    onError: (error: any) => {
      console.error("Login error:", error);

      // Extract error message from different possible locations
      const message = error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An error occurred during login";

      // Handle specific error cases
      if (message.toLowerCase().includes('invalid email') ||
        message.toLowerCase().includes('invalid password') ||
        message.toLowerCase().includes('invalid credentials') ||
        error?.response?.status === 401) {
        // Set field-specific errors for invalid credentials
        setError('email', {
          type: 'server',
          message: 'Invalid email or password'
        });
        setError('password', {
          type: 'server',
          message: 'Invalid email or password'
        });
      }
    }
  });

  // Get the error message for display
  const getErrorMessage = () => {
    if (!mutation.isError) return null;

    const error = mutation.error as any;
    return error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'An error occurred during login';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Sign in to your account</h2>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email or Username
            </label>
            <input
              type="text"
              {...register("email")}
              disabled={mutation.isPending}
              className={`w-full px-4 py-2 border rounded focus:outline-none transition ${errors.email
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
                }`}
              placeholder="Enter your email or username"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              disabled={mutation.isPending}
              className={`w-full px-4 py-2 border rounded focus:outline-none transition ${errors.password
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
                }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-2 font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white transition disabled:bg-blue-400"
          >
            {mutation.isPending ? "Logging in..." : "Login"}
          </button>

          {/* Error message display */}
          {mutation.isError && (
            <p className="text-center text-red-600 text-sm mt-2">
              {getErrorMessage()}
            </p>
          )}

          {/* Success message display */}
          {mutation.isSuccess && (
            <p className="text-center text-green-600 text-sm mt-2">Login successful!</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;