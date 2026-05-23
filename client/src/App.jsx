import { Sandpack } from "@codesandbox/sandpack-react";
import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import axios from "axios";

function App() {

  // PROJECT ID
  const [projectId, setProjectId] =
    useState(null);

  // FILES
  const [files, setFiles] = useState({

    "/App.js": `
import "./styles.css";

export default function App() {
  return (
    <div className="container">
      <h1>Browser Sandbox</h1>
      <p>Persistence Working</p>
    </div>
  );
}
`,

    "/styles.css": `
.container {
  padding: 20px;
  font-family: sans-serif;
}

h1 {
  color: blue;
}
`
  });

  // ACTIVE FILE
  const [activeFile, setActiveFile] =
    useState("/App.js");

  // LOAD PROJECT ON REFRESH
  useEffect(() => {

    const savedProjectId =
      localStorage.getItem("projectId");

    if (savedProjectId) {

      loadProject(savedProjectId);
    }

  }, []);

  // LOAD PROJECT
  const loadProject = async (id) => {

    try {

      const res = await axios.get(
        `http://localhost:5000/project/${id}`
      );

      if (res.data.files) {

        setFiles(res.data.files);

        setProjectId(id);

        // SET FIRST FILE ACTIVE
        setActiveFile(
          Object.keys(res.data.files)[0]
        );
      }

    } catch (error) {

      console.log(error);
    }
  };

  // UPDATE CODE
  const updateCode = (value) => {

    setFiles((prev) => ({
      ...prev,
      [activeFile]: value || "",
    }));
  };

  // CREATE FILE
  const createFile = () => {

    const fileName = prompt(
      "Enter file name with extension"
    );

    if (!fileName) return;

    const filePath = `/${fileName}`;

    // CHECK DUPLICATE
    if (files[filePath]) {

      alert("File already exists");

      return;
    }

    // ADD FILE
    setFiles((prev) => ({
      ...prev,
      [filePath]: "",
    }));

    setActiveFile(filePath);
  };

  // DELETE FILE
  const deleteFile = (file) => {

    // PREVENT LAST FILE DELETE
    if (Object.keys(files).length === 1) {

      alert("At least one file required");

      return;
    }

    const updatedFiles = {
      ...files,
    };

    delete updatedFiles[file];

    setFiles(updatedFiles);

    setActiveFile(
      Object.keys(updatedFiles)[0]
    );
  };

  // SAVE PROJECT
  const saveProject = async () => {

    try {

      const res = await axios.post(
        "https://browser-sandbox-production-f1da.up.railway.app/save",
        {
          files: files,
          projectId: projectId,
        }
      );

      // SAVE PROJECT ID
      localStorage.setItem(
        "projectId",
        res.data._id
      );

      setProjectId(res.data._id);

      alert("Project Saved");

    } catch (error) {

      console.log(error);

      alert("Save Failed");
    }
  };

  return (

    <div className="h-screen flex">

      {/* LEFT SIDEBAR */}
      <div className="w-1/5 bg-blue-950 text-white p-5 overflow-y-auto">

        <h1 className="text-3xl font-bold">
          Files
        </h1>

        {/* BUTTONS */}
        <div className="flex gap-2 mt-4">

          <button
            onClick={createFile}
            className="bg-green-500 px-3 py-2 rounded"
          >
            + File
          </button>

          <button
            onClick={saveProject}
            className="bg-blue-500 px-3 py-2 rounded"
          >
            Save
          </button>

        </div>

        {/* FILE LIST */}
        {
          Object.keys(files).map((file) => (

            <div
              key={file}
              className={`mt-3 p-3 rounded flex justify-between items-center ${
                activeFile === file
                  ? "bg-blue-700"
                  : "bg-blue-900"
              }`}
            >

              {/* FILE NAME */}
              <div
                onClick={() => setActiveFile(file)}
                className="cursor-pointer flex-1"
              >
                {file.replace("/", "")}
              </div>

              {/* DELETE */}
              <button
                onClick={() => deleteFile(file)}
                className="bg-red-500 px-2 py-1 rounded"
              >
                X
              </button>

            </div>

          ))
        }

      </div>

      {/* MIDDLE */}
      <div className="w-2/5 flex flex-col">

        <div className="bg-gray-200 p-3 font-bold">

          Editing:
          {" "}
          {activeFile}

        </div>

        <Editor
          height="90vh"
          language={
            activeFile.includes(".css")
              ? "css"
              : "javascript"
          }
          value={files[activeFile] || ""}
          onChange={updateCode}
        />

      </div>

      {/* RIGHT */}
      <div className="w-2/5">

        <div className="bg-gray-200 p-3 font-bold">
          Live Preview
        </div>

        <Sandpack
          template="react"
          files={files}
        />

      </div>

    </div>
  );
}

export default App;