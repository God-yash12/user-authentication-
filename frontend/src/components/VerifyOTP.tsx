import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "../api/client";
import { toast } from "react-hot-toast";

const OTP_LENGTH = 6;

const otpSchema = z.object({
    otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^[0-9]+$/, "OTP must contain only numbers"),
});

type OTPFormData = z.infer<typeof otpSchema>;

const VerifyOTP: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { email, username, password, firstName, lastName } = location.state || {};

    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const [resendStatus, setResendStatus] = useState<string | null>(null);
    const api = apiClient;

    React.useEffect(() => {
        if (!email || !username || !password || !firstName || !lastName) {
            console.error("Missing registration data, redirecting to register");
            navigate("/register", {
                state: { error: "Missing registration data. Please try again." },
            });
            toast.error("Missing registration data. Please try again.");
        }
    }, [email, username, password, firstName, lastName, navigate]);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<OTPFormData>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    });

    const otpValue = watch("otp");

    const verifyOTPMutation = useMutation({
        mutationFn: async (otp: string) => {
            const response = await api.post("register/complete", { otp, email, username, password, firstName, lastName });
            return response.data;
        },
        onSuccess: () => {
            navigate("/dashboard");
        },
        onError: (error: any) => {
            console.error("OTP verification failed:", error);
        },
    });

    const resendOtpMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post("register/resend-otp", { email });
            return response.data;
        },
        onSuccess: () => {
            setResendStatus("OTP resent successfully.");
        },
        onError: () => {
            setResendStatus("Failed to resend OTP. Please try again later.");
        },
    });

    const handleInputChange = (index: number, value: string) => {
        if (!/^[0-9]*$/.test(value)) return;

        // Create array of current OTP digits, filling missing positions with empty strings
        const otpArray = Array.from({ length: OTP_LENGTH }, (_, i) => otpValue[i] || "");
        
        // Update the specific index with new value (take only last character if multiple)
        otpArray[index] = value.slice(-1);

        // Join array and remove any trailing empty strings, but keep leading/middle empty positions
        const updatedOtp = otpArray.join("").replace(/\s+$/, "");
        setValue("otp", updatedOtp);

        // Move to next input if current input has value and not at last position
        if (value && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            // Create array of current OTP digits
            const otpArray = Array.from({ length: OTP_LENGTH }, (_, i) => otpValue[i] || "");

            if (!otpArray[index] || otpArray[index] === "") {
                // If current position is empty, go to previous and clear it
                if (index > 0) {
                    inputsRef.current[index - 1]?.focus();
                    otpArray[index - 1] = "";
                }
            } else {
                // Clear current position
                otpArray[index] = "";
            }

            // Update OTP value
            const updatedOtp = otpArray.join("").replace(/\s+$/, "");
            setValue("otp", updatedOtp);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (paste.length === OTP_LENGTH) {
            setValue("otp", paste);
            inputsRef.current[OTP_LENGTH - 1]?.focus();
            e.preventDefault();
        }
    };

    const onSubmit = (data: OTPFormData) => {
        verifyOTPMutation.mutate(data.otp);
    };

    const getDigitValue = (index: number): string => {
        return otpValue[index] || "";
    };

    if (!email || !username || !password) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600">Redirecting...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Account</h2>
                    <p className="text-sm text-gray-600 mb-8">
                        Please enter the 6-digit verification code sent to{" "}
                        <span className="font-medium text-gray-900">{email}</span>
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Controller
                            name="otp"
                            control={control}
                            render={() => (
                                <div className="flex justify-center space-x-3">
                                    {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={getDigitValue(idx)}
                                            onChange={(e) => handleInputChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(idx, e)}
                                            onPaste={handlePaste}
                                            ref={(el) => { inputsRef.current[idx] = el; }}
                                            className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                errors.otp
                                                    ? "border-red-500 bg-red-50"
                                                    : getDigitValue(idx)
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-300 bg-white hover:border-gray-400"
                                            }`}
                                            autoFocus={idx === 0}
                                        />
                                    ))}
                                </div>
                            )}
                        />

                        {errors.otp && (
                            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md border border-red-200">
                                {errors.otp.message}
                            </div>
                        )}

                        {verifyOTPMutation.error && (
                            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md border border-red-200">
                                {(verifyOTPMutation.error as any)?.response?.data?.message || "Invalid OTP. Please try again."}
                            </div>
                        )}

                        {resendStatus && (
                            <div className={`text-sm text-center p-2 rounded-md border ${
                                resendStatus.includes("success")
                                    ? "text-green-600 bg-green-50 border-green-200"
                                    : "text-red-600 bg-red-50 border-red-200"
                            }`}>
                                {resendStatus}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={verifyOTPMutation.isPending || otpValue.length !== OTP_LENGTH}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {verifyOTPMutation.isPending ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </div>
                            ) : (
                                "Verify OTP"
                            )}
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                            <button
                                type="button"
                                onClick={() => resendOtpMutation.mutate()}
                                disabled={resendOtpMutation.isPending}
                                className="text-blue-600 hover:text-blue-500 font-medium text-sm underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {resendOtpMutation.isPending ? "Resending..." : "Resend OTP"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;