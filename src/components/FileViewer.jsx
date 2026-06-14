import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { FileText, Image, Film, AlertCircle } from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Detect the file category from a filename extension.
 */
const getFileCategory = (filename) => {
  const ext = (filename || '').split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'mov', 'ogg', 'avi'].includes(ext)) return 'video';
  return 'other';
};

const FileViewer = ({ filename, directUrl }) => {
  const [url, setUrl] = useState(directUrl || null);
  const [loading, setLoading] = useState(!directUrl);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pdfContainerWidth, setPdfContainerWidth] = useState(800);

  const category = directUrl ? getFileCategory(directUrl) : getFileCategory(filename);

  // Fetch the pre-signed URL from the backend
  useEffect(() => {
    if (directUrl) {
      setUrl(directUrl);
      setLoading(false);
      return;
    }

    if (!filename) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchUrl = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${BASE_URL}/file-url/${encodeURIComponent(filename)}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch file URL');

        const data = await res.json();
        if (!cancelled) {
          setUrl(data.url);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUrl();
    return () => { cancelled = true; };
  }, [filename]);

  // Measure the PDF container width for responsive rendering
  useEffect(() => {
    const container = document.getElementById('pdf-scroll-container');
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPdfContainerWidth(entry.contentRect.width - 48); // 48px total horizontal padding
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [loading, url]);

  const onDocumentLoadSuccess = ({ numPages: pages }) => {
    setNumPages(pages);
  };

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '1.5rem',
        color: 'var(--on-surface-variant)',
        padding: '3rem'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid var(--primary-container)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ fontWeight: 600, fontSize: '1rem' }}>Loading file…</p>
      </div>
    );
  }

  /* ─── Error State ─── */
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '1rem',
        color: 'var(--error)',
        padding: '3rem',
        textAlign: 'center'
      }}>
        <AlertCircle size={48} />
        <h3 style={{ fontWeight: 700 }}>Unable to load file</h3>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', maxWidth: '400px' }}>{error}</p>
      </div>
    );
  }

  /* ─── PDF Viewer ─── */
  if (category === 'pdf') {
    return (
      <div
        id="pdf-scroll-container"
        style={{
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          padding: '24px',
          background: 'var(--surface-low)'
        }}
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="spinner-small" />
            </div>
          }
          error={
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--error)' }}>
              <AlertCircle size={32} style={{ marginBottom: '0.5rem' }} />
              <p>Failed to load PDF document.</p>
            </div>
          }
        >
          {numPages && Array.from({ length: numPages }, (_, i) => (
            <div
              key={`page_${i + 1}`}
              style={{
                marginBottom: '1.5rem',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'white'
              }}
            >
              <Page
                pageNumber={i + 1}
                width={Math.min(pdfContainerWidth, 900)}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </div>
          ))}
        </Document>
        {numPages && (
          <p style={{
            textAlign: 'center',
            padding: '1rem 0 0.5rem',
            fontSize: '0.8rem',
            color: 'var(--on-surface-variant)',
            fontWeight: 600
          }}>
            {numPages} page{numPages !== 1 ? 's' : ''} total
          </p>
        )}
      </div>
    );
  }

  /* ─── Image Viewer ─── */
  if (category === 'image') {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--surface-low)'
      }}>
        <img
          src={url}
          alt={filename}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            pointerEvents: 'auto',
            userSelect: 'none'
          }}
        />
      </div>
    );
  }

  /* ─── Video Viewer ─── */
  if (category === 'video') {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#000'
      }}>
        <video
          controls
          autoPlay
          controlsList="nodownload"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: '8px',
            outline: 'none'
          }}
          src={url}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  /* ─── Unsupported / Fallback ─── */
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '1rem',
      padding: '3rem',
      textAlign: 'center',
      color: 'var(--on-surface-variant)'
    }}>
      <FileText size={48} style={{ color: 'var(--primary)' }} />
      <h3 style={{ fontWeight: 700, color: 'var(--on-surface)' }}>Preview not available</h3>
      <p style={{ fontSize: '0.9rem', maxWidth: '400px' }}>
        This file type cannot be previewed in the browser. Contact your administrator for access.
      </p>
    </div>
  );
};

export { getFileCategory };
export default FileViewer;
