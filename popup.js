// Sorted languages and their ISO 639-1 codes
const languages = [
    { name: "arabic", code: "ar" },
    { name: "bengali", code: "bn" },
    { name: "chinese", code: "zh" },
    { name: "english", code: "en" },
    { name: "french", code: "fr" },
    { name: "german", code: "de" },
    { name: "gujarati", code: "gu" },
    { name: "hindi", code: "hi" },
    { name: "hungarian", code: "hu" },
    { name: "indonesian", code: "id" },
    { name: "irish", code: "ga" },
    { name: "italian", code: "it" },
    { name: "japanese", code: "ja" },
    { name: "kannada", code: "kn" },
    { name: "korean", code: "ko" },
    { name: "latin", code: "la" },
    { name: "malyalam", code: "ml" },
    { name: "marathi", code: "mr" },
    { name: "mongolian", code: "mn" },
    { name: "nepali", code: "ne" },
    { name: "dutch", code: "nl" },
    { name: "polish", code: "pl" },
    { name: "portuguese", code: "pt" },
    { name: "punjabi", code: "pa" },
    { name: "russian", code: "ru" },
    { name: "sanskrit", code: "sa" },
    { name: "tamil", code: "ta" },
    { name: "telugu", code: "te" },
    { name: "thai", code: "th" },
    { name: "turkish", code: "tr" },
    { name: "ukrainian", code: "uk" },
    { name: "urdu", code: "ur" },
    { name: "vietnamese", code: "vi" }
];

// Populate the "Your Language" select field
const yourLanguageSelect = document.getElementById('language-select');
languages.forEach(language => {
    const option = document.createElement('option');
    option.value = language.code;
    option.textContent = `${language.name}-${language.code}`;
    yourLanguageSelect.appendChild(option);
});

// Populate the "Conversation Language" select field
const conversationLanguageSelect = document.getElementById('conversation-language-select');
languages.forEach(language => {
    const option = document.createElement('option');
    option.value = language.code;
    option.textContent = `${language.name}-${language.code}`;
    conversationLanguageSelect.appendChild(option);
});

// Handle save button click
document.getElementById('save-button').addEventListener('click', () => {
    const selectedYourLanguage = yourLanguageSelect.value;
    const selectedConversationLanguage = conversationLanguageSelect.value;

    // Save both languages to Chrome storage
    chrome.storage.sync.set({ 
        myLanguage: selectedYourLanguage, 
        conversationLanguage: selectedConversationLanguage 
    }, () => {
        console.log('Your Language saved:', selectedYourLanguage);
        console.log('Conversation Language saved:', selectedConversationLanguage);
        alert(`Languages saved: Your Language: ${selectedYourLanguage}, Conversation Language: ${selectedConversationLanguage}`);
    });
});
