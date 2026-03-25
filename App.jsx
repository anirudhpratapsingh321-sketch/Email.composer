import { useState } from "react";

const TONES = ["Professional", "Friendly", "Formal", "Persuasive", "Concise"];
const TYPES = ["Follow-up", "Introduction", "Thank you", "Request", "Apology", "Proposal"];

export default function EmailComposer() {
  const [context, setContext] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("Professional");
  const [type, setType] = useState("Follow-up");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function compose() {
    if (!context.trim()) { setError("Please describe what the email is about."); return; }
    setError("");
    setLoading(true);
    setResult(null);

    const prompt = `Write a ${tone.toLowerCase()} ${type.toLowerCase()} email${recipient ? ` to ${recipient}` : ""}.

Context: ${context}

Respond ONLY with a JSON object (no markdown, no backticks) in this exact format:
{
  "subject": "the email subject line",
  "body": "the full email body with proper line breaks as \\n"
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.text || "").join("").trim();
      const parsed = JSON.parse(raw);
      setResult(parsed);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d0d",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#f0ede6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; }
        .card { background: #161616; border: 1px solid #2a2a2a; border-radius: 2px; }
        textarea, input { background: #0d0d0d; border: 1px solid #2a2a2a; color: #f0ede6; font-family: 'DM Mono', monospace; font-size: 0.85rem; border-radius: 2px; outline: none; transition: border-color 0.2s; }
        textarea:focus, input:focus { border-color: #c9a84c; }
        .chip { cursor: pointer; padding: 0.35rem 0.85rem; border-radius: 2px; font-family: 'DM Mono', monospace; font-size: 0.75rem; letter-spacing: 0.05em; border: 1px solid #2a2a2a; background: #0d0d0d; color: #888; transition: all 0.15s; }
        .chip.active { background: #c9a84c; color: #0d0d0d; border-color: #c9a84c; font-weight: 600; }
        .chip:hover:not(.active) { border-color: #555; color: #ccc; }
        .btn { cursor: pointer; background: #c9a84c; color: #0d0d0d; border: none; padding: 0.75rem 2rem; font-family: 'DM Mono', monospace; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.08em; border-radius: 2px; transition: all 0.2s; }
        .btn:hover { background: #e0bc60; }
        .btn:disabled { background: #333; color: #666; cursor: not-allowed; }
        .copy-btn { cursor: pointer; background: transparent; border: 1px solid #2a2a2a; color: #888; padding: 0.4rem 0.9rem; font-family: 'DM Mono', monospace; font-size: 0.75rem; border-radius: 2px; transition: all 0.15s; }
        .copy-btn:hover { border-color: #c9a84c; color: #c9a84c; }
        .shimmer { background: linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 2px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .fade-in { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        label { display: block; font-family: 'DM Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; color: #666; text-transform: uppercase; margin-bottom: 0.5rem; }
      `}</style>

      <div style={{ width: "100%", maxWidth: "680px" }}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.2em", color: "#c9a84c", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            ✦ AI-Powered
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.6rem", fontWeight: 700, margin: 0, lineHeight: 1.1, color: "#f0ede6" }}>
            Email<br /><em style={{ color: "#c9a84c" }}>Composer</em>
          </h1>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", color: "#555", marginTop: "0.75rem" }}>
            Craft the perfect email in seconds.
          </p>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1rem" }}>
          {/* Email Type */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label>Email Type</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {TYPES.map(t => (
                <div key={t} className={`chip ${type === t ? "active" : ""}`} onClick={() => setType(t)}>{t}</div>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label>Tone</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {TONES.map(t => (
                <div key={t} className={`chip ${tone === t ? "active" : ""}`} onClick={() => setTone(t)}>{t}</div>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label>Recipient (optional)</label>
            <input
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              placeholder="e.g. hiring manager, client, team"
              style={{ width: "100%", padding: "0.65rem 0.85rem" }}
            />
          </div>

          {/* Context */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label>What's the email about? *</label>
            <textarea
              value={context}
              onChange={e => { setContext(e.target.value); setError(""); }}
              placeholder="e.g. Following up on a job application I sent last week for the product designer role..."
              rows={4}
              style={{ width: "100%", padding: "0.65rem 0.85rem", resize: "vertical" }}
            />
            {error && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "#e05c5c", marginTop: "0.4rem" }}>{error}</div>}
          </div>

          <button className="btn" onClick={compose} disabled={loading} style={{ width: "100%" }}>
            {loading ? "Composing..." : "Compose Email →"}
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="card" style={{ padding: "1.75rem" }}>
            <div className="shimmer" style={{ height: "14px", width: "40%", marginBottom: "1.5rem" }} />
            <div className="shimmer" style={{ height: "12px", width: "100%", marginBottom: "0.6rem" }} />
            <div className="shimmer" style={{ height: "12px", width: "90%", marginBottom: "0.6rem" }} />
            <div className="shimmer" style={{ height: "12px", width: "95%", marginBottom: "0.6rem" }} />
            <div className="shimmer" style={{ height: "12px", width: "70%", marginBottom: "1.5rem" }} />
            <div className="shimmer" style={{ height: "12px", width: "55%", marginBottom: "0.6rem" }} />
            <div className="shimmer" style={{ height: "12px", width: "80%", marginBottom: "0.6rem" }} />
            <div className="shimmer" style={{ height: "12px", width: "40%", }} />
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="card fade-in" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.1em", color: "#c9a84c", textTransform: "uppercase" }}>
                ✦ Generated Email
              </span>
              <button className="copy-btn" onClick={copy}>
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: "1.25rem", paddingBottom: "1.25rem", borderBottom: "1px solid #1f1f1f" }}>
              <label style={{ marginBottom: "0.3rem" }}>Subject</label>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "#f0ede6" }}>
                {result.subject}
              </div>
            </div>

            {/* Body */}
            <div>
              <label style={{ marginBottom: "0.3rem" }}>Body</label>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.82rem", lineHeight: 1.8, color: "#c8c3bb", whiteSpace: "pre-wrap" }}>
                {result.body}
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #1f1f1f", display: "flex", gap: "0.75rem" }}>
              <button className="copy-btn" onClick={compose} style={{ fontSize: "0.75rem" }}>↺ Regenerate</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
