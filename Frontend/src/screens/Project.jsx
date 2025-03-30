import React, { useEffect, useState, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../config/axios";
import { UserContext } from "../context/user.context";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";
import { getWebContainer } from "../config/webContainer";

import {
  initializeSocket,
  recieveMessage,
  sendMessage,
} from "../config/socket";
import e from "cors";

const Project = () => {
  const [webContainer, setwebContainer] = useState(null);
  const [sidepanel, setsidepanel] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [users, setusers] = useState([]);
  const { user } = useContext(UserContext);

  const location = useLocation();

  const [project, setproject] = useState(location.state.project);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messageBox = useRef(null);
  const [filetree, setfiletree] = useState({});
  const [currentFile, setcurrentFile] = useState(null);

  const [openFiles, setopenFiles] = useState([]);
  const [iframe, setiframe] = useState(null);
  const [runProcess, setRunProcess] = useState(null);

  const handleUserClick = (userId) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(userId)) {
        newSelectedUserId.delete(userId);
      } else {
        newSelectedUserId.add(userId);
      }
      return Array.from(newSelectedUserId);
    });
  };

  function addCollaborators() {
    axiosInstance
      .put("projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  }

  function send() {
    const messageObject = { message, sender: user.email };
    sendMessage("project-message", JSON.stringify(messageObject));
    setMessages((prevMessages) => [...prevMessages, messageObject]);
    setMessage("");
    scrollToBottom();
  }

  function writeAIResponse(message) {
    const messageObject = JSON.parse(message);
    return (
      <div className="overflow-auto bg-slate-950 text-white p-2 rounded-md ">
        <Markdown>{messageObject.text}</Markdown>
      </div>
    );
  }

  useEffect(() => {
    initializeSocket(project._id);

    if (!webContainer) {
      getWebContainer().then((container) => {
        setwebContainer(container);
        console.log("container started");
      });
    }

    recieveMessage("project-message", (data) => {
      let messageObject;

      try {
        messageObject = JSON.parse(data.message);
      } catch (error) {
        console.warn("⚠️ Received non-JSON message:", error);
        setMessages((prevMessages) => [...prevMessages, data]);
        scrollToBottom();
        return; // Exit early if JSON parsing fails
      }

      webContainer?.mount(messageObject.fileTree);

      if (messageObject.fileTree) {
        console.log("🌳 FileTree found in messageObject!");
        console.log(messageObject.fileTree);
        setfiletree(messageObject.fileTree);
      } else {
        console.warn("⚠️ No fileTree found in messageObject!");
      }
      setMessages((prevMessages) => [...prevMessages, data]);
      scrollToBottom();
    });

    axiosInstance
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        setproject(res.data.project);
      })
      .catch((err) => {
        console.log(err.response.data);
      });
    axiosInstance
      .get("/users/all")
      .then((res) => {
        setusers(res.data.users);
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  }, []);

  function scrollToBottom() {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }

  return (
    <main className="h-screen w-screen flex">
      <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
        <header className="flex justify-between items-center px-4 p-2 w-full bg-slate-200 absolute">
          <button onClick={() => setIsModalOpen(true)} className="flex gap-2">
            <i className="ri-add-line mr-1"></i>
            <p>Add Collaborators</p>
          </button>
          <button onClick={() => setsidepanel(!sidepanel)} className="p-2">
            <i className="ri-group-fill"></i>
          </button>
        </header>
        <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col relative overflow-hidden">
          <div
            ref={messageBox}
            className="p-1 message-box flex-grow flex flex-col gap-1 overflow-y-auto max-h-full"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message max-w-56 flex flex-col p-2 bg-slate-50 w-fit rounded-md ${
                  msg.sender === user.email ? "ml-auto" : "max-w-80"
                }`}
              >
                <small className="opacity-65 text-xs">{msg.sender}</small>
                <p className="text-sm">
                  {msg.sender == "AI"
                    ? writeAIResponse(msg.message)
                    : msg.message}
                </p>
              </div>
            ))}
          </div>
          <div className="input-field w-full flex absolute bottom-0 ">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-2 px-4 flex-grow border-none outline-none "
              type="text"
              placeholder="Type a message"
            />
            <button
              onClick={() => send()}
              className=" px-5 bg-slate-200 hover:bg-slate-400"
            >
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
        <div
          className={`flex flex-col gap-2 sidepanel w-full h-full bg-slate-50 absolute transition-all ${
            sidepanel ? "translate-x-0" : "-translate-x-full"
          } top-0`}
        >
          <header className="flex justify-between items-center px-3 w-full bg-slate-200">
            <h1>Collaborators</h1>
            <button onClick={() => setsidepanel(!sidepanel)} className="p-2">
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-2 p-2 ">
            {project.users &&
              project.users.map((user) => {
                return (
                  <div
                    key={user._id}
                    className="user cursor-pointer flex items-center gap-2 hover:bg-slate-200 p-2 rounded-md"
                  >
                    <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center  p-5 text-white bg-slate-600">
                      <i className="ri-user-fill absolute "></i>
                    </div>
                    <h1 className="font-semibold text-lg">{user.email}</h1>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
      <section className="right flex-grow bg-red-50 h-full flex">
        <div className="explorer h-full max-w-64 min-w-52 bg-slate-200">
          <div className="file-tree w-full">
            {Object.keys(filetree).map((file) => {
              return (
                <button
                  onClick={() => {
                    setcurrentFile(file);
                    setopenFiles(Array.from(new Set([...openFiles, file])));
                  }}
                  key={file}
                  className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full"
                >
                  <p className=" font-semibold text-lg">{file}</p>
                </button>
              );
            })}
          </div>
        </div>
        {currentFile && (
          <div className="code-editor flex flex-col flex-grow h-full">
            <div className="top flex justify-between w-full">
              <div className="files flex">
                {openFiles.map((file) => {
                  <button
                    onClick={() => setcurrentFile(file)}
                    key={file}
                    className="p-2 px-4 flex flex-row items-center gap-2 bg-slate-300 w-fit"
                  >
                    <p className=" font-semibold text-lg">{file}</p>
                  </button>;
                })}
              </div>

              <div className="action flex gap-2">
                <button
                  onClick={async () => {
                    await webContainer.mount(filetree);

                    const installProcess = await webContainer.spawn("npm", [
                      "install",
                    ]);
                    installProcess.output.pipeTo(
                      new WritableStream({
                        write(chunk) {
                          console.log(chunk);
                        },
                      })
                    );

                    if (runProcess) {
                      runProcess.kill();
                    }

                    let tempRunProcess = await webContainer.spawn("npm", [
                      "kill-port",
                      "3000",
                    ]);

                    const runProcess = await webContainer.spawn("npm", [
                      "start",
                    ]);
                    runProcess.output.pipeTo(
                      new WritableStream({
                        write(chunk) {
                          console.log(chunk);
                        },
                      })
                    );

                    setRunProcess(tempRunProcess);

                    webContainer.on("server-ready", (port, url) => {
                      console.log(port, url);
                      setiframe(url);
                    });
                  }}
                >
                  run
                </button>
              </div>
            </div>
            <div className="bottom flex flex-grow"></div>
            {filetree[currentFile] && (
              <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                <pre className="hljs h-full">
                  <code
                    className="hljs h-full outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedContent = e.target.innerText;
                      setfiletree((prevFileTree) => ({
                        ...prevFileTree,
                        [currentFile]: {
                          ...prevFileTree[currentFile],
                          file: {
                            ...prevFileTree[currentFile].file,
                            contents: updatedContent,
                          },
                        },
                      }));
                    }}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(
                        "javascript",
                        filetree[currentFile].file.contents
                      ).value,
                    }}
                    style={{
                      whiteSpace: "pre-wrap",
                      paddingBottom: "25rem",
                      counterSet: "line-numbering",
                    }}
                  />
                </pre>
              </div>
            )}
          </div>
        )}
        {iframe && webContainer && (
          <div className="flex flex-col h-full min-w-96">
            <div className="addressBa">
              <input
                className="p-2 px-4 flex-grow border-none outline-none"
                type="text"
                value={iframe}
                onChange={(e) => setiframe(e.target.value)}
              />
            </div>
            <iframe src={iframe} className="h-full w-full"></iframe>
          </div>
        )}
      </section>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-11/12 max-w-md relative">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select a User</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2">
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  className={`user cursor-pointer flex items-center gap-2 hover:bg-slate-200 ${
                    Array.from(selectedUserId).indexOf(user._id) != -1
                      ? "bg-slate-200"
                      : ""
                  } p-2 rounded-md `}
                >
                  <div className="aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className="font-semibold text-lg">{user.email}</h1>
                </div>
              ))}
            </div>
            <button
              onClick={() => addCollaborators()}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
