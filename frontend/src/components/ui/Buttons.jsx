export function PrimaryButton({ children, onClick, style, disabled, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#9bbbd8" : "#185FA5",
        color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px",
        fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, ...style,
      }}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, style, disabled, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ background: "#f4f6fa", border: "1px solid #e2e7f0", borderRadius: 8, padding: "9px 18px", fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", ...style }}
    >
      {children}
    </button>
  );
}

export function SearchBar({ value, onChange, placeholder, style }) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d0d5e0", fontSize: 14, boxSizing: "border-box", ...style }}
    />
  );
}
