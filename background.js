console.log("Background script initialized.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyze_text") {
    console.log("Received text for ML analysis:", request.text);
    
    setTimeout(() => {
      let score = 0.1;
      const lowerText = request.text.toLowerCase();
      
      if (lowerText.includes("horrible") || lowerText.includes("disgusting") || lowerText.includes("terrible")) {
          score = 0.7;
      } else if (lowerText.includes("bad") || lowerText.includes("awful") || lowerText.includes("poor")) {
          score = 0.4;
      }
      
      console.log(`Sending score ${score} for text: "${request.text.substring(0, 20)}..."`);
      sendResponse({ score: score });
    }, 500);
    
    return true;
  }
});