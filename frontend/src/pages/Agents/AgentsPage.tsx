import React, { useState } from 'react';
import './AgentsPage.css';
import { ProductivityAgent } from './ProductivityAgent/ProductivityAgent';
import { WellnessAgent } from './WellnessAgent/WellnessAgent';
import { BriefingAgent } from './BriefingAgent/BriefingAgent';
import SupervisorAgent from './SupervisorAgent/SupervisorAgent';


// Example agent type - adjust based on your actual agent files
interface Agent {
  id: string;
  name: string;
  subtitle: string;
  status: string;
  description: string;
  capabilities: Array<{
    title: string;
    desc: string;
  }>;
  integrations: string[];
  example?: string;
}

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Import your agent data from separate files
  const agents = [ProductivityAgent, WellnessAgent, BriefingAgent];

  const openModal = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const closeModal = () => {
    setSelectedAgent(null);
  };

  return (
    <div className="agents-page">
      <div className="agents-header">
        <h1 className="agents-title">Your AI Agent Network</h1>
        <p className="agents-subtitle">
          Intelligent agents working together to optimize your productivity, health, and daily workflow
        </p>
      </div>

      {/* Render SupervisorAgent as an interactive card at the top */}
      <SupervisorAgent />

      <div className="agents-grid">
        {agents.filter(agent => agent.id !== 'supervisor').map((agent) => (
          <div
            key={agent.id}
            className={`agent-card`}
            onClick={() => openModal(agent)}
          >
            <div className="agent-card-header">
              <div className="agent-header-info">
                <h3 className="agent-name">{agent.name}</h3>
                <p className="agent-subtitle">{agent.subtitle}</p>
              </div>
            </div>

            <p className="agent-description">{agent.description}</p>

            <div className="view-details">
              View Details →
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedAgent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className={`modal-content`} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="modal-header">
              <div>
                <h2 className="modal-title">{selectedAgent.name}</h2>
                <p className="modal-subtitle">{selectedAgent.subtitle}</p>
              </div>
            </div>

            <p className="modal-description">{selectedAgent.description}</p>

            <div className="modal-body">
              <div className="capabilities-section">
                <h4 className="section-title">Key Capabilities</h4>
                <div className="capabilities-list">
                  {selectedAgent.capabilities.map((cap, idx) => (
                    <div key={idx} className="capability-item">
                      <div>
                        <h5>{cap.title}</h5>
                        <p>{cap.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedAgent.example && (
                <div className="example-section">
                  <h4 className="section-title">Example Output</h4>
                  <div className="example-box">
                    {selectedAgent.example}
                  </div>
                </div>
              )}

              <div className="integrations-section">
                <h4 className="section-title">Integrations</h4>
                <div className="integrations-tags">
                  {selectedAgent.integrations.map((integration, idx) => (
                    <span key={idx} className="integration-tag">
                      {integration}
                    </span>
                  ))}
                </div>
              </div>

              <div className="agent-actions">
                <button className="action-btn primary">Configure Agent</button>
                <button className="action-btn secondary">View Activity</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}