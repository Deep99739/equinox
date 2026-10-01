import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { handleGoogleSignIn } from "../../../api/authApi";

export function CTA({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="cta">
      <div className="container">
        <div className="cta__card">
          {/* Background decoration */}
          <div className="cta__glow-1" />
          <div className="cta__glow-2" />
          
          <div className="cta__content">
            <h2 className="cta__title">
              Stop burning out.
              <br />
              Start performing sustainably.
            </h2>
            
            <p className="cta__description">
              Join professionals who have discovered that true productivity comes from 
              balancing ambition with well-being.
            </p>

            <div className="cta__buttons">
              {signedIn ? (
                <Link to="/chat" className="btn btn--primary btn--lg">
                  Open Equinox
                  <ArrowRight className="icon--md" />
                </Link>
              ) : (
                <button type="button" className="btn btn--primary btn--lg" onClick={handleGoogleSignIn}>
                  Get Started Free
                  <ArrowRight className="icon--md" />
                </button>
              )}
              <Link to="/contact" className="btn btn--outline btn--lg">
                Talk to Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
