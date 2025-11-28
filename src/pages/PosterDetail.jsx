import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function PosterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inCollection, setInCollection] = useState(false);

  useEffect(() => {
    fetchPoster();
  }, [id]);

  const fetchPoster = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await client.get(`/posters/${id}`);
      setPoster(response.data.data);
      setInCollection(response.data.data.attributes.in_user_collection || false);
    } catch (err) {
      setError('Failed to fetch poster details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await client.post('/user_posters', {
        data: {
          type: 'user_posters',
          attributes: {
            poster_id: id,
          },
        },
      });
      setInCollection(true);
    } catch (err) {
      console.error('Failed to add to collection:', err);
      setError('Failed to add poster to collection');
    }
  };

  const handleRemoveFromCollection = async () => {
    try {
      // Assuming API provides a user_poster relationship
      const userPosterId = poster.attributes.user_poster_id;
      await client.delete(`/user_posters/${userPosterId}`);
      setInCollection(false);
    } catch (err) {
      console.error('Failed to remove from collection:', err);
      setError('Failed to remove poster from collection');
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !poster) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Poster not found'}
        </div>
      </div>
    );
  }

  const attributes = poster.attributes;

  return (
    <div className="container py-5">
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate('/gallery')}
      >
        ← Back to Gallery
      </button>

      <div className="row g-4">
        {/* Image Section */}
        <div className="col-lg-6">
          <div
            style={{
              position: 'relative',
              paddingBottom: '133.33%',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <img
              src={attributes.image_url}
              alt={attributes.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="col-lg-6">
          <h1 className="mb-2">{attributes.title}</h1>

          <div className="mb-4">
            {attributes.artist_name && (
              <p className="text-muted mb-1">
                <strong>Artist:</strong> {attributes.artist_name}
              </p>
            )}
            {attributes.venue_name && (
              <p className="text-muted mb-1">
                <strong>Venue:</strong> {attributes.venue_name}
              </p>
            )}
            {attributes.year && (
              <p className="text-muted mb-1">
                <strong>Year:</strong> {attributes.year}
              </p>
            )}
            {attributes.series_name && (
              <p className="text-muted mb-1">
                <strong>Series:</strong> {attributes.series_name}
              </p>
            )}
          </div>

          {attributes.price && (
            <div className="mb-4">
              <span className="badge bg-success p-2">
                ${(attributes.price / 100).toFixed(2)}
              </span>
            </div>
          )}

          {attributes.description && (
            <div className="mb-4">
              <h5 className="mb-2">Description</h5>
              <p className="text-muted">{attributes.description}</p>
            </div>
          )}

          {/* Collection Action */}
          {user && (
            <div className="mb-4">
              {inCollection ? (
                <button
                  className="btn btn-outline-danger"
                  onClick={handleRemoveFromCollection}
                >
                  Remove from Collection
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleAddToCollection}
                >
                  Add to Collection
                </button>
              )}
            </div>
          )}

          {!user && (
            <div className="alert alert-info">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/login')}
              >
                Sign in to add to collection
              </button>
            </div>
          )}

          {/* Additional Details */}
          <div className="mt-5 pt-4 border-top">
            <h5 className="mb-3">Details</h5>
            <dl className="row">
              {attributes.condition && (
                <>
                  <dt className="col-sm-4">Condition:</dt>
                  <dd className="col-sm-8 text-muted">{attributes.condition}</dd>
                </>
              )}
              {attributes.edition && (
                <>
                  <dt className="col-sm-4">Edition:</dt>
                  <dd className="col-sm-8 text-muted">{attributes.edition}</dd>
                </>
              )}
              {attributes.created_at && (
                <>
                  <dt className="col-sm-4">Added:</dt>
                  <dd className="col-sm-8 text-muted">
                    {new Date(attributes.created_at).toLocaleDateString()}
                  </dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
