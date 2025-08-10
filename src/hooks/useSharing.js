import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useSharing = (type) => {
  const { supabase, isSupabaseConfigured, user } = useAuth();
  const [shareData, setShareData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const tableName = type === 'collection' ? 'shared_collections' : 'shared_wishlists';

  // Check if user already has an active share
  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return;
    
    const checkExistingShare = async () => {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (data && !error) {
          setShareData(data);
        }
      } catch (err) {
        // No existing share found, which is fine
        console.log('No existing share found');
      }
    };

    checkExistingShare();
  }, [supabase, tableName, isSupabaseConfigured, user?.id]);

  const createShare = async ({ title, description }) => {
    if (!isSupabaseConfigured) {
      setError('Sharing not available - Supabase not configured');
      return null;
    }

    if (!user?.id) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description?.trim() || null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setShareData(data);
      return data;
    } catch (err) {
      console.error('Error creating share:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateShare = async ({ title, description, isActive }) => {
    if (!shareData || !isSupabaseConfigured) return null;

    setIsLoading(true);
    setError(null);

    try {
      const updates = {};
      if (title !== undefined) updates.title = title.trim();
      if (description !== undefined) updates.description = description?.trim() || null;
      if (isActive !== undefined) updates.is_active = isActive;

      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', shareData.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setShareData(data);
      return data;
    } catch (err) {
      console.error('Error updating share:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteShare = async () => {
    if (!shareData || !isSupabaseConfigured) return false;

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', shareData.id);

      if (error) {
        throw error;
      }

      setShareData(null);
      return true;
    } catch (err) {
      console.error('Error deleting share:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getShareUrl = (token) => {
    if (!token) return null;
    return `${window.location.origin}/shared/${type}/${token}`;
  };

  return {
    shareData,
    isLoading,
    error,
    createShare,
    updateShare,
    deleteShare,
    getShareUrl: shareData ? getShareUrl(shareData.share_token) : null,
    isShared: !!shareData?.is_active
  };
};