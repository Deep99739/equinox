import { useEffect, useState } from "react";
import { ArrowRight, LogOut } from "lucide-react";
import { fetchConnections, handleGoogleSignIn } from "../../api/authApi";
import { fetchUserProfileByEmail } from "../../api/profileApi";
import { getUserEmail, signOut } from "../../utils/authUtils";
import { ThemeToggle } from "../../components/ThemeToggle/ThemeToggle";

export default function SettingsPage() {
  const email = getUserEmail();
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    avatar_url?: string;
  } | null>(null);
  const [google, setGoogle] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(Boolean(email));
  useEffect(() => {
    if (!email) return;
    let active = true;
    Promise.allSettled([
      fetchUserProfileByEmail(email),
      fetchConnections(),
    ]).then(([profileResult, connectionResult]) => {
      if (!active) return;
      if (profileResult.status === "fulfilled") setProfile(profileResult.value);
      if (connectionResult.status === "fulfilled")
        setGoogle(connectionResult.value.google);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [email]);
  return (
    <div className="page-wrap settings-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Make it yours</p>
          <h1>
            Settings<span className="heading-dot">.</span>
          </h1>
          <p className="page-subtitle">
            Your account and the services you choose to connect.
          </p>
        </div>
      </div>
      <div className="settings-group">
        <h2>Account</h2>
        <div className="settings-row">
          <span className="settings-avatar">
            {profile?.name?.charAt(0).toUpperCase() ||
              email?.charAt(0).toUpperCase() ||
              "E"}
          </span>
          <div>
            <strong>
              {loading
                ? "Loading…"
                : profile?.name || email?.split("@")[0] || "Your account"}
            </strong>
            <small>{profile?.email || email || "Email unavailable"}</small>
          </div>
        </div>
      </div>
      <div className="settings-group">
        <h2>Connections</h2>
        <div className="settings-row">
          <span className="google-mark" aria-hidden="true">
            G
          </span>
          <div>
            <strong>Google</strong>
            <small>
              {google === true
                ? "Connected to your account"
                : google === false
                  ? "Connect to use email in briefings"
                  : "Connection status unavailable"}
            </small>
          </div>
          {google === false && (
            <button
              type="button"
              className="text-link button-link"
              onClick={() => void handleGoogleSignIn()}
            >
              Connect <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="settings-group">
        <h2>Preferences</h2>
        <ThemeToggle />
      </div>
      <div className="settings-group">
        <h2>Session</h2>
        <button
          type="button"
          className="settings-signout"
          onClick={() => void signOut()}
        >
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </div>
  );
}
