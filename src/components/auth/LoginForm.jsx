import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [randomAmiibo, setRandomAmiibo] = useState(null);
  const { signIn, signUp, signInWithOAuth, isLoading, isSupabaseConfigured } = useAuth();
  const { colors } = useTheme();

  // Load a random amiibo image for branding
  useEffect(() => {
    const loadRandomAmiibo = async () => {
      if (!isSupabaseConfigured) return;
      
      try {
        const { data, error } = await supabase
          .from('amiibos')
          .select('name, image_url')
          .limit(1)
          .order('id'); // Get first amiibo as fallback
        
        if (data && data.length > 0) {
          setRandomAmiibo(data[0]);
        }
      } catch (error) {
        console.log('Could not load amiibo image for login page');
      }
    };

    loadRandomAmiibo();
  }, [isSupabaseConfigured]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const result = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password);
    
    if (!result.success) {
      setError(result.error);
    } else if (result.message) {
      setMessage(result.message);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setError('');
    setMessage('');
    
    const result = await signInWithOAuth(provider);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '0 auto', 
      padding: '24px',
      backgroundColor: colors.surface,
      borderRadius: '8px',
      border: `1px solid ${colors.border}`
    }}>
      {/* App branding */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          margin: '0 auto 12px',
          backgroundColor: randomAmiibo ? colors.background : '#10b981',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${colors.border}`,
          overflow: 'hidden'
        }}>
          {randomAmiibo ? (
            <img 
              src={randomAmiibo.image_url}
              alt={`${randomAmiibo.name} Amiibo`}
              style={{
                width: '56px',
                height: '56px',
                objectFit: 'cover'
              }}
              onError={(e) => {
                // Fallback to SVG if image fails to load
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
          ) : null}
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 32 32" 
            fill="none"
            style={{ display: randomAmiibo ? 'none' : 'block' }}
          >
            <g fill="white">
              <circle cx="16" cy="9" r="3"/>
              <ellipse cx="16" cy="16" rx="2.5" ry="4"/>
              <ellipse cx="12" cy="14" rx="1.5" ry="2" transform="rotate(-20 12 14)"/>
              <ellipse cx="20" cy="14" rx="1.5" ry="2" transform="rotate(20 20 14)"/>
              <ellipse cx="14" cy="22" rx="1.5" ry="3"/>
              <ellipse cx="18" cy="22" rx="1.5" ry="3"/>
              <ellipse cx="16" cy="26" rx="4" ry="1.5" opacity="0.6"/>
            </g>
          </svg>
        </div>
        <h1 style={{ 
          color: colors.text.primary, 
          fontSize: '20px',
          fontWeight: '700',
          margin: '0 0 4px 0'
        }}>
          My Amiibo Collection
        </h1>
        <p style={{ 
          color: colors.text.secondary, 
          fontSize: '14px',
          margin: 0
        }}>
          Manage your amiibo collection and wishlist
        </p>
      </div>

      <h2 style={{ 
        color: colors.text.primary, 
        marginBottom: '24px', 
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: '600'
      }}>
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </h2>

      {/* OAuth Buttons */}
      {isSupabaseConfigured && (
        <div style={{ marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: colors.surface,
              color: colors.text.primary,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: colors.surface,
              color: colors.text.primary,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '16px 0',
            color: colors.text.secondary,
            fontSize: '14px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }}></div>
            <span style={{ padding: '0 16px' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }}></div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: colors.text.primary,
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              backgroundColor: colors.surface,
              color: colors.text.primary,
              fontSize: '14px',
              outline: 'none'
            }}
            placeholder="your@email.com"
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: colors.text.primary,
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              backgroundColor: colors.surface,
              color: colors.text.primary,
              fontSize: '14px',
              outline: 'none'
            }}
            placeholder={isSignUp ? "Create a password" : "Enter your password"}
            required
          />
        </div>

        {error && (
          <div style={{ 
            color: '#ef4444', 
            fontSize: '14px', 
            marginBottom: '16px',
            padding: '8px',
            backgroundColor: '#fee2e2',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ 
            color: '#10b981', 
            fontSize: '14px', 
            marginBottom: '16px',
            padding: '8px',
            backgroundColor: '#d1fae5',
            borderRadius: '4px'
          }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading 
            ? (isSignUp ? 'Creating account...' : 'Signing in...') 
            : (isSignUp ? 'Sign Up' : 'Sign In')
          }
        </button>
      </form>

      <div style={{ 
        marginTop: '16px', 
        textAlign: 'center'
      }}>
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          style={{
            background: 'none',
            border: 'none',
            color: '#10b981',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {isSignUp 
            ? 'Already have an account? Sign in' 
            : 'Need an account? Sign up'
          }
        </button>
      </div>

    </div>
  );
};