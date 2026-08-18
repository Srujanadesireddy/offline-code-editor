import {
  Bug,
  Play,
  Square,
  Trash2,
  Terminal,
  FileCode2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { useEditor } from "../../context/EditorContext";
import { useEffect, useRef, useState } from "react";

function DebugPanel() {
  const {
    activeFile,
    files,
  } = useEditor();

  const [output, setOutput] = useState([]);
  const [debugging, setDebugging] = useState(false);

  const iframeRef = useRef(null);

  const currentCode =
    activeFile
      ? files[activeFile] || ""
      : "";

  const isJavaScript =
    activeFile?.toLowerCase().endsWith(".js");

  const isJSX =
    activeFile?.toLowerCase().endsWith(".jsx");


  /*
   * Receive messages from debug sandbox.
   */

  useEffect(() => {
    const handleMessage = (event) => {
      if (
        event.data?.source !==
        "codesync-debugger"
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

        setDebugging(false);
      }

      if (type === "done") {
        setDebugging(false);

        setOutput((prev) => [
          ...prev,
          {
            type: "success",
            value: "Debug session completed.",
          },
        ]);
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
   * Start debugging.
   */

  const startDebugging = () => {
    if (!activeFile) {
      return;
    }

    if (isJSX) {
      setOutput([
        {
          type: "error",
          value:
            "JSX/React files cannot be debugged directly yet. Use a plain .js file for the current debugger.",
        },
      ]);

      return;
    }

    if (!isJavaScript) {
      setOutput([
        {
          type: "error",
          value:
            "The current debugger supports JavaScript (.js) files only.",
        },
      ]);

      return;
    }

    setOutput([]);
    setDebugging(true);

    const iframe =
      iframeRef.current;

    if (!iframe) {
      setDebugging(false);

      setOutput([
        {
          type: "error",
          value:
            "Debugger is not ready. Please try again.",
        },
      ]);

      return;
    }

    const escapedCode =
      JSON.stringify(currentCode);

    const debugHTML = `
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
        source: "codesync-debugger",
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

    send(
      "done"
    );

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
      debugHTML;
  };


  /*
   * Stop debugging.
   */

  const stopDebugging = () => {

    if (iframeRef.current) {
      iframeRef.current.srcdoc =
        "<html></html>";
    }

    setDebugging(false);

    setOutput((prev) => [
      ...prev,
      {
        type: "log",
        value:
          "Debug session stopped.",
      },
    ]);
  };


  /*
   * Clear output.
   */

  const clearOutput = () => {
    setOutput([]);
  };


  return (
    <div className="w-72 h-full bg-slate-900 border-r border-slate-700 text-white flex flex-col">


      {/* Header */}

      <div className="p-4 border-b border-slate-700">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <Bug
              size={18}
              className="text-red-400"
            />

            <span className="font-semibold">
              Run and Debug
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


      {/* Debug controls */}

      <div className="p-4 border-b border-slate-800">

        {!activeFile ? (

          <div className="flex items-center gap-2 text-xs text-slate-500">

            <AlertCircle size={15} />

            Select a file to debug.

          </div>

        ) : isJSX ? (

          <div className="flex items-start gap-2 text-xs text-yellow-400">

            <AlertCircle
              size={15}
              className="mt-0.5 flex-shrink-0"
            />

            <span>
              JSX/React files need a
              transpiler. Plain .js
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

            {!debugging ? (

              <button
                onClick={startDebugging}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-medium"
              >

                <Play
                  size={16}
                  fill="currentColor"
                />

                Start

              </button>

            ) : (

              <button
                onClick={stopDebugging}
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


      {/* Status */}

      <div className="px-4 py-3 border-b border-slate-800">

        <div className="flex items-center gap-2">

          {debugging ? (
            <>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />

              <span className="text-xs text-blue-400">
                Debugging...
              </span>
            </>
          ) : (
            <>
              <CheckCircle2
                size={14}
                className="text-slate-500"
              />

              <span className="text-xs text-slate-500">
                Debugger ready
              </span>
            </>
          )}

        </div>

      </div>


      {/* Output */}

      <div className="flex-1 min-h-0 flex flex-col">

        <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">

          <Terminal
            size={15}
            className="text-slate-400"
          />

          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Debug Console
          </span>

        </div>


        <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">

          {output.length === 0 ? (

            <div className="text-slate-600 text-center py-8">

              <Bug
                size={28}
                className="mx-auto mb-3 opacity-50"
              />

              <p>
                Debug output will appear here.
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
                        : item.type === "success"
                        ? "bg-green-950/40 text-green-400 border border-green-900/40"
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


      {/* Hidden debugger sandbox */}

      <iframe
        ref={iframeRef}
        title="Code Debugger"
        sandbox="allow-scripts"
        className="hidden"
      />

    </div>
  );
}

export default DebugPanel;