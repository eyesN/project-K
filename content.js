const TOXIC_WORDS = ["idiot","stupid","moron","dumb",  "hate", "scum", "trash","loser",];
const SPAM_PATTERNS = [/http/, /free money/i, /click here/i, /(.)\1{4,}/i,
  /\b(click here|make money fast|buy now|cheap meds)\b/i,
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
];

console.log("Content script loaded. Fast filter constraints initialized.");

// Basic selectors for popular social media (e.g., X/Twitter, YouTube, general articles)
// These would need to be fine-tuned for actual production use on specific platforms.
const COMMENT_SELECTORS = [
  '[data-testid="tweetText"]', // X/Twitter
  '#content-text',             // YouTube
  '.comment-text',             // Generic
  '.dtText',                   // Merriam-Webster definitions
  '.vg',                       // Merriam-Webster verb guide
  'h1', 'h2',                  // Headers (e.g., page titles)
  'p'                          // Fallback for paragraphs
];

function extractComments() {
  const elements = [];
  for (const selector of COMMENT_SELECTORS) {
    const nodes = document.querySelectorAll(selector);
    nodes.forEach(node => {
      // Only process nodes that haven't been processed yet
      if (!node.dataset.projectKProcessed) {
        elements.push(node);
      }
    });
  }
  return elements;
}

function applyFastFilter(text) {
  const lowerText = text.toLowerCase();
  
  // 1. Check for obvious spam
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      return { action: 'hide', reason: 'spam' };
    }
  }

  // 2. Check for obvious toxic words
  let toxicCount = 0;
  for (const word of TOXIC_WORDS) {
    // Add word boundaries and allow optional asterisks between letters 
    // and an optional 's' at the end to catch obfuscated words.
    const patternChars = word.split('').join('\\**');
    const regex = new RegExp(`\\b${patternChars}\\**s?\\b`, 'i');
    if (regex.test(lowerText)) {
      toxicCount++;
    }
  }

  // Changed to 1 for easier testing on sites like dictionary pages
  if (toxicCount >= 1) {
    return { action: 'hide', reason: 'highly_toxic' };
  }

  // Clean
  return { action: 'allow' };
}

function processComments() {
  const comments = extractComments();
  
  comments.forEach(commentNode => {
    // Mark as processed
    commentNode.dataset.projectKProcessed = "true";
    
    const text = commentNode.innerText || commentNode.textContent;
    if (!text || text.trim() === "") return;

    const filterResult = applyFastFilter(text);

    if (filterResult.action === 'hide') {
      console.log(`[Project-K] Hiding comment (Reason: ${filterResult.reason}):`, text.substring(0, 30) + '...');
      hideComment(commentNode);
    } else if (filterResult.action === 'analyze') {
      console.log(`[Project-K] Sending to ML (Unclear case):`, text.substring(0, 30) + '...');
      // Add a slight visual indicator while analyzing
      commentNode.style.opacity = '0.5';
      
      chrome.runtime.sendMessage({ action: "analyze_text", text: text }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("[Project-K] Error communicating with background script:", chrome.runtime.lastError);
          commentNode.style.opacity = '1';
          return;
        }

        if (response && response.score) {
          console.log(`[Project-K] ML Score for "${text.substring(0, 15)}...": ${response.score}`);
          if (response.score > 0.5) { // Threshold for hate speech
             hideComment(commentNode, "ML Model flagged this content.");
          } else {
             // Reset visual indicator if clean
             commentNode.style.opacity = '1';
          }
        }
      });
    }
  });
}

function hideComment(node, reason = "Content hidden by Project-K filter") {
  // Rather than removing, we typically hide it and show a placeholder
  const originalDisplay = node.style.display;
  node.style.display = 'none';
  
  const placeholder = document.createElement('div');
  placeholder.style.padding = '12px 8px';
  placeholder.style.margin = '4px 0';
  placeholder.style.backgroundColor = '#111111'; // Dark black stripe
  placeholder.style.color = '#ffffff'; // White text
  placeholder.style.borderRadius = '4px';
  placeholder.style.fontSize = '12px';
  placeholder.style.fontWeight = 'bold';
  placeholder.style.textAlign = 'center';
  placeholder.style.cursor = 'pointer';
  placeholder.style.letterSpacing = '1px';
  placeholder.innerText = `[ ${reason} - Click to show ]`;
  
  placeholder.addEventListener('click', () => {
    node.style.display = originalDisplay;
    placeholder.style.display = 'none';
  });

  if (node.parentNode) {
    node.parentNode.insertBefore(placeholder, node);
  }
}

// Initial run
setTimeout(processComments, 2000);

// Run periodically to catch dynamically loaded comments (e.g., infinite scroll)
setInterval(processComments, 3000);