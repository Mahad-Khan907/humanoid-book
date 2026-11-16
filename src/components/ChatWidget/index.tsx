import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from './styles.module.css';
import { useHistory } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { AuthContext } from '../../lib/better-auth-client';

const ChatWidget = ({ selectedText, clearSelectedText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const history = useHistory();
  const authClient = useContext(AuthContext);
  const { siteConfig } = useDocusaurusContext();

  const ragBackendURL =
    (siteConfig.customFields?.ragBackendURL as string) ||
    'http://localhost:7860';

  // If authClient is not ready, return null
  if (!authClient) {
    return null; 
  }

  // Direct session hook for instant updates
  const { data: session } = authClient.useSession();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Open chat automatically when text is selected
  useEffect(() => {
    if (session && selectedText && selectedText.trim().length > 0) {
      if (!isOpen) setIsOpen(true);
    }
  }, [selectedText, session]);

  const toggleChat = () => {
    if (!session) {
      alert("Please login to use AI features.");
      history.push('/login');
      return;
    }
    setIsOpen(!isOpen);
    if (isOpen) clearSelectedText();
  };

  const handleSendMessage = async (textToSend = inputValue) => {
    if (!textToSend.trim()) return;

    const userMsg = { text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    clearSelectedText();

    setMessages(prev => [...prev, { text: 'Thinking...', sender: 'bot', isTyping: true }]);

    try {
      const endpoint = `${ragBackendURL.replace(/\/$/, '')}/ask`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error (${response.status})`);
      }

      const data = await response.json();
      const reply = data.reply || "No response received.";
      setMessages(prev => prev.filter(m => !m.isTyping).concat({ text: reply, sender: 'bot' }));
    } catch (error) {
      const errMsg = error.message.includes('fetch')
        ? `Unable to connect to AI server at ${ragBackendURL}. Please ensure the backend is running.`
        : `AI Error: ${error.message}`;
      setMessages(prev => prev.filter(m => !m.isTyping).concat({ text: errMsg, sender: 'bot' }));
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatIcon} onClick={toggleChat} title="Chat with AI Assistant">💬</div>
      
      {isOpen && session && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <span>🤖 AI Textbook Assistant</span>
            <button onClick={toggleChat} aria-label="Close chat">×</button>
          </div>

          <div className={styles.chatMessages}>
            {messages.length === 0 && (
              <div style={{ padding: '1rem', color: '#888', textAlign: 'center', fontSize: '0.9rem' }}>
                👋 Ask me anything about the Physical AI & Humanoid Robotics book!
              </div>
            )}
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`${styles.message} ${styles[msg.sender]}`}
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTED TEXT BOX (The Ask AI Option) */}
          {selectedText && (
            <div className={styles.suggestedBox}>
              <p>"{selectedText.substring(0, 50)}..."</p>
              <div className={styles.suggestedButtons}>
                <button onClick={() => handleSendMessage(selectedText)} className={styles.askBtn}>Ask AI</button>
                <button onClick={clearSelectedText} className={styles.clearBtn}>Clear</button>
              </div>
            </div>
          )}

          <div className={styles.chatInput}>
            <input 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about ROS 2, Isaac, VLA..." 
            />
            <button onClick={() => handleSendMessage()}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
