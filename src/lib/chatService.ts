export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const INITIAL_GREETING = "Hello! I'm your agrarian intelligence assistant. How can I help you today?";

const RESPONSES: Record<string, string> = {
  "default": "I'm analyzing your request using our proprietary field intelligence. Could you provide more details about your crops or current market needs?",
  "market": "The Farm-Ease marketplace is currently seeing high demand for organic fertilizers and seed protocols. You can view all verified listings in the Market tab.",
  "weather": "Hyper-local soil moisture predictions indicate a 20% increase in irrigation requirements for the next 48 hours for your region.",
  "payment": "All payments on Farm-Ease are secured by patented smart contract escrow. Funds are only released upon your confirmation of delivery.",
  "scan": "You can use our AI Bio-Scan tool to upload photos of your crops. Our neural nodes will detect pathogens or nutrient deficiencies with 99.2% accuracy."
};

export const chatService = {
  getInitialMessage: (): ChatMessage => ({
    role: 'assistant',
    content: INITIAL_GREETING,
    timestamp: Date.now()
  }),

  sendMessage: async (message: string): Promise<ChatMessage> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerMsg = message.toLowerCase();
    let responseText = RESPONSES["default"];

    if (lowerMsg.includes("market") || lowerMsg.includes("buy") || lowerMsg.includes("sell")) {
      responseText = RESPONSES["market"];
    } else if (lowerMsg.includes("weather") || lowerMsg.includes("rain") || lowerMsg.includes("soil")) {
      responseText = RESPONSES["weather"];
    } else if (lowerMsg.includes("payment") || lowerMsg.includes("safe") || lowerMsg.includes("secure")) {
      responseText = RESPONSES["payment"];
    } else if (lowerMsg.includes("scan") || lowerMsg.includes("disease") || lowerMsg.includes("sick")) {
      responseText = RESPONSES["scan"];
    }

    return {
      role: 'assistant',
      content: responseText,
      timestamp: Date.now()
    };
  }
};
