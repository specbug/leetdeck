var invoke = function(action, version, params={}) {
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

        xhr.open('POST', 'http://127.0.0.1:8765');
        xhr.send(JSON.stringify({action, version, params}));
    });
};

var addToAnki = function() {
  const leetcodeProblemPageRegex = /^https:\/\/leetcode\.com\/problems\/.+/;
  if (leetcodeProblemPageRegex.test(window.location.href)) {
      console.log("Detected LC problem page. `addToAnki` registered.");
      document.querySelector('button').addEventListener('click', function() {
        console.log("Submit button clicked");
      
      const originalFetch = window.fetch;
      window.fetch = function(url, init) {
          console.log("API hit", url);
          if (url.endsWith('/submit/')) {
            // Show confirmation popup
            if (confirm("Do you want to create a flashcard in Anki?")) {
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
              invoke('createDeck', 6, {
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
          }
        return originalFetch.apply(this, arguments);
      };
    });
  };
};