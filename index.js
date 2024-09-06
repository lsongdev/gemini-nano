import { ready } from 'https://lsong.org/scripts/dom.js';
import { query } from 'https://lsong.org/scripts/query.js';
import { parse } from 'https://lsong.org/scripts/marked.js';

// DOM Elements
let form, userInput, messageList;

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

// Main Function
ready(async () => {
  // Initialize DOM elements
  form = document.getElementById('form');
  userInput = document.getElementById('user');
  messageList = document.getElementById('messages');
  const status = document.getElementById('status');
  const capabilities = await ai.assistant.capabilities();
  console.log("capabilities", capabilities);
  const bot = await ai.assistant.create();
  // console.log(bot);

  // Set up event listeners
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const userMessage = userInput.value;
    appendMessage('user', userMessage);
    const botMessage = await appendMessage('assistant', '...');
    const responseStream = bot.promptStreaming(userMessage);
    for await (const chunk of responseStream) {
      botMessage.innerHTML = parse(chunk);
    }
    userInput.value = '';
    status.textContent = `tokens: ${bot.tokensSoFar}/${bot.maxTokens}, available: ${bot.tokensLeft}`;
  });
});