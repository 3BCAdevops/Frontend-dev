
import React, { useEffect, useState } from "react";
import axios from "axios";

function StatsDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return <div className="page">Loading stats...</div>;
  }

  const totalEvents = events.length;
  const uniqueProjects = new Set(events.map((e) => e.projectName)).size;
  const uniqueDevelopers = new Set(events.map((e) => e.developer)).size;
  const failedCount = events.filter((e) => e.action === "BUILD_FAILED").length;
  const successCount = events.filter((e) => e.action === "BUILD_SUCCESS").length;

  return (
    <div className="page">
      <div className="card">
        <h2>Stats &amp; Insights</h2>
        <p
          style={{
            marginTop: 4,
            marginBottom: 0,
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          Overall numbers across all projects.
        </p>

        {/* NOTE: here old labels (Events / Projects / Developers / Build failures) */}
        <div className="kpi-row">
          <div className="kpi-card blue">
            <div className="kpi-label">Events</div>
            <div className="kpi-value">{totalEvents}</div>
          </div>
          <div className="kpi-card green">
            <div className="kpi-label">Projects</div>
            <div className="kpi-value">{uniqueProjects}</div>
          </div>
          <div className="kpi-card orange">
            <div className="kpi-label">Developers</div>
            <div className="kpi-value">{uniqueDevelopers}</div>
          </div>
          <div className="kpi-card purple">
            <div className="kpi-label">Build failures</div>
            <div className="kpi-value">{failedCount}</div>
          </div>
        </div>

        <p style={{ marginTop: 8, fontSize: 14, color: "#4b5563" }}>
          Build successes: {successCount}. Failures: {failedCount}. Total
          events: {totalEvents}.
        </p>
      </div>
    </div>
  );
}

export default StatsDashboard;
