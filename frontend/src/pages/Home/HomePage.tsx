import React from 'react';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="homepage">
      <div className="homepage-content">
        <div className="hero-section">
          <h1 className="hero-title">Equinox</h1>
          <p className="hero-subtitle">
            Connect specialized AI agents that work together to solve complex problems through
            collaborative intelligence.
          </p>
          <div className="hero-buttons">
            <button className="primary-cta">Experience Multi-Agent Chat</button>
            <button className="primary-cta">Explore Agent Directory</button>

          </div>
        </div>

        <div className="capabilities-section">
          <h2 className="section-title">Key Capabilities</h2>
          <p className="section-subtitle">Discover how Equinox revolutionizes AI workflows</p>
          
          <div className="capabilities-grid">
            <div className="capability-card">
              <div className="capability-icon purple">💬</div>
              <h3>Multi-Agent Chat</h3>
              <p>Engage with multiple specialized AI agents collaborating in real-time to solve your complex problems.</p>
              <a href="#" className="capability-link purple-link">Try it now →</a>
            </div>
            
            <div className="capability-card">
              <div className="capability-icon blue">🤖</div>
              <h3>Intelligent Task Routing</h3>
              <p>Smart delegation ensures each task is handled by the most capable agent for optimal results.</p>
              <a href="#" className="capability-link blue-link">Explore agents →</a>
            </div>
          </div>
        </div>

        <div className="sponsors-section">
          <h2 className="section-title">Powered By</h2>
          <div className="sponsors-grid">
            <div className="sponsor-card">Google AI</div>
            <div className="sponsor-card">Comet</div>
            <div className="sponsor-card">Vercel</div>
          </div>
        </div>
      </div>
    </div>
  );
}