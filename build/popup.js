// popup.js

let model;
const threshold = 0.9;
const statusEl = document.getElementById('status');
const scanBtn = document.getElementById('scan-btn');

// Initialize the models
async function init() {
  try {
    statusEl.innerText = 'Loading Toxicity Model...';
    // Load toxicity model
    model = await toxicity.load(threshold);
    
    statusEl.innerText = 'Models loaded. Ready.';
    scanBtn.disabled = false;
  } catch (err) {
    statusEl.innerText = 'Error loading models: ' + err.message;
    console.error(err);
  }
}

// Compute TF-IDF (simulated document processing)
function computeTfIdf(comments) {
  // We use natural.js TfIdf to process text
  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();
  
  // Add all comments as documents
  comments.forEach(c => tfidf.addDocument(c.text));
  
  // Example of using TF-IDF logic:
  // For each document, we could identify the most significant words, 
  // but for our core logic we will mainly rely on toxicity model. 
  // Let's just output the TF-IDF measure for a common toxic word as a demonstration.
  console.log('TF-IDF initialized for ' + comments.length + ' documents.');
}

async function scanPage() {
  statusEl.innerText = 'Extracting comments...';
  
  // Get active tab
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    
    // Request comments from content script
    chrome.tabs.sendMessage(activeTab.id, { action: 'extract_comments' }, async (response) => {
      if (!response || !response.comments) {
        statusEl.innerText = 'No comments found or content script not injected.';
        return;
      }
      
      const comments = response.comments;
      statusEl.innerText = `Analyzing ${comments.length} comments...`;
      
      // Run TF-IDF step
      computeTfIdf(comments);
      
      // Run Toxicity Prediction
      for (const comment of comments) {
        const predictions = await model.classify([comment.text]);
        
        // predictions is an array of objects for different labels
        // We consider it toxic if any label has a match of true
        let isToxic = false;
        predictions.forEach(p => {
          if (p.results[0].match === true) {
            isToxic = true;
          }
        });
        
        // Take Action: send message to highlight
        chrome.tabs.sendMessage(activeTab.id, {
          action: 'highlight',
          id: comment.id,
          isToxic: isToxic
        });
      }
      
      statusEl.innerText = 'Scan complete.';
    });
  });
}

scanBtn.addEventListener('click', scanPage);

// Start initialization
init();
