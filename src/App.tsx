import React from 'react';
import logo from './logo.svg';
import './App.css';

import { io } from "socket.io-client";

const socket = io("https://timesheets.space");

socket.on("connect", () => {
  console.log(`Socket connected with id ${socket.id}`);
});

socket.on("disconnect", () => {
  console.log(`Socket disconnected with id ${socket.id}`);
});

socket.on("print", (...args) => {
  console.log(`Socket print event with args ${args}`);
});

socket.onAny((eventName, ...args) => {
  console.log(`Socket event ${eventName} with args ${args}`);
});

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reloaddddddd.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
