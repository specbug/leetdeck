// popup.js

const submitButton = document.getElementById("submit");

submitButton.addEventListener("click", function() {
  // Send message to background script to add flashcard to Anki
  chrome.runtime.sendMessage({ type: "addToAnki" });
});

const cancelButton = document.getElementById("cancel");

cancelButton.addEventListener("click", function() {
  // Close the popup
  window.close();
});
