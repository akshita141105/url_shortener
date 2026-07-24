"use client";

import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

function RegisterSkeleton() {
    return (
        <div className="glass-card w-full max-w-md p-8">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-subtitle" />

            <div className="space-y-4">
                <div className="skeleton skeleton-input" />
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

export default function RegisterForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const { register: registerUser } = useAuth();

    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        try {
            setLoading(true);

            await registerUser(data);

            toast.success("Registration successful! Please log in.");

            router.push("/login");
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <RegisterSkeleton />;
    }

    return (
        <div className="glass-card w-full max-w-md p-8">

            <h1 className="text-3xl font-bold mb-2">
                Create Account
            </h1>

            <p className="text-zinc-400 mb-6">
                Start shortening your links today 🚀
            </p>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
            >
                <div>
                    <input
                        className="url-input"
                        placeholder="Full Name"
                        {...register("name", {
                            required: "Name is required",
                        })}
                    />

                    {errors.name && (
                        <p className="error-msg">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <input
                        className="url-input"
                        placeholder="Email"
                        {...register("email", {
                            required: "Email is required",
                        })}
                    />

                    {errors.email && (
                        <p className="error-msg">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <input
                        type="password"
                        className="url-input"
                        placeholder="Password"
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 8,
                                message:
                                    "Minimum 8 characters",
                            },
                        })}
                    />

                    {errors.password && (
                        <p className="error-msg">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <button
                    className="btn-primary w-full"
                >
                    Register
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-400">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="text-violet-400 hover:underline"
                >
                    Login
                </Link>
            </p>
        </div>
    );
}