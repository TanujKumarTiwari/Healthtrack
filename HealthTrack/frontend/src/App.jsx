
import { useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000/api";

export default function App() {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState("patient");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [submissions, setSubmissions] = useState([]);

  async function submitSymptoms(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!symptoms.trim()) {
      setError("Please enter your symptoms.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/symptoms/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.errors?.symptoms?.[0] ||
          data.error ||
          "Unable to analyze symptoms."
        );
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function login(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Invalid provider credentials.");
      }

      setToken(data.access);
      await loadSubmissions(data.access);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadSubmissions(accessToken) {
    const response = await fetch(
      `${API}/provider/submissions/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Provider access denied.");
    }

    const data = await response.json();
    setSubmissions(data.results || data);
    setMode("dashboard");
  }

  return (
    <main className="container">
      <header>
        <h1>HealthTrack</h1>
        <p>AI-powered symptom information</p>
        <nav>
          <button onClick={() => {
            setMode("patient");
            setError("");
          }}>
            Symptom Checker
          </button>
          <button onClick={() => {
            setMode("login");
            setError("");
          }}>
            Dashboard
          </button>
        </nav>
      </header>

      {error && <p className="error">{error}</p>}

      {mode === "patient" && (
        <section className="panel">
          <h2>Describe your symptoms</h2>
          <form onSubmit={submitSymptoms}>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="For example: headache and fatigue..."
              maxLength={5000}
              rows={5}
            />
            <button disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Symptoms"}
            </button>
          </form>

          {result && (
            <div className="results">
              <h2>Possible Conditions</h2>
              <ul>
                {result.ai_response.possible_conditions.map(
                  (item, i) => (
                    <li key={i}>
                      <strong>{item.name}</strong>
                      <p>{item.explanation}</p>
                    </li>
                  )
                )}
              </ul>

              <h3>Recommended Actions</h3>
              <ul>
                {result.ai_response.recommended_actions.map(
                  (item, i) => <li key={i}>{item}</li>
                )}
              </ul>

              <h3>Warning Signs</h3>
              <ul>
                {result.ai_response.warning_signs.map(
                  (item, i) => <li key={i}>{item}</li>
                )}
              </ul>

              <p>
                <strong>Urgency:</strong>{" "}
                {result.ai_response.urgency}
              </p>
              <p>{result.ai_response.disclaimer}</p>
            </div>
          )}

          <p className="notice">
            This tool provides general information, not a
            medical diagnosis. Seek emergency care for
            potentially life-threatening symptoms.
          </p>
        </section>
      )}

      {mode === "login" && (
        <section className="panel">
          <h2>Provider Login</h2>
          <form onSubmit={login}>
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button>Sign In</button>
          </form>
        </section>
      )}

      {mode === "dashboard" && (
  <section className="panel dashboard">
    <div className="dashboard-header">
      <div>
        <h2>Healthcare Provider Dashboard</h2>
        <p>Patient symptoms and AI-generated analysis</p>
      </div>

      <button
        onClick={() => {
          setToken("");
          setSubmissions([]);
          setMode("patient");
        }}
      >
        Logout
      </button>
    </div>

    <p className="table-info">
      Total submissions: {submissions.length}
    </p>

    <div className="table-wrapper">
      <table className="submissions-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date & Time</th>
            <th>User Prompt / Symptoms</th>
            <th>Possible Conditions</th>
            <th>Recommended Actions</th>
            <th>Warning Signs</th>
            <th>Urgency</th>
            <th>Disclaimer</th>
          </tr>
        </thead>

        <tbody>
          {submissions.length === 0 ? (
            <tr>
              <td colSpan={8} className="empty-table">
                No patient submissions found.
              </td>
            </tr>
          ) : (
            submissions.map((item) => {
              const ai = item.ai_response || {};

              return (
                <tr key={item.id}>
                  <td>#{item.id}</td>

                  <td>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "N/A"}
                  </td>

                  <td className="prompt-cell">
                    {item.symptoms || "N/A"}
                  </td>

                  <td>
                    {Array.isArray(ai.possible_conditions) &&
                    ai.possible_conditions.length > 0 ? (
                      <ul>
                        {ai.possible_conditions.map((condition, index) => (
                          <li key={index}>
                            <strong>{condition.name || "Condition"}</strong>
                            <p>{condition.explanation || ""}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "N/A"
                    )}
                  </td>

                  <td>
                    {Array.isArray(ai.recommended_actions) &&
                    ai.recommended_actions.length > 0 ? (
                      <ul>
                        {ai.recommended_actions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    ) : (
                      "N/A"
                    )}
                  </td>

                  <td>
                    {Array.isArray(ai.warning_signs) &&
                    ai.warning_signs.length > 0 ? (
                      <ul>
                        {ai.warning_signs.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    ) : (
                      "N/A"
                    )}
                  </td>

                  <td>
                    <span
                      className={`urgency urgency-${String(
                        ai.urgency || "unknown"
                      ).toLowerCase()}`}
                    >
                      {({
  routine: "Routine",
  prompt: "Medical Review Soon",
  urgent: "Urgent Care",
  emergency: "Emergency"
})[String(ai.urgency || "").toLowerCase()] || "Needs Review"}
                    </span>
                  </td>

                  <td className="disclaimer-cell">
                    {ai.disclaimer || "N/A"}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </section>
      )}
    </main>
  );
}
