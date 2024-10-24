import { ready } from 'https://lsong.org/scripts/dom/index.js';
import { parse } from 'https://lsong.org/scripts/marked.js';

// DOM Elements
let bot, form, userInput, messageList, statusElement;

// Helper Functions
function createMessageElement(role, content) {
  const messageElement = document.createElement('li');
  messageElement.className = `message-role-${role}`;
  messageElement.innerHTML = parse(content);
  return messageElement;
}

async function appendMessage(role, content) {
  const messageElement = createMessageElement(role, content);
  messageList.appendChild(messageElement);
  return messageElement;
}

const assistant = ai.languageModel;
const capabilities = await assistant.capabilities();

// Main Function
ready(async () => {
  // Initialize DOM elements
  form = document.getElementById('form');
  userInput = document.getElementById('user');
  messageList = document.getElementById('messages');
  statusElement = document.getElementById('status');

  switch (capabilities.available) {
    case 'no':
      appendMessage('assistant', 'Sorry, I don\'t have access to your capabilities.');
      break;
    case 'readily':
      // create session
      bot = await assistant.create();
      appendMessage('assistant', 'I\'m ready to help you.');
      break;
    default:
      throw new Error(`unknown capabilities: ${capabilities.available}`);
  }

  // Set up event listeners
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const userMessage = userInput.value;
    appendMessage('user', userMessage);
    const botMessage = await appendMessage('assistant', '...');
    try {
      const responseStream = bot.promptStreaming(userMessage);
      for await (const chunk of responseStream) {
        botMessage.innerHTML = parse(chunk);
      }
    } catch (e) {
      botMessage.innerHTML = parse(e.toString());
    }
    userInput.value = '';
    statusElement.textContent = `tokens: ${bot.tokensSoFar}/${bot.maxTokens}, available: ${bot.tokensLeft}`;
  });
});