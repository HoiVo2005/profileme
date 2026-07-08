type QueryResult = { data: any; error: any; count?: number | null };

type QueryBuilder = {
  select: (...args: any[]) => QueryBuilder;
  eq: (...args: any[]) => QueryBuilder;
  or: (...args: any[]) => QueryBuilder;
  order: (...args: any[]) => QueryBuilder;
  limit: (...args: any[]) => QueryBuilder;
  single: () => Promise<QueryResult>;
  insert: (payload: any) => QueryBuilder;
  update: (payload: any) => QueryBuilder;
  delete: () => QueryBuilder;
  then: (resolve: (value: QueryResult) => any, reject?: (reason?: any) => any) => Promise<any>;
  count?: number | null;
};

type SupabaseSession = {
  access_token?: string;
  refresh_token?: string;
  user?: Record<string, any>;
};

const SESSION_STORAGE_KEY = 'sb-session';

const readSession = (): SupabaseSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeSession = (session: SupabaseSession | null) => {
  if (typeof window === 'undefined') return;
  if (session) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
};

const parseJson = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const createQueryBuilder = (baseUrl: string, anonKey: string, table: string): QueryBuilder => {
  const state: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    select: string;
    queryParams: Array<{ key: string; value: string }>;
    body?: any;
    countMode?: 'exact' | 'planned' | 'estimated';
    head?: boolean;
    wantsRepresentation?: boolean;
  } = {
    method: 'GET',
    select: '*',
    queryParams: [],
  };

  const execute = async (): Promise<QueryResult> => {
    const params = new URLSearchParams();
    params.set('select', state.select);
    state.queryParams.forEach(({ key, value }) => params.append(key, value));

    const url = `${baseUrl}/rest/v1/${encodeURIComponent(table)}${params.toString() ? `?${params.toString()}` : ''}`;
    const session = readSession();
    const headers: Record<string, string> = {
      apikey: anonKey,
      Authorization: `Bearer ${session?.access_token || anonKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    // Request a total row count from PostgREST via the Prefer header.
    // Without this, PostgREST never returns Content-Range and `count`
    // stays undefined no matter how many rows exist.
    const preferParts: string[] = [];
    if (state.countMode) preferParts.push(`count=${state.countMode}`);
    if (state.head) preferParts.push('return=minimal');
    if (state.wantsRepresentation && (state.method === 'POST' || state.method === 'PATCH')) {
      preferParts.push('return=representation');
    }
    if (preferParts.length) headers.Prefer = preferParts.join(',');

    const requestInit: RequestInit = {
      method: state.head ? 'HEAD' : state.method,
      headers,
    };

    if (state.body !== undefined && (state.method === 'POST' || state.method === 'PATCH')) {
      requestInit.body = JSON.stringify(state.body);
    }

    try {
      const response = await fetch(url, requestInit);

      // PostgREST returns the total count in the Content-Range header,
      // e.g. "0-9/97" (97 = total rows) or "*/97" for HEAD requests.
      let count: number | null = null;
      const contentRange = response.headers.get('content-range');
      if (contentRange && contentRange.includes('/')) {
        const total = contentRange.split('/')[1];
        count = total && total !== '*' ? Number(total) : null;
      }

      const payload = state.head ? null : await parseJson(response);
      if (!response.ok) {
        return {
          data: null,
          count,
          error: { message: typeof payload === 'string' ? payload : payload?.message || 'Supabase request failed' },
        };
      }
      return { data: payload ?? [], count, error: null };
    } catch (error: any) {
      return { data: null, count: null, error: { message: error?.message || 'Supabase request failed' } };
    }
  };

  const chain: QueryBuilder = {
    select: (...args: any[]) => {
      state.select = args[0] ?? '*';
      const options = args[1] as { count?: 'exact' | 'planned' | 'estimated'; head?: boolean } | undefined;
      if (options?.count) state.countMode = options.count;
      if (options?.head) state.head = true;
      if (state.method === 'POST' || state.method === 'PATCH') state.wantsRepresentation = true;
      return chain;
    },
    eq: (...args: any[]) => {
      const [column, value] = args;
      state.queryParams.push({ key: column, value: `eq.${encodeURIComponent(String(value))}` });
      return chain;
    },
    or: (...args: any[]) => {
      const [condition] = args;
      if (condition) {
        state.queryParams.push({ key: 'or', value: String(condition) });
      }
      return chain;
    },
    order: (...args: any[]) => {
      const [column, options] = args;
      const direction = options?.ascending === false ? 'desc' : 'asc';
      state.queryParams.push({ key: 'order', value: `${column}.${direction}` });
      return chain;
    },
    limit: (...args: any[]) => {
      const [value] = args;
      state.queryParams.push({ key: 'limit', value: String(value) });
      return chain;
    },
    single: async () => {
      if (state.method === 'GET') {
        state.queryParams.push({ key: 'limit', value: '1' });
      }
      const result = await execute();
      if (Array.isArray(result.data)) {
        return { data: result.data[0] ?? null, error: result.error };
      }
      return result;
    },
    insert: (payload: any) => {
      state.method = 'POST';
      state.body = payload;
      return chain;
    },
    update: (payload: any) => {
      state.method = 'PATCH';
      state.body = payload;
      return chain;
    },
    delete: () => {
      state.method = 'DELETE';
      return chain;
    },
    then: (resolve, reject) => execute().then(resolve, reject),
    count: 0,
  };

  return chain;
};

const createSupabaseClient = (baseUrl: string, anonKey: string) => ({
  from: (table: string) => createQueryBuilder(baseUrl, anonKey, table),
  auth: {
    getUser: async () => {
      const session = readSession();
      if (!session?.access_token) {
        return { data: { user: null }, error: null };
      }
      try {
        const response = await fetch(`${baseUrl}/auth/v1/user`, {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${session.access_token}`,
            Accept: 'application/json',
          },
        });
        const payload = await parseJson(response);
        if (!response.ok) {
          writeSession(null);
          return { data: { user: null }, error: { message: payload?.message || 'Authentication failed' } };
        }
        return { data: { user: payload }, error: null };
      } catch (error: any) {
        return { data: { user: null }, error: { message: error?.message || 'Authentication failed' } };
      }
    },
    signOut: async () => {
      writeSession(null);
      return { error: null };
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            apikey: anonKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        const payload = await parseJson(response);
        if (!response.ok) {
          return { data: { user: null }, error: { message: payload?.message || 'Sign in failed' } };
        }
        writeSession(payload);
        return { data: { user: payload?.user || null }, error: null };
      } catch (error: any) {
        return { data: { user: null }, error: { message: error?.message || 'Sign in failed' } };
      }
    },
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File, _options?: any) => {
        const session = readSession();
        const response = await fetch(`${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeURIComponent(path)}`, {
          method: 'POST',
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${session?.access_token || anonKey}`,
          },
          body: file,
        });
        if (!response.ok) {
          const payload = await parseJson(response);
          return { error: { message: payload?.message || 'Upload failed' } };
        }
        return { error: null };
      },
      remove: async (paths: string[]) => {
        const session = readSession();
        const response = await fetch(`${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}`, {
          method: 'DELETE',
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${session?.access_token || anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paths),
        });
        if (!response.ok) {
          const payload = await parseJson(response);
          return { error: { message: payload?.message || 'Delete failed' } };
        }
        return { error: null };
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeURIComponent(path)}` },
      }),
    }),
  },
});

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);
export const supabase = url && key ? createSupabaseClient(url, key) : createSupabaseClient('https://placeholder.supabase.co', 'placeholder-key');
