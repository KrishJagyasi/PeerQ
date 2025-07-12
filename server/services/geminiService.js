const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateResponse(userMessage, conversationHistory = [], forumContext = null) {
    try {
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
      return {
        success: false,
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
    }
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