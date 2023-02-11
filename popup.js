const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    const buttons = document.querySelectorAll('button');
    if (buttons.length) {
      observer.disconnect();
      buttons.forEach(function(button) {
        if (button.innerText == 'Submit') {
            console.log('adding event to button', button.innerText);
            button.addEventListener('click', function() {
              console.log('[leak] Submit button clicked!');
              var front = '';
              var back = '<code>';
              // Code to create flashcard in Anki
              console.log("[leak] flashcard creation triggered");
              const paragraphs = document.querySelector('._1l1MA').childNodes;
              for (const p of paragraphs) {
                  front += p.textContent + "\n";
              };
              console.log('[leak] front\n', front);
              back += document.querySelector('.monaco-scrollable-element').innerText;
              back += '</code>';
              console.log('[leak] back\n', back);
              // send a message to the background script
              chrome.runtime.sendMessage({ type: 'submit-button-clicked' , payload: {"front": front, "back": back}});
        });
        }
      });
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
