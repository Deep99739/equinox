export const WellnessAgent = {
  id: 'wellness',
  name: 'The Wellness Agent',
  subtitle: 'The Coach',
  status: 'Active',
  description: 'Your personal health coach that optimizes your fitness and recovery based on real-time data.',
  capabilities: [
    {
      title: 'Recovery Tracking',
      desc: 'Ingests sleep and activity metrics to calculate a daily "readiness score."',
    },
    {
      title: 'Adaptive Fitness Plans',
      desc: 'Adjusts workout intensity based on your schedule and energy levels reported by other agents.',
    }
  ],
  integrations: ['Apple Health', 'Fitbit', 'Whoop', 'Strava'],
  color: undefined,
  example: undefined
};
