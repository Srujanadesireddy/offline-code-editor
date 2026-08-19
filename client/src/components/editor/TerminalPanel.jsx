import { useState, useRef, useEffect } from "react";
import {
  Terminal as TerminalIcon,
  X,
  Trash2,
} from "lucide-react";

function TerminalPanel({ onClose }) {
  const [history, setHistory] = useState([
    {
      type: "system",
      text: "CodeSync Terminal",
    },
    {
      type: "system",
      text: 'Type "help" to see available commands.',
    },
  ]);

  const [command, setCommand] =
    useState("");

  const inputRef = useRef(null);
  const terminalRef = useRef(null);


  useEffect(() => {
    inputRef.current?.focus();
  }, []);


  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop =
        terminalRef.current.scrollHeight;
    }
  }, [history]);


  const addOutput = (
    type,
    text
  ) => {
    setHistory((prev) => [
      ...prev,
      {
        type,
        text,
      },
    ]);
  };


  const runCommand = (
    e
  ) => {
    e.preventDefault();

    const value =
      command.trim();

    if (!value) {
      return;
    }


    addOutput(
      "command",
      `$ ${value}`
    );


    const normalized =
      value.toLowerCase();


    if (
      normalized === "help"
    ) {

      addOutput(
        "output",
        "Available commands:"
      );

      addOutput(
        "output",
        "help     - Show available commands"
      );

      addOutput(
        "output",
        "clear    - Clear terminal"
      );

      addOutput(
        "output",
        "status   - Show editor status"
      );

      addOutput(
        "output",
        "files    - Show terminal information"
      );

    } else if (
      normalized === "clear"
    ) {

      setHistory([]);

    } else if (
      normalized === "status"
    ) {

      addOutput(
        "output",
        "CodeSync editor is running."
      );

      addOutput(
        "output",
        "Connection status is shown in the top bar."
      );

    } else if (
      normalized === "files"
    ) {

      addOutput(
        "output",
        "Project files are available in the Explorer."
      );

    } else {

      addOutput(
        "error",
        `Command not found: ${value}`
      );

      addOutput(
        "output",
        'Type "help" for available commands.'
      );

    }


    setCommand("");
  };


  const clearTerminal = () => {
    setHistory([]);
  };


  return (
    <div className="h-full bg-[#181818] border-t border-slate-700 text-slate-300 flex flex-col">


      {/* Header */}

      <div className="h-10 flex items-center justify-between px-3 border-b border-slate-700 bg-[#1f1f1f]">

        <div className="flex items-center gap-2">

          <TerminalIcon
            size={15}
            className="text-slate-400"
          />

          <span className="text-xs font-medium text-slate-300">
            TERMINAL
          </span>

        </div>


        <div className="flex items-center gap-1">

          <button
            onClick={clearTerminal}
            title="Clear terminal"
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <Trash2 size={14} />
          </button>


          <button
            onClick={onClose}
            title="Close terminal"
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X size={15} />
          </button>

        </div>

      </div>


      {/* Output */}

      <div
        ref={terminalRef}
        onClick={() =>
          inputRef.current?.focus()
        }
        className="flex-1 overflow-y-auto px-4 py-3 font-mono text-xs"
      >

        {history.map(
          (item, index) => (

            <div
              key={index}
              className={`leading-6 ${
                item.type === "command"
                  ? "text-white"
                  : item.type === "error"
                  ? "text-red-400"
                  : "text-slate-400"
              }`}
            >
              {item.text}
            </div>

          )
        )}


        {/* Input */}

        <form
          onSubmit={runCommand}
          className="flex items-center gap-2"
        >

          <span className="text-green-400">
            $
          </span>

          <input
            ref={inputRef}
            value={command}
            onChange={(e) =>
              setCommand(
                e.target.value
              )
            }
            className="flex-1 bg-transparent outline-none text-white font-mono"
            autoComplete="off"
            spellCheck="false"
          />

        </form>

      </div>

    </div>
  );
}

export default TerminalPanel;