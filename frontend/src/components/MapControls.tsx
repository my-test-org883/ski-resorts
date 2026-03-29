interface MapControlsProps {
  children: React.ReactNode;
}

export function MapControls({ children }: MapControlsProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "12px",
        left: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        zIndex: 10,
      }}
    >
      {children}
    </div>
  );
}
