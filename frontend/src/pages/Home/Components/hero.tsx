import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { handleGoogleSignIn, type SessionStatus } from "../../../api/authApi";

export function Hero({ session }: { session: SessionStatus }) {
    return (
        <section className="hero">
            {/* High-resolution background image */}
            <div className="hero__bg-image" aria-hidden="true" />

            {/* Grid overlay for texture */}
            <div className="hero__grid" aria-hidden="true" />

            {/* Gradient glow for additional depth */}
            <div className="hero__glow" />

            <div className="container hero__content">
                {/* Badge */}
                <div className="hero__badge">
                    <Sparkles className="hero__badge-icon" />
                    <span className="hero__badge-text">AI-Powered Multi-Agent Orchestrator</span>
                </div>

                {/* Main headline */}
                <h1 className="hero__title">
                    Work smarter.
                    <br />
                    <span className="hero__title-accent">Live better.</span>
                </h1>

                {/* Subheadline */}
                <p className="hero__subtitle">
                    Equinox bridges the gap between professional productivity and personal well-being.
                    Your AI Chief of Staff that adapts your workload to your wellness.
                </p>

                {/* CTA Buttons */}
                <div className="hero__buttons">
                    {session === 'ready' ? (
                        <Link to="/chat" className="btn btn--primary btn--lg">
                            Open Equinox
                            <ArrowRight className="icon--md" />
                        </Link>
                    ) : session === 'signed_out' ? (
                        <button type="button" className="btn btn--primary btn--lg" onClick={handleGoogleSignIn}>
                            Get Started Free
                            <ArrowRight className="icon--md" />
                        </button>
                    ) : (
                        <button type="button" className="btn btn--primary btn--lg" disabled>
                            {session === 'checking' ? 'Checking sign-in...' : 'Sign-in check unavailable'}
                        </button>
                    )}
                    <Link to="/contact" className="btn btn--outline btn--lg">
                        Talk to Us
                    </Link>
                </div>

                {/* Social proof */}
                <div className="hero__social-proof">
                    <p className="hero__social-proof-text">Built with 💙 for Encode AI: Commit to Change</p>
                    <div className="hero__social-proof-items">
                        {["Deepak", "Mainak", "Abhayjit"].map((item) => (
                            <span key={item} className="hero__social-proof-item">{item}</span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
