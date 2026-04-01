import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Supabase auth state changes
  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Sign Up ───────────────────────────────────────────────────────────────
  const signup = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);

    // Create profile row
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        email,
      });
    }
    return data.user;
  };

  // ── Sign In ───────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data.user;
  };

  // ── Sign Out ──────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ── Update Profile ────────────────────────────────────────────────────────
  const updateProfile = async (updates) => {
    if (!user) return;
    // Separate database columns from metadata-only fields
    const { currency, timezone, ...dbUpdates } = updates;
    
    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
      if (error) throw new Error(error.message);
    }
    // Save everything (including currency/timezone) to Auth metadata
    await supabase.auth.updateUser({ data: updates });
  };

  // Expose a clean user object with name and preferences from metadata
  const profile = user ? {
    id:       user.id,
    email:    user.email,
    name:     user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    currency: user.user_metadata?.currency || 'USD',
    timezone: user.user_metadata?.timezone || 'America/New_York',
  } : null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
        <div style={{ textAlign: 'center', color: 'var(--outline)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <p>Loading Aura Finance…</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user: profile, rawUser: user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
