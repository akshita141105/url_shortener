"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function truncateUrl(url, maxLen = 50) {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen) + "…";
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [showAlias, setShowAlias] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [urls, setUrls] = useState([]);
  const [copied, setCopied] = useState("");
  const [toast, setToast] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Auth guard: redirect to /login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const fetchUrls = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/urls`, {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json();
        setUrls(data.data || []);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUrls();
    }
  }, [user, fetchUrls]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!url.trim()) {
      setError("Please enter a URL to shorten.");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL (include https://).");
      return;
    }

    setLoading(true);

    try {
      const body = { originalUrl: url.trim() };
      if (customAlias.trim()) body.customAlias = customAlias.trim();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/urls`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setResult(data.data);
      setUrl("");
      setCustomAlias("");
      setShowAlias(false);
      fetchUrls();
      showToast("🎉 Link shortened successfully!");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      showToast("Failed to copy");
    }
  };

  const handleDelete = async (code) => {
    if (deleteConfirm !== code) {
      setDeleteConfirm(code);
      setTimeout(() => setDeleteConfirm(""), 3000);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/urls/${code}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        fetchUrls();
        showToast("🗑️ Link deleted");
        if (result && result.shortCode === code) {
          setResult(null);
        }
      } else {
        showToast("Failed to delete link");
      }
    } catch {
      showToast("Network error");
    } finally {
      setDeleteConfirm("");
    }
  };

  const getShortUrl = (code) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const base = apiUrl.replace(/\/api\/?$/, ""); // strip trailing /api
    return `${base}/${code}`;
  };

  // While checking auth status, or if not logged in (about to redirect), show nothing/loading
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="pt-16 pb-8 md:pt-24 md:pb-12 text-center px-4">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-4xl">🔗</span>
            <h1
              className="text-5xl md:text-7xl font-bold tracking-tight"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #06b6d4, #f472b6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Sniplink
            </h1>
          </div>
          <p className="text-lg md:text-xl mt-3" style={{ color: "var(--text-muted)" }}>
            Shorten your links, amplify your reach
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pb-16">
        {/* Shorten Form */}
        <section className="glass-card p-6 md:p-8 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <input
                type="text"
                className="url-input"
                placeholder="Paste your long URL here..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                disabled={loading}
                autoFocus
              />

              {/* Custom alias toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAlias(!showAlias)}
                  className="text-sm font-medium flex items-center gap-1.5 transition-colors duration-200"
                  style={{ color: "var(--primary)" }}
                >
                  <span
                    className="inline-block transition-transform duration-200"
                    style={{ transform: showAlias ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    ▶
                  </span>
                  Custom alias
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    (optional)
                  </span>
                </button>

                {showAlias && (
                  <div className="mt-3" style={{ animation: "slideUp 0.3s ease" }}>
                    <input
                      type="text"
                      className="url-input"
                      placeholder="my-custom-link"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                      disabled={loading}
                      style={{ fontSize: "14px", padding: "10px 14px" }}
                    />
                    <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      Only letters, numbers, hyphens, and underscores
                    </p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && <p className="error-msg">{error}</p>}

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Shortening...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    Shorten URL
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Result */}
        {result && (
          <section className="result-card mb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: "var(--success)" }}>
                  ✨ Your shortened link
                </p>
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg md:text-xl font-semibold break-all transition-colors duration-200 hover:underline"
                  style={{ color: "var(--primary)" }}
                >
                  {result.shortUrl}
                </a>
                <p className="mt-2 text-sm break-all" style={{ color: "var(--text-muted)" }}>
                  {truncateUrl(result.originalUrl || url, 80)}
                </p>
              </div>
              <button
                className="btn-copy flex-shrink-0"
                onClick={() => handleCopy(getShortUrl(result.shortCode), "result")}
              >
                {copied === "result" ? "✓ Copied!" : "Copy"}
              </button>
            </div>
          </section>
        )}

        {/* URL History */}
        <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Your Links</h2>
              {urls.length > 0 && <span className="stats-badge">{urls.length}</span>}
            </div>
            {urls.length > 0 && (
              <button
                onClick={fetchUrls}
                className="text-sm transition-colors duration-200"
                style={{ color: "var(--text-muted)" }}
                title="Refresh"
              >
                ↻ Refresh
              </button>
            )}
          </div>

          {urls.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <div className="text-5xl mb-4">✂️</div>
              <p className="text-lg font-medium mb-1">No links yet</p>
              <p style={{ color: "var(--text-muted)" }}>
                Shorten your first URL to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {urls.map((item) => (
                <div key={item.shortCode} className="url-item">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* URL info */}
                    <div className="min-w-0 flex-1">
                      <a
                        href={getShortUrl(item.shortCode)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-sm md:text-base transition-colors duration-200 hover:underline"
                        style={{ color: "var(--primary)" }}
                      >
                        {getShortUrl(item.shortCode)}
                      </a>
                      <p
                        className="text-xs md:text-sm mt-1 truncate"
                        style={{ color: "var(--text-muted)" }}
                        title={item.originalUrl}
                      >
                        {truncateUrl(item.originalUrl, 60)}
                      </p>
                    </div>

                    {/* Meta & actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Click count */}
                      <span
                        className="text-xs flex items-center gap-1 mr-1"
                        style={{ color: "var(--text-muted)" }}
                        title="Total clicks"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {item.clicks ?? 0}
                      </span>

                      {/* Time ago */}
                      <span
                        className="text-xs mr-1 hidden sm:inline"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {timeAgo(item.createdAt)}
                      </span>

                      {/* Copy */}
                      <button
                        className="btn-copy"
                        onClick={() => handleCopy(getShortUrl(item.shortCode), item.shortCode)}
                      >
                        {copied === item.shortCode ? "✓" : "Copy"}
                      </button>

                      {/* Delete */}
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(item.shortCode)}
                      >
                        {deleteConfirm === item.shortCode ? "Sure?" : "🗑"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        Built with ♥ — <span style={{ color: "var(--primary)" }}>Sniplink</span>
      </footer>

      {/* Toast */}
      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  );
}