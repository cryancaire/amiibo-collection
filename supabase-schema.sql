-- Supabase Database Schema for Amiibo Collection App
-- Run this SQL in your Supabase SQL Editor

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Amiibos reference table (master list of all amiibos)
CREATE TABLE public.amiibos (
  id TEXT PRIMARY KEY, -- Official amiibo ID from Nintendo API
  name TEXT NOT NULL,
  character TEXT NOT NULL,
  game_series TEXT NOT NULL,
  amiibo_series TEXT NOT NULL,
  type TEXT NOT NULL,
  image_url TEXT,
  release_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User's amiibo collections (many-to-many relationship)
CREATE TABLE public.amiibo_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amiibo_id TEXT REFERENCES public.amiibos(id) ON DELETE CASCADE NOT NULL,
  acquired_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  condition TEXT DEFAULT 'mint' CHECK (condition IN ('mint', 'good', 'fair', 'poor')),
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, amiibo_id) -- User can only have one of each amiibo
);

-- User wishlists
CREATE TABLE public.user_wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amiibo_id TEXT REFERENCES public.amiibos(id) ON DELETE CASCADE NOT NULL,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, amiibo_id)
);

-- Row Level Security Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amiibo_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amiibos ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can manage their own collections
CREATE POLICY "Users can view own collections" ON public.amiibo_collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON public.amiibo_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON public.amiibo_collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON public.amiibo_collections
  FOR DELETE USING (auth.uid() = user_id);

-- Users can manage their own wishlists
CREATE POLICY "Users can view own wishlists" ON public.user_wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlists" ON public.user_wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlists" ON public.user_wishlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlists" ON public.user_wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- Everyone can read the amiibos reference table
CREATE POLICY "Anyone can view amiibos" ON public.amiibos
  FOR SELECT USING (true);

-- Functions to automatically handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Sample data (optional)
INSERT INTO public.amiibos (id, name, character, game_series, amiibo_series, type, image_url) VALUES
('0x000000000000', 'Mario', 'Mario', 'Super Mario', 'Super Mario', 'Figure', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200'),
('0x000000000001', 'Luigi', 'Luigi', 'Super Mario', 'Super Mario', 'Figure', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200'),
('0x000000000002', 'Peach', 'Peach', 'Super Mario', 'Super Mario', 'Figure', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200');

-- Indexes for better performance
CREATE INDEX idx_amiibo_collections_user_id ON public.amiibo_collections(user_id);
CREATE INDEX idx_amiibo_collections_amiibo_id ON public.amiibo_collections(amiibo_id);
CREATE INDEX idx_user_wishlists_user_id ON public.user_wishlists(user_id);
CREATE INDEX idx_amiibos_character ON public.amiibos(character);
CREATE INDEX idx_amiibos_game_series ON public.amiibos(game_series);