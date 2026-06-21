export default function Spinner({ size = 22, color = "#185FA5" }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size, height: size,
        border: `${Math.max(2, size / 10)}px solid #e2e7f0`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}

export function CenteredLoader({ label = "Cargando..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48, color: "#9ab5cc" }}>
      <Spinner size={30} />
      <span style={{ fontSize: 13 }}>{label}</span>
    </div>
  );
}
