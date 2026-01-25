import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Health Agent Detects",
    description: "The Wellness Agent monitors your sleep, fatigue, and activity metrics to detect your current state.",
    highlight: "Low sleep score detected (65)",
  },
  {
    number: "02",
    title: "Supervisor Orchestrates",
    description: "The central Supervisor Agent receives the signal and evaluates how to adjust your workday.",
    highlight: "Cross-domain communication",
  },
  {
    number: "03",
    title: "Productivity Adapts",
    description: "The Productivity Agent automatically reschedules deep work blocks to light admin tasks.",
    highlight: "Workload matched to capacity",
  },
  {
    number: "04",
    title: "You Stay Balanced",
    description: "Productivity is maintained while intensity is modulated. No burnout, sustainable performance.",
    highlight: "Performance without sacrifice",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works">
      <div className="container">
        {/* Section header */}
        <div className="how-it-works__header">
          <h2 className="how-it-works__title">
            How It Works
          </h2>
          <p className="how-it-works__subtitle">
            Cross-domain adaptability through intelligent agent communication.
          </p>
        </div>

        {/* Steps */}
        <div className="how-it-works__steps">
          {steps.map((step, index) => (
            <div key={step.number} className="step">
              {/* Step number */}
              <span className="step__number">
                {step.number}
              </span>
              
              {/* Title */}
              <h3 className="step__title">
                {step.title}
              </h3>
              
              {/* Description */}
              <p className="step__description">
                {step.description}
              </p>
              
              {/* Highlight */}
              <div className="step__highlight">
                <span className="step__highlight-text">{step.highlight}</span>
              </div>

              {/* Arrow connector (hidden on mobile and last item) */}
              {index < steps.length - 1 && (
                <div className="step__arrow">
                  <ArrowRight className="icon--lg" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
