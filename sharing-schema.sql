-- Sharing Schema Extension for Amiibo Collection App
-- Run this SQL in your Supabase SQL Editor after the main schema

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

-- Users can manage their own shared collections
CREATE POLICY "Users can view own shared collections" ON public.shared_collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shared collections" ON public.shared_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shared collections" ON public.shared_collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shared collections" ON public.shared_collections
  FOR DELETE USING (auth.uid() = user_id);

-- Anyone can view active shared collections by token (for public sharing)
CREATE POLICY "Anyone can view active shared collections by token" ON public.shared_collections
  FOR SELECT USING (is_active = true);

-- Users can manage their own shared wishlists
CREATE POLICY "Users can view own shared wishlists" ON public.shared_wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shared wishlists" ON public.shared_wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shared wishlists" ON public.shared_wishlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shared wishlists" ON public.shared_wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- Anyone can view active shared wishlists by token (for public sharing)
CREATE POLICY "Anyone can view active shared wishlists by token" ON public.shared_wishlists
  FOR SELECT USING (is_active = true);

-- Special policies to allow anonymous users to read collections/wishlists for public sharing
-- This creates a view-only policy for shared content
CREATE POLICY "Public can view collections for active shares" ON public.amiibo_collections
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM public.shared_collections 
      WHERE is_active = true
    )
  );

CREATE POLICY "Public can view wishlists for active shares" ON public.user_wishlists
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM public.shared_wishlists 
      WHERE is_active = true
    )
  );

-- Function to update updated_at timestamp for sharing tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.shared_collections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.shared_wishlists
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_share_view_count()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be called to increment view counts
  -- We'll implement this client-side to avoid triggers on every view
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for better performance
CREATE INDEX idx_shared_collections_user_id ON public.shared_collections(user_id);
CREATE INDEX idx_shared_collections_token ON public.shared_collections(share_token);
CREATE INDEX idx_shared_collections_active ON public.shared_collections(is_active);
CREATE INDEX idx_shared_wishlists_user_id ON public.shared_wishlists(user_id);
CREATE INDEX idx_shared_wishlists_token ON public.shared_wishlists(share_token);
CREATE INDEX idx_shared_wishlists_active ON public.shared_wishlists(is_active);