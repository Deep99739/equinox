import { Sun, Mail, Calendar, Moon, ArrowRight, CheckCircle2 } from "lucide-react";

export function MorningBriefing() {
  return (
    <section id="briefing" className="morning-briefing">
      <div className="container">
        <div className="morning-briefing__grid">
          {/* Content */}
          <div>
            <div className="morning-briefing__badge">
              <Sun className="morning-briefing__badge-icon" />
              <span className="morning-briefing__badge-text">Morning Briefing Protocol</span>
            </div>
            
            <h2 className="morning-briefing__title">
              Start every day aligned
            </h2>
            
            <p className="morning-briefing__description">
              At 8:00 AM, Equinox delivers a proactive daily summary that considers both your 
              work commitments and your physical readiness. No more manual reconciliation.
            </p>

            <ul className="morning-briefing__list">
              {[
                "Critical emails and deadlines surfaced",
                "Energy levels factored into scheduling",
                "Tasks automatically reordered for optimal performance",
                "Recovery recommendations when needed",
              ].map((item) => (
                <li key={item} className="morning-briefing__list-item">
                  <CheckCircle2 className="morning-briefing__list-icon" />
                  <span className="morning-briefing__list-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mock briefing card */}
          <div className="briefing-card-wrapper">
            <div className="briefing-card-glow" />
            <div className="briefing-card">
              <div className="briefing-card__header">
                <div className="briefing-card__avatar">
                  <Sun className="briefing-card__avatar-icon" />
                </div>
                <div>
                  <p className="briefing-card__greeting">Good morning, Alex</p>
                  <p className="briefing-card__date">Tuesday, January 24</p>
                </div>
              </div>

              <div className="briefing-card__items">
                {/* Sleep alert */}
                <div className="briefing-item">
                  <Moon className="briefing-item__icon" />
                  <div>
                    <p className="briefing-item__title">Sleep Score: 65</p>
                    <p className="briefing-item__description">Below optimal. Adjusted your schedule accordingly.</p>
                  </div>
                </div>

                {/* Emails */}
                <div className="briefing-item">
                  <Mail className="briefing-item__icon" />
                  <div>
                    <p className="briefing-item__title">3 Critical Emails</p>
                    <p className="briefing-item__description">1 from CEO, 2 client follow-ups need attention.</p>
                  </div>
                </div>

                {/* Schedule */}
                <div className="briefing-item">
                  <Calendar className="briefing-item__icon" />
                  <div>
                    <p className="briefing-item__title">Schedule Updated</p>
                    <p className="briefing-item__description">{"Moved brainstorming to tomorrow. Today: execution tasks only."}</p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button type="button" className="briefing-card__button">
                View Full Briefing
                <ArrowRight className="briefing-card__button-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
