import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuthState } from "../hooks/useAuthState";
import "./ChatWindow.css";
import { FaTrash, FaEdit, FaCheck } from "react-icons/fa";

export default function ChatWindow() {
  const sel = useSelector((s) => s.chat.selectedUser);
  const { user } = useAuthState();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [lastSeen, setLastSeen] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const messagesEndRef = useRef(null);

  const chatId = user && sel ? [user.uid, sel.uid].sort().join("_") : null;

  // Update own lastSeen every 30s
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const updateLastSeen = async () => {
      await updateDoc(userRef, { lastSeen: serverTimestamp() });
    };
    updateLastSeen();
    const interval = setInterval(updateLastSeen, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch selected user's lastSeen
  useEffect(() => {
    if (!sel) return;
    const unsub = onSnapshot(doc(db, "users", sel.uid), (snap) => {
      if (snap.exists()) setLastSeen(snap.data().lastSeen);
    });
    return () => unsub();
  }, [sel]);

  // Fetch messages & mark unread as read
  useEffect(() => {
    if (!chatId || !sel) return;
    const q = query(collection(db, "messages", chatId, "chat"), orderBy("timestamp"));
    const unsub = onSnapshot(q, async (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      for (let m of msgs) {
        if (m.senderId !== user.uid && m.status !== "read") {
          await updateDoc(doc(db, "messages", chatId, "chat", m.id), { status: "read" });
        }
      }
      setMessages(msgs);
    });
    return () => unsub();
  }, [chatId, sel, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = () => {
    if (!user) return;
    updateDoc(doc(db, "users", user.uid), { lastSeen: serverTimestamp() }).catch(console.error);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    await addDoc(collection(db, "messages", chatId, "chat"), {
      senderId: user.uid,
      text: newMessage.trim(),
      timestamp: serverTimestamp(),
      status: "sent",
    });

    setNewMessage("");
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "messages", chatId, "chat", id));
  };

  const handleEdit = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = async (id) => {
    if (!editingText.trim()) return;
    await updateDoc(doc(db, "messages", chatId, "chat", id), { text: editingText });
    setEditingId(null);
    setEditingText("");
  };

if (!sel)
  return (
    <div className="chat-window no-chat-selected">
      <div className="placeholder" style={{background:"#753939",height:"100%",width:"100%"}}>
        <img
        style={{marginTop:"25%"}}
          src="https://png.pngtree.com/png-vector/20221214/ourmid/pngtree-phone-chat-apps-png-image_6523592.png"
          alt="Select user"
          className="placeholder-img"
        />
        <h2 style={{color:"#f1afafff",fontFamily:"initial"}}>Welcome to Chit-chat</h2>
        <p style={{color:"white"}}>Select a user from the list to start chatting 😊</p>
      </div>
    </div>
  );


  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="user-info">
          <div className="user-avatar">
            {sel.displayName ? sel.displayName.charAt(0) : sel.email.charAt(0)}
          </div>
          <div className="user-details">
            <div className="user-name">{sel.displayName || sel.email}</div>
            <span className="last-seen">
              Last seen {lastSeen ? new Date(lastSeen.toDate()).toLocaleString() : "recently"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.map((m) => (
          <div
          
            key={m.id}
            className={`message ${m.senderId === user.uid ? "sent" : "received"}`}
          >
            {editingId === m.id ? (
              <div className="edit-message">
                <input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <button onClick={() => saveEdit(m.id)}>
                  <FaCheck />
                </button>
              </div>
            ) : (
              <>
                <div className="msg-text">{m.text}</div>
                <div className="msg-meta">
                  {m.timestamp?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {m.senderId === user.uid && (
                    <span className={`tick ${m.status}`}> &nbsp;&nbsp;✔</span>
                  )}
                  <span className="msg-actions">
                    <FaEdit onClick={() => handleEdit(m.id, m.text)} />
                    <FaTrash onClick={() => handleDelete(m.id)} />
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="message-form" onSubmit={handleSend}>
        <input
          type="text"
          value={newMessage}
          placeholder="Type a message..."
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
        />
        <button type="submit">➤</button>
      </form>
    </div>
  );
}
