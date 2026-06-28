const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const darkModeToggle = document.getElementById('dark-mode-toggle');

let conversation = [];

// Handle Dark Mode Toggle
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    darkModeToggle.textContent = '☀️ Light Mode';
  } else {
    darkModeToggle.textContent = '🌙 Dark Mode';
  }
});

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Add the user's message to the chat box and history
  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });
  input.value = '';

  // Show a temporary "Thinking..." bot message
  const botMessageElement = appendMessage('model', 'Thinking...');

  try {
    // Send the conversation history as a POST request to /api/chat
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Replace the "Thinking..." message with the AI's reply parsed from Markdown
    if (data && data.result) {
      botMessageElement.innerHTML = marked.parse(data.result);
      conversation.push({ role: 'model', text: data.result });
      chatBox.scrollTop = chatBox.scrollHeight;
    } else {
      botMessageElement.textContent = 'Sorry, no response received.';
      botMessageElement.classList.add('error');
    }
  } catch (error) {
    console.error('Error:', error);
    botMessageElement.textContent = 'Failed to get response from server.';
    botMessageElement.classList.add('error');
  }
});

function appendMessage(role, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', role);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
