import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axiosInstance from "../config/axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setprojectName] = useState(null);
  const [project, setproject] = useState([]);

  const navigate = useNavigate();
  useEffect(() => {
    axiosInstance
      .get("/projects/all")
      .then((res) => {
        setproject(res.data.projects);
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  }, []);

  function createProject(e) {
    e.preventDefault();
    console.log(projectName);
    axiosInstance
      .post("/projects/create", {
        name: projectName,
      })
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  }
  return (
    <main className="p-4">
      <div className="projects flex flex-wrap gap-3">
        <button
          className="project p-4 border border-slate-300 rounded-md"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="mr-2"> New Project</span>
          <i className="ri-link"></i>
        </button>
        {project.map((project) => (
          <div
            key={project._id}
            className="project p-4 border border-slate-300 rounded-md cursor-pointer flex flex-col min-w-52 hover:bg-slate-200"
            onClick={() => navigate(`/project`, { state: { project } })}
          >
            <h2 className="mr-2 font-semibold">{project.name}</h2>
            <div className="flex gap-2">
              <i className="ri-user-line"></i>
              <p>Collaborators :</p> {project.users.length}
            </div>
          </div>
        ))}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-md">
              <h2 className="text-xl mb-4">Create New Project</h2>
              <form onSubmit={createProject}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Project Name
                  </label>
                  <input
                    onChange={(e) => setprojectName(e.target.value)}
                    value={projectName}
                    type="text"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
