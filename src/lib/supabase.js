import { createClient } from "@supabase/supabase-js";

// These would normally come from environment variables
// For now, using placeholder values - you'll need to replace with your actual Supabase project details
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database schema types for TypeScript (optional but helpful)
export const TABLES = {
  USERS: "users",
  AMIIBO_COLLECTIONS: "amiibo_collections",
  AMIIBOS: "amiibos",
};

// Helper functions for common database operations
export const db = {
  // User operations
  async createUser(userData) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert([userData])
      .select();
    return { data, error };
  },

  async getUserById(userId) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select("*")
      .eq("id", userId)
      .single();
    return { data, error };
  },

  // Amiibo collection operations
  async getUserAmiibos(userId) {
    const { data, error } = await supabase
      .from(TABLES.AMIIBO_COLLECTIONS)
      .select(
        `
        *,
        amiibos (*)
      `
      )
      .eq("user_id", userId);
    return { data, error };
  },

  async addAmiiboToCollection(userId, amiiboData) {
    const { data, error } = await supabase
      .from(TABLES.AMIIBO_COLLECTIONS)
      .insert([
        {
          user_id: userId,
          amiibo_id: amiiboData.id,
          acquired_date: new Date().toISOString(),
          ...amiiboData,
        },
      ])
      .select();
    return { data, error };
  },

  async removeAmiiboFromCollection(userId, amiiboId) {
    const { data, error } = await supabase
      .from(TABLES.AMIIBO_COLLECTIONS)
      .delete()
      .eq("user_id", userId)
      .eq("amiibo_id", amiiboId);
    return { data, error };
  },
};
