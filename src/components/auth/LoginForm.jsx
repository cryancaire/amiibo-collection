import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, isLoading } = useAuth();
  const { colors } = useTheme();

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
      <h2 style={{ 
        color: colors.text.primary, 
        marginBottom: '24px', 
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: '600'
      }}>
        {isSignUp ? 'Sign Up' : 'Sign In'}
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
            placeholder={isSignUp ? "your@email.com" : "demo@example.com"}
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
            placeholder={isSignUp ? "Create a password" : "password"}
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

      {!isSignUp && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px',
          backgroundColor: colors.background,
          borderRadius: '4px',
          fontSize: '12px',
          color: colors.text.secondary
        }}>
          <strong>Demo credentials (for testing):</strong><br />
          Email: demo@example.com<br />
          Password: password
        </div>
      )}
    </div>
  );
};