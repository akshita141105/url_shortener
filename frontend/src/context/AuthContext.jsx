"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    login as loginApi,
    register as registerApi,
    logout as logoutApi,
    me,
} from "@/lib/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const res = await me();
            setUser(res.data.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const register = async (formData) => {
        return await registerApi(formData);
    };

    const login = async (formData) => {
        // Backend sets accessToken + refreshToken as httpOnly cookies directly.
        // Nothing to store manually here.
        const res = await loginApi(formData);

        await fetchCurrentUser();

        return res;
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.error(error);
        }

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                register,
                fetchCurrentUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);