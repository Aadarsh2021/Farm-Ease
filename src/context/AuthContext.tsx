import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    userRole: "farmer" | "seller" | "consumer" | "admin" | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, userRole: null });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<AuthContextType["userRole"]>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    const { data, error } = await supabase
                        .from("users")
                        .select("role")
                        .eq("id", firebaseUser.uid)
                        .maybeSingle();

                    if (!error && data) {
                        setUserRole(data.role);
                    }
                } catch (error) {
                    console.error("Error fetching user role from Supabase:", error);
                }
            } else {
                setUserRole(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, userRole }}>
            {children}
        </AuthContext.Provider>
    );
};
