import { useState } from "react";
import { Menu, X } from "lucide-react";
import "./Navbar.css";

function handleGoogleSignIn() {
  fetch("http://localhost:8000/auth/google/login")
    .then((res) => res.json())
    .then((data) => {
      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    });
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <nav className="container navbar__inner">
        {/* Desktop Navigation */}
        <div className="navbar__links">
          <a href="#features" className="navbar__link">
            Features
          </a>
          <a href="#how-it-works" className="navbar__link">
            How It Works
          </a>
          <a href="#briefing" className="navbar__link">
            Morning Briefing
          </a>
        </div>

        {/* Desktop CTA */}
        <div className="navbar__cta">
          <button
            className="btn btn--ghost btn--left"
            onClick={handleGoogleSignIn}
          >
            Sign In
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className="navbar__mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="icon" /> : <Menu className="icon" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="container navbar__mobile-menu">
          <div className="navbar__mobile-links">
            <a href="#features" className="navbar__mobile-link">
              Features
            </a>
            <a href="#how-it-works" className="navbar__mobile-link">
              How It Works
            </a>
            <a href="#briefing" className="navbar__mobile-link">
              Morning Briefing
            </a>
          </div>

          <div className="navbar__mobile-cta">
            <button
              className="btn btn--ghost btn--left"
              onClick={handleGoogleSignIn}
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
