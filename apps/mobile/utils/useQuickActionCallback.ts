import * as React from 'react';
import * as QuickActions from "expo-quick-actions";

export function useQuickActionCallback(
  callback?: (data: QuickActions.Action) => void | Promise<void>
) {
  React.useEffect(() => {
    let isMounted = true;

    if (QuickActions.initial) {
      callback?.(QuickActions.initial);
    }

    const sub = QuickActions.addListener((event) => {
      if (isMounted) {
        callback?.(event);
      }
    });
    return () => {
      isMounted = false;
      sub.remove();
    };
  }, [QuickActions.initial, callback]);
}