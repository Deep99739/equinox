export const BriefingAgent = {
  id: 'briefing',
  name: 'Morning Briefing Protocol',
  subtitle: 'The Orchestrator',
  status: 'Active',
  description: 'A proactive daily summary that aligns your day across all agents for optimal performance.',
  capabilities: [
    {
      title: 'Smart Daily Alignment',
      desc: 'Delivered at 8:00 AM with insights from all agents to plan your perfect day.',
      icon: '📊'
    },
    {
      title: 'Intelligent Rescheduling',
      desc: 'Automatically adjusts your schedule based on energy levels, deadlines, and priorities.',
      icon: '🔄'
    }
  ],
  integrations: ['All Agents', 'Email', 'Calendar', 'Health Apps'],
  example: '"Good morning. You have 3 critical emails and a deadline at 5 PM. However, your sleep score was low (65). I\'ve moved your brainstorming session to tomorrow and kept today focused on execution tasks to conserve energy."'
};
