import { useEffect, useState } from 'react';
import type { AppDispatch } from '../../app/store';
import { useAppDispatch } from '../../app/hooks';
import { setAccessToken, setCredentials } from './authSlice';
import { refreshRequest, fetchMe } from './authApi';

// Module-level promise so the restore runs EXACTLY ONCE for the app's lifetime,
// even under React StrictMode's double-invoked effects (and across remounts).
// /auth/refresh rotates the single-use refresh token, so a duplicate call must
// be avoided — every caller awaits this same promise.
let bootstrapPromise: Promise<void> | null = null;

function runBootstrap(dispatch: AppDispatch): Promise<void> {
  bootstrapPromise ??= (async () => {
    try {
      const { accessToken } = await refreshRequest();
      dispatch(setAccessToken(accessToken)); // so fetchMe's request is authorized
      const user = await fetchMe();
      dispatch(setCredentials({ user, accessToken }));
    } catch {
      // No valid refresh cookie → stay logged out. Expected, not an error.
    }
  })();
  return bootstrapPromise;
}

// On app load, try to restore the session from the httpOnly refresh cookie.
// Returns `ready` = true once the attempt settles (success OR failure).
export function useAuthBootstrap(): boolean {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    // setReady runs in an async callback (not synchronously in the effect body).
    runBootstrap(dispatch).finally(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  return ready;
}
