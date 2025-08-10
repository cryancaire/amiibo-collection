import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { AmiiboCardBrowser } from '../amiibos/AmiiboCardBrowser';
import { amiiboService } from '../../services/amiiboService';

export const PublicCollectionView = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { supabase, isSupabaseConfigured } = useAuth();
  
  const [shareData, setShareData] = useState(null);
  const [collectionAmiibos, setCollectionAmiibos] = useState([]);
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !token) {
      setError('Unable to load shared collection');
      setIsLoading(false);
      return;
    }

    loadSharedCollection();
  }, [token, isSupabaseConfigured]);

  const loadSharedCollection = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, get the share data
      const { data: shareInfo, error: shareError } = await supabase
        .from('shared_collections')
        .select(`
          *,
          users (
            full_name,
            email
          )
        `)
        .eq('share_token', token)
        .eq('is_active', true)
        .single();

      if (shareError || !shareInfo) {
        throw new Error('Shared collection not found or no longer available');
      }

      setShareData(shareInfo);
      setOwnerInfo(shareInfo.users);

      // Increment view count (fire and forget)
      supabase
        .from('shared_collections')
        .update({ view_count: shareInfo.view_count + 1 })
        .eq('id', shareInfo.id)
        .then(() => {});

      // Get the collection amiibos
      const result = await amiiboService.getUserCollectionWithDetails(shareInfo.user_id);
      if (result.error) {
        throw new Error('Failed to load collection items');
      }

      setCollectionAmiibos(result.data);
    } catch (err) {
      console.error('Error loading shared collection:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            color: colors.text.secondary
          }}>
            Loading shared collection...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
          paddingTop: '80px'
        }}>
          <div style={{
            backgroundColor: colors.surface,
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            padding: '48px 24px'
          }}>
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={colors.text.secondary} 
              strokeWidth="1.5"
              style={{ margin: '0 auto 24px' }}
            >
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <h2 style={{
              color: colors.text.primary,
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              Collection Not Available
            </h2>
            <p style={{
              color: colors.text.secondary,
              marginBottom: '24px'
            }}>
              {error}
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ownerName = ownerInfo?.full_name || 
                   ownerInfo?.email?.split('@')[0] || 
                   'Anonymous Collector';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: colors.surface,
          borderRadius: '8px',
          border: `1px solid ${colors.border}`,
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div>
              <h1 style={{
                color: colors.text.primary,
                fontSize: '28px',
                fontWeight: '700',
                margin: '0 0 8px 0'
              }}>
                {shareData.title}
              </h1>
              <p style={{
                color: colors.text.secondary,
                fontSize: '16px',
                margin: '0 0 8px 0'
              }}>
                by {ownerName}
              </p>
              {shareData.description && (
                <p style={{
                  color: colors.text.secondary,
                  fontSize: '14px',
                  margin: '0',
                  maxWidth: '600px'
                }}>
                  {shareData.description}
                </p>
              )}
            </div>
            <div style={{
              textAlign: 'right',
              color: colors.text.secondary,
              fontSize: '12px'
            }}>
              <div>Shared on {new Date(shareData.created_at).toLocaleDateString()}</div>
              <div>{shareData.view_count + 1} views</div>
            </div>
          </div>
        </div>

        {/* Collection Content */}
        {collectionAmiibos.length === 0 ? (
          <div style={{
            backgroundColor: colors.surface,
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            padding: '48px',
            textAlign: 'center'
          }}>
            <p style={{
              color: colors.text.secondary,
              fontSize: '16px',
              margin: 0
            }}>
              This collection is currently empty.
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              marginBottom: '16px',
              color: colors.text.secondary,
              fontSize: '14px'
            }}>
              {collectionAmiibos.length} amiibo{collectionAmiibos.length !== 1 ? 's' : ''} in collection
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
                  isPublicView={true}
                  showActionsForPublic={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '48px',
          padding: '24px',
          borderTop: `1px solid ${colors.border}`
        }}>
          <p style={{
            color: colors.text.secondary,
            fontSize: '12px',
            margin: '0 0 12px 0'
          }}>
            Shared with My Amiibo Collection
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Create Your Own Collection
          </button>
        </div>
      </div>
    </div>
  );
};