import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  X,
  PlayCircle,
  UploadCloud,
  Download
} from 'lucide-react';
import api from '../services/api';
import { CardShimmer } from '../components/common/Shimmer';

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newResource, setNewResource] = useState({
    title: '',
    type: 'document',
    url: '',
    category: ''
  });
  const [uploading, setUploading] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const data = await api.resources.getAll();
      setResources(data);
    } catch (error) {
      console.error('Failed to load resources', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (uploading) return;
    try {
      await api.admin.createResource(newResource);
      setIsModalOpen(false);
      loadResources();
      setNewResource({ title: '', type: 'document', url: '', category: '' });
    } catch (error) {
      alert('Failed to add resource');
    }
  };

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getYouTubeId = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
  };

  const getVimeoId = (url) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const renderViewer = (resource) => {
    if (resource.type === 'video') {
      const youtubeId = getYouTubeId(resource.url);
      const vimeoId = getVimeoId(resource.url);

      if (youtubeId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={resource.title}
          />
        );
      } else if (vimeoId) {
        return (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={resource.title}
          />
        );
      } else {
        return (
          <video
            controls
            autoPlay
            style={{ maxWidth: '100%', maxHeight: '100%', outline: 'none' }}
            src={resource.url}
          >
            Your browser does not support the video tag.
          </video>
        );
      }
    }

    if (resource.type === 'image') {
      return (
        <img
          src={resource.url}
          alt={resource.title}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      );
    }

    if (resource.type === 'link') {
      return (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#333' }}>
          <ExternalLink size={48} style={{ marginBottom: '1.5rem', color: 'var(--primary)' }} />
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.3rem' }}>{resource.title}</h3>
          <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.95rem' }}>
            External links cannot be previewed here due to security restrictions.
          </p>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'var(--primary)',
              color: 'white',
              padding: '0.8rem 2rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ExternalLink size={16} /> Open in New Tab
          </a>
        </div>
      );
    }

    // Default: document (PDF, DOCX, PPTX, etc.) — Google Docs Viewer
    return (
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(resource.url)}&embedded=true`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title={resource.title}
      />
    );
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem', padding: '0 clamp(1rem, 5vw, 2.5rem)' }}>
      <header style={{
        marginBottom: '3.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '2rem',
        marginTop: '1rem'
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Educational Assets
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '0.5rem', lineHeight: 1.1 }}>Resource Library</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
            Curate and distribute learning materials to the student body.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="primary-gradient"
          style={{ padding: '1rem 2rem', borderRadius: '12px', color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.8rem', width: 'fit-content' }}
        >
          <Plus size={20} /> <span className="mobile-hide">Add Material</span><span className="desktop-hide">Add</span>
        </button>
      </header>

      {/* Control Bar */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <div className="card-tonal" style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '0.8rem 1.5rem' }}>
          <Search size={20} color="var(--primary)" />
          <input
            type="text"
            placeholder="Search resources by title or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', width: '100%', fontSize: '1rem', color: 'var(--on-surface)', outline: 'none' }}
          />
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <CardShimmer cards={8} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
          {filteredResources.map((res) => (
            <div key={res._id} className="card-tonal" style={{ border: '1px solid var(--outline-variant)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'var(--primary-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  {res.type === 'video' ? <PlayCircle size={24} /> : <FileText size={24} />}
                </div>
                <div className="badge-tonal" style={{ background: 'var(--surface-high)', color: 'var(--on-surface-variant)', fontSize: '0.7rem', fontWeight: 900 }}>
                  {res.category}
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 800 }}>{res.title}</h3>

              <div style={{ display: 'flex', gap: '0.8rem', width: '100%' }}>
                <button
                  onClick={() => setSelectedResource(res)}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    borderRadius: '8px',
                    background: 'var(--on-surface)',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  View <ExternalLink size={14} />
                </button>

                {res.type !== 'link' && (
                  <a
                    href={res.url}
                    download
                    style={{
                      padding: '0.7rem',
                      borderRadius: '8px',
                      background: 'var(--surface-high)',
                      color: 'var(--primary)',
                      border: '1px solid var(--outline-variant)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Download File"
                  >
                    <Download size={18} />
                  </a>
                )}

                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this resource?')) {
                      try {
                        await api.admin.deleteResource(res._id);
                        loadResources();
                      } catch (e) {
                        alert('Failed to delete resource');
                      }
                    }
                  }}
                  style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 10, 10, 0.4)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'clamp(1rem, 5vw, 2rem)' }}>
          <div className="card-tonal" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface)', border: '1px solid var(--outline-variant)', position: 'relative', padding: 'clamp(1.5rem, 5vw, 3rem)' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--surface-high)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={24} /></button>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Add Study Material</h2>
            <form onSubmit={handleCreateResource} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>TITLE</label>
                <input required className="input-premium" type="text" value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} placeholder="e.g. Masterclass: Advanced React" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>TYPE</label>
                  <select className="input-premium" value={newResource.type} onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}>
                    <option value="document">Document (PDF)</option>
                    <option value="video">Video Lecture</option>
                    <option value="image">Image</option>
                    <option value="link">External Link</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>CATEGORY</label>
                  <input required className="input-premium" type="text" value={newResource.category} onChange={(e) => setNewResource({ ...newResource, category: e.target.value })} placeholder="e.g. Frontend" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>
                  {newResource.type === 'link' ? 'RESOURCE URL' : 'ASSET CONTENT'}
                </label>

                {newResource.type === 'link' ? (
                  <input
                    required
                    className="input-premium"
                    type="url"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    placeholder="https://external-resource.com/..."
                  />
                ) : (
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <input
                      required
                      className="input-premium"
                      type="text"
                      value={newResource.url}
                      onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                      placeholder={
                        newResource.type === 'video' ? 'Paste YouTube, Vimeo, or direct MP4 URL...' :
                          newResource.type === 'image' ? 'Paste image URL or upload...' :
                            'Paste document URL or upload...'
                      }
                      style={{ flex: 1 }}
                      disabled={uploading}
                    />
                    <label style={{
                      padding: '0.8rem 1.5rem',
                      background: uploading ? 'var(--surface-low)' : 'var(--surface-high)',
                      borderRadius: '12px',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      color: uploading ? 'var(--on-surface-variant)' : 'var(--primary)',
                      border: '1px solid var(--outline-variant)',
                      opacity: uploading ? 0.6 : 1
                    }}>
                      {uploading ? <div className="spinner-small" /> : <UploadCloud size={18} />}
                      <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{uploading ? 'Uploading...' : 'Upload'}</span>
                      <input
                        type="file"
                        hidden
                        disabled={uploading}
                        accept={
                          newResource.type === 'video' ? 'video/*' :
                            newResource.type === 'image' ? 'image/*' :
                              '.pdf,.doc,.docx'
                        }
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setUploading(true);
                            setNewResource(prev => ({
                              ...prev,
                              url: `Uploading: ${file.name}`,
                              title: prev.title || file.name.split('.')[0]
                            }));
                            const formData = new FormData();
                            formData.append('file', file);
                            try {
                              const response = await api.admin.uploadMedia(formData);
                              setNewResource(prev => ({ ...prev, url: response.url }));
                            } catch (error) {
                              alert('Upload failed. Please try a different file.');
                              setNewResource(prev => ({ ...prev, url: '' }));
                            } finally {
                              setUploading(false);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                  {newResource.type === 'video' ? 'Supports YouTube, Vimeo, or direct MP4 uploads.' :
                    newResource.type === 'document' ? 'PDF, DOCX, and other academic formats.' :
                      newResource.type === 'image' ? 'JPG, PNG, GIF, WEBP formats supported.' :
                        'Direct navigation to external educational portals.'}
                </p>
              </div>
              <button
                type="submit"
                disabled={uploading || !newResource.url}
                className="primary-gradient"
                style={{
                  padding: '1.2rem',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: 800,
                  marginTop: '1rem',
                  opacity: (uploading || !newResource.url) ? 0.6 : 1,
                  cursor: (uploading || !newResource.url) ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? 'Awaiting Upload Completion...' : 'Publish to Library'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Resource Viewer Modal */}
      {selectedResource && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 2000,
          padding: '2rem'
        }}>
          {/* Modal Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            color: 'white'
          }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedResource.title}</h2>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{selectedResource.category} • Resource Verification</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {selectedResource.type !== 'link' && (
                <a
                  href={selectedResource.url}
                  download
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Download size={16} /> Download
                </a>
              )}
              <button
                onClick={() => setSelectedResource(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Modal Viewer */}
          <div style={{
            flex: 1,
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {renderViewer(selectedResource)}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResources;