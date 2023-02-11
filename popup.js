// popup.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('loaded DOM content')
    const submitButton = document.querySelector('button');
    submitButton.addEventListener('click', function() {
      console.log('[leak] Submit button clicked!')
      // send a message to the background script
      chrome.runtime.sendMessage({ type: 'submit-button-clicked' });
    });
});
