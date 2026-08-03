import { Search } from "lucide-react";
import { useEditor } from "../../context/EditorContext";
import { useState } from "react";

function SearchPanel() {
  const { files, openFile } = useEditor();
  const [query, setQuery] = useState("");

  const results = Object.keys(files).filter((file) =>
    file.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-700 h-full text-white">
      <div className="p-4 border-b border-slate-700 font-semibold flex items-center gap-2">
        <Search size={18} />
        Search
      </div>

      <div className="p-3">
        <input
          placeholder="Search files..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-slate-800 rounded px-3 py-2 outline-none"
        />
      </div>

      <div className="px-3">
        {results.map((file) => (
          <div
            key={file}
            onClick={() => openFile(file)}
            className="px-3 py-2 rounded cursor-pointer hover:bg-slate-700"
          >
            {file}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchPanel;