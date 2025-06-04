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

        const currentOtp = otpValue.padEnd(OTP_LENGTH, " ");
        const newOtp = currentOtp.split("");
        newOtp[index] = value.slice(-1);

        const updatedOtp = newOtp.join("").replace(/ /g, "");
        setValue("otp", updatedOtp);

        if (value && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            const currentOtp = otpValue.padEnd(OTP_LENGTH, " ");
            const newOtp = currentOtp.split("");

            if (newOtp[index] === " " || newOtp[index] === "") {
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

    if (!email || !username || !password) {
        return <div>Redirecting...</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2>Enter OTP</h2>
            <p style={{ marginBottom: "1rem", color: "#666" }}>Please enter the 6-digit code sent to {email}</p>

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

            {errors.otp && <div style={{ color: "red", marginTop: 8 }}>{errors.otp.message}</div>}
            {verifyOTPMutation.error && <div style={{ color: "red", marginTop: 8 }}>{(verifyOTPMutation.error as any)?.response?.data?.message || "Invalid OTP. Please try again."}</div>}
            {resendStatus && <div style={{ color: resendStatus.includes("success") ? "green" : "red", marginTop: 8 }}>{resendStatus}</div>}

            <button
                type="submit"
                disabled={verifyOTPMutation.isPending || otpValue.length !== OTP_LENGTH}
                style={{ marginTop: 16, backgroundColor: "#007bff", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "4px" }}
            >
                {verifyOTPMutation.isPending ? "Verifying..." : "Verify OTP"}
            </button>

            <button
                type="button"
                onClick={() => resendOtpMutation.mutate()}
                disabled={resendOtpMutation.isPending}
                style={{ marginTop: 12, backgroundColor: "#007bff", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "4px" }}
            >
                {resendOtpMutation.isPending ? "Resending..." : "Resend OTP"}
            </button>
        </form>
    );
};

export default VerifyOTP;