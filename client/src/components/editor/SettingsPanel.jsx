import { useEffect, useState } from "react";
import {
  Settings,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const DEFAULT_EDITOR_SETTINGS = {
  theme: "dark",
  fontSize: 14,
  wordWrap: true,
  minimap: true,
};

function SettingsPanel() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(
    DEFAULT_EDITOR_SETTINGS
  );

  /* Load saved settings */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "codeSyncSettings"
        );

      if (saved) {
        setSettings({
          ...DEFAULT_EDITOR_SETTINGS,
          ...JSON.parse(saved),
        });
      }
    } catch (error) {
      console.error(
        "Failed to load editor settings:",
        error
      );
    }
  }, []);


  /* Update setting */

  const updateSetting = (
    key,
    value
  ) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        [key]: value,
      };

      localStorage.setItem(
        "codeSyncSettings",
        JSON.stringify(updated)
      );

      window.dispatchEvent(
        new Event(
          "codeSyncSettingsChanged"
        )
      );

      return updated;
    });
  };


  /* Reset editor settings */

  const resetEditorSettings = () => {
    const confirmed =
      window.confirm(
        "Reset editor settings to defaults?"
      );

    if (!confirmed) {
      return;
    }

    const defaults = {
      ...DEFAULT_EDITOR_SETTINGS,
    };

    setSettings(defaults);

    localStorage.setItem(
      "codeSyncSettings",
      JSON.stringify(defaults)
    );

    window.dispatchEvent(
      new Event(
        "codeSyncSettingsChanged"
      )
    );
  };


  return (
    <div className="w-72 bg-slate-900 text-white border-r border-slate-700 h-full overflow-y-auto">

      {/* Header */}

      <div className="p-4 border-b border-slate-700">

        <div className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-2">

              <Settings
                size={18}
                className="text-blue-400"
              />

              <h2 className="font-semibold">
                Quick Settings
              </h2>

            </div>

            <p className="text-xs text-slate-500 mt-1">
              Editor preferences
            </p>

          </div>


          <button
            onClick={
              resetEditorSettings
            }
            title="Reset editor settings"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >

            <RotateCcw
              size={16}
            />

          </button>

        </div>

      </div>


      <div className="p-4 space-y-6">


        {/* Theme */}

        <div>

          <label className="block mb-2 text-sm text-slate-300">
            Theme
          </label>

          <select
            value={settings.theme}
            onChange={(e) =>
              updateSetting(
                "theme",
                e.target.value
              )
            }
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >

            <option value="dark">
              Dark
            </option>

            <option value="light">
              Light
            </option>

          </select>

        </div>


        {/* Font Size */}

        <div>

          <div className="flex items-center justify-between mb-2">

            <label className="text-sm text-slate-300">
              Font Size
            </label>

            <span className="text-sm text-blue-400 font-semibold">
              {settings.fontSize}px
            </span>

          </div>

          <input
            type="range"
            min="12"
            max="24"
            step="1"
            value={
              settings.fontSize
            }
            onChange={(e) =>
              updateSetting(
                "fontSize",
                Number(
                  e.target.value
                )
              )
            }
            className="w-full accent-blue-500"
          />

          <div className="flex justify-between text-xs text-slate-500 mt-1">

            <span>12</span>

            <span>18</span>

            <span>24</span>

          </div>

        </div>


        {/* Word Wrap */}

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-slate-200">
              Word Wrap
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Wrap long lines
            </p>

          </div>


          <button
            onClick={() =>
              updateSetting(
                "wordWrap",
                !settings.wordWrap
              )
            }
            className={`relative w-11 h-6 rounded-full transition ${
              settings.wordWrap
                ? "bg-blue-600"
                : "bg-slate-700"
            }`}
          >

            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                settings.wordWrap
                  ? "left-6"
                  : "left-1"
              }`}
            />

          </button>

        </div>


        {/* Minimap */}

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-slate-200">
              Minimap
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Show code minimap
            </p>

          </div>


          <button
            onClick={() =>
              updateSetting(
                "minimap",
                !settings.minimap
              )
            }
            className={`relative w-11 h-6 rounded-full transition ${
              settings.minimap
                ? "bg-blue-600"
                : "bg-slate-700"
            }`}
          >

            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                settings.minimap
                  ? "left-6"
                  : "left-1"
              }`}
            />

          </button>

        </div>


        {/* Divider */}

        <div className="border-t border-slate-800" />


        {/* Full Settings */}

        <button
          onClick={() =>
            navigate("/settings")
          }
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
        >

          <div className="text-left">

            <p className="text-sm font-medium text-white">
              Full Settings
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Manage all preferences
            </p>

          </div>

          <ExternalLink
            size={17}
            className="text-blue-400"
          />

        </button>


        {/* Info */}

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">

          <p className="text-xs text-blue-300 leading-relaxed">
            Changes are applied instantly to the editor and saved automatically.
          </p>

        </div>

      </div>

    </div>
  );
}

export default SettingsPanel;