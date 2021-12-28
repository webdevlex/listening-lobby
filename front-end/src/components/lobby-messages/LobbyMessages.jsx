import React, { useRef, useEffect, useState } from "react";
import MessagesForm from "../messages-form/MessagesForm";
import MessageDisplay from "../message-display/MessageDisplay";
import "./lobby-messages.scss";

function LobbyMessages({ messages, user }) {
  const hasMessages = messages[0];
  const lastMessage = useRef(null);
  const [atBottom, setAtBottom] = useState(true);
  const [newMessages, setNewMessages] = useState(false);
  const [numberOfMessages, setNumberOfMessages] = useState(0);
  let size = messages.length - 1;
  useEffect(() => {
    if (numberOfMessages < messages.length) {
      if (messages[size].username === user.username || atBottom) {
        lastMessage.current?.scrollIntoView();
      } else {
        setNewMessages(true);
      }
      setNumberOfMessages(messages.length);
    }
  }, [messages, atBottom, numberOfMessages, setNumberOfMessages]);

  function handleScroll({ target }) {
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight) {
      setAtBottom(true);
      setNewMessages(false);
    } else {
      setAtBottom(false);
    }
  }

  function scrollToBottom() {
    lastMessage.current?.scrollIntoView();
  }

  return (
    <div className='lobby-messages'>
      <h4 className='section-title'>Messages</h4>
      <div className='messages-container' onScroll={(e) => handleScroll(e)}>
        {hasMessages &&
          messages.map((messageData) => (
            <MessageDisplay messageData={messageData} />
          ))}
        <div className='last-message' ref={lastMessage} />
      </div>
      {!atBottom && newMessages ? (
        <div className='scroll-to-bottom' onClick={() => scrollToBottom()}>
          *New Messages* Scroll to bottom
        </div>
      ) : null}

      <MessagesForm user={user} />
    </div>
  );
}

export default LobbyMessages;
