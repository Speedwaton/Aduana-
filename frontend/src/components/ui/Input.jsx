export default function Input({ label, value, onChange, type = "text", options, required, placeholder, textarea }) {
  const style = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #d0d5e0", fontSize: 14, outline: "none", boxSizing: "border-box" };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, color: "#5a6278", marginBottom: 4 }}>
        {label}{required && <span style={{ color: "#E24B4A" }}> *</span>}
      </label>
      {options ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} style={style}>
          <option value="">Seleccionar...</option>
          {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
          ))}
        </select>
      ) : textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...style, resize: "vertical" }} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={style} />
      )}
    </div>
  );
}
