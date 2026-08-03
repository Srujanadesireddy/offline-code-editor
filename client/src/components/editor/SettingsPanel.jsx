import { useState } from "react";

function SettingsPanel() {
  const [theme, setTheme] = useState("Dark");
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(true);

  return (
    <div className="w-72 bg-slate-900 text-white border-r border-slate-700 h-full">
      <div className="p-4 border-b border-slate-700 font-semibold">
        ⚙ Settings
      </div>

      <div className="p-4 space-y-5">

        <div>
          <label className="block mb-2 text-sm text-slate-300">
            Theme
          </label>

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full bg-slate-800 rounded px-3 py-2"
          >
            <option>Dark</option>
            <option>Light</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm text-slate-300">
            Font Size
          </label>

          <input
            type="range"
            min="12"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="w-full"
          />

          <p className="text-sm mt-1">{fontSize}px</p>
        </div>

        <div className="flex justify-between items-center">
          <span>Word Wrap</span>

          <input
            type="checkbox"
            checked={wordWrap}
            onChange={() => setWordWrap(!wordWrap)}
          />
        </div>

      </div>
    </div>
  );
}

export default SettingsPanel;