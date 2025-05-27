import axios from 'axios';

const EVERYDAY_PROMPTS = [
  {
    title: "Professional Email Reply",
    body: "Write a professional email response to the following message. Keep it concise, friendly, and action-oriented:\n\n[Insert email content here]\n\nMake sure to:\n- Acknowledge their message\n- Address their main points\n- Provide clear next steps if needed\n- Use an appropriate professional tone",
    tags: "Email,Non-Technical,Professional,Communication",
    locked: 1
  },
  {
    title: "Social Media Post Creator",
    body: "Create an engaging social media post about [topic]. Include:\n\n- Hook that grabs attention in the first line\n- 2-3 key points or benefits\n- Call to action\n- Relevant hashtags (3-5)\n- Keep it under 280 characters for Twitter or 2-3 sentences for LinkedIn/Facebook\n\nTone: [Professional/Casual/Inspiring/Educational]",
    tags: "Social Media,Marketing,Creative,Non-Technical",
    locked: 1
  },
  {
    title: "Meeting Agenda Creator",
    body: "Create a structured meeting agenda for [meeting topic] with [number] participants.\n\nInclude:\n- Meeting objective/purpose\n- Time allocated for each item\n- Who is responsible for each topic\n- Expected outcomes\n- Action items section\n\nMeeting length: [duration]\nParticipants: [list attendees]",
    tags: "Meetings,Planning,Productivity,Non-Technical",
    locked: 1
  },
  {
    title: "Customer Support Response",
    body: "Write a helpful customer support response to address the following customer issue:\n\n[Customer complaint/question]\n\nResponse should:\n- Show empathy and understanding\n- Provide a clear solution or next steps\n- Offer additional help if needed\n- Maintain a positive, professional tone\n- Include any relevant policies if applicable",
    tags: "Customer Service,Non-Technical,Communication,Professional",
    locked: 1
  },
  {
    title: "Personal Goal Setting",
    body: "Help me create a structured plan for achieving this personal goal: [your goal]\n\nPlease include:\n- Break down the goal into 3-5 smaller milestones\n- Suggested timeline with deadlines\n- Potential obstacles and how to overcome them\n- Daily/weekly actions I can take\n- How to measure progress\n- Motivation strategies",
    tags: "Personal,Planning,Productivity,Non-Technical",
    locked: 1
  },
  {
    title: "Creative Writing Prompt",
    body: "Write a compelling [story/poem/article] about [topic/theme]. \n\nParameters:\n- Length: [word count or time to read]\n- Target audience: [specify audience]\n- Tone: [dramatic/humorous/inspirational/mysterious]\n- Include these elements: [specific requirements]\n\nFocus on:\n- Strong opening that hooks the reader\n- Vivid descriptions and engaging characters\n- Clear narrative structure\n- Satisfying conclusion",
    tags: "Creative,Writing,Non-Technical,Personal",
    locked: 1
  },
  {
    title: "Event Planning Checklist",
    body: "Create a comprehensive planning checklist for [type of event] with [number] attendees.\n\nEvent details:\n- Date: [date]\n- Location: [venue type]\n- Budget: [budget range]\n- Special requirements: [any specific needs]\n\nInclude:\n- Timeline (8 weeks before to day of event)\n- Vendor checklist\n- Budget breakdown\n- Day-of-event schedule\n- Emergency contact list",
    tags: "Planning,Non-Technical,Events,Productivity",
    locked: 1
  },
  {
    title: "Learning Study Plan",
    body: "Create a structured study plan for learning [subject/skill] in [timeframe].\n\nCurrent level: [beginner/intermediate/advanced]\nTime available: [hours per week]\nLearning style: [visual/auditory/hands-on]\nGoal: [what you want to achieve]\n\nInclude:\n- Weekly learning objectives\n- Recommended resources (books, courses, videos)\n- Practice exercises\n- Progress milestones\n- Review schedule",
    tags: "Education,Planning,Personal,Productivity",
    locked: 1
  },
  {
    title: "Thank You Note Writer",
    body: "Write a heartfelt thank you note for [occasion/reason].\n\nDetails:\n- Recipient: [name and relationship]\n- What you're thanking them for: [specific action/gift/help]\n- How it impacted you: [personal effect]\n- Tone: [formal/casual/personal]\n\nThe note should:\n- Be specific about what you're grateful for\n- Express genuine emotion\n- Be the appropriate length (2-4 sentences for casual, longer for formal)\n- End with a warm closing",
    tags: "Writing,Personal,Communication,Non-Technical",
    locked: 1
  },
  {
    title: "Daily Productivity Planner",
    body: "Create a personalized daily productivity plan based on my schedule and priorities.\n\nToday's information:\n- Top 3 priorities: [list them]\n- Available time blocks: [morning/afternoon/evening availability]\n- Energy levels: [when you're most/least energetic]\n- Meetings/commitments: [fixed appointments]\n- Personal preferences: [work style preferences]\n\nProvide:\n- Optimized schedule with time blocks\n- Break and meal times\n- Buffer time for unexpected tasks\n- End-of-day review questions",
    tags: "Productivity,Planning,Personal,Non-Technical",
    locked: 1
  }
];

async function addPrompts() {
  console.log('Adding 10 everyday user prompts...');
  
  for (let i = 0; i < EVERYDAY_PROMPTS.length; i++) {
    const prompt = EVERYDAY_PROMPTS[i];
    try {
      const response = await axios.post('http://localhost:5001/api/prompts', prompt);
      console.log(`✅ Added: "${prompt.title}" (ID: ${response.data.id})`);
    } catch (error) {
      console.error(`❌ Failed to add "${prompt.title}":`, error.message);
    }
  }
  
  console.log('\n🎉 Finished adding everyday user prompts!');
}

addPrompts().catch(console.error); 