// Layer 1: Fast Filter Constants

// A preliminary list of English toxic words for fast filtering.
// This list can be expanded based on specific requirements.
const toxicWords = [
  "idiot",
  "stupid",
  "moron",
  "dumb",
  "hate",
  "hate you",
  "scum",
  "trash",
  "loser",
];

// Regular expressions to detect common spam patterns.
const spamPatterns = [
  // Repeated characters (e.g., "wooooooooow")
  /(.)\1{4,}/i,
  
  // Obvious scam/spam phrases
  /\b(click here|make money fast|free money|buy now|cheap meds)\b/i,
  
  // Basic URL matching
  /http/,
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
];

function fastFilter(text) {
  const lower = text.toLowerCase();

  // keyword check
  if (toxicWords.some(word => lower.includes(word))) {
    return { action: "block", reason: "keyword" };
  }

  // spam regex
  if (spamPatterns.some(pattern => pattern.test(text))) {
    return { action: "block", reason: "spam" };
  }

  return { action: "uncertain" };
}

console.log("Content script loaded. Fast filter initialized.");
