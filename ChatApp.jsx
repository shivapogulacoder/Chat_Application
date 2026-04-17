import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./index.css";

const socket = io("http://localhost:5000");

export default function ChatApp() {
  const [user, setUser] = useState(null); // logged-in user
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Listen for incoming messages
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => socket.off("receiveMessage");
  }, []);

  // Handle register/login
  const handleAuth = async () => {
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token); // save JWT
        setUser(data.user); // store user info
      } else {
        alert(data.message || "Authentication failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // Send chat message
  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("sendMessage", {
        senderId: user?._id,
        senderName: user?.username,
        content: message,
      });
      setMessage("");
    }
  };

  // If not logged in, show auth form
  if (!user) {
    return (
      <div className="auth-container">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button onClick={handleAuth}>{isLogin ? "Login" : "Register"}</button>
        <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer" }}>
          {isLogin ? "Need an account? Register" : "Already have an account? Login"}
        </p>
      </div>
    );
  }

  // Chat UI after login
  return (
    <div className="chat-container">
      <h2>Welcome, {user.username} 🚀</h2>
      <div className="messages">
        {messages.map((msg, i) => (
          <p key={i}>
            <strong>{msg.senderName}:</strong> {msg.content}
          </p>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
