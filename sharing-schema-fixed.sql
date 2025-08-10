-- Fixed Sharing Schema Extension for Amiibo Collection App
-- Run this SQL in your Supabase SQL Editor after the main schema

-- First, drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS public.shared_collections CASCADE;
DROP TABLE IF EXISTS public.shared_wishlists CASCADE;

-- Shared collections - allows users to create public shareable versions of their collections
CREATE TABLE public.shared_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Amiibo Collection',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE, -- User can disable sharing
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'), -- URL-safe token
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Shared wishlists - allows users to create public shareable versions of their wishlists
CREATE TABLE public.shared_wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Amiibo Wishlist',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE, -- User can disable sharing
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'), -- URL-safe token
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security for sharing tables
ALTER TABLE public.shared_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_wishlists ENABLE ROW LEVEL SECURITY;

-- More permissive policies for shared_collections
-- Allow authenticated users to view their own shares
CREATE POLICY "Users can view own shared collections" ON public.shared_collections
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- Allow authenticated users to insert their own shares
CREATE POLICY "Users can insert own shared collections" ON public.shared_collections
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- Allow authenticated users to update their own shares
CREATE POLICY "Users can update own shared collections" ON public.shared_collections
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- Allow authenticated users to delete their own shares
CREATE POLICY "Users can delete own shared collections" ON public.shared_collections
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- Allow ANYONE (including anonymous users) to view active shared collections by token
CREATE POLICY "Public can view active shared collections" ON public.shared_collections
  FOR SELECT USING (is_active = true);

-- Same policies for shared_wishlists
CREATE POLICY "Users can view own shared wishlists" ON public.shared_wishlists
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "Users can insert own shared wishlists" ON public.shared_wishlists
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "Users can update own shared wishlists" ON public.shared_wishlists
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "Users can delete own shared wishlists" ON public.shared_wishlists
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- Allow ANYONE (including anonymous users) to view active shared wishlists by token
CREATE POLICY "Public can view active shared wishlists" ON public.shared_wishlists
  FOR SELECT USING (is_active = true);

-- Update the existing policies for collections and wishlists to allow public access for sharing
-- We need to allow anonymous users to read collections/wishlists when they belong to users with active shares

-- Drop existing restrictive policies and recreate them
DROP POLICY IF EXISTS "Public can view collections for active shares" ON public.amiibo_collections;
DROP POLICY IF EXISTS "Public can view wishlists for active shares" ON public.user_wishlists;

-- More specific policies for public sharing
CREATE POLICY "Anyone can view collections for public shares" ON public.amiibo_collections
  FOR SELECT USING (
    -- Allow if authenticated user owns the collection
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    -- OR allow if user has an active shared collection (for public viewing)
    (user_id IN (
      SELECT user_id FROM public.shared_collections 
      WHERE is_active = true
    ))
  );

CREATE POLICY "Anyone can view wishlists for public shares" ON public.user_wishlists
  FOR SELECT USING (
    -- Allow if authenticated user owns the wishlist
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    -- OR allow if user has an active shared wishlist (for public viewing)
    (user_id IN (
      SELECT user_id FROM public.shared_wishlists 
      WHERE is_active = true
    ))
  );

-- Function to update updated_at timestamp for sharing tables
CREATE TRIGGER handle_updated_at_shared_collections BEFORE UPDATE ON public.shared_collections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_shared_wishlists BEFORE UPDATE ON public.shared_wishlists
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for better performance
CREATE INDEX idx_shared_collections_user_id ON public.shared_collections(user_id);
CREATE INDEX idx_shared_collections_token ON public.shared_collections(share_token);
CREATE INDEX idx_shared_collections_active ON public.shared_collections(is_active);
CREATE INDEX idx_shared_wishlists_user_id ON public.shared_wishlists(user_id);
CREATE INDEX idx_shared_wishlists_token ON public.shared_wishlists(share_token);
CREATE INDEX idx_shared_wishlists_active ON public.shared_wishlists(is_active);

-- Test the setup with some debugging queries (optional)
-- You can run these to check if everything is working:

-- Check if auth.uid() is working:
-- SELECT auth.uid() as current_user_id;

-- Check if a user can insert (replace with your actual user ID for testing):
-- INSERT INTO public.shared_collections (user_id, title) 
-- VALUES (auth.uid(), 'Test Collection');