const SYSTRAN_API_KEY = "cfef3ec9-bc9c-4c5b-80c8-3db0ed22ecdb"; 
let targetLang = "fr"; 
let conversationLang = "Hi"; 

async function systranTranslate(input, source = "auto", target) {
  try {
    const response = await fetch(
      `https://api-translate.systran.net/translation/text/translate?key=${SYSTRAN_API_KEY}&input=${encodeURIComponent(
        input
      )}&source=${source}&target=${target}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(
        `HTTP error! status: ${response.status} - ${errorData.message}`
      );
    }

    const data = await response.json();
    if (data.outputs && data.outputs.length > 0) {
      return data.outputs[0].output;
    } else {
      console.error("Translation error:", data);
      return input;
    }
  } catch (err) {
    console.error("Translation API error:", err);
    return input;
  }
}

function injectTranslateButton() {
  const checkExist = setInterval(() => {
    const chatInputContainer = document.querySelector("footer");
    const inputBox = chatInputContainer
      ? chatInputContainer.querySelector("div[contenteditable='true']")
      : null;

    if (chatInputContainer && inputBox) {
      if (chatInputContainer.querySelector("#translate-btn")) return;

      chatInputContainer.style.position = "relative";

      const translateBtn = document.createElement("button");
      translateBtn.id = "translate-btn";
      translateBtn.innerText = "T";
      translateBtn.style.cssText = `
                background-color: #25D366;
                color: white;
                padding: 8px 12px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                position: absolute;
                top: 15px;
                right: 68px;
                z-index: 1000;
            `;

      chatInputContainer.appendChild(translateBtn);

      translateBtn.addEventListener("click", async () => {
        const messageText = inputBox.innerText.trim();
        if (!messageText) return;

        try {
          const translatedText = await systranTranslate(
            messageText,
            "auto",
            targetLang
          );
          console.log(`Translated text: ${messageText} => ${translatedText}`);

          inputBox.innerHTML = "";

          const translatedSpan = document.createElement("span");
          translatedSpan.className = "selectable-text copyable-text";
          translatedSpan.setAttribute("data-lexical-text", "true");
          translatedSpan.innerText = translatedText;

          const pElement = document.createElement("p");
          pElement.appendChild(translatedSpan);
          inputBox.appendChild(pElement);

          inputBox.focus();

          inputBox.dispatchEvent(new Event("input", { bubbles: true }));

          await navigator.clipboard.writeText(translatedText);
          console.log("Translated text copied to clipboard:", translatedText);
        } catch (error) {
          console.error("Translation or insertion error:", error);
          alert("Translation or text insertion failed. Please try again.");
        }
      });

      clearInterval(checkExist);
    }
  }, 1000);
}

function translateAllMessages() {
  const messages = document.querySelectorAll(
    "div.message-in:not(.translated-message)"
  );

  messages.forEach((message) => {
    processMessage(message, targetLang);
  });
}

function translateOutgoingMessages() {
  const messages = document.querySelectorAll(
    "div.message-out:not(.translated-message)"
  );

  messages.forEach((message) => {
    processMessage(message, conversationLang);
  });
}

async function processMessage(messageElement, targetLanguage) {
  const textElement = messageElement.querySelector("span.selectable-text");
  if (textElement && textElement.innerText) {
    const originalText = textElement.innerText;

    console.log("Translating:", originalText, "to language:", targetLanguage);

    const translatedText = await systranTranslate(
      originalText,
      "auto",
      targetLanguage
    );
    insertTranslatedMessage(messageElement, translatedText);
    console.log(`Translated: "${originalText}" to "${translatedText}"`);
  }
}

function insertTranslatedMessage(originalMessageElement, translatedText) {
  const existingClone = originalMessageElement.nextElementSibling;

  if (existingClone && existingClone.classList.contains("translated-message")) {
    const textElement = existingClone.querySelector("span.selectable-text");
    if (textElement) {
      textElement.innerText = `${translatedText}`;
    }
    return;
  }

  const translatedMessageElement = originalMessageElement.cloneNode(true);

  const textElement = translatedMessageElement.querySelector(
    "span.selectable-text"
  );
  if (textElement) {
    textElement.innerText = `${translatedText}`;
  }

  translatedMessageElement.classList.add("translated-message");
  translatedMessageElement.classList.add("translated-from");
  translatedMessageElement.style.fontWeight = "600";
  translatedMessageElement.style.color = "#34B7F1";
  translatedMessageElement.style.marginTop = "0";
  translatedMessageElement.style.marginBottom = "16px";
  translatedMessageElement.style.paddingTop = "0";

  originalMessageElement.parentNode.insertBefore(
    translatedMessageElement,
    originalMessageElement.nextSibling
  );
}

function observeMessages() {
  const messageContainer = document.querySelector(
    ".x3psx0u.xwib8y2.xkhd6sd.xrmvbpv"
  );

  if (messageContainer) {
    console.log("Message container found:", messageContainer);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.getAttribute && node.getAttribute("role") === "row") {
              console.log("New message detected, processing...");
              translateAllMessages();
              translateOutgoingMessages();
            }
          });
        }
      });
    });

    observer.observe(messageContainer, { childList: true, subtree: true });
    console.log("Observer initialized.");
  } else {
    console.error("Message container not found.");
  }
}

let previousUsername = "";

function pollForChatSwitch() {
  setInterval(() => {
    const headerElement = document.querySelector("._amid._aqbz");

    if (headerElement) {
      const usernameSpan = headerElement.querySelector(
        "span.x1iyjqo2.x6ikm8r.x10wlt62.x1n2onr6.xlyipyv.xuxw1ft.x1rg5ohu._ao3e"
      );

      if (usernameSpan) {
        const currentUsername = usernameSpan.innerText.trim();

        if (currentUsername !== previousUsername) {
          console.log("Chat switched! New chat with:", currentUsername);
          translateAllMessages();
          translateOutgoingMessages();
          injectTranslateButton();
          previousUsername = currentUsername;
        }
      }
    }
  }, 1000);
}

pollForChatSwitch();

chrome.storage.sync.get(["myLanguage", "conversationLanguage"], (result) => {
  targetLang = result.myLanguage || "fr";
  conversationLang = result.conversationLanguage || "hi";
  translateAllMessages();
  translateOutgoingMessages();
  injectTranslateButton();
  observeMessages();
  pollForChatSwitch();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.myLanguage) {
    targetLang = changes.myLanguage.newValue;
    console.log("My language updated. Translating to:", targetLang);
    translateAllMessages();
    observeMessages();
  }
  if (area === "sync" && changes.conversationLanguage) {
    conversationLang = changes.conversationLanguage.newValue;
    console.log(
      "Conversation language updated. Translating to:",
      conversationLang
    );
    translateOutgoingMessages();
    observeMessages();
  }
});
