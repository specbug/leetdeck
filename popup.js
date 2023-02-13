var _BFL = true;
async function fetchGraphQLData(query, variables={}) {
    console.log('[leetdeck] fetching lc details for query', query, 'with variables', variables)
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
    let res = await response.json();
    console.log('query', query, 'responded with', res.data);
    return res.data;
}

const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        const buttons = document.querySelectorAll('button');
        if (buttons.length) {
          observer.disconnect();
          buttons.forEach(function(button) {
            if (button.innerText == 'Submit' && _BFL) {
                _BFL = false;
                console.log('adding event to button', button.innerText);
                button.addEventListener('click', function() {
                    console.log("[leetdeck] flashcard creation triggered");
                    let front = '';
                    let back = '<br /><br /><code style="font-family: Jetbrains Mono, monospace; white-space: pre; background-color: #f6f8fa; padding: 10px; border-radius: 4px; overflow-x: auto;">';

                    // fetch slug
                    const url = window.location.href;
                    const slug = url.match(/\/problems\/(.*?)\//)[1];
                    console.log('[leetdeck] slug:', slug)
                    let v = {titleSlug: slug};
                    let desc_coro = fetchGraphQLData('\n    query questionContent($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    content\n  }\n}\n    ', v)
                    let lang = document.querySelector('.monaco-editor').parentElement.attributes['data-mode-id'].value;
                    let lid_coro = fetchGraphQLData('\n    query languageList {\n  languageList {\n    id\n    name\n  }\n}\n    ')
                    let qid_coro = fetchGraphQLData('\n    query questionTitle($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    questionId\n  }\n}\n    ', v)
                    Promise.all([lid_coro, qid_coro])
                        .then(([l_data, q_data]) => {
                            // language ID
                            let languageId = null;
                            let languages = l_data.languageList;
                            for (const l of languages) {
                                if (l.name === lang) {
                                    languageId = l.id;
                                    break
                                }
                            }
                            // question ID
                            let questionId = parseInt(q_data.question.questionId);
                            let code_coro = fetchGraphQLData('\n    query syncedCode($questionId: Int!, $lang: Int!) {\n  syncedCode(questionId: $questionId, lang: $lang) {\n    code\n  }\n}\n    ', {"lang": languageId, "questionId": questionId})
                            Promise.all([desc_coro, code_coro])
                                .then(([desc_data, code_data]) => {
                                    front += desc_data.question.content;
                                    back += code_data.syncedCode.code;
                                    back += '</code>'
                                    console.log('[leetdeck] front\n', front);
                                    console.log('[leetdeck] back\n', back);
                                    // send a message to the background script
                                    chrome.runtime.sendMessage({ type: 'submit-button-clicked' , payload: {"front": front, "back": back}});
                                })
                                .catch((error) => {
                                    console.error(error);
                                });
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                });
            }});
        }});
});

window.addEventListener('load', function () {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
