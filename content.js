// content.js
// Capture Comments and Extract text from the page

function getComments() {
  // For simplicity, we'll extract text from all paragraph elements
  // as potential "comments", but in a real scenario we'd target specific selectors.
  const paragraphs = document.querySelectorAll('p, span, div.comment');
  const comments = [];
  
  paragraphs.forEach((p, index) => {
    const text = p.innerText.trim();
    if (text.length > 10) { // filter out very short text
      comments.push({ id: index, text: text });
      // Attach an ID to the element so we can highlight it later
      p.setAttribute('data-toxicity-id', index);
    }
  });
  
  return comments;
}

function highlightComment(id, isToxic) {
  const el = document.querySelector(`[data-toxicity-id="${id}"]`);
  if (el) {
    if (isToxic) {
      el.style.backgroundColor = 'black';
      el.style.color = 'white';
      el.style.padding = '5px';
      el.style.border = 'none';
      el.innerText = 'Content Hidden by project-K';
      el.title = 'Warning: This comment has been flagged as toxic.';
    } else {
      el.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
    }
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract_comments') {
    const comments = getComments();
    sendResponse({ comments: comments });
  } else if (request.action === 'highlight') {
    highlightComment(request.id, request.isToxic);
    sendResponse({ success: true });
  }
});
