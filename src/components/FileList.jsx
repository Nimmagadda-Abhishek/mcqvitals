import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Image,
  Film,
  File,
  Filter,
  Clock,
  Eye,
  X,
  AlertCircle,
  FolderOpen,
  Lock,
  ExternalLink
} from 'lucide-react';
import { CardShimmer } from './common/Shimmer';
import useScreenCapturePrevention from '../hooks/useScreenCapturePrevention';
import api from '../services/api';

/**
 * Return an icon component for the file category.
 */
const getFileIcon = (type) => {
  switch (type) {
    case 'document': return <FileText size={22} />;
    case 'image': return <Image size={22} />;
    case 'video': return <Film size={22} />;
    default: return <File size={22} />;
  }
};

/**
 * Return a color scheme for the file category badge.
 */
const getCategoryColors = (type) => {
  switch (type) {
    case 'document':
      return { bg: '#fde8e8', color: '#b91c1c', label: 'Document' };
    case 'image':
      return { bg: '#dbeafe', color: '#1d4ed8', label: 'Image' };
    case 'video':
      return { bg: '#ede9fe', color: '#6d28d9', label: 'Video' };
    case 'link':
      return { bg: '#dcfce7', color: '#15803d', label: 'Link' };
    default:
      return { bg: 'var(--surface-high)', color: 'var(--on-surface-variant)', label: 'File' };
  }
};

const FileList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isBlurred, setIsBlurred] = useState(false);
  const containerRef = useRef(null);

  const filters = ['All', 'document', 'image', 'video', 'link'];

  // Watermark text based on logged-in user
  const watermarkText = user
    ? `${user.name || 'Student'} • ${user.email || ''}`
    : 'GlobXplore Confidential';

  // Enable screen capture prevention for resources
  useScreenCapturePrevention(
    (reason) => {
      alert(`Security Alert: ${reason}\nScreenshots and screen recording are prohibited for resources.`);
    },
    true
  );

  useEffect(() => {
    fetchResources();

    // Blur content when tab/window loses focus (deters alt-tab screenshots)
    const handleVisibilityChange = () => {
      setIsBlurred(document.hidden);
    };
    const handleWindowBlur = () => setIsBlurred(true);
    const handleWindowFocus = () => setIsBlurred(false);

    // Block drag events to prevent drag-to-desktop saving
    const handleDragStart = (e) => e.preventDefault();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  const fetchResources = async () => {
    try {
      const data = await api.resources.getAll();
      setResources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || res.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

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
            controlsList="nodownload"
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
    <div
      ref={containerRef}
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        position: 'relative'
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* ─── Blur Overlay ─── */}
      {isBlurred && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Eye size={32} style={{ color: 'white' }} />
          </div>
          <p style={{
            color: 'white',
            fontSize: '1.3rem',
            fontWeight: 700,
            textAlign: 'center'
          }}>
            Content hidden for security
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            Return to this tab to continue viewing
          </p>
        </div>
      )}

      {/* ─── Header ─── */}
      <header style={{ marginBottom: '3.5rem' }}>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--primary)',
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          Knowledge Repository
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>
          Global Question Bank
        </h1>
        <p style={{
          color: 'var(--on-surface-variant)',
          fontSize: '1.2rem',
          maxWidth: '700px',
          lineHeight: 1.5
        }}>
          Explore curated academic materials, verified research papers, and lecture
          series uploaded by our academic administration.
        </p>
      </header>

      {/* ─── Search & Filters ─── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3rem',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
          <Search style={{
            position: 'absolute',
            left: '1.2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--on-surface-variant)'
          }} size={20} />
          <input
            type="text"
            placeholder="Search files by name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '1.2rem 1.2rem 1.2rem 3.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--outline-variant)',
              background: 'var(--surface-lowest)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <Filter size={18} style={{ color: 'var(--on-surface-variant)', marginRight: '0.5rem' }} />
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '30px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: activeFilter === filter ? 'var(--primary)' : 'var(--surface-low)',
                color: activeFilter === filter ? 'white' : 'var(--on-surface-variant)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {filter === 'All' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Error State ─── */}
      {error && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--surface-low)',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '2rem'
        }}>
          <AlertCircle size={48} style={{ color: 'var(--error)', marginBottom: '1.5rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Connection Error</h2>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); fetchResources(); }}
            style={{
              background: 'var(--primary)',
              color: 'white',
              padding: '0.8rem 2rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── Files Grid ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '2rem'
      }}>
        {loading ? (
          <CardShimmer cards={6} />
        ) : filteredResources.map((res, index) => {
          const categoryColors = getCategoryColors(res.type);
          const isLocked = !res.isFree && user?.subscription?.status !== 'active';

          return (
            <div
              key={res._id || index}
              className="premium-card"
              onClick={() => {
                if (isLocked) {
                  navigate('/pricing');
                } else {
                  setSelectedFile(res);
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                cursor: 'pointer',
                position: 'relative',
                opacity: isLocked ? 0.8 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {/* Top Row: Icon + Badge */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: isLocked ? 'var(--error-container)' : categoryColors.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isLocked ? 'var(--error)' : categoryColors.color
                }}>
                  {isLocked ? <Lock size={22} /> : getFileIcon(res.type)}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--on-surface-variant)',
                    background: 'var(--surface-high)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {res.category}
                  </div>
                  {!res.isFree && (
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: 'white',
                      background: 'var(--primary)',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '20px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      Premium
                    </div>
                  )}
                </div>
              </div>

              {/* Filename */}
              <h3 style={{
                fontSize: '1.2rem',
                marginBottom: '0.8rem',
                lineHeight: 1.35,
                wordBreak: 'break-word'
              }}>
                {res.title}
              </h3>

              {/* Metadata Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--surface-low)',
                marginTop: 'auto'
              }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  {/* Upload Date */}
                  {res.createdAt && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      color: 'var(--on-surface-variant)'
                    }}>
                      <Clock size={14} />
                      {new Date(res.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* View Button */}
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: isLocked ? 'var(--error)' : 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {isLocked ? <><Lock size={16} /> Unlock</> : <><Eye size={16} /> View</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Empty State ─── */}
      {!loading && !error && filteredResources.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '6rem 2rem',
          background: 'var(--surface-low)',
          borderRadius: 'var(--radius-xl)'
        }}>
          <FolderOpen size={48} style={{ color: 'var(--outline-variant)', marginBottom: '1.5rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>No files found</h2>
          <p style={{ color: 'var(--on-surface-variant)' }}>
            {searchTerm || activeFilter !== 'All'
              ? 'Try adjusting your search terms or filters.'
              : 'No resources have been uploaded yet.'}
          </p>
        </div>
      )}

      {/* ─── Viewer Modal ─── */}
      {selectedFile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 2000,
            padding: '2rem'
          }}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* Modal Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            color: 'white'
          }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {selectedFile.title}
              </h2>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                {getCategoryColors(selectedFile.type).label} • Knowledge Repository
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginLeft: '1rem',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Viewer Area */}
          <div style={{
            flex: 1,
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {renderViewer(selectedFile)}

            {/* ─── Watermark Overlay ─── */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 10,
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '60px',
                transform: 'rotate(-35deg)',
                transformOrigin: 'center center'
              }}>
                {Array.from({ length: 80 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'rgba(0, 55, 176, 0.07)',
                      whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '0.05em',
                      padding: '20px 40px',
                      userSelect: 'none'
                    }}
                  >
                    {watermarkText}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;
