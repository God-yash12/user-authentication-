import { useForm } from "react-hook-form";
import zxcvbn from "zxcvbn";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";
import axios from "axios";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegistrationForm() {
  const { register, handleSubmit } = useForm<FormData>();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!captchaToken) {
      alert("Please complete the CAPTCHA.");
      return;
    }

    const payload = {
      username: data.username,
      email: data.email,
      password: data.password,
      captchaToken,
    };

    try {
      await axios.post("http://localhost:3000/api/register", payload);
      alert("Registration successful. Check your email to verify.");
    } catch (error) {
      console.error(error);
      alert("Registration failed.");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = zxcvbn(e.target.value);
    setPasswordStrength(result.score);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 space-y-4 max-w-md mx-auto border rounded-md shadow-md mt-6"
    >
      <input {...register("username")} placeholder="Username" className="w-full p-2 border rounded" required />
      <input {...register("email")} placeholder="Email" type="email" className="w-full p-2 border rounded" required />
      <input
        {...register("password")}
        placeholder="Password"
        type="password"
        onChange={handlePasswordChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        {...register("confirmPassword")}
        placeholder="Confirm Password"
        type="password"
        className="w-full p-2 border rounded"
        required
      />
      <div>
        <p className="text-sm">
          Password strength: <strong>{["Weak", "Fair", "Good", "Strong", "Very Strong"][passwordStrength]}</strong>
        </p>
      </div>
      <ReCAPTCHA sitekey="YOUR_SITE_KEY" onChange={(token) => setCaptchaToken(token)} />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Register</button>
    </form>
  );
}
