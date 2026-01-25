export const ProductivityAgent = {
  id: 'productivity',
  name: 'The Productivity Agent',
  subtitle: 'The Executive Assistant',
  status: 'Active',
  description: 'Your intelligent executive assistant that manages emails, tasks, and schedules to maximize your productivity.',
  capabilities: [
    {
      title: 'Intelligent Inbox',
      desc: 'Connects to Gmail to summarize threads, draft replies, and surface urgent items only.',
    },
    {
      title: 'Contextual Task Manager',
      desc: 'Dynamically prioritizes to-do lists based on available time slots and current energy levels.',
    }
  ],
  integrations: ['Gmail', 'Google Calendar', 'Slack', 'Notion'],
  color: undefined,
  example: undefined
};
