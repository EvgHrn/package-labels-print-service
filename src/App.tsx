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

  const buttonRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`Socket connected with id ${socket.id}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected with id ${socket.id}`);
    });

    socket.on("hello", (...args: any[]) => {
      console.log(`Socket hello event with args ${args}`);
    });

    socket.on("print", (...args: any[]) => {
      console.log(`Socket print event with args ${args}`);
      const str = args[0];
      const div = document.createElement('div');
      div.innerHTML = str.trim();
      setDiv(str);
      // @ts-ignore
      buttonRef.current.click();
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

      <ReactToPrint
        trigger={() => <button
          ref={buttonRef}
        >Print this out!</button>}
        content={() => componentRef.current}
      />

      <div ref={componentRef}>
        { div ? parse(div) : null}
      </div>

    </div>
  );
}

export default App;
