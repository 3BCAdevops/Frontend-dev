import React, { useEffect, useState } from "react";
import axios from "axios";

function ProjectDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState("all");

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/dev-events")
      .then((res) => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading project events...</div>;
  }

  const projects = Array.from(new Set(events.map((e) => e.projectName))).filter(
    (p) => p
  );

  const filtered =
    selectedProject === "all"
      ? events
      : events.filter((e) => e.projectName === selectedProject);

  return (
    <div style={{ padding: 20 }}>
      <h2>Project Dashboard</h2>

      <div style={{ marginBottom: 12 }}>
        <label>
          Project:&nbsp;
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="all">All projects</option>
            {projects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Developer</th>
            <th>Action</th>
            <th>Project</th>
            <th>Timestamp</th>
            <th>Metadata</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.developer}</td>
              <td>{e.action}</td>
              <td>{e.projectName}</td>
              <td>{e.timestamp}</td>
              <td>{e.metadata}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProjectDashboard;
