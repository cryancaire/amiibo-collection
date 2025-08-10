import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export const ShareModal = ({ isOpen, onClose, type, onShare, shareUrl, shareTitle, isLoading }) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState(shareTitle || `My Amiibo ${type === 'collection' ? 'Collection' : 'Wishlist'}`);
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleShare = () => {
    onShare({ title, description });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: colors.surface,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{
          color: colors.text.primary,
          fontSize: '20px',
          fontWeight: '600',
          margin: '0 0 16px 0'
        }}>
          Share Your {type === 'collection' ? 'Collection' : 'Wishlist'}
        </h2>

        {!shareUrl ? (
          // Create share form
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: colors.text.primary,
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  backgroundColor: colors.background,
                  color: colors.text.primary,
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder={`My Amiibo ${type === 'collection' ? 'Collection' : 'Wishlist'}`}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: colors.text.primary,
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  backgroundColor: colors.background,
                  color: colors.text.primary,
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder="Tell others about your collection..."
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'transparent',
                  color: colors.text.secondary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={isLoading || !title.trim()}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isLoading || !title.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: isLoading || !title.trim() ? 0.6 : 1
                }}
              >
                {isLoading ? 'Creating...' : 'Create Share Link'}
              </button>
            </div>
          </div>
        ) : (
          // Share link created
          <div>
            <p style={{
              color: colors.text.secondary,
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              Your {type} is now shareable! Anyone with this link can view it:
            </p>

            <div style={{
              backgroundColor: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <input
                type="text"
                value={shareUrl}
                readOnly
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: colors.text.primary,
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={copyToClipboard}
                style={{
                  padding: '6px 12px',
                  backgroundColor: copied ? '#10b981' : colors.surface,
                  color: copied ? 'white' : colors.text.primary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'all 0.2s'
                }}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>

            <div style={{
              backgroundColor: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '24px'
            }}>
              <p style={{
                color: colors.text.secondary,
                fontSize: '12px',
                margin: '0 0 8px 0'
              }}>
                <strong>Privacy:</strong> Anyone with this link can view your {type}, but cannot edit it.
                You can disable sharing at any time by clicking the share button again.
              </p>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};