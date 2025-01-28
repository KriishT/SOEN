import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../config/axios";

const Project = () => {
  const [sidepanel, setsidepanel] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [users, setusers] = useState([]);

  const location = useLocation();
  console.log(location.state);

  const [project, setproject] = useState(location.state.project);

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

  useEffect(() => {
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

  return (
    <main className="h-screen w-screen flex">
      <section className="left relative flex flex-col h-full min-w-96 bg-slate-300">
        <header className="flex justify-between items-center px-4 p-2 w-full bg-slate-200">
          <button onClick={() => setIsModalOpen(true)} className="flex gap-2">
            <i className="ri-add-line mr-1"></i>
            <p>Add Collaborators</p>
          </button>
          <button onClick={() => setsidepanel(!sidepanel)} className="p-2">
            <i className="ri-group-fill "></i>
          </button>
        </header>
        <div className="conversation-area flex-grow flex flex-col">
          <div className="p-1 message-box flex-grow flex flex-col gap-1">
            <div className=" message max-w-56 flex flex-col p-2 bg-slate-50 w-fit rounded-md">
              <small className="opacity-65 text-xs">example@gmail.com</small>
              <p className="text-sm">
                Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet
              </p>
            </div>
            <div className=" message max-w-56 ml-auto flex flex-col p-2 bg-slate-50 w-fit rounded-md">
              <small className="opacity-65 text-xs">example@gmail.com</small>
              <p className="text-sm"> Lorem ipsum dolor sit amet.</p>
            </div>
          </div>

          <div className="input-field w-full flex">
            <input
              className="p-2 px-4 flex-grow border-none outline-none "
              type="text"
              placeholder="Type a message"
            />
            <button className=" px-5 bg-slate-200 hover:bg-slate-400">
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
