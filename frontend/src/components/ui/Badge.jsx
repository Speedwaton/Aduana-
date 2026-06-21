import { ESTADO_COLORS, labelEnum } from "../../data/constants";

export default function Badge({ estado }) {
  const c = ESTADO_COLORS[estado] || { bg: "#f1efe8", text: "#5F5E5A" };
  return (
    <span style={{ background: c.bg, color: c.text, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
      {labelEnum(estado)}
    </span>
  );
}
