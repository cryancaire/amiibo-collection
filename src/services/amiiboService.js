import { supabase } from '../lib/supabase';

export const amiiboService = {
  // Get all available amiibos
  async getAllAmiibos() {
    try {
      const { data, error } = await supabase
        .from('amiibos')
        .select('*')
        .order('character');

      if (error) {
        console.error('Error fetching amiibos:', error);
        return { data: [], error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception fetching amiibos:', error);
      return { data: [], error };
    }
  },

  // Get user's collection
  async getUserCollection(userId) {
    try {
      const { data, error } = await supabase
        .from('amiibo_collections')
        .select(`
          *,
          amiibos (*)
        `)
        .eq('user_id', userId)
        .order('acquired_date', { ascending: false });

      if (error) {
        console.error('Error fetching user collection:', error);
        return { data: [], error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception fetching user collection:', error);
      return { data: [], error };
    }
  },

  // Get user's collection with full amiibo details (for Collection page)
  async getUserCollectionWithDetails(userId) {
    try {
      const { data, error } = await supabase
        .from('amiibo_collections')
        .select(`
          acquired_date,
          condition,
          notes,
          is_favorite,
          amiibos (*)
        `)
        .eq('user_id', userId)
        .order('acquired_date', { ascending: false });

      if (error) {
        console.error('Error fetching user collection with details:', error);
        return { data: [], error };
      }

      // Transform the data to return just amiibo objects with collection metadata
      const amiibos = data.map(item => ({
        ...item.amiibos,
        acquired_date: item.acquired_date,
        condition: item.condition,
        notes: item.notes,
        is_favorite: item.is_favorite
      }));

      return { data: amiibos, error: null };
    } catch (error) {
      console.error('Exception fetching user collection with details:', error);
      return { data: [], error };
    }
  },

  // Add amiibo to user's collection
  async addToCollection(userId, amiiboId, options = {}) {
    try {
      const collectionData = {
        user_id: userId,
        amiibo_id: amiiboId,
        condition: options.condition || 'mint',
        notes: options.notes || '',
        is_favorite: options.isFavorite || false,
        acquired_date: options.acquiredDate || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('amiibo_collections')
        .insert([collectionData])
        .select(`
          *,
          amiibos (*)
        `);

      if (error) {
        console.error('Error adding to collection:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Exception adding to collection:', error);
      return { success: false, error: error.message };
    }
  },

  // Remove amiibo from user's collection
  async removeFromCollection(userId, amiiboId) {
    try {
      const { data, error } = await supabase
        .from('amiibo_collections')
        .delete()
        .eq('user_id', userId)
        .eq('amiibo_id', amiiboId)
        .select();

      if (error) {
        console.error('Error removing from collection:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Exception removing from collection:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user owns a specific amiibo
  async checkOwnership(userId, amiiboId) {
    try {
      const { data, error } = await supabase
        .from('amiibo_collections')
        .select('id')
        .eq('user_id', userId)
        .eq('amiibo_id', amiiboId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking ownership:', error);
        return { owned: false, error };
      }

      return { owned: !!data, error: null };
    } catch (error) {
      console.error('Exception checking ownership:', error);
      return { owned: false, error };
    }
  },

  // Get amiibos by character/series
  async searchAmiibos(searchTerm, filterBy = 'character') {
    try {
      const { data, error } = await supabase
        .from('amiibos')
        .select('*')
        .ilike(filterBy, `%${searchTerm}%`)
        .order('character');

      if (error) {
        console.error('Error searching amiibos:', error);
        return { data: [], error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception searching amiibos:', error);
      return { data: [], error };
    }
  },

  // Get user's wishlist
  async getUserWishlist(userId) {
    try {
      const { data, error } = await supabase
        .from('user_wishlists')
        .select(`
          *,
          amiibos (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user wishlist:', error);
        return { data: [], error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception fetching user wishlist:', error);
      return { data: [], error };
    }
  },

  // Add amiibo to user's wishlist
  async addToWishlist(userId, amiiboId, options = {}) {
    try {
      const wishlistData = {
        user_id: userId,
        amiibo_id: amiiboId,
        priority: options.priority || 3,
        notes: options.notes || ''
      };

      const { data, error } = await supabase
        .from('user_wishlists')
        .insert([wishlistData])
        .select(`
          *,
          amiibos (*)
        `);

      if (error) {
        console.error('Error adding to wishlist:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Exception adding to wishlist:', error);
      return { success: false, error: error.message };
    }
  },

  // Remove amiibo from user's wishlist
  async removeFromWishlist(userId, amiiboId) {
    try {
      const { data, error } = await supabase
        .from('user_wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('amiibo_id', amiiboId)
        .select();

      if (error) {
        console.error('Error removing from wishlist:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Exception removing from wishlist:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user's wishlist with full amiibo details (for Wishlist page)
  async getUserWishlistWithDetails(userId) {
    try {
      const { data, error } = await supabase
        .from('user_wishlists')
        .select(`
          created_at,
          priority,
          notes,
          amiibos (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user wishlist with details:', error);
        return { data: [], error };
      }

      // Transform the data to return just amiibo objects with wishlist metadata
      const amiibos = data.map(item => ({
        ...item.amiibos,
        added_date: item.created_at,
        priority: item.priority,
        notes: item.notes
      }));

      return { data: amiibos, error: null };
    } catch (error) {
      console.error('Exception fetching user wishlist with details:', error);
      return { data: [], error };
    }
  },

  // Get random amiibos not in user's collection (for Dashboard)
  async getRandomUncollectedAmiibos(userId, limit = 9) {
    try {
      // First get all amiibo IDs that the user owns
      const { data: userCollection, error: collectionError } = await supabase
        .from('amiibo_collections')
        .select('amiibo_id')
        .eq('user_id', userId);

      if (collectionError) {
        console.error('Error fetching user collection for random amiibos:', collectionError);
        return { data: [], error: collectionError };
      }

      const ownedAmiiboIds = userCollection.map(item => item.amiibo_id);

      // Get random amiibos not in the user's collection
      let query = supabase
        .from('amiibos')
        .select('*');

      // Exclude owned amiibos if user has any
      if (ownedAmiiboIds.length > 0) {
        query = query.not('id', 'in', `(${ownedAmiiboIds.join(',')})`);
      }

      // Get a larger sample and then limit to avoid predictable ordering
      const { data, error } = await query.limit(limit * 3);

      if (error) {
        console.error('Error fetching random uncollected amiibos:', error);
        return { data: [], error };
      }

      // Shuffle and take the requested number
      const shuffled = data.sort(() => Math.random() - 0.5);
      const randomAmiibos = shuffled.slice(0, limit);

      return { data: randomAmiibos, error: null };
    } catch (error) {
      console.error('Exception fetching random uncollected amiibos:', error);
      return { data: [], error };
    }
  },

  // Get user collection stats for dashboard
  async getUserStats(userId) {
    try {
      // Get total amiibos count
      const { count: totalAmiibos, error: totalError } = await supabase
        .from('amiibos')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        console.error('Error getting total amiibos count:', totalError);
      }

      // Get user collection count
      const { count: collectionCount, error: collectionError } = await supabase
        .from('amiibo_collections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (collectionError) {
        console.error('Error getting collection count:', collectionError);
      }

      // Get user wishlist count
      const { count: wishlistCount, error: wishlistError } = await supabase
        .from('user_wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (wishlistError) {
        console.error('Error getting wishlist count:', wishlistError);
      }

      const completionPercentage = totalAmiibos > 0 ? Math.round((collectionCount / totalAmiibos) * 100) : 0;

      return {
        data: {
          totalAmiibos: totalAmiibos || 0,
          collectionCount: collectionCount || 0,
          wishlistCount: wishlistCount || 0,
          completionPercentage
        },
        error: null
      };
    } catch (error) {
      console.error('Exception fetching user stats:', error);
      return { 
        data: { 
          totalAmiibos: 0, 
          collectionCount: 0, 
          wishlistCount: 0, 
          completionPercentage: 0 
        }, 
        error 
      };
    }
  }
};