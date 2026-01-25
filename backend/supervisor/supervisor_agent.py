from agents.productivity_agent import ProductivityAgent

class SupervisorAgent:
    """
    Supervisor Agent acts as a central brain, managing specialized sub-agents.
    It can receive signals from sub-agents and instruct other agents accordingly.
    """
    def __init__(self):
        pass

    def get_work_summary(self, tokens):
        """Chain: Supervisor → ProductivityAgent → Gmail Tool"""
        ProductivityAgent_instance = ProductivityAgent()
        return ProductivityAgent_instance.get_today_priorities(tokens)
