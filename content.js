const TOXIC_WORDS = ["idiot", "stupid", "moron", "dumb", "hate", "scum", "trash", "loser"];
const SPAM_PATTERNS = [
  /(.)\1{4,}/i,
  /\b(click here|make money fast|buy now|cheap meds|get rich quick|work from home|earn \$\d+|subscribe now|crypto giveaway|free gift card|lose weight fast|100% free|no credit card required)\b/i,
  /https?:\/\/(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|adf\.ly|cutt\.ly|rebrand\.ly)\/[a-zA-Z0-9_-]+/i,
  /https?:\/\/(?:www\.)?[a-zA-Z0-9-]*?(?:free-?robux|casino|viagra|cheap-?meds|giveaway|hack)[a-zA-Z0-9-]*\.[a-z]{2,}/i,
  /https?:\/\/[a-zA-Z0-9.-]+\.(xyz|top|pw|biz|info|loan|win)\b/i
];

console.log("Content script loaded. Fast filter constraints initialized.");

const COMMENT_SELECTORS = [
  '[data-testid="tweetText"]',
  '#content-text',
  '.comment-text',
  '.dtText',
  '.vg',
  'h1', 'h2',
  'p'
];

function extractComments() {
  const elements = [];
  for (const selector of COMMENT_SELECTORS) {
    const nodes = document.querySelectorAll(selector);
    nodes.forEach(node => {
      if (!node.dataset.projectKProcessed) {
        elements.push(node);
      }
    });
  }
  return elements;
}

function applyFastFilter(text) {
  const lowerText = text.toLowerCase();
  
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      return { action: 'hide', reason: 'spam' };
    }
  }

  let toxicCount = 0;
  for (const word of TOXIC_WORDS) {
    const patternChars = word.split('').join('\\**');
    const regex = new RegExp(`\\b${patternChars}\\**s?\\b`, 'i');
    if (regex.test(lowerText)) {
      toxicCount++;
    }
  }

  if (toxicCount >= 2) {
    return { action: 'hide', reason: 'highly_toxic' };
  } else if (toxicCount === 1) {
    return { action: 'analyze' };
  }

  if (lowerText.includes("bad") || lowerText.includes("awful") || lowerText.includes("terrible") || lowerText.includes("horrible") || lowerText.includes("disgusting") || lowerText.includes("poor")) {
      return { action: 'analyze' };
  }

  return { action: 'allow' };
}

function processComments() {
  const comments = extractComments();
  
  comments.forEach(commentNode => {
    commentNode.dataset.projectKProcessed = "true";
    
    const text = commentNode.innerText || commentNode.textContent;
    if (!text || text.trim() === "") return;

    const filterResult = applyFastFilter(text);

    if (filterResult.action === 'hide') {
      console.log(`[Project-K] Hiding comment (Reason: ${filterResult.reason}):`, text.substring(0, 30) + '...');
      hideComment(commentNode);
    } else if (filterResult.action === 'analyze') {
      console.log(`[Project-K] Sending to ML (Unclear case):`, text.substring(0, 30) + '...');
      commentNode.style.opacity = '0.5';
      
      chrome.runtime.sendMessage({ action: "analyze_text", text: text }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("[Project-K] Error communicating with background script:", chrome.runtime.lastError);
          commentNode.style.opacity = '1';
          return;
        }

        if (response && response.score) {
          console.log(`[Project-K] ML Score for "${text.substring(0, 15)}...": ${response.score}`);
          if (response.score > 0.5) {
             hideComment(commentNode, "ML Model flagged this content.");
          } else {
             commentNode.style.opacity = '1';
          }
        }
      });
    }
  });
}

function hideComment(node, reason = "Content hidden by Project-K filter") {
  const originalDisplay = node.style.display;
  node.style.display = 'none';
  
  const placeholder = document.createElement('div');
  placeholder.style.padding = '12px 8px';
  placeholder.style.margin = '4px 0';
  placeholder.style.backgroundColor = '#111111';
  placeholder.style.color = '#ffffff';
  placeholder.style.borderRadius = '4px';
  placeholder.style.fontSize = '12px';
  placeholder.style.fontWeight = 'bold';
  placeholder.style.textAlign = 'center';
  placeholder.style.cursor = 'pointer';
  placeholder.style.letterSpacing = '1px';
  placeholder.innerText = "Content Hidden Tap to display";
  
  placeholder.addEventListener('click', () => {
    node.style.display = originalDisplay;
    placeholder.style.display = 'none';
  });

  if (node.parentNode) {
    node.parentNode.insertBefore(placeholder, node);
  }
}

setTimeout(processComments, 2000);
setInterval(processComments, 3000);