import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState(null);

  // Check if Supabase is properly configured
  const isSupabaseConfigured =
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== "https://your-project.supabase.co" &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== "your-anon-key";

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        if (!isSupabaseConfigured) {
          console.error(
            "Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables."
          );
          setIsLoading(false);
          return;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        } else if (session) {
          setSession(session);
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error("Failed to get session:", error);
      }

      setIsLoading(false);
    };

    getInitialSession();

    if (!isSupabaseConfigured) {
      return;
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [isSupabaseConfigured]);

  const signUp = async (email, password, options = {}) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error:
          "Authentication not configured. Please check your environment variables.",
      };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: options.fullName || "",
          },
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        return { success: false, error: error.message };
      }

      // If user needs to confirm email
      if (data.user && !data.session) {
        console.log("User created but needs email confirmation");
        return {
          success: true,
          message: "Account created! Check your email for confirmation link.",
          requiresConfirmation: true,
        };
      }

      // If user was created and immediately signed in (email confirmation disabled)
      if (data.user && data.session) {
        return { success: true, data };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Sign up exception:", error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error:
          "Authentication not configured. Please check your environment variables.",
      };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        return { success: false, error: error.message };
      }

      if (data.user && !data.session) {
        return {
          success: false,
          error:
            "Please check your email and confirm your account before signing in.",
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Sign in exception:", error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithOAuth = async (provider) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error:
          "Authentication not configured. Please check your environment variables.",
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Error signing out:", error);
        }
      }

      // Always clear local state regardless
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error signing out:", error);
      // Still clear local state on error
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error:
          "Authentication not configured. Please check your environment variables.",
      };
    }

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: "Password reset email sent" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Helper function to get user profile from our users table
  const getUserProfile = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error fetching user profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const value = {
    user,
    session,
    isAuthenticated,
    isLoading,
    isSupabaseConfigured,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    getUserProfile,
    // Supabase client for direct access if needed
    supabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
