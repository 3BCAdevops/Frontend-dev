import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Line } from 'react-chartjs-2';


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import ProfileDropdown from './components/ProfileDropdown';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function DevEventsDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("THIS_YEAR");
  const [selectedProjectForGauge, setSelectedProjectForGauge] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [timeRange]);

  const fetchEvents = () => {
    setLoading(true);
    let url = "http://localhost:8080/api/dev-events";
    
    console.log("🔥 SELECTED TIME RANGE:", timeRange);
    
    if (timeRange === "7_DAYS") {
      url = "http://localhost:8080/api/dev-events/filter/last-days?days=7";
    } else if (timeRange === "30_DAYS") {
      url = "http://localhost:8080/api/dev-events/filter/last-days?days=30";
    } else if (timeRange === "THIS_YEAR") {
      const startDate = new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endDate = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59).toISOString();
      url = `http://localhost:8080/api/dev-events/filter/date-range?start=${startDate}&end=${endDate}`;
    }
    
    console.log("🔥 CALLING API:", url);
    
    axios
      .get(url)
      .then((res) => {
        console.log("dev-events response =", res.data);
        setEvents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events", err);
        setLoading(false);
      });
  };

  if (loading) {
    return <div className="page">Loading dashboard...</div>;
  }

  const filteredEvents = searchQuery ? events.filter((event) => {
    const query = searchQuery.toLowerCase();
    const developer = (event.developer || "").toLowerCase();
    const action = (event.action || "").toLowerCase();
    const projectName = (event.projectName || "").toLowerCase();
    
    return developer.includes(query) || 
           action.includes(query) || 
           projectName.includes(query);
  }) : events;

  const totalEvents = filteredEvents.length;
  const uniqueDevelopers = new Set(filteredEvents.map((e) => e.developer)).size;
  const uniqueProjects = new Set(filteredEvents.map((e) => e.projectName)).size;

  const failedCount = filteredEvents.filter((e) => e.action === "BUILD_FAILED").length;
  const successCount = filteredEvents.filter((e) => e.action === "BUILD_SUCCESS").length;

  const overallSuccessRate = totalEvents === 0 ? 0 : Math.round((successCount / totalEvents) * 100);
  const totalReports = successCount + failedCount;
  const holidayCount = 0;

  const projectStatsMap = filteredEvents.reduce((map, e) => {
    const key = e.projectName || "Unknown";
    const obj = map.get(key) || { project: key, success: 0, failed: 0 };
    if (e.action === "BUILD_SUCCESS") obj.success += 1;
    if (e.action === "BUILD_FAILED") obj.failed += 1;
    map.set(key, obj);
    return map;
  }, new Map());

  const projectStats = Array.from(projectStatsMap.values());
  const projectNamesForGauge = ["ALL", ...projectStats.map((p) => p.project)];

  const eventsForGauge = selectedProjectForGauge === "ALL"
    ? filteredEvents
    : filteredEvents.filter((e) => e.projectName === selectedProjectForGauge);

  // NEW: Calculate weekly success rate (last 7 days)
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const weeklyEvents = eventsForGauge.filter(e => 
    new Date(e.timestamp) >= last7Days
  );

  const weeklySuccessCount = weeklyEvents.filter(e => 
    e.action === "BUILD_SUCCESS"
  ).length;

  const weeklySuccessRate = weeklyEvents.length === 0 
    ? 0 
    : Math.round((weeklySuccessCount / weeklyEvents.length) * 100);

  // Original all-time success rate (kept for comparison)
  const gaugeTotal = eventsForGauge.length;
  const gaugeSuccessCount = eventsForGauge.filter((e) => e.action === "BUILD_SUCCESS").length;
  const gaugeSuccessRate = gaugeTotal === 0 ? 0 : Math.round((gaugeSuccessCount / gaugeTotal) * 100);

  const last10 = [...filteredEvents]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  const chartData = () => {
    const eventsByDate = {};
    
    filteredEvents.forEach(event => {
      const date = new Date(event.timestamp).toLocaleDateString();
      if (!eventsByDate[date]) {
        eventsByDate[date] = { success: 0, failed: 0 };
      }
      if (event.action === "BUILD_SUCCESS") eventsByDate[date].success++;
      if (event.action === "BUILD_FAILED") eventsByDate[date].failed++;
    });

    const dates = Object.keys(eventsByDate).sort((a, b) => new Date(a) - new Date(b));
    
    return {
      labels: dates,
      datasets: [
        {
          label: 'Success',
          data: dates.map(date => eventsByDate[date].success),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Failed',
          data: dates.map(date => eventsByDate[date].failed),
          borderColor: 'rgb(249, 115, 22)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="page">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <h2 style={{ margin: 0 }}>Hello Admin!</h2>
            <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>
              Measure how fast your dev builds are improving over time.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="text"
              placeholder="🔍 Search developer, project, action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                padding: "6px 16px",
                fontSize: 13,
                width: 280,
                outline: "none",
              }}
            />

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ borderRadius: 999, border: "1px solid #e5e7eb", padding: "6px 12px", fontSize: 13 }}
            >
              <option value="THIS_YEAR">This year</option>
              <option value="30_DAYS">Last 30 days</option>
              <option value="7_DAYS">Last 7 days</option>
            </select>

            <button className="top-icon-btn" title="View stats" onClick={() => navigate("/stats")}>
              🔔
            </button>

            <button className="top-icon-btn" title="Insights" onClick={() => alert("Insights page coming soon – will show tips based on failures.")}>
              💬
            </button>

            <ProfileDropdown />
          </div>
        </div>

        {searchQuery && (
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12, padding: "8px 12px", background: "#f3f4f6", borderRadius: 8 }}>
            Found {totalEvents} event{totalEvents !== 1 ? 's' : ''} matching "{searchQuery}"
            <button onClick={() => setSearchQuery("")} style={{ marginLeft: 8, color: "#f97316", border: "none", background: "none", cursor: "pointer", fontSize: 13, textDecoration: "underline" }}>
              Clear
            </button>
          </div>
        )}

        <h3 style={{ marginTop: 18, marginBottom: 8 }}>Overview</h3>

        <div className="kpi-row">
          <KpiCard colorClass="blue" label="Users" value={uniqueDevelopers} icon="🧑‍💻" />
          <KpiCard colorClass="green" label="Events" value={totalEvents} icon="📅" />
          <KpiCard colorClass="orange" label="Holidays" value={holidayCount} icon="🏖️" />
          <KpiCard colorClass="purple" label="Reports" value={totalReports} icon="📊" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.1fr", gap: 16, marginBottom: 16 }}>
          <div className="sub-card">
            <div className="sub-card-header">
              <span>Events over time</span>
              <span className="sub-card-chip">Real-time chart</span>
            </div>
            <div style={{ height: 200, padding: 10 }}>
              {filteredEvents.length > 0 ? (
                <Line data={chartData()} options={chartOptions} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                  No events to display
                </div>
              )}
            </div>
          </div>

          <div className="sub-card">
            <div className="sub-card-header">
              <span>Success rate</span>
              <span className="sub-card-chip">Last 7 Days</span>
            </div>

            <div style={{ marginTop: 8 }}>
              <select
                value={selectedProjectForGauge}
                onChange={(e) => setSelectedProjectForGauge(e.target.value)}
                style={{ borderRadius: 999, border: "1px solid #e5e7eb", padding: "4px 10px", fontSize: 12 }}
              >
                {projectNamesForGauge.map((p) => (
                  <option key={p} value={p}>{p === "ALL" ? "All projects" : p}</option>
                ))}
              </select>
            </div>

            <div className="gauge-placeholder">
              <div className="gauge-arc"></div>
              <div className="gauge-center">
                <div style={{ fontSize: 12, color: "#6b7280" }}>Last 7 Days</div>
                <div style={{ fontSize: 26, fontWeight: 700 }}>{weeklySuccessRate}%</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                  {weeklyEvents.length} builds this week
                </div>
                <div style={{ fontSize: 10, color: "#d1d5db", marginTop: 2 }}>
                  All-time: {gaugeSuccessRate}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr", gap: 16 }}>
          <div className="sub-card">
            <div className="sub-card-header">
              <span>Performance statistics</span>
              <span className="sub-card-chip">Overall (All-time)</span>
            </div>
            <div style={{ marginTop: 10 }}>
              {projectStats.length === 0 && <div style={{ fontSize: 13, color: "#9ca3af" }}>No events yet.</div>}
              {projectStats.map((p) => {
                const total = p.success + p.failed || 1;
                const successPct = Math.round((p.success / total) * 100);
                return (
                  <div key={p.project} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 13, marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                      <span>{p.project}</span>
                      <span>{successPct}% success</span>
                    </div>
                    <div className="perf-bar-bg">
                      <div className="perf-bar-fill" style={{ width: `${successPct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sub-card">
            <div className="sub-card-header">
              <span>Recent activity</span>
              <span className="sub-card-chip">Last 10 builds (green=success, red=failure)</span>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 180, padding: '10px 0' }}>
              {last10.length === 0 && (
                <div style={{ fontSize: 13, color: "#9ca3af", width: '100%', textAlign: 'center' }}>
                  No events in selected range.
                </div>
              )}
              
              {last10.map((e) => (
                <div key={e.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '100%',
                      height: e.action === "BUILD_SUCCESS" ? "120px" : "60px",
                      background: e.action === "BUILD_SUCCESS" 
                        ? "linear-gradient(180deg, #22c55e, #16a34a)" 
                        : "linear-gradient(180deg, #f97316, #fb923c)",
                      borderRadius: 4,
                    }}
                    title={`${e.projectName} - ${e.action}`}
                  ></div>
                  <div style={{ fontSize: 9, color: '#6b7280', marginTop: 4, textAlign: 'center', wordBreak: 'break-word' }}>
                    {new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 8, color: '#9ca3af', marginTop: 2, textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.projectName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ colorClass, label, value, icon }) {
  return (
    <div className={`kpi-card ${colorClass}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: "999px", background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
          {icon}
        </div>
        <div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default DevEventsDashboard;
