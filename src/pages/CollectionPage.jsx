import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { amiiboService } from '../services/amiiboService';
import { AmiiboCardBrowser } from '../components/amiibos/AmiiboCardBrowser';

export const CollectionPage = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [collectionAmiibos, setCollectionAmiibos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
    </div>
  );
};