import {
  Search,
  X,
  FileCode2,
  ChevronRight,
} from "lucide-react";

import { useEditor } from "../../context/EditorContext";
import { useMemo, useState } from "react";

function SearchPanel() {
  const {
    files,
    explorer,
    openFile,
  } = useEditor();

  const [query, setQuery] = useState("");


  /*
   * Get every file from the Explorer tree.
   *
   * This is important because files that have
   * not been opened yet may not exist in `files`.
   */

  const explorerFiles = useMemo(() => {
    const result = [];

    const walkTree = (nodes) => {
      nodes.forEach((node) => {
        if (node.type === "file") {
          result.push(node);
        }

        if (node.children) {
          walkTree(node.children);
        }
      });
    };

    walkTree(explorer);

    return result;
  }, [explorer]);


  /*
   * Search filenames + loaded file contents.
   */

  const results = useMemo(() => {
    const searchQuery =
      query.trim().toLowerCase();

    if (!searchQuery) {
      return [];
    }

    return explorerFiles
      .map((file) => {

        const fileName =
          file.name || "";

        const fileNameMatch =
          fileName
            .toLowerCase()
            .includes(searchQuery);


        /*
         * Content is available only when
         * the file has already been opened/loaded.
         */

        const content =
          files[fileName] || "";

        const lines =
          String(content).split("\n");

        const matchingLines = [];

        lines.forEach(
          (line, index) => {
            if (
              line
                .toLowerCase()
                .includes(searchQuery)
            ) {
              matchingLines.push({
                lineNumber:
                  index + 1,
                text: line.trim(),
              });
            }
          }
        );


        if (
          fileNameMatch ||
          matchingLines.length > 0
        ) {
          return {
            file,
            fileName,
            fileNameMatch,
            matchingLines:
              matchingLines.slice(0, 20),
          };
        }

        return null;
      })
      .filter(Boolean);

  }, [
    explorerFiles,
    files,
    query,
  ]);


  const totalMatches =
    results.reduce(
      (total, result) => {
        return (
          total +
          result.matchingLines.length +
          (result.fileNameMatch ? 1 : 0)
        );
      },
      0
    );


  const handleClear = () => {
    setQuery("");
  };


  /*
   * IMPORTANT:
   * Pass the actual Explorer file object
   * to openFile().
   */

  const handleOpenFile = (file) => {
    openFile(file);
  };


  return (
    <div className="w-72 bg-slate-900 border-r border-slate-700 h-full text-white flex flex-col">


      {/* Header */}

      <div className="p-4 border-b border-slate-700">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <Search
              size={18}
              className="text-blue-400"
            />

            <span className="font-semibold">
              Search
            </span>

          </div>


          {query && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}

        </div>

      </div>


      {/* Search input */}

      <div className="p-3 border-b border-slate-800">

        <div className="relative">

          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search files or code..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            autoFocus
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />


          {query && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}

        </div>

      </div>


      {/* Result count */}

      {query.trim() && (
        <div className="px-4 py-2 border-b border-slate-800">

          <p className="text-xs text-slate-400">

            {results.length === 0
              ? "No results"
              : `${totalMatches} ${
                  totalMatches === 1
                    ? "match"
                    : "matches"
                } in ${
                  results.length
                } ${
                  results.length === 1
                    ? "file"
                    : "files"
                }`}

          </p>

        </div>
      )}


      {/* Results */}

      <div className="flex-1 overflow-y-auto p-2">


        {/* Nothing searched */}

        {!query.trim() && (
          <div className="flex flex-col items-center justify-center text-center px-5 py-12">

            <Search
              size={38}
              className="text-slate-700"
            />

            <p className="text-sm text-slate-400 mt-4">
              Search your project
            </p>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Search file names and loaded code content.
            </p>

          </div>
        )}


        {/* No results */}

        {query.trim() &&
          results.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center px-5 py-12">

              <FileCode2
                size={38}
                className="text-slate-700"
              />

              <p className="text-sm text-slate-400 mt-4">
                No results found
              </p>

              <p className="text-xs text-slate-600 mt-2">
                Try another file name or code term.
              </p>

            </div>
          )}


        {/* Results */}

        {results.map((result) => (

          <div
            key={result.file.id}
            className="mb-2"
          >

            {/* File result */}

            <button
              onClick={() =>
                handleOpenFile(
                  result.file
                )
              }
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition text-left"
            >

              <FileCode2
                size={16}
                className="text-blue-400 flex-shrink-0"
              />

              <span className="text-sm text-slate-200 truncate flex-1">
                {result.fileName}
              </span>

              <ChevronRight
                size={14}
                className="text-slate-600"
              />

            </button>


            {/* Filename match */}

            {result.fileNameMatch && (
              <button
                onClick={() =>
                  handleOpenFile(
                    result.file
                  )
                }
                className="w-full text-left px-9 py-1.5 text-xs text-blue-400 hover:bg-slate-800 rounded"
              >
                Filename match
              </button>
            )}


            {/* Code matches */}

            {result.matchingLines.map(
              (match) => (

                <button
                  key={`${result.file.id}-${match.lineNumber}`}
                  onClick={() =>
                    handleOpenFile(
                      result.file
                    )
                  }
                  className="w-full text-left px-9 py-1.5 rounded hover:bg-slate-800 transition group"
                >

                  <div className="flex items-start gap-2">

                    <span className="text-[11px] text-slate-600 min-w-[28px] pt-0.5 text-right">
                      {match.lineNumber}
                    </span>

                    <span className="text-xs text-slate-400 group-hover:text-slate-200 truncate">
                      {match.text ||
                        "(empty line)"}
                    </span>

                  </div>

                </button>

              )
            )}


            {result.matchingLines.length >=
              20 && (
              <p className="px-9 py-1 text-[10px] text-slate-600">
                Showing first 20 matches
              </p>
            )}

          </div>

        ))}

      </div>

    </div>
  );
}

export default SearchPanel;