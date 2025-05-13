'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ChatbotWidget from './ChatbotWidget';
import styles from './ChatbotIcon.module.css';

const ChatbotIcon = () => {
  const [isOpen, setIsOpen] = useState(true); 
  const [showGreeting, setShowGreeting] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    setShowGreeting(false); 
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(true);
    }, 1000); 
    return () => clearTimeout(timer); 
  }, []);

  return (
    <div className={styles.chatbotIconContainer}>
      {showGreeting && !isOpen && <div className={styles.greetingBubble}>Hi!</div>}
      <Link href="/chatbot">
        <button className={styles.chatbotIconButton} onClick={toggleChatbot}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={styles.chatIcon}>
            <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
          </svg>
        </button>
      </Link>
      {isOpen && <ChatbotWidget />}
    </div>
  );
};

export default ChatbotIcon;