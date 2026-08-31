import { useState } from "react";
import Navbar from "@/components/Navbar";
import Landing from "@/pages/Landing";
import Chat from "@/pages/Chat";
import { useAuth } from "@/hooks/useAuth";

export default function App() {
  const { user, loading, configured, login, logout } = useAuth();
  const [view, setView] = useState<"landing" | "chat">("landing");
  const [authError, setAuthError] = useState<string | null>(null);

  async function handleLogin() {
    setAuthError(null);
    if (!configured) {
      setAuthError("Google sign-in is not configured yet. Add your Firebase settings to continue.");
      return;
    }
    try {
      await login();
      setView("chat");
    } catch {
      setAuthError("Google sign-in was cancelled or could not be completed. Please try again.");
    }
  }

  async function handleLogout() {
    await logout();
    setView("landing");
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
      </div>
    );
  }

  const showChat = Boolean(user) && view === "chat";

  return (
    <div className="min-h-screen bg-ink-950">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onNavigateHome={() => setView("landing")}
      />
      {authError && (
        <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-200">
          {authError}
        </div>
      )}
      {showChat ? (
        <Chat user={user!} onEnd={() => setView("landing")} />
      ) : (
        <Landing
          onContinueWithGoogle={handleLogin}
          onStartChatting={user ? () => setView("chat") : handleLogin}
          authLoading={loading}
        />
      )}
    </div>
  );
}
