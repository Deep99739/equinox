
import React, { useState } from "react";
import "./SupervisorAgent.css";
import { simulateFatigue } from "../../../api/supervisorAgentApi";

const SupervisorAgent: React.FC = () => {
    const [fatigueLevel, setFatigueLevel] = useState(5);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSimulate = async () => {
        setLoading(true);
        setStatus("");
        try {
            const data = await simulateFatigue(fatigueLevel);
            setStatus(data.status || data.reply || "Simulation complete.");
        } catch (e) {
            setStatus("Error: " + e);
        }
        setLoading(false);
    };

    return (
        <div className="supervisor-agent-card">
            <h2>Supervisor Agent</h2>
            <p>
                Acts as a central brain, managing specialized sub-agents. Demonstrates cross-domain adaptability and inter-agent communication.
            </p>
            <div className="supervisor-agent-controls">
                <label>
                    Fatigue Level: {fatigueLevel}
                    <input
                        type="range"
                        min={0}
                        max={10}
                        value={fatigueLevel}
                        onChange={e => setFatigueLevel(Number(e.target.value))}
                        disabled={loading}
                    />
                </label>
                <button onClick={handleSimulate} disabled={loading}>
                    {loading ? "Simulating..." : "Simulate Fatigue Event"}
                </button>
            </div>
            {status && <div className="supervisor-agent-status">{status}</div>}
        </div>
    );
};

export default SupervisorAgent;
