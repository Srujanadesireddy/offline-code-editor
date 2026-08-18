import {
  Play,
  Square,
  Trash2,
  Terminal,
  FileCode2,
  AlertCircle,
} from "lucide-react";

import { useEditor } from "../../context/EditorContext";
import { useEffect, useRef, useState } from "react";

function RunPanel() {
  const {
    activeFile,
    files,
  } = useEditor();

  const [output, setOutput] = useState([]);
  const [running, setRunning] = useState(false);

  const iframeRef = useRef(null);

  const currentCode =
    activeFile
      ? files[activeFile] || ""
      : "";

  /*
   * Current runner supports plain JavaScript only.
   *
   * JSX/React files need a transpiler such as
   * Babel or a proper build environment.
   */
  const isJavaScript =
    activeFile?.toLowerCase().endsWith(".js");

  const isJSX =
    activeFile?.toLowerCase().endsWith(".jsx");


  /*
   * Receive output from sandbox iframe.
   */

  useEffect(() => {
    const handleMessage = (event) => {

      if (
        event.data?.source !==
        "codesync-runner"
      ) {
        return;
      }

      const {
        type,
        value,
      } = event.data;

      if (type === "log") {

        setOutput((prev) => [
          ...prev,
          {
            type: "log",
            value,
          },
        ]);

      }

      if (type === "error") {

        setOutput((prev) => [
          ...prev,
          {
            type: "error",
            value,
          },
        ]);

        setRunning(false);

      }

      if (type === "done") {
        setRunning(false);
      }
    };

    window.addEventListener(
      "message",
      handleMessage
    );

    return () => {
      window.removeEventListener(
        "message",
        handleMessage
      );
    };

  }, []);


  /*
   * Run current JavaScript file.
   */

  const runCode = () => {

    if (!activeFile) {
      return;
    }


    if (isJSX) {

      setOutput([
        {
          type: "error",
          value:
            "JSX/React files cannot be executed directly yet. The current runner supports plain JavaScript (.js) files.",
        },
      ]);

      return;
    }


    if (!isJavaScript) {

      setOutput([
        {
          type: "error",
          value:
            "Only JavaScript (.js) files are supported by the current runner.",
        },
      ]);

      return;
    }


    setOutput([]);
    setRunning(true);


    const iframe =
      iframeRef.current;


    if (!iframe) {

      setRunning(false);

      setOutput([
        {
          type: "error",
          value:
            "Runner is not ready. Please try again.",
        },
      ]);

      return;
    }


    const escapedCode =
      JSON.stringify(currentCode);


    const runnerHTML = `
<!DOCTYPE html>

<html>

<head>
  <meta charset="UTF-8">
</head>

<body>

<script>

(function () {

  const send = (type, value) => {

    window.parent.postMessage(
      {
        source: "codesync-runner",
        type,
        value
      },
      "*"
    );

  };


  const formatValue = (value) => {

    if (
      typeof value ===
      "undefined"
    ) {
      return "undefined";
    }


    if (
      typeof value ===
      "string"
    ) {
      return value;
    }


    try {

      return JSON.stringify(
        value,
        null,
        2
      );

    } catch {

      return String(value);

    }

  };


  console.log = (...args) => {

    send(
      "log",
      args
        .map(formatValue)
        .join(" ")
    );

  };


  console.warn = (...args) => {

    send(
      "log",
      "[Warning] " +
      args
        .map(formatValue)
        .join(" ")
    );

  };


  console.error = (...args) => {

    send(
      "error",
      args
        .map(formatValue)
        .join(" ")
    );

  };


  window.onerror = (
    message,
    source,
    line,
    column,
    error
  ) => {

    send(
      "error",
      error?.stack ||
      String(message)
    );

    return true;

  };


  try {

    const code =
      ${escapedCode};

    const execute =
      new Function(code);

    execute();

    send("done");

  } catch (error) {

    send(
      "error",
      error?.stack ||
      String(error)
    );

  }

})();

<\/script>

</body>

</html>
`;


    iframe.srcdoc =
      runnerHTML;

  };


  const clearOutput = () => {
    setOutput([]);
  };


  const stopCode = () => {

    if (iframeRef.current) {

      iframeRef.current.srcdoc =
        "<html></html>";

    }

    setRunning(false);

    setOutput((prev) => [
      ...prev,
      {
        type: "log",
        value:
          "Execution stopped.",
      },
    ]);

  };


  return (
    <div className="w-72 h-full bg-slate-900 border-r border-slate-700 text-white flex flex-col">


      {/* Header */}

      <div className="p-4 border-b border-slate-700">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <Terminal
              size={18}
              className="text-green-400"
            />

            <span className="font-semibold">
              Run
            </span>

          </div>


          <button
            onClick={clearOutput}
            title="Clear output"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Trash2 size={16} />
          </button>

        </div>

      </div>


      {/* Current File */}

      <div className="p-4 border-b border-slate-800">

        <p className="text-xs text-slate-500 mb-2">
          Current File
        </p>

        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-800 rounded-lg px-3 py-2">

          <FileCode2
            size={16}
            className="text-blue-400"
          />

          <span className="text-sm text-slate-300 truncate">
            {activeFile ||
              "No file selected"}
          </span>

        </div>

      </div>


      {/* Controls */}

      <div className="p-4 border-b border-slate-800">

        {!activeFile ? (

          <div className="flex items-center gap-2 text-xs text-slate-500">

            <AlertCircle size={15} />

            Select a file to run.

          </div>

        ) : isJSX ? (

          <div className="flex items-start gap-2 text-xs text-yellow-400">

            <AlertCircle
              size={15}
              className="mt-0.5 flex-shrink-0"
            />

            <span>
              JSX/React files need a
              transpiler to run.
              Currently only .js
              files are supported.
            </span>

          </div>

        ) : !isJavaScript ? (

          <div className="flex items-start gap-2 text-xs text-yellow-400">

            <AlertCircle
              size={15}
              className="mt-0.5 flex-shrink-0"
            />

            <span>
              Only JavaScript files
              are supported currently.
            </span>

          </div>

        ) : (

          <div className="flex gap-2">

            {!running ? (

              <button
                onClick={runCode}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 transition font-medium"
              >

                <Play
                  size={16}
                  fill="currentColor"
                />

                Run

              </button>

            ) : (

              <button
                onClick={stopCode}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 transition font-medium"
              >

                <Square
                  size={15}
                  fill="currentColor"
                />

                Stop

              </button>

            )}

          </div>

        )}

      </div>


      {/* Output */}

      <div className="flex-1 min-h-0 flex flex-col">

        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <Terminal
              size={15}
              className="text-slate-400"
            />

            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Output
            </span>

          </div>


          {running && (
            <span className="text-xs text-green-400">
              Running...
            </span>
          )}

        </div>


        <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">

          {output.length === 0 ? (

            <div className="text-slate-600 text-center py-8">

              <Terminal
                size={28}
                className="mx-auto mb-3 opacity-50"
              />

              <p>
                Program output will appear here.
              </p>

            </div>

          ) : (

            <div className="space-y-2">

              {output.map(
                (item, index) => (

                  <div
                    key={index}
                    className={`rounded-lg p-2 whitespace-pre-wrap break-words ${
                      item.type === "error"
                        ? "bg-red-950/50 text-red-400 border border-red-900/50"
                        : "bg-slate-800/70 text-slate-300"
                    }`}
                  >
                    {item.value}
                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>


      {/* Hidden sandbox */}

      <iframe
        ref={iframeRef}
        title="Code Runner"
        sandbox="allow-scripts"
        className="hidden"
      />

    </div>
  );
}

export default RunPanel;