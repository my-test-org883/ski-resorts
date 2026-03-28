interface LoadingScreenProps {
  message: string;
  error?: string | null;
  onRetry?: () => void;
}

export function LoadingScreen({ message, error, onRetry }: LoadingScreenProps) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-primary)",
        gap: "24px",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "48px" }}>⛷️</div>
      <h1
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "var(--text-primary)",
        }}
      >
        Ski Resort Finder
      </h1>
      {error ? (
        <>
          <p style={{ color: "var(--color-poor)", fontSize: "14px", maxWidth: "400px" }}>{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                background: "var(--accent-blue)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          )}
        </>
      ) : (
        <>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{message}</p>
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid var(--bg-tertiary)",
              borderTopColor: "var(--accent-blue)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </div>
  );
}
