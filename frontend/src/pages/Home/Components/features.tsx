import { Mail, Heart, Brain, Zap, Calendar, Activity } from "lucide-react";

const features = [
  {
    icon: Mail,
    title: "Intelligent Inbox",
    description: "Connects to Gmail to summarize threads, draft replies, and surface urgent items only.",
    agent: "Productivity Agent",
  },
  {
    icon: Calendar,
    title: "Contextual Task Manager",
    description: "Dynamically prioritizes your to-do list based on available time slots and current energy levels.",
    agent: "Productivity Agent",
  },
  {
    icon: Activity,
    title: "Recovery Tracking",
    description: "Ingests sleep and activity metrics to calculate a daily readiness score for optimal performance.",
    agent: "Wellness Agent",
  },
  {
    icon: Heart,
    title: "Adaptive Fitness Plans",
    description: "Suggests shorter, high-intensity workouts when work is demanding, or full sessions when you have capacity.",
    agent: "Wellness Agent",
  },
  {
    icon: Brain,
    title: "Cross-Domain Intelligence",
    description: "Agents communicate with each other, not just you. Health insights influence work scheduling automatically.",
    agent: "Supervisor Agent",
  },
  {
    icon: Zap,
    title: "Real-time Adaptation",
    description: "Continuously adjusts recommendations based on your changing state throughout the day.",
    agent: "Supervisor Agent",
  },
];

export function Features() {
  return (
    <section id="features" className="features">
      <div className="container">
        {/* Section header */}
        <div className="features__header">
          <h2 className="features__title">
            Your AI-Powered Chief of Staff
          </h2>
          <p className="features__subtitle">
            A Multi-Agent Orchestrator with specialized agents working together to balance your work and wellness.
          </p>
        </div>

        {/* Features grid */}
        <div className="features__grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <div className="feature-card__icon-wrapper">
                <feature.icon className="feature-card__icon" />
              </div>
              <span className="feature-card__agent">
                {feature.agent}
              </span>
              <h3 className="feature-card__title">{feature.title}</h3>
              <p className="feature-card__description">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
