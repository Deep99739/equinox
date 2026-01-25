# health_agent.py

class HealthAgent:
    def __init__(self, supervisor):
        self.supervisor = supervisor

    def detect_fatigue(self, fatigue_level):
        # Simulate detection of high fatigue
        if fatigue_level > 7:
            self.supervisor.receive_signal('health', {'fatigue': fatigue_level})
