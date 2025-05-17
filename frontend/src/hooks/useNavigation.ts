import { useEffect } from 'react';

type GuardCallback = (nextPath: string) => boolean;

export const useNavigationRoute = (enabled: boolean, onNavigateAway: GuardCallback) => {

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (enabled) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled]);

  useEffect(() => {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const blockNavigation = (method: typeof history.pushState) => {
      return function (this: History, ...args: Parameters<typeof history.pushState>) {
        const url = typeof args[2] === 'string' ? args[2] : window.location.href;
        if (!enabled || onNavigateAway(url)) {
          return method.apply(this, args);
        }
      };
    };

    history.pushState = blockNavigation(originalPushState);
    history.replaceState = blockNavigation(originalReplaceState);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [enabled, onNavigateAway]);
};
