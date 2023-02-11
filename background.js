async function invoke(action, version, params={}) {
  console.log('[leak] adding to anki', params);
  try {
    const response = await fetch('http://localhost:8765', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({action, version, params})
    });
    const json = await response.json();
    if (Object.getOwnPropertyNames(json).length != 2) {
      throw 'response has an unexpected number of fields';
    }
    if (!json.hasOwnProperty('error')) {
      throw 'response is missing required error field';
    }
    if (!json.hasOwnProperty('result')) {
      throw 'response is missing required result field';
    }
    if (json.error) {
      throw json.error;
    }
    return json.result;
  } catch (e) {
    console.error('[leak] failed to add to anki', e);
  }
};


async function addToAnki(data) {
    // Code to create flashcard in Anki
    console.log("[leak] flashcard creation triggered");
    console.log('Received front\n', data.front);
    console.log('Received back\n', data.back);
    await invoke('addNote', 6, {
      "note": {
        "deckName": "One Deck To Rule Them All",
        "modelName": "Basic",
        "fields": {
          "Front": data.front,
          "Back": data.back
        },
        "tags": []
      }
    });
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
   if (request.type === 'submit-button-clicked') {
       console.log('[leak] submit button event detected.')
       addToAnki(request.payload).then((result) => {
           console.log(result);
       }).catch((error) => {
           console.error(error);
       });
   }
   else {
       console.log('[leak] non-supported event received.', request.type)
   }
   return true;
});

