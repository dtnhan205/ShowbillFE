/**
 * Utility to detect and prevent Developer Tools access
 * If DevTools is detected, redirects to Google and blocks API calls
 */

// Check if already detected by inline script
declare global {
  interface Window {
    __DEVTOOLS_DETECTED__?: boolean;
    __API_BLOCKED__?: boolean;
  }
}

/**
 * Detects if Developer Tools is open using multiple methods
 */
function detectDevToolsOpen(): boolean {
  // First check global flag set by inline script
  // @ts-ignore
  if (window.__DEVTOOLS_DETECTED__ || window.__API_BLOCKED__) {
    return true;
  }
  try {
    // Method 1: Check window size difference (most reliable for docked DevTools)
    const widthThreshold = 160;
    const heightThreshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    
    if (widthDiff > widthThreshold || heightDiff > heightThreshold) {
      return true;
    }

    // Method 2: Check console detection using getter trap
    let devtoolsDetected = false;
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function() {
        devtoolsDetected = true;
        return '';
      }
    });
    
    // Trigger the getter (console.log will access .id if DevTools is open)
    console.log(element);
    console.clear();
    
    if (devtoolsDetected) {
      return true;
    }

    // Method 3: Check for DevTools using function toString
    // When DevTools is open, function.toString() behavior might differ
    try {
      const func = function() {};
      const funcString = func.toString();
      // If DevTools is inspecting, toString might be modified
      if (funcString.length < 10 || funcString.length > 1000) {
        // Suspicious, but not definitive
      }
    } catch (e) {
      // Ignore
    }

    // Method 4: Check if console methods are being inspected
    const devtoolsObj: any = {};
    let propertyAccessed = false;
    Object.defineProperty(devtoolsObj, 'isDevToolsOpen', {
      get: function() {
        propertyAccessed = true;
        return false;
      }
    });
    
    console.log(devtoolsObj);
    console.clear();
    
    if (propertyAccessed) {
      return true;
    }

    // Method 5: Check for DevTools specific window properties
    // Some browsers expose DevTools state
    try {
      // @ts-ignore
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        return true;
      }
      
      // Check for Chrome DevTools specific properties
      // @ts-ignore
      if (window.chrome && window.chrome.runtime && window.chrome.runtime.onConnect) {
        // Additional checks can be added here
      }
    } catch (e) {
      // Ignore errors
    }

    return false;
  } catch (e) {
    // If detection fails, assume DevTools might be open (fail-safe)
    return false;
  }
}

/**
 * Redirects to Google and blocks API
 */
function redirectToGoogle(): void {
  // Set global flags
  // @ts-ignore
  window.__DEVTOOLS_DETECTED__ = true;
  // @ts-ignore
  window.__API_BLOCKED__ = true;
  
  // Block all ongoing and future API calls
  // Override fetch
  window.fetch = function() {
    return Promise.reject(new Error('API calls blocked - DevTools detected'));
  };
  
  // Override XMLHttpRequest
  XMLHttpRequest.prototype.open = function() {
    throw new Error('API calls blocked - DevTools detected');
  };
  
  // Clear all storage
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    // Ignore errors
  }

  // Redirect to Google
  window.location.href = 'https://www.google.com';
}

/**
 * Blocks F12 and DevTools shortcuts
 */
function blockDevToolsShortcuts(): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      redirectToGoogle();
      return false;
    }

    // Ctrl + Shift + I (DevTools)
    if (e.key === 'I' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      redirectToGoogle();
      return false;
    }

    // Ctrl + Shift + C (Inspect Element)
    if (e.key === 'C' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      redirectToGoogle();
      return false;
    }

    // Ctrl + Shift + J (Console)
    if (e.key === 'J' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      redirectToGoogle();
      return false;
    }

    // Ctrl + Shift + K (Console in Firefox)
    if (e.key === 'K' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      redirectToGoogle();
      return false;
    }

    // Ctrl + U (View Source)
    if (e.key === 'u' && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      redirectToGoogle();
      return false;
    }

    // Ctrl + Shift + U (View Source in some browsers)
    if (e.key === 'U' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      redirectToGoogle();
      return false;
    }
  };

  // Add event listener with capture to catch early
  document.addEventListener('keydown', handleKeyDown, { capture: true });
  window.addEventListener('keydown', handleKeyDown, { capture: true });

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown, { capture: true });
    window.removeEventListener('keydown', handleKeyDown, { capture: true });
  };
}

/**
 * Continuously monitors for DevTools
 */
function monitorDevTools(): () => void {
  let checkCount = 0;
  const maxChecks = 1; // Immediate redirect on detection (more aggressive)

  const checkInterval = setInterval(() => {
    // @ts-ignore
    if (window.__DEVTOOLS_DETECTED__ || window.__API_BLOCKED__) {
      clearInterval(checkInterval);
      redirectToGoogle();
      return;
    }
    
    if (detectDevToolsOpen()) {
      checkCount++;
      if (checkCount >= maxChecks) {
        clearInterval(checkInterval);
        console.warn('[DevTools Protection] DevTools detected! Blocking API and redirecting...');
        redirectToGoogle();
      }
    } else {
      checkCount = 0; // Reset if DevTools is closed
    }
  }, 200); // Check every 200ms for faster detection

  return () => {
    clearInterval(checkInterval);
  };
}

/**
 * Detects DevTools on page load (if opened before navigation)
 */
function detectDevToolsOnLoad(): void {
  // Immediate check on load (catches DevTools opened before page load)
  // We check multiple times to be sure
  let immediateCheckCount = 0;
  const immediateChecks = 2; // Check 2 times immediately
  
  const immediateCheck = () => {
    if (detectDevToolsOpen()) {
      immediateCheckCount++;
      if (immediateCheckCount >= immediateChecks) {
        console.warn('[DevTools Protection] DevTools detected on page load! Redirecting...');
        redirectToGoogle();
        return;
      }
    }
  };
  
  immediateCheck();
  
  // Check again after a very short delay
  setTimeout(immediateCheck, 50);
  
  // Also check after a longer delay (in case DevTools opens during page load)
  setTimeout(() => {
    if (detectDevToolsOpen()) {
      console.warn('[DevTools Protection] DevTools detected after page load! Redirecting...');
      redirectToGoogle();
    }
  }, 1500);
}

/**
 * Blocks right-click context menu (often used to open DevTools)
 */
function blockContextMenu(): () => void {
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // Also check if DevTools might be opening
    setTimeout(() => {
      if (detectDevToolsOpen()) {
        redirectToGoogle();
      }
    }, 100);
    
    return false;
  };

  document.addEventListener('contextmenu', handleContextMenu, { capture: true });
  window.addEventListener('contextmenu', handleContextMenu, { capture: true });

  return () => {
    document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
  };
}

/**
 * Main function to enable DevTools protection
 * This will redirect to Google if DevTools is detected and block all API calls
 */
export function enableDevToolsProtection(): () => void {
  // Check if already detected by inline script
  // @ts-ignore
  if (window.__DEVTOOLS_DETECTED__ || window.__API_BLOCKED__) {
    redirectToGoogle();
    return () => {}; // Return empty cleanup
  }

  console.log('%c⚠️ CẢNH BÁO ⚠️', 'color: red; font-size: 50px; font-weight: bold;');
  console.log('%cNếu bạn đang cố gắng mở Developer Tools, bạn sẽ bị chuyển hướng và API sẽ bị chặn!', 'color: red; font-size: 20px;');

  // Check immediately on load (catches DevTools opened before page load)
  detectDevToolsOnLoad();

  // Block shortcuts
  const cleanupShortcuts = blockDevToolsShortcuts();

  // Block context menu
  const cleanupContextMenu = blockContextMenu();

  // Monitor continuously (more aggressive - check every 200ms)
  const cleanupMonitor = monitorDevTools();

  // Also check on window resize (DevTools opening changes window size)
  const handleResize = () => {
    setTimeout(() => {
      if (detectDevToolsOpen()) {
        redirectToGoogle();
      }
    }, 50);
  };

  window.addEventListener('resize', handleResize);
  window.addEventListener('focus', handleResize);
  window.addEventListener('blur', handleResize);

  // Return cleanup function
  return () => {
    cleanupShortcuts();
    cleanupContextMenu();
    cleanupMonitor();
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('focus', handleResize);
    window.removeEventListener('blur', handleResize);
  };
}

