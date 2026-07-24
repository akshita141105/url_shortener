"use client";

import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

function LoginSkeleton() {
    return (
        <div className="glass-card w-full max-w-md p-8">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-subtitle" />

            <div className="space-y-4">
                <div className="skeleton skeleton-input" />
                <div className="skeleton skeleton-input" />
                <div className="skeleton skeleton-btn" />
            </div>

            <div style={{ marginTop: 24 }}>
                <div className="skeleton skeleton-text-sm" />
            </div>
        </div>
    );
}

export default function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const { login } = useAuth();

    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data) => {
        try {
            setLoading(true);

            await login(data);

            router.push("/");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoginSkeleton />;
    }

    return (
        <div className="glass-card w-full max-w-md p-8">

            <h1 className="text-3xl font-bold mb-6">
                Welcome Back 👋
            </h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
            >
                <div>
                    <input
                        className="url-input"
                        placeholder="Email"
                        {...register("email", {
                            required: "Email is required",
                        })}
                    />

                    {errors.email && (
                        <p className="error-msg mt-1">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="url-input pr-12"
                            placeholder="Password"
                            {...register("password", {
                                required: "Password is required",
                            })}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
                            tabIndex={-1}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                // eye-off icon
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                    <line x1="2" x2="22" y1="2" y2="22" />
                                </svg>
                            ) : (
                                // eye icon
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {errors.password && (
                        <p className="error-msg mt-1">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <button
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    Login
                </button>
            </form>

            <p className="text-center text-sm text-[var(--text-muted)] mt-6">
                Don&apos;t have an account?{" "}
                <Link
                    href="/register"
                    className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium transition-colors"
                >
                    Register
                </Link>
            </p>

        </div>
    );
}