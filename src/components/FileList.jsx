import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
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
  HardDrive,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import FileViewer, { getFileCategory } from './FileViewer';
import { CardShimmer } from './common/Shimmer';
import useScreenCapturePrevention from '../hooks/useScreenCapturePrevention';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Format bytes into human-readable size.
 */
const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

/**
 * Return an icon component for the file category.
 */
const getFileIcon = (filename) => {
  const category = getFileCategory(filename);
  switch (category) {
    case 'pdf': return <FileText size={22} />;
    case 'image': return <Image size={22} />;
    case 'video': return <Film size={22} />;
    default: return <File size={22} />;
  }
};

/**
 * Return a color scheme for the file category badge.
 */
const getCategoryColors = (filename) => {
  const category = getFileCategory(filename);
  switch (category) {
    case 'pdf':
      return { bg: '#fde8e8', color: '#b91c1c', label: 'PDF' };
    case 'image':
      return { bg: '#dbeafe', color: '#1d4ed8', label: 'Image' };
    case 'video':
      return { bg: '#ede9fe', color: '#6d28d9', label: 'Video' };
    default:
      return { bg: 'var(--surface-high)', color: 'var(--on-surface-variant)', label: 'File' };
  }
};

const FileList = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isBlurred, setIsBlurred] = useState(false);
  const containerRef = useRef(null);

  const filters = ['All', 'pdf', 'image', 'video'];

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
    fetchFiles();

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

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}/files`, { headers });
      if (!res.ok) throw new Error('Failed to fetch files');

      const data = await res.json();
      setFiles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Strip path prefix for display (show only filename after last /)
  const getDisplayName = (filename) => {
    const parts = filename.split('/');
    return parts[parts.length - 1];
  };

  const filteredFiles = files.filter(file => {
    const displayName = getDisplayName(file.filename);
    const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const category = getFileCategory(file.filename);
    const matchesFilter = activeFilter === 'All' || category === activeFilter;
    return matchesSearch && matchesFilter;
  });

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
      {/* ─── Blur Overlay (activates when tab/window loses focus) ─── */}
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
          Global Scholarly Library
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
            onClick={() => { setError(null); setLoading(true); fetchFiles(); }}
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
        ) : filteredFiles.map((file, index) => {
          const displayName = getDisplayName(file.filename);
          const categoryColors = getCategoryColors(file.filename);

          return (
            <div
              key={file.filename + index}
              className="premium-card"
              onClick={() => setSelectedFile(file)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                cursor: 'pointer',
                position: 'relative'
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
                  background: categoryColors.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: categoryColors.color
                }}>
                  {getFileIcon(file.filename)}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: categoryColors.color,
                  background: categoryColors.bg,
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {categoryColors.label}
                </div>
              </div>

              {/* Filename */}
              <h3 style={{
                fontSize: '1.2rem',
                marginBottom: '0.8rem',
                lineHeight: 1.35,
                wordBreak: 'break-word'
              }}>
                {displayName}
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
                  {file.uploadedAt && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      color: 'var(--on-surface-variant)'
                    }}>
                      <Clock size={14} />
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </div>
                  )}
                  {/* File Size */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--primary)'
                  }}>
                    <HardDrive size={14} />
                    {formatSize(file.size)}
                  </div>
                </div>

                {/* View Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(file); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <Eye size={16} /> View
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Empty State ─── */}
      {!loading && !error && filteredFiles.length === 0 && (
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
              : 'No files have been uploaded yet.'}
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
                {getDisplayName(selectedFile.filename)}
              </h2>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                {getCategoryColors(selectedFile.filename).label} • {formatSize(selectedFile.size)} • Knowledge Repository
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
            <FileViewer filename={selectedFile.filename} />

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
