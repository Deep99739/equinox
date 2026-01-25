# supervisor_agent.py

class SupervisorAgent:
    """
    Supervisor Agent acts as a central brain, managing specialized sub-agents.
    It can receive signals from sub-agents and instruct other agents accordingly.
    """
    def __init__(self, sub_agents):
        self.sub_agents = sub_agents  # Dict of agent_name: agent_instance

    def receive_signal(self, from_agent, signal_data):
        """Handle signals from sub-agents and coordinate actions."""
        # Example: If Health Agent signals high fatigue, instruct Productivity Agent
        if from_agent == 'health' and signal_data.get('fatigue', 0) > 7:
            self.instruct_productivity_agent('reschedule', {
                'from': 'Deep Work',
                'to': 'Light Admin Tasks',
                'suggest_nap': True
            })

    def instruct_productivity_agent(self, action, params):
        productivity_agent = self.sub_agents.get('productivity')
        if productivity_agent:
            productivity_agent.handle_supervisor_instruction(action, params)

    # Add more methods for other agent communications as needed
