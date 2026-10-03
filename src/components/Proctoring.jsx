import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import useScreenCapturePrevention from '../hooks/useScreenCapturePrevention';

const Proctoring = ({ testId, userId, isAdmin, isSubmitted, onTerminate }) => {
    const [violationCount, setViolationCount] = useState(0);
    const lastViolationTime = useRef(0);

    useEffect(() => {
        if (!testId || !userId || isSubmitted || isAdmin) return;

        // Fetch initial violations
        const fetchViolations = async () => {
            try {
                const data = await api.violations.get(userId, testId);
                setViolationCount(data.totalCount);
                if (data.terminated) {
                    onTerminate('Exceeded maximum allowed violations.');
                }
            } catch (err) {
                console.error('Failed to fetch violations', err);
            }
        };

        fetchViolations();
    }, [testId, userId, isSubmitted, isAdmin, onTerminate]);

    // Handle screen capture attempts (screenshots, screen recording)
    const handleScreenCaptureAttempt = async (reason) => {
        const now = Date.now();
        // Cooldown of 2 seconds to prevent rapid duplicate events
        if (now - lastViolationTime.current < 2000) return;
        lastViolationTime.current = now;

        const fullReason = `Screen Capture Attempt: ${reason}`;
        
        try {
            const res = await api.violations.log({
                userId,
                testId,
                reason: fullReason,
                timestamp: now
            });
            
            setViolationCount(res.violationCount);
            
            if (res.terminated) {
                onTerminate('Session terminated: Screen capture or recording detected.');
            } else {
                const remaining = 3 - res.violationCount;
                alert(`Security Alert: ${fullReason}.\nWarnings remaining: ${remaining < 0 ? 0 : remaining}. Such attempts may result in immediate termination.`);
                lastViolationTime.current = Date.now();
            }
        } catch (error) {
            console.error('Error logging screen capture violation:', error);
        }
    };

    // Use screen capture prevention hook
    useScreenCapturePrevention(handleScreenCaptureAttempt, !isSubmitted && !isAdmin && !!testId && !!userId);

    useEffect(() => {
        if (isSubmitted || isAdmin || !testId || !userId) return;

        const logViolation = async (reason) => {
            const now = Date.now();
            // Cooldown of 2 seconds to prevent rapid duplicate events (e.g., blur + visibilitychange)
            if (now - lastViolationTime.current < 2000) return;
            lastViolationTime.current = now;

            try {
                const res = await api.violations.log({
                    userId,
                    testId,
                    reason,
                    timestamp: now
                });
                
                setViolationCount(res.violationCount);
                
                if (res.terminated) {
                    onTerminate('Exceeded maximum allowed violations during the test.');
                } else {
                    const remaining = 3 - res.violationCount;
                    alert(`Security Alert: ${reason}.\nWarnings remaining: ${remaining < 0 ? 0 : remaining}. Please stay on this tab to avoid termination.`);
                    // Reset cooldown after alert is dismissed to prevent blur/focus events from triggering another violation
                    lastViolationTime.current = Date.now();
                }
            } catch (error) {
                console.error('Error logging violation:', error);
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) logViolation('Tab switched or minimized');
        };

        const handleBlur = () => {
            logViolation('Browser window lost focus');
        };

        const handleContextMenu = (e) => {
            e.preventDefault();
            logViolation('Right-click attempted');
        };

        const handleCopyPaste = (e) => {
            e.preventDefault();
            logViolation('Copy/Paste attempted');
        };

        const handleKeyDown = (e) => {
            // Allow basic safe keys
            if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) return;

            const forbiddenKeys = ['PrintScreen', 'F12', 'Escape'];
            const isForbiddenKey = forbiddenKeys.includes(e.key);
            const isForbiddenCombo = (e.ctrlKey || e.metaKey) && ['c', 'v', 'p', 's', 'u', 'i'].includes(e.key.toLowerCase());
            
            if (isForbiddenKey || isForbiddenCombo) {
                e.preventDefault();
                e.stopPropagation();
                logViolation('Forbidden keyboard shortcut attempted');
                return false;
            }
        };

        // Desktop & Mobile Events
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('cut', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup on unmount
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('cut', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSubmitted, isAdmin, testId, userId, onTerminate]);

    if (violationCount > 0 && !isAdmin && !isSubmitted) {
        return (
            <div style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                zIndex: 9999,
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: '2px solid #991b1b',
                maxWidth: 'calc(100vw - 2rem)'
            }}>
                <svg style={{ width: '24px', height: '24px', color: 'white', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.875rem', letterSpacing: '0.025em', textTransform: 'uppercase' }}>Security Warning</span>
                    <span style={{ fontWeight: '500', fontSize: '0.75rem' }}>Violations: {violationCount}/3</span>
                </div>
            </div>
        );
    }

    return null;
};

export default Proctoring;
