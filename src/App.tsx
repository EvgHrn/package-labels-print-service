import React, {useEffect, useRef, useState} from 'react';
import parse from 'html-react-parser';
import ReactToPrint from 'react-to-print';
import logo from './logo.svg';
import './App.css';

import { io } from "socket.io-client";

const socket = io("https://timesheets.space:3334");

// socket.onAny((eventName, ...args) => {
//   console.log(`Socket event ${eventName} with args ${args}`);
// });

function App() {

  const [div, setDiv] = useState<string | null>(null);

  const componentRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`Socket connected with id ${socket.id}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected with id ${socket.id}`);
    });

    socket.on("hello", (...args) => {
      console.log(`Socket hello event with args ${args}`);
    });

    socket.on("print", (...args) => {
      console.log(`Socket print event with args ${args}`);
      const str: string = args[0];
      const div = document.createElement('div');
      div.innerHTML = str.trim();
      setDiv(str);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('hello');
      socket.off('print');
    }
  }, []);

  useEffect(() => {
    console.log(`New div in state: `, div);
  }, [div]);

  return (
    <div className="App" style={{width: 260, height: 400}}>
      {/*<header className="App-header">*/}
      {/*  <img src={logo} className="App-logo" alt="logo" />*/}
      {/*  <p>*/}
      {/*    Edit <code>src/App.tsx</code> and save to reloaddddddd.*/}
      {/*  </p>*/}
      {/*  <a*/}
      {/*    className="App-link"*/}
      {/*    href="https://reactjs.org"*/}
      {/*    target="_blank"*/}
      {/*    rel="noopener noreferrer"*/}
      {/*  >*/}
      {/*    Learn React*/}
      {/*  </a>*/}
      {/*</header>*/}

      <ReactToPrint
        trigger={() => <button>Print this out!</button>}
        content={() => componentRef.current}
      />

      <div ref={componentRef}>
        { div ? parse(div) : null}
      </div>

    </div>
  );
}

export default App;
