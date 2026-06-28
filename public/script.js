const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const darkModeToggle = document.getElementById('dark-mode-toggle');

let conversation = [];

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    darkModeToggle.textContent = '☀️ Light Mode';
  } else {
    darkModeToggle.textContent = '🌙 Dark Mode';
  }
});

function checkWelcomeScreen() {
  const welcomeScreen = document.getElementById('welcome-screen');
  if (welcomeScreen) {
    welcomeScreen.remove();
  }
}

chatBox.addEventListener('click', (e) => {
  if (e.target.classList.contains('suggestion-chip')) {

    const chipText = e.target.innerText.replace(/^[^\s]+\s/, '');

    input.value = chipText;

    form.dispatchEvent(new Event('submit'));
  }
});

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  checkWelcomeScreen();

  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });
  input.value = '';

  const botMessageElement = appendMessage('model', 'Thinking...');

  try {
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