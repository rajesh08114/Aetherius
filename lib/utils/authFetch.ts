import { useAuthStore } from '@/store/authStore';

let refreshPromise: Promise<string | null> | null = null;

function withAuthHeaders(init: RequestInit = {}, token?: string) {
  const headers = new Headers(init.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else {
    headers.delete('Authorization');
  }
  return headers;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshRes = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    if (!refreshRes.ok) {
      useAuthStore.setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false
      });
      return null;
    }

    const refreshJson = await refreshRes.json();
    const nextToken = refreshJson?.data?.accessToken as string | undefined;
    if (!nextToken) {
      return null;
    }

    useAuthStore.getState().setAccessToken(nextToken);
    return nextToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

type AuthFetchOptions = {
  retryOn401?: boolean;
};

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}, options: AuthFetchOptions = {}): Promise<Response> {
  const { accessToken } = useAuthStore.getState();
  const firstHeaders = withAuthHeaders(init, accessToken || undefined);

  const firstRes = await fetch(input, {
    ...init,
    credentials: 'include',
    headers: firstHeaders
  });

  if (firstRes.status !== 401 || options.retryOn401 === false) {
    return firstRes;
  }

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) {
    return firstRes;
  }

  const retryHeaders = withAuthHeaders(init, refreshedToken);
  return fetch(input, {
    ...init,
    credentials: 'include',
    headers: retryHeaders
  });
}
