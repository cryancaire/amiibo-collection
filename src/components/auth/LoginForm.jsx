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
  const { signIn, signUp, isLoading, isSupabaseConfigured } = useAuth();
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