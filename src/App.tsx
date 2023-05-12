import React, {useEffect, useRef, useState} from 'react';
import parse from 'html-react-parser';
import ReactToPrint from 'react-to-print';
import './App.css';
import { io } from "socket.io-client";
import {FormControl, MenuItem, Select, SelectChangeEvent} from "@mui/material";
import {labelPrinterLocationsList, LabelPrinterLocationType} from "./types/LabelPrinterLocationType";
import localForage from 'localforage';
// @ts-ignore
import {useSnackbar} from "notistack";
import {labelPrinterDepartmentsList, LabelPrinterDepartmentType} from "./types/LabelPrinterDepartmentType";

if(!process.env.REACT_APP_SERVERS) {
  console.error(`${new Date().toLocaleString('ru')} No servers list`);
}

// @ts-ignore
const servers: string[] =  process.env.REACT_APP_SERVERS.split(',');

const sockets = servers.map((serverStr: string) => io(serverStr));

const setLabelPrinter = async (location: string, department: string): Promise<boolean> => {
  try {
    const savedPrinter: string = await localForage.setItem("printer", JSON.stringify({location, department}));
    console.log("Printer saved: ", savedPrinter);
    return !!savedPrinter;
  } catch (err) {
    console.error("Printer saving error: ", err);
    return false;
  }
}

const getLabelPrinter = async (): Promise<{location: string, department: string} | null>  => {
  console.log("[utils-storage] Getting printer");
  try {
    const printer: string | null = await localForage.getItem('printer');
    console.log("[utils-storage] Got printer from storage: ", printer);
    if(!printer) return null;
    return JSON.parse(printer);
  } catch (err) {
    console.log("[utils-storage] Getting printer from storage error: ", err);
    return null;
  }
}

// const socket = io("https://timesheets.space:3334");

// socket.onAny((eventName, ...args) => {
//   console.log(`Socket event ${eventName} with args ${args}`);
// });

function App() {

  const [div, setDiv] = useState<string | null>(null);
  const [printerDepartment, setPrinterDepartment] = useState<LabelPrinterDepartmentType>(labelPrinterDepartmentsList[0] as LabelPrinterDepartmentType);
  const [printerLocation, setPrinterLocation] = useState<LabelPrinterLocationType>(labelPrinterLocationsList[0] as LabelPrinterLocationType);

  const componentRef = useRef(null);

  const buttonRef = useRef(null);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    (async() => {
      for(let i = 0; i < servers.length; i++) {
        const socket = sockets[i];
        socket.on("connect", () => {
          console.log(`${new Date().toLocaleString('ru')} Socket ${socket.id} connected`);
        });

        socket.on("disconnect", () => {
          console.error(`${new Date().toLocaleString('ru')} Socket ${socket.id} disconnected`);
        });

        socket.on("connect_error", () => {
          console.error(`${new Date().toLocaleString('ru')} Socket ${socket.id} connect_error`);
        });

        socket.on("hello", (...args: any[]) => {
          console.log(`${new Date().toLocaleString('ru')} Socket ${socket.id} hello event with args ${args}`);
        });

        socket.on("print", async(...args: any[]) => {
          console.log(`${new Date().toLocaleString('ru')} Socket ${socket.id} print event with args ${args}`);
          if(args.length > 1) {
            //new version
            //check printer
            const isPrint = await checkIsPrint(args[1], args[2]);
            if(!isPrint) return;
          }
          const str = args[0];
          const div = document.createElement('div');
          div.innerHTML = str.trim();
          setDiv(str);
          setTimeout(() => {
            // @ts-ignore
            buttonRef.current.click();
          }, 1000);
        });
      }

      return () => {
        for(let i = 0; i < servers.length; i++) {
          const socket = sockets[i];
          socket.off('connect');
          socket.off('disconnect');
          socket.off('hello');
          socket.off('print');
        }
      }
    })()
  }, []);

  useEffect(() => {

    getLabelPrinter()
      .then((res) => {
        if(res) {
          setPrinterDepartment(res.department as LabelPrinterDepartmentType);
          setPrinterLocation(res.location as LabelPrinterLocationType);
        } else {
          enqueueSnackbar(`Ошибка получения принтера из локального хранилища`,{
            variant: 'error',
          });
          setLabelPrinter(labelPrinterLocationsList[0], labelPrinterDepartmentsList[0]);
        }
      })
      .catch((e) => {
        console.error('Getting local storage printer error: ', e);
        enqueueSnackbar(`Ошибка получения принтера из локального хранилища`,{
          variant: 'error',
        });
        setLabelPrinter(labelPrinterLocationsList[0], labelPrinterDepartmentsList[0]);
      });
  }, []);

  useEffect(() => {
    console.log(`${new Date().toLocaleString('ru')} New div in state`);
  }, [div]);

  useEffect(() => {
    console.log(`${new Date().toLocaleString('ru')} New printerDepartment in state: `, printerDepartment);
  }, [printerDepartment]);

  useEffect(() => {
    console.log(`${new Date().toLocaleString('ru')} New printerLocation in state: `, printerLocation);
  }, [printerLocation]);

  const checkIsPrint = async(requestLocation: string, requestDepartment: string): Promise<boolean> => {
    const localPrinter: {location: string, department: string} | null = await getLabelPrinter();
    if(!localPrinter) {
      enqueueSnackbar(`Ошибка получения принтера из локального хранилища`,{
        variant: 'error',
      });
      return false;
    }
    console.log(`Socket request location: `, requestLocation);
    console.log(`Local location: `, localPrinter.location);
    console.log(`Socket request department: `, requestDepartment);
    console.log(`Local department: `, localPrinter.department);
    if((requestLocation !== localPrinter.location ) || (requestDepartment !== localPrinter.department )) {
      console.log(`its not our printer`);
      return false;
    }
    return true;
  };

  const handlePrinterLocationChange = (event: SelectChangeEvent<string>) => {
    setLabelPrinter(event.target.value, printerDepartment);
    setPrinterLocation(event.target.value as LabelPrinterLocationType);
  }

  const handlePrinterDepartmentChange = (event: SelectChangeEvent<string>) => {
    setLabelPrinter(printerLocation, event.target.value);
    setPrinterDepartment(event.target.value as LabelPrinterDepartmentType);
  }

  return (
    <div className="App" style={{width: 260, height: 400}}>

      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
        <Select
          labelId="location-select"
          id="select-printer-location"
          value={printerLocation}
          // label="Производство"
          onChange={handlePrinterLocationChange}
        >
          {
            labelPrinterLocationsList.map((printerLocation: string) =>
              <MenuItem dense key={printerLocation} value={printerLocation}>{printerLocation}</MenuItem>
            )
          }
        </Select>
        <p/>
        <Select
          labelId="printer-department-select"
          id="select-printer-department"
          value={printerDepartment}
          // label="Принтер"
          onChange={handlePrinterDepartmentChange}
        >
          {
            labelPrinterDepartmentsList.map((printerDepartment: string) =>
              <MenuItem dense key={printerDepartment} value={printerDepartment}>{printerDepartment}</MenuItem>
            )
          }
        </Select>
      </FormControl>

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
