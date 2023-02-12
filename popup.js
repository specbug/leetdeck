async function fetchGraphQLData(query, variables) {
  const response = await fetch('https://leetcode.com/graphql/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  return await response.json();
}



const observer = new MutationObserver(function(mutations) {
  const para = 'P';
  const codeblock = 'PRE';
  const styling = {
      "code": "font-family: Jetbrains Mono, monospace; white-space: pre; background-color: #f6f8fa; padding: 10px; border-radius: 4px; overflow-x: auto;",
      "text": "white-space: pre-wrap;"
  };
  mutations.forEach(function(mutation) {
    const buttons = document.querySelectorAll('button');
    if (buttons.length) {
      observer.disconnect();
      buttons.forEach(function(button) {
        if (button.innerText == 'Submit') {
            console.log('adding event to button', button.innerText);
            button.addEventListener('click', function() {
              console.log('[leak] Submit button clicked!');
              var front = '<div>';
              var back = '<code style="font-family: Jetbrains Mono, monospace; white-space: pre; background-color: #f6f8fa; padding: 10px; border-radius: 4px; overflow-x: auto;">';
              // Code to create flashcard in Anki
              console.log("[leak] flashcard creation triggered");
              const paragraphs = document.querySelector('._1l1MA').childNodes;
              for (const p of paragraphs) {
                  if (p.tagName === para) {
                    front += '<p style="white-space: pre-wrap;">'
                  }
                  else if (p.tagName === codeblock) {
                    front += '<pre style="font-family: Jetbrains Mono, monospace; white-space: pre; background-color: #f6f8fa; padding: 10px; border-radius: 4px; overflow-x: auto;">'
                  }
                  front += p.textContent;
                  if (p.tagName === para) {
                    front += '</p>'
                  }
                  else if (p.tagName === codeblock) {
                    front += '</pre>'
                  }
              }
              front += '</div>'
              console.log('[leak] front\n', front);
              // Use the Monaco editor's API to retrieve the complete text content
              var editor = monaco.editor.getModels()[0];
              back += editor.getValue();
              back += '</code>';
              console.log('[leak] back\n', back);
              // format
              // front = front.replace(/\n(\s*)/g, '<br />');
              // back = back.replace(/\n(\s*)/g, '<br />');
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
