'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from '@supabase/supabase-js';
import type { Expense, HouseholdMember } from '../common/types';
import { getSupabaseClient } from '../lib/supabase/client';
import { loadHouseholdData } from '../lib/supabase/queries';

interface AppContextValue {
  user: User | null;
  members: HouseholdMember[];
  expenses: Expense[];
  loading: boolean;
  error: string;
  setError: (message: string) => void;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

/** Reject a request that never settles so the app cannot remain on a loader forever. */
function withTimeout<T>(promise: Promise<T>, label: string, timeoutMs = 15000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out. Check your internet connection and Supabase project status, then retry.`));
    }, timeoutMs);

    promise.then(
      (result) => {
        clearTimeout(timer);
        resolve(result);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState('');

  // Create/restore the invisible anonymous Supabase session.
  useEffect(() => {
    let alive = true;
    let unsubscribe: (() => void) | undefined;

    async function initialise() {
      try {
        const client = getSupabaseClient();
        const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
          if (alive) setUser(session?.user ?? null);
        });
        unsubscribe = () => subscription.unsubscribe();

        const sessionResult = await withTimeout(
          client.auth.getSession(),
          'Supabase session check',
        );
        if (sessionResult.error) throw sessionResult.error;
        if (!alive) return;

        if (sessionResult.data.session?.user) {
          setUser(sessionResult.data.session.user);
        } else {
          const authResult = await withTimeout(
            client.auth.signInAnonymously(),
            'Anonymous authentication',
          );
          if (authResult.error) throw authResult.error;
          if (!authResult.data.user) {
            throw new Error('Supabase did not return an anonymous user. Enable Anonymous Sign-Ins in Supabase Authentication settings.');
          }
          if (alive) setUser(authResult.data.user);
        }
      } catch (caught) {
        if (alive) {
          setError(getErrorMessage(caught, 'Unable to connect to Supabase.'));
          // Critical: release the loading screen even when authentication fails.
          setLoading(false);
        }
      } finally {
        if (alive) setAuthReady(true);
      }
    }

    void initialise();
    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await withTimeout(loadHouseholdData(), 'Loading household data');
      setMembers(data.members);
      setExpenses(data.expenses);
      setError('');
    } catch (caught) {
      const message = getErrorMessage(caught, 'Unable to refresh household expenses.');
      setError(message);
      throw caught;
    }
  }, []);

  // Load household data after the anonymous session is ready.
  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      // Auth failed or no session exists: never leave the app loading forever.
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setError('');

    withTimeout(loadHouseholdData(), 'Loading household data')
      .then((data) => {
        if (!alive) return;
        setMembers(data.members);
        setExpenses(data.expenses);
      })
      .catch((caught: unknown) => {
        if (alive) {
          setError(getErrorMessage(caught, 'Unable to load household expenses.'));
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [authReady, user]);

  // Keep all open devices in sync when expenses or member settings change.
  useEffect(() => {
    if (!user) return;

    let alive = true;
    const client = getSupabaseClient();
    const channel = client
      .channel('household-live-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'household_expenses' },
        () => {
          if (alive) void refresh().catch(() => undefined);
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'household_members' },
        () => {
          if (alive) void refresh().catch(() => undefined);
        },
      )
      .subscribe();

    return () => {
      alive = false;
      void client.removeChannel(channel);
    };
  }, [user, refresh]);

  const value = useMemo(
    () => ({
      user,
      members,
      expenses,
      loading: loading || !authReady,
      error,
      setError,
      refresh,
    }),
    [user, members, expenses, loading, authReady, error, refresh],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider.');
  return value;
}
