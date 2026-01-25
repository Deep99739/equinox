import { ArrowRight } from "lucide-react";

export function CTA() {
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
              <button type="button" className="btn btn--primary btn--lg">
                Get Started Free
                <ArrowRight className="icon--md" />
              </button>
              <button type="button" className="btn btn--outline btn--lg">
                Talk to Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
