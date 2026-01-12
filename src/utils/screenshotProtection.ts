/**
 * Utility functions to prevent screenshots and screen recording
 * Note: Complete prevention is impossible, but we can make it harder
 */

/**
 * Blocks common screenshot keyboard shortcuts
 */
export function blockScreenshotShortcuts(): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Print Screen key (multiple ways to detect)
    if (
      e.key === 'PrintScreen' ||
      e.key === 'Print' ||
      e.keyCode === 44 ||
      e.which === 44 ||
      (e.code && e.code.includes('PrintScreen'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Windows + Shift + S (Snipping Tool)
    if (e.key === 'S' && e.shiftKey && (e.metaKey || e.ctrlKey || e.altKey)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Windows + G (Game Bar - can be used for screenshots)
    if (e.key === 'G' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Alt + Print Screen
    if ((e.key === 'PrintScreen' || e.keyCode === 44) && e.altKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl + Print Screen
    if ((e.key === 'PrintScreen' || e.keyCode === 44) && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // F12 (DevTools - can be used to take screenshots)
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl + Shift + I (DevTools)
    if (e.key === 'I' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl + Shift + C (Inspect Element)
    if (e.key === 'C' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl + Shift + J (Console)
    if (e.key === 'J' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl + Shift + K (Console in Firefox)
    if (e.key === 'K' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl + U (View Source)
    if (e.key === 'u' && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl + S (Save Page - can be used to save images)
    if (e.key === 's' && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl + P (Print - can be used to save as PDF)
    if (e.key === 'p' && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Windows + Print Screen
    if ((e.key === 'PrintScreen' || e.keyCode === 44) && e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  };

  // Add event listener with capture to catch early
  document.addEventListener('keydown', handleKeyDown, { capture: true });

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown, { capture: true });
  };
}

/**
 * Detects when user tries to take a screenshot using clipboard
 * Note: This only works in some browsers
 */
export function detectScreenshotAttempt(): () => void {
  const handlePaste = (e: ClipboardEvent) => {
    // If clipboard contains image data, it might be from a screenshot
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          // Screenshot detected via clipboard
          console.warn('[Screenshot Protection] Screenshot attempt detected via clipboard');
          // Optionally show warning or take action
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    }
  };

  document.addEventListener('paste', handlePaste, { capture: true });

  return () => {
    document.removeEventListener('paste', handlePaste, { capture: true });
  };
}

/**
 * Blocks context menu (right-click) to prevent Save Image As
 */
export function blockContextMenu(): () => void {
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  document.addEventListener('contextmenu', handleContextMenu, { capture: true });

  return () => {
    document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
  };
}

/**
 * Blocks drag and drop to prevent dragging images out
 */
export function blockDragDrop(): () => void {
  const handleDragStart = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  document.addEventListener('dragstart', handleDragStart, { capture: true });
  document.addEventListener('drop', handleDrop, { capture: true });

  return () => {
    document.removeEventListener('dragstart', handleDragStart, { capture: true });
    document.removeEventListener('drop', handleDrop, { capture: true });
  };
}

/**
 * Blocks text selection to prevent copying
 */
export function blockTextSelection(): () => void {
  const handleSelectStart = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleCopy = (e: ClipboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleCut = (e: ClipboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  document.addEventListener('selectstart', handleSelectStart, { capture: true });
  document.addEventListener('copy', handleCopy, { capture: true });
  document.addEventListener('cut', handleCut, { capture: true });

  return () => {
    document.removeEventListener('selectstart', handleSelectStart, { capture: true });
    document.removeEventListener('copy', handleCopy, { capture: true });
    document.removeEventListener('cut', handleCut, { capture: true });
  };
}

/**
 * Detects when page visibility changes (might indicate screenshot tool)
 */
export function detectVisibilityChange(callback: () => void): () => void {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Page became hidden - might be screenshot tool
      callback();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

/**
 * Detects when window loses focus (might indicate screenshot tool)
 */
export function detectBlur(callback: () => void): () => void {
  const handleBlur = () => {
    callback();
  };

  window.addEventListener('blur', handleBlur);

  return () => {
    window.removeEventListener('blur', handleBlur);
  };
}

/**
 * Detects DevTools opening (can be used to take screenshots)
 */
export function detectDevTools(callback: () => void): () => void {
  let devToolsOpen = false;
  const threshold = 160;

  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        callback();
      }
    } else {
      devToolsOpen = false;
    }
  };

  const interval = setInterval(checkDevTools, 500);

  return () => {
    clearInterval(interval);
  };
}

/**
 * Blocks screen capture API if available
 */
export function blockScreenCapture(): () => void {
  // Try to use Screen Capture API to detect/prevent
  if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
    
    navigator.mediaDevices.getDisplayMedia = async () => {
      console.warn('[Screenshot Protection] Screen capture attempt blocked');
      throw new Error('Screen capture is not allowed');
    };

    return () => {
      navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
    };
  }

  return () => {};
}

/**
 * Main function to enable all screenshot protection
 */
export function enableScreenshotProtection(options?: {
  blockShortcuts?: boolean;
  detectScreenshot?: boolean;
  blockContextMenu?: boolean;
  blockDragDrop?: boolean;
  blockTextSelection?: boolean;
  detectDevTools?: boolean;
  blockScreenCapture?: boolean;
  onScreenshotDetected?: () => void;
}): () => void {
  const {
    blockShortcuts = true,
    detectScreenshot = true,
    blockContextMenu: enableContextMenuBlock = true,
    blockDragDrop: enableDragDropBlock = true,
    blockTextSelection: enableTextSelectionBlock = false, // Set to false by default as it might interfere with UX
    detectDevTools: enableDevToolsDetection = true,
    blockScreenCapture: enableScreenCaptureBlock = true,
    onScreenshotDetected,
  } = options || {};

  const cleanupFunctions: (() => void)[] = [];

  if (blockShortcuts) {
    cleanupFunctions.push(blockScreenshotShortcuts());
  }

  if (detectScreenshot) {
    cleanupFunctions.push(detectScreenshotAttempt());
    if (onScreenshotDetected) {
      cleanupFunctions.push(
        detectVisibilityChange(onScreenshotDetected),
        detectBlur(onScreenshotDetected)
      );
    }
  }

  if (enableContextMenuBlock) {
    cleanupFunctions.push(blockContextMenu());
  }

  if (enableDragDropBlock) {
    cleanupFunctions.push(blockDragDrop());
  }

  if (enableTextSelectionBlock) {
    cleanupFunctions.push(blockTextSelection());
  }

  if (enableDevToolsDetection && onScreenshotDetected) {
    cleanupFunctions.push(detectDevTools(onScreenshotDetected));
  }

  if (enableScreenCaptureBlock) {
    cleanupFunctions.push(blockScreenCapture());
  }

  // Return combined cleanup function
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
}

