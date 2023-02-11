function invoke(action, version, params={}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('error', () => reject('failed to issue request'));
        xhr.addEventListener('load', () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (Object.getOwnPropertyNames(response).length != 2) {
                    throw 'response has an unexpected number of fields';
                }
                if (!response.hasOwnProperty('error')) {
                    throw 'response is missing required error field';
                }
                if (!response.hasOwnProperty('result')) {
                    throw 'response is missing required result field';
                }
                if (response.error) {
                    throw response.error;
                }
                resolve(response.result);
            } catch (e) {
                reject(e);
            }
        });

        xhr.open('POST', 'http://localhost:8765');
        xhr.send(JSON.stringify({action, version, params}));
    });
};

function addToAnki() {
  const leetcodeProblemPageRegex = /^https:\/\/leetcode\.com\/problems\/.+/;
  if (leetcodeProblemPageRegex.test(window.location.href)) {
      console.log("Detected LC problem page. `addToAnki` registered.");
      const originalFetch = window.fetch;
      window.fetch = function(url, init) {
          console.log("API hit", url);
          if (url.endsWith('/submit/')) {
            // Show confirmation popup
            // Code to create flashcard in Anki
            console.log("Flashcard creation triggered");
            var front = '';
            var back = '';
            const paragraphs = document.querySelector('._1l1MA').childNodes;
            for (const p of paragraphs) {
                front += p.textContent + "\n";
            };
            console.log('Copied front\n', front);
            if (init && init.body) {
              let payload = JSON.parse(init.body);
              console.log("Request Payload:", payload);
              back += payload.typed_code;
              console.log("Back:\n", back);
            };
            invoke('addNote', 6, {
              "note": {
                "deckName": "One Deck To Rule Them All",
                "modelName": "Basic",
                "fields": {
                  "Front": front,
                  "Back": back
                },
                "tags": []
              }
            });
          }
        return originalFetch.apply(this, arguments);
      };
  };
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
   if (request.type === 'submit-button-clicked') {
       console.log('[leak] submit button event detected.')
       addToAnki();
   }
   else {
       console.log('[leak] non-supported event received.', request.type)
   }
});
