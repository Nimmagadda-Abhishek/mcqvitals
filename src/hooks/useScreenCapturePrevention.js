import { useEffect, useRef } from 'react';

/**
 * Custom hook to prevent screenshot and screen recording
 * Blocks common shortcuts and detects capture attempts
 */
const useScreenCapturePrevention = (onScreenCaptureAttempt = null, isEnabled = true) => {
    const lastViolationTime = useRef(0);

    useEffect(() => {
        if (!isEnabled) return;

        const handleScreenCaptureAttempt = (reason) => {
            const now = Date.now();
            // Cooldown of 500ms to prevent rapid duplicate events
            if (now - lastViolationTime.current < 500) return;
            lastViolationTime.current = now;

            console.warn('Screen capture attempt detected:', reason);
            
            if (onScreenCaptureAttempt) {
                onScreenCaptureAttempt(reason);
            } else {
                // Fallback alert if no callback provided
                alert(`Security Alert: ${reason}\nScreenshots and screen recording are not allowed.`);
            }
        };

        // Block keyboard shortcuts for screenshots and screen recording
        const handleKeyDown = (e) => {
            const key = e.key;
            const keyLower = key.toLowerCase();
            const hasCtrl = e.ctrlKey || e.metaKey;
            const hasShift = e.shiftKey;
            const hasAlt = e.altKey;

            // Block PrintScreen - HIGHEST PRIORITY
            if (key === 'PrintScreen') {
                e.preventDefault();
                e.stopPropagation();
                e.returnValue = false;
                handleScreenCaptureAttempt('PrintScreen key pressed');
                return false;
            }

            // Block Windows/Mac screenshot shortcuts
            // Windows: PrintScreen, Alt+PrintScreen, Shift+PrintScreen
            // Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
            if (hasShift && (keyLower === '3' || keyLower === '4' || keyLower === '5')) {
                if (e.metaKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.returnValue = false;
                    handleScreenCaptureAttempt('Mac screenshot shortcut (Cmd+Shift+' + keyLower + ')');
                    return false;
                }
            }

            // Block Alt+PrintScreen
            if (hasAlt && key === 'PrintScreen') {
                e.preventDefault();
                e.stopPropagation();
                e.returnValue = false;
                handleScreenCaptureAttempt('Alt+PrintScreen pressed');
                return false;
            }

            // Block Ctrl+S (Save screenshot in some apps)
            if (hasCtrl && keyLower === 's') {
                e.preventDefault();
                e.stopPropagation();
                e.returnValue = false;
                handleScreenCaptureAttempt('Ctrl+S pressed (potential screenshot save)');
                return false;
            }

            // Block Ctrl+Shift+S (Region screenshot)
            if (hasCtrl && hasShift && keyLower === 's') {
                e.preventDefault();
                e.stopPropagation();
                e.returnValue = false;
                handleScreenCaptureAttempt('Ctrl+Shift+S pressed (screenshot tool)');
                return false;
            }

            // Block Windows Snipping Tool (Win+Shift+S) - Check for Shift+S specifically
            if (hasShift && keyLower === 's' && !hasCtrl) {
                e.preventDefault();
                e.stopPropagation();
                e.returnValue = false;
                handleScreenCaptureAttempt('Windows Snipping Tool shortcut (Shift+S)');
                return false;
            }

            // Block Ctrl+P (Print/Print to screenshot)
            if (hasCtrl && keyLower === 'p') {
                e.preventDefault();
                e.stopPropagation();
                e.returnValue = false;
                handleScreenCaptureAttempt('Ctrl+P pressed (print dialog)');
                return false;
            }

            // Block recording shortcuts (Ctrl+Shift+R)
            if (hasCtrl && hasShift && keyLower === 'r') {
                e.preventDefault();
                e.stopPropagation();
                e.returnValue = false;
                handleScreenCaptureAttempt('Ctrl+Shift+R pressed (recording shortcut)');
                return false;
            }
        };

        // Detect context menu (right-click) - often used with screenshot tools
        const handleContextMenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.returnValue = false;
            handleScreenCaptureAttempt('Right-click attempted');
            return false;
        };

        // Detect screen recording via getDisplayMedia or similar APIs
        const preventScreenRecording = () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
                navigator.mediaDevices.getDisplayMedia = async function (constraints) {
                    handleScreenCaptureAttempt('Screen recording attempt via getDisplayMedia');
                    throw new Error('Screen recording is not permitted in this environment');
                };
            }

            // Also prevent via getUserMedia if trying to capture display
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
                navigator.mediaDevices.getUserMedia = async function (constraints) {
                    if (constraints && constraints.video && constraints.video.mediaSource === 'screen') {
                        handleScreenCaptureAttempt('Screen recording attempt via getUserMedia');
                        throw new Error('Screen recording is not permitted in this environment');
                    }
                    return originalGetUserMedia.call(navigator.mediaDevices, constraints);
                };
            }
        };

        preventScreenRecording();

        // Add event listeners with capture phase (true) to intercept before bubbling
        const keydownHandler = (e) => handleKeyDown(e);
        const contextHandler = (e) => handleContextMenu(e);
        const dragHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        const copyHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        // Use capture phase to intercept events earlier
        document.addEventListener('keydown', keydownHandler, true);
        document.addEventListener('contextmenu', contextHandler, true);
        document.addEventListener('dragstart', dragHandler, true);
        document.addEventListener('copy', copyHandler, true);
        document.addEventListener('cut', copyHandler, true);
        document.addEventListener('paste', copyHandler, true);
        
        // Also add to window for additional coverage
        window.addEventListener('keydown', keydownHandler, true);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', keydownHandler, true);
            document.removeEventListener('contextmenu', contextHandler, true);
            document.removeEventListener('dragstart', dragHandler, true);
            document.removeEventListener('copy', copyHandler, true);
            document.removeEventListener('cut', copyHandler, true);
            document.removeEventListener('paste', copyHandler, true);
            window.removeEventListener('keydown', keydownHandler, true);
        };
    }, [isEnabled, onScreenCaptureAttempt]);
};

export default useScreenCapturePrevention;
