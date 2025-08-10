import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export const AmiiboCardBrowser = ({ 
  amiibo, 
  isOwned = false, 
  isWishlisted = false, 
  onAddToCollection, 
  onRemoveFromCollection, 
  onAddToWishlist, 
  onRemoveFromWishlist, 
  showRemoveOnly = false,
  showWishlistOnly = false,
  isPublicView = false,
  showActionsForPublic = false
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const handleToggleCollection = async () => {
    if (!user) return;
    
    setIsCollectionLoading(true);
    try {
      if (isOwned || showRemoveOnly) {
        await onRemoveFromCollection(amiibo.id);
      } else {
        await onAddToCollection(amiibo.id);
      }
    } catch (error) {
      console.error('Error toggling collection:', error);
    } finally {
      setIsCollectionLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) return;
    
    setIsWishlistLoading(true);
    try {
      if (isWishlisted) {
        await onRemoveFromWishlist(amiibo.id);
      } else {
        await onAddToWishlist(amiibo.id);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      padding: isMobile ? '12px' : '16px',
      width: '100%',
      maxWidth: isMobile ? 'none' : '280px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Amiibo Image */}
      <div style={{
        width: '100%',
        height: isMobile ? '160px' : '200px',
        backgroundColor: colors.background,
        borderRadius: '6px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {amiibo.image_url ? (
          <img 
            src={amiibo.image_url} 
            alt={amiibo.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            color: colors.text.secondary,
            fontSize: '14px',
            textAlign: 'center'
          }}>
            No Image
          </div>
        )}
      </div>

      {/* Amiibo Info */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{
          color: colors.text.primary,
          fontSize: isMobile ? '16px' : '18px',
          fontWeight: '600',
          marginBottom: '4px',
          margin: 0
        }}>
          {amiibo.name}
        </h3>
        
        <p style={{
          color: colors.text.secondary,
          fontSize: isMobile ? '12px' : '14px',
          margin: 0,
          marginBottom: '2px'
        }}>
          <strong>Character:</strong> {amiibo.character}
        </p>
        
        <p style={{
          color: colors.text.secondary,
          fontSize: isMobile ? '12px' : '14px',
          margin: 0,
          marginBottom: '2px'
        }}>
          <strong>Series:</strong> {amiibo.game_series}
        </p>
        
        <p style={{
          color: colors.text.secondary,
          fontSize: isMobile ? '12px' : '14px',
          margin: 0
        }}>
          <strong>Type:</strong> {amiibo.type}
        </p>
      </div>

      {/* Collection Status & Actions */}
      <div style={{
        paddingTop: '12px',
        borderTop: `1px solid ${colors.border}`
      }}>
        {/* Status badges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          {isOwned && (
            <span style={{
              backgroundColor: '#10b981',
              color: 'white',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: '500'
            }}>
              ✓ Owned
            </span>
          )}
          {isWishlisted && (
            <span style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: '500'
            }}>
              ♡ Wishlist
            </span>
          )}
        </div>

        {/* Action buttons - hide for public view unless specifically allowed */}
        {isPublicView && !showActionsForPublic ? null : showWishlistOnly ? (
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={handleToggleCollection}
              disabled={isCollectionLoading || !user}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: isMobile ? '6px 8px' : '8px 12px',
                borderRadius: '6px',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: '500',
                cursor: isCollectionLoading || !user ? 'not-allowed' : 'pointer',
                opacity: isCollectionLoading || !user ? 0.6 : 1,
                transition: 'opacity 0.2s',
                flex: 1
              }}
            >
              {isCollectionLoading ? '...' : isMobile ? 'Add to Collection' : 'Add to Collection'}
            </button>

            <button
              onClick={handleToggleWishlist}
              disabled={isWishlistLoading || !user}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: isMobile ? '6px 8px' : '8px 12px',
                borderRadius: '6px',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: '500',
                cursor: isWishlistLoading || !user ? 'not-allowed' : 'pointer',
                opacity: isWishlistLoading || !user ? 0.6 : 1,
                transition: 'opacity 0.2s',
                flex: 1
              }}
            >
              {isWishlistLoading ? '...' : isMobile ? 'Remove from Wishlist' : 'Remove from Wishlist'}
            </button>
          </div>
        ) : showRemoveOnly ? (
          <button
            onClick={handleToggleCollection}
            disabled={isCollectionLoading || !user}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: isMobile ? '6px 12px' : '8px 16px',
              borderRadius: '6px',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: '500',
              cursor: isCollectionLoading || !user ? 'not-allowed' : 'pointer',
              opacity: isCollectionLoading || !user ? 0.6 : 1,
              transition: 'opacity 0.2s',
              width: '100%'
            }}
          >
            {isCollectionLoading ? '...' : 'Remove from Collection'}
          </button>
        ) : (
          <div style={{
            display: 'flex',
            gap: isMobile ? '6px' : '8px'
          }}>
            <button
              onClick={handleToggleCollection}
              disabled={isCollectionLoading || !user}
              style={{
                backgroundColor: isOwned ? '#ef4444' : '#10b981',
                color: 'white',
                border: 'none',
                padding: isMobile ? '6px 8px' : '8px 12px',
                borderRadius: '6px',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: '500',
                cursor: isCollectionLoading || !user ? 'not-allowed' : 'pointer',
                opacity: isCollectionLoading || !user ? 0.6 : 1,
                transition: 'opacity 0.2s',
                flex: 1
              }}
            >
              {isCollectionLoading 
                ? '...' 
                : isOwned 
                  ? isMobile ? 'Remove' : 'Remove from Collection'
                  : isMobile ? 'Add to Collection' : 'Add to Collection'
              }
            </button>

            <button
              onClick={handleToggleWishlist}
              disabled={isWishlistLoading || !user || isOwned}
              style={{
                backgroundColor: isWishlisted ? '#ef4444' : '#f59e0b',
                color: 'white',
                border: 'none',
                padding: isMobile ? '6px 8px' : '8px 12px',
                borderRadius: '6px',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: '500',
                cursor: isWishlistLoading || !user || isOwned ? 'not-allowed' : 'pointer',
                opacity: isWishlistLoading || !user || isOwned ? 0.6 : 1,
                transition: 'opacity 0.2s',
                flex: 1
              }}
            >
              {isWishlistLoading 
                ? '...' 
                : isWishlisted 
                  ? isMobile ? 'Remove' : 'Remove from Wishlist'
                  : isMobile ? 'Add to Wishlist' : 'Add to Wishlist'
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};