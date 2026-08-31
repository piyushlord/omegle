import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  isFirebaseConfigured,
  onAuthChange,
  signInWithGoogle,
  signOut,
} from "@/services/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured] = useState(isFirebaseConfigured());

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    const unsub = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [configured]);

  async function login() {
    await signInWithGoogle();
  }

  async function logout() {
    await signOut();
  }

  return { user, loading, configured, login, logout };
}
