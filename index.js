import { ready } from 'https://lsong.org/scripts/dom.js';
import { parse } from 'https://lsong.org/scripts/marked.js';
import { h, render, useState, useEffect, useRef } from 'https://lsong.org/scripts/react/index.js';



const Message = ({ message }) => {
  const previewRef = useRef(null);
  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.innerHTML = parse(message.content);
    }
  }, [message]);
  return h('div', { className: `preview message-role-${message.role}` },
    h('div', { ref: previewRef, className: 'message-content' })
  );
};

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const sendMessage = async content => {
    const userMessage = {
      role: 'user',
      content,
    };
    const available = await ai.canCreateTextSession();
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessages(prevMessages => [...prevMessages, {
      role: 'assistant',
      content: available ? '...' : `Sorry, I'm not available right now.`,
    }]);
    const session = await ai.createTextSession();
    const responseStream = session.promptStreaming(prompt);
    for await (const chunk of responseStream) {
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = {
          role: 'assistant',
          content: parse(chunk),
        };
        return updatedMessages;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendMessage(prompt);
    setPrompt('');
  };

  return h('div', null, [
    h('h2', null, 'Gemini Nano'),
    h('ul', { className: 'messages' },
      messages.map((message, index) =>
        h('li', { className: `message-role-${message.role}`, key: index },
          h(Message, { message })
        )
      )
    ),
    h('form', { className: 'flex', onSubmit: handleSubmit }, [
      h('input', {
        value: prompt,
        className: 'input',
        placeholder: 'Enter something...',
        onInput: e => setPrompt(e.target.value),
      }),
      h('button', { className: 'button button-primary', type: 'submit' }, 'Send'),
    ]),
    h('p', { className: 'copyright' }, `Based on Gemini Nano.`)
  ]);
};

ready(() => {
  const app = document.getElementById('app');
  render(h(App), app);
});