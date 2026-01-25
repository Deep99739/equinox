export const SupervisorAgentData = {
  id: 'supervisor',
  name: 'The Supervisor Agent',
  subtitle: 'Your Personal Chief of Staff',
  status: 'Active',
  description:
    'Acts as a central brain, managing specialized sub-agents. Enables cross-domain adaptability and inter-agent communication. Has access to both your office (Gmail/Docs) and your health data (Wearables/Logs).',
  capabilities: [
    {
      title: 'Cross-Domain Adaptability',
      desc: 'Coordinates between productivity and health agents to optimize your workflow and well-being.'
    },
    {
      title: 'Inter-Agent Communication',
      desc: 'Receives signals from sub-agents and instructs others to take action, e.g., rescheduling tasks based on health data.'
    }
  ],
  integrations: ['Gmail', 'Google Docs', 'Wearables', 'Health Logs'],
  example: 'If high fatigue is detected, the Supervisor instructs the Productivity Agent to reschedule deep work to lighter tasks or suggest a power nap.'
};
