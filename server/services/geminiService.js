const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with fallback for missing API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key-here') {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
} else {
  console.warn('⚠️  GEMINI_API_KEY not configured. Chatbot will use fallback responses.');
}

// System prompt for strict validation and no hallucination
const SYSTEM_PROMPT = `You are a helpful AI assistant integrated with a Q&A forum platform. Follow these strict rules:

1. NO HALLUCINATION: Only provide information that is explicitly stated in the conversation or available in the provided data
2. NO ASSUMPTIONS: Do not make assumptions beyond what is clearly presented
3. VALIDATION: If you don't have enough information to answer accurately, ask for clarification
4. CONTEXT AWARENESS: You have access to forum data including questions, answers, and user information
5. HELPFUL GUIDANCE: Provide clear, actionable advice based on available information
6. SAFETY: Never provide harmful, illegal, or inappropriate content

When responding:
- Be concise but thorough
- Use markdown formatting for better readability
- If referencing forum content, mention the source
- Always maintain a helpful and professional tone`;

class GeminiService {
  constructor() {
    this.model = genAI ? genAI.getGenerativeModel({ model: 'gemini-pro' }) : null;
  }

  async generateResponse(userMessage, conversationHistory = [], forumContext = null) {
    try {
      // Check if Gemini is available
      if (!genAI || !this.model) {
        return this.getFallbackResponse(userMessage, conversationHistory);
      }

      // Build context-aware prompt
      let prompt = SYSTEM_PROMPT + '\n\n';
      
      // Add forum context if available
      if (forumContext) {
        prompt += `Forum Context:\n${forumContext}\n\n`;
      }
      
      // Add conversation history
      if (conversationHistory.length > 0) {
        prompt += 'Previous conversation:\n';
        conversationHistory.forEach(msg => {
          prompt += `${msg.role}: ${msg.content}\n`;
        });
        prompt += '\n';
      }
      
      prompt += `User: ${userMessage}\nAssistant:`;

      // Generate response
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        content: text,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.getFallbackResponse(userMessage, conversationHistory);
    }
  }

  getFallbackResponse(userMessage, conversationHistory = []) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple keyword-based responses when API is not available
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return {
        success: true,
        content: 'Hello! I\'m your AI assistant. I can help you with questions about the forum, users, and general inquiries. How can I assist you today?',
        timestamp: new Date()
      };
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return {
        success: true,
        content: 'I can help you with:\n\n• **Forum Questions**: Find and discuss questions\n• **User Information**: Learn about community members\n• **General Support**: Answer questions about the platform\n• **Guidance**: Provide helpful advice and tips\n\nWhat would you like to know?',
        timestamp: new Date()
      };
    }
    
    if (lowerMessage.includes('question') || lowerMessage.includes('ask')) {
      return {
        success: true,
        content: 'To ask a question on the forum:\n\n1. Go to the "Ask Question" page\n2. Write a clear, descriptive title\n3. Add detailed content with any relevant code or images\n4. Use appropriate tags to help others find your question\n5. Submit and wait for helpful answers!\n\nWould you like me to help you formulate a good question?',
        timestamp: new Date()
      };
    }
    
    if (lowerMessage.includes('user') || lowerMessage.includes('member')) {
      return {
        success: true,
        content: 'The forum has a diverse community of users including students, developers, and professionals. You can view user profiles to see their activity, questions, and answers. Each user has a reputation based on their contributions to the community.',
        timestamp: new Date()
      };
    }
    
    if (lowerMessage.includes('thank')) {
      return {
        success: true,
        content: 'You\'re welcome! I\'m here to help. Feel free to ask me anything about the forum or if you need assistance with anything else.',
        timestamp: new Date()
      };
    }
    
    // Default response
    return {
      success: true,
      content: 'I understand your message. While I\'m currently operating in a limited mode, I can still help you with basic forum-related questions. Could you please be more specific about what you\'d like to know?',
      timestamp: new Date()
    };
  }

  async validateResponse(response, originalQuery) {
    // Basic validation to ensure response is relevant and safe
    const lowerResponse = response.toLowerCase();
    const lowerQuery = originalQuery.toLowerCase();
    
    // Check if response contains common hallucination indicators
    const hallucinationIndicators = [
      'i don\'t have access to',
      'i cannot access',
      'i don\'t know about',
      'i\'m not sure about',
      'i cannot provide information about'
    ];
    
    const hasHallucinationIndicator = hallucinationIndicators.some(indicator => 
      lowerResponse.includes(indicator)
    );
    
    // Check if response is too generic
    const genericResponses = [
      'i\'m sorry, i don\'t understand',
      'i cannot help with that',
      'i don\'t have information about'
    ];
    
    const isTooGeneric = genericResponses.some(generic => 
      lowerResponse.includes(generic)
    );
    
    return {
      isValid: !hasHallucinationIndicator && !isTooGeneric,
      reason: hasHallucinationIndicator ? 'Potential hallucination detected' : 
              isTooGeneric ? 'Response too generic' : 'Valid response'
    };
  }
}

module.exports = new GeminiService(); 