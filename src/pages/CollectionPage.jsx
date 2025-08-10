import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { amiiboService } from '../services/amiiboService';
import { AmiiboCardBrowser } from '../components/amiibos/AmiiboCardBrowser';
import { ShareModal } from '../components/sharing/ShareModal';
import { useSharing } from '../hooks/useSharing';

export const CollectionPage = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [collectionAmiibos, setCollectionAmiibos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Sharing functionality
  const { 
    shareData, 
    isLoading: shareLoading, 
    createShare, 
    updateShare,
    deleteShare,
    getShareUrl,
    isShared 
  } = useSharing('collection');

  useEffect(() => {
    loadCollection();
  }, [user]);

  const loadCollection = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await amiiboService.getUserCollectionWithDetails(user.id);
      if (result.error) {
        throw new Error('Failed to load collection');
      }
      setCollectionAmiibos(result.data);
    } catch (error) {
      console.error('Error loading collection:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromCollection = async (amiiboId) => {
    try {
      const result = await amiiboService.removeFromCollection(user.id, amiiboId);
      if (result.success) {
        // Remove from local state
        setCollectionAmiibos(prev => prev.filter(amiibo => amiibo.id !== amiiboId));
      } else {
        alert(result.error || 'Failed to remove from collection');
      }
    } catch (error) {
      console.error('Error removing from collection:', error);
      alert('Failed to remove from collection');
    }
  };

  const handleShare = async (shareConfig) => {
    const result = await createShare(shareConfig);
    if (result) {
      // Modal will show the share URL automatically
    }
  };

  const handleToggleShare = async () => {
    if (isShared) {
      // Disable sharing
      await updateShare({ isActive: false });
      setShowShareModal(false);
    } else {
      // Show share modal
      setShowShareModal(true);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h2 
          style={{ 
            color: colors.text.primary,
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '24px'
          }}
        >
          My Collection
        </h2>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          color: colors.text.secondary
        }}>
          Loading your collection...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 
          style={{ 
            color: colors.text.primary,
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '24px'
          }}
        >
          My Collection
        </h2>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          color: colors.text.secondary
        }}>
          <p>Error: {error}</p>
          <button
            onClick={loadCollection}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <h2 
          style={{ 
            color: colors.text.primary,
            fontSize: '24px',
            fontWeight: '600',
            margin: 0
          }}
        >
          My Collection
        </h2>
        
        {collectionAmiibos.length > 0 && (
          <button
            onClick={handleToggleShare}
            disabled={shareLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: isShared ? '#ef4444' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: shareLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: shareLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {shareLoading ? (
              'Loading...'
            ) : isShared ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                Shared
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.59 13.51l6.83 3.98" />
                  <path d="M15.41 6.51l-6.82 3.98" />
                </svg>
                Share Collection
              </>
            )}
          </button>
        )}
      </div>

      {/* Show share URL if collection is currently shared */}
      {isShared && shareData && getShareUrl && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#10b981',
          border: `1px solid #059669`,
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.59 13.51l6.83 3.98" />
              <path d="M15.41 6.51l-6.82 3.98" />
            </svg>
            Collection is Shared
          </h3>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px',
            margin: '0 0 12px 0'
          }}>
            <strong>Title:</strong> {shareData.title}
          </p>
          
          {shareData.description && (
            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              margin: '0 0 12px 0'
            }}>
              <strong>Description:</strong> {shareData.description}
            </p>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <input
              type="text"
              value={getShareUrl}
              readOnly
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            />
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(getShareUrl);
                  // Simple feedback - you could enhance this with a toast notification
                  const btn = document.activeElement;
                  const originalText = btn.textContent;
                  btn.textContent = 'Copied!';
                  btn.style.backgroundColor = '#10b981';
                  setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }, 2000);
                } catch (err) {
                  console.error('Failed to copy:', err);
                }
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              Copy URL
            </button>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: colors.text.secondary,
            fontSize: '12px'
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Shared on {new Date(shareData.created_at).toLocaleDateString()} • {shareData.view_count} views
            </span>
            <button
              onClick={() => setShowShareModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                textDecoration: 'underline'
              }}
            >
              Edit Share Settings
            </button>
          </div>
        </div>
      )}

      {collectionAmiibos.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: colors.text.secondary
        }}>
          <p style={{ fontSize: '18px', marginBottom: '16px' }}>
            Your collection is empty
          </p>
          <p style={{ fontSize: '14px', marginBottom: '24px' }}>
            Start building your collection by browsing and adding amiibos!
          </p>
          <a 
            href="/browse"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            Browse Amiibos
          </a>
        </div>
      ) : (
        <>
          <div style={{ 
            marginBottom: '16px',
            color: colors.text.secondary,
            fontSize: '14px'
          }}>
            You own {collectionAmiibos.length} amiibo{collectionAmiibos.length !== 1 ? 's' : ''}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
            padding: '8px'
          }}>
            {collectionAmiibos.map(amiibo => (
              <AmiiboCardBrowser
                key={amiibo.id}
                amiibo={amiibo}
                isOwned={true}
                onRemoveFromCollection={handleRemoveFromCollection}
                showRemoveOnly={true}
              />
            ))}
          </div>
        </>
      )}
      
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        type="collection"
        onShare={handleShare}
        shareUrl={getShareUrl}
        shareTitle={shareData?.title}
        isLoading={shareLoading}
      />
    </div>
  );
};