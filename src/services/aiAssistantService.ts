export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; link: string }[];
}

/**
 * AI Assistant Service - Modular architecture prepared for Gemini API integration
 */
export const aiAssistantService = {
  /**
   * Process user query and return assistant response.
   * NOTE: Currently utilizes local knowledge base matching.
   * In production, this method can be modified to call the Gemini API (`@google/genai`).
   */
  async generateResponse(query: string): Promise<{ text: string; actions?: { label: string; link: string }[] }> {
    // Artificial latency for realistic conversational feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    const q = query.toLowerCase().trim();

    // 1. "How do I report a lost item?"
    if (q.includes('report a lost') || q.includes('report lost') || q.includes('lost an item') || q.includes('lost my')) {
      return {
        text: `To report a lost item on campus:

1. Click on **"Report Lost Item"** in the navigation header or dashboard.
2. Fill in the item title, category, description, and precise campus location (e.g., Student Union, Library Floor 2).
3. Upload a photo or select an example image — our **AI Image Matching** engine will automatically compare your photo with reported found items!
4. Add a security verification question to verify true ownership before item pickup.`,
        actions: [
          { label: 'File Lost Item Report', link: '/report-lost' },
          { label: 'Browse Search Database', link: '/search' }
        ]
      };
    }

    // 2. "How do I contact the owner?" / "Contact finder"
    if (q.includes('contact the owner') || q.includes('contact owner') || q.includes('contact finder') || q.includes('reach out') || q.includes('chat')) {
      return {
        text: `You can directly contact an item owner or finder using our **Real-Time Campus Messenger**:

1. Search for or view the item details page.
2. Click the blue **"Contact Owner"** or **"Contact Finder"** button.
3. This opens a secure real-time Firestore chat session with online status, image attachment sharing, and instant messaging.
4. You can access all your ongoing chats anytime under **"Messages"** in the navigation menu.`,
        actions: [
          { label: 'Go to Messages', link: '/chat' },
          { label: 'Search All Items', link: '/search' }
        ]
      };
    }

    // 3. "What should I do if I found an ID card?"
    if (q.includes('id card') || q.includes('student id') || q.includes('campus card') || q.includes('found an id')) {
      return {
        text: `If you found a Student ID Card or Faculty Badge:

1. **Submit a Found Report**: Click **"Report Found Item"** and select **"ID Cards & Badges"** as the category.
2. **Turn It In**: Bring the physical ID card to the **Campus Security Desk** located at the Student Services Building (Room 101).
3. **Automated Notification**: Once logged, our system notifies the matching student account directly via their campus email.`,
        actions: [
          { label: 'Report Found ID Card', link: '/report-found' },
          { label: 'View Security Hours', link: '/dashboard' }
        ]
      };
    }

    // 4. "Where can I find my reports?"
    if (q.includes('my reports') || q.includes('where can i find') || q.includes('my items') || q.includes('view my report')) {
      return {
        text: `You can view, edit, or update the status of all your submitted reports in one place:

- Navigate to **"My Reports"** in the top navigation bar or user dropdown menu.
- From there, you can mark items as **"Claimed & Reunited"**, update descriptions, or remove fulfilled listings.`,
        actions: [
          { label: 'Open My Reports', link: '/my-reports' },
          { label: 'View Profile', link: '/profile' }
        ]
      };
    }

    // 5. "How does AI matching work?"
    if (q.includes('ai') || q.includes('matching') || q.includes('vision') || q.includes('image match')) {
      return {
        text: `Our **AI Visual Matcher** analyzes uploaded item images, category tags, and location vectors to find matches:

- Whenever you report a lost or found item, the system automatically compares image similarity score and text descriptors.
- Check out the **"AI Matcher"** tab in the top navigation bar to see high-confidence potential matches across all active campus listings!`,
        actions: [
          { label: 'Open AI Matcher Results', link: '/match-results' }
        ]
      };
    }

    // Default Fallback Response
    return {
      text: `I'm your **Campus Lost & Found AI Assistant**! Here are the main things I can help you with:

- 📝 **Reporting**: Step-by-step guidance on reporting lost or found valuables.
- 💬 **Messaging**: Connecting with item owners or finders via real-time chat.
- 🪪 **Special Items**: Handing in sensitive items like Student IDs, keys, or electronics.
- 🔍 **Tracking**: Checking the status of your reported items.

What specific question can I assist you with today?`,
      actions: [
        { label: 'Report Lost Item', link: '/report-lost' },
        { label: 'Report Found Item', link: '/report-found' },
        { label: 'Browse Search Catalog', link: '/search' }
      ]
    };
  }
};
