const TOXIC_WORDS = ["idiot","stupid","moron","dumb",  "hate", "scum", "trash","loser",];
const SPAM_PATTERNS = [/http/, /free money/i, /click here/i, /(.)\1{4,}/i,
  /\b(click here|make money fast|buy now|cheap meds)\b/i,
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
];

console.log("Content script loaded. Fast filter constraints initialized.");