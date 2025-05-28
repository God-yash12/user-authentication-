import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "../api/client";


const OTP_LENGTH = 6;

// Zod schema for OTP validation
const otpSchema = z.object({
    otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
});

type OTPFormData = z.infer<typeof otpSchema>;

const VerifyOTP: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
     const email = location.state?.email;
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const api = apiClient;

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<OTPFormData>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: "",
        },
    });

    const otpValue = watch("otp");

    // React Query mutation for OTP verification
    const verifyOTPMutation = useMutation({
        mutationFn: async (otp: string) => {
            const response = await api.post("register/complete", { otp, email });
            return response.data;
        },
        onSuccess: () => {
            navigate("/dashboard");
        },
        onError: (error: any) => {
            console.error("OTP verification failed:", error);
        },
    });

    const handleInputChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const currentOtp = otpValue.padEnd(OTP_LENGTH, " ");
        const newOtp = currentOtp.split("");
        newOtp[index] = value.slice(-1);
        
        const updatedOtp = newOtp.join("").replace(/ /g, "");
        setValue("otp", updatedOtp);

        // Auto-focus next input
        if (value && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            const currentOtp = otpValue.padEnd(OTP_LENGTH, " ");
            const newOtp = currentOtp.split("");
            
            if (newOtp[index] === " " || newOtp[index] === "") {
                // Move to previous input if current is empty
                if (index > 0) {
                    inputsRef.current[index - 1]?.focus();
                    newOtp[index - 1] = "";
                }
            } else {
                newOtp[index] = "";
            }
            
            const updatedOtp = newOtp.join("").replace(/ /g, "");
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2>Enter OTP</h2>
            <Controller
                name="otp"
                control={control}
                render={() => (
                    <div style={{ display: "flex", gap: "8px" }}>
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
                                style={{ 
                                    width: "2rem", 
                                    fontSize: "2rem", 
                                    textAlign: "center",
                                    border: errors.otp ? "2px solid red" : "1px solid #ccc",
                                }}
                                autoFocus={idx === 0}
                            />
                        ))}
                    </div>
                )}
            />
            
            {errors.otp && (
                <div style={{ color: "red", marginTop: 8 }}>{errors.otp.message}</div>
            )}
            
            {verifyOTPMutation.error && (
                <div style={{ color: "red", marginTop: 8 }}>
                    {(verifyOTPMutation.error as any)?.response?.data?.message || "Invalid OTP. Please try again."}
                </div>
            )}
            
            <button 
                type="submit" 
                disabled={verifyOTPMutation.isPending || otpValue.length !== OTP_LENGTH}
                style={{ marginTop: 16 }}
            >
                {verifyOTPMutation.isPending ? "Verifying..." : "Verify OTP"}
            </button>
        </form>
    );
};

export default VerifyOTP;