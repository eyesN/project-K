// Simulated Background ML model
console.log("Background script initialized.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyze_text") {
    console.log("Received text for ML analysis:", request.text);
    
    // Simulate ML model delay and scoring
    setTimeout(() => {
      // Mock score: 0 = clean, 1 = extremely toxic
      // Simple heuristic for the mock
      let score = 0.1;
      const lowerText = request.text.toLowerCase();
      
      if (lowerText.includes("bad") || lowerText.includes("awful") || lowerText.includes("terrible")) {
          score = 0.7; // Send back a high score for testing unclear cases
      }
      
      console.log(`Sending score ${score} for text: "${request.text.substring(0, 20)}..."`);
      sendResponse({ score: score });
    }, 500);
    
    // Return true to indicate asynchronous response
    return true;
  }
});