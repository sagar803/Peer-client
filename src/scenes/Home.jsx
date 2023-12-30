import React, { useEffect, useRef, useState } from 'react';
import useSocket from '../providers/Socket';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export const Home = ({setUser}) => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [name, setName] = useState('')
  const [email, setEmail] = useState('');
  const [error, setError] = useState({});
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const handleNameBlur = () => {
    const nameValidation = name.trim() !== '';
    setError((prevErrors) => ({ ...prevErrors, name: nameValidation ? '' : 'Name is required.' }));
  };
  const handleEmailBlur = () => {
    const emailValidation = email.trim() !== '';
    setError((prevErrors) => ({ ...prevErrors, email: emailValidation ? '' : 'Email is required.' }));
  };
  
  const handleLogin = (e) => {
    e.preventDefault();

    if (error.email === '' && error.name === '') {
      socket.emit('login', { name, email });
    }
  };

  const handleRoomJoined = (data) => {
    setUser(data);
    navigate("/room");
  };

  useEffect(() => {
    socket.on('login_successful', handleRoomJoined);
    return () => {
      socket.off('login_successful', handleRoomJoined);
    };
  }, [socket]);



  return (
    <div className="home">
      <h2 style={{ textAlign: 'center' }}>Live video calls using <i>WebRTC</i></h2>
      <form>
        <input
          ref={inputRef}
          className="home-input"
          type="text"
          value={name}
          placeholder="Enter your name"
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
        />
        {error.name && <div className="error-message">{error.name}</div>}
        <input
          className="home-input"
          type="text"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={handleEmailBlur}
        />
        {error.email && <div className="error-message">{error.email}</div>}
        <button className="home-button" onClick={handleLogin}>
          Login
        </button>
      </form>
    </div>
  );
};
