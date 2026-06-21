import { useEffect } from "react";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

const STYLES = {
  success: { bg: "#e1f5ee", border: "#1D9E75", text: "#0F6E56", Icon: CheckCircle },
  error: { bg: "#fcebeb", border: "#E24B4A", text: "#A32D2D", Icon: AlertCircle },
  info: { bg: "#eaf2fb", border: "#185FA5", text: "#185FA5", Icon: Info },
};

// Notificación flotante que se autodescarta.
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const s = STYLES[toast.type] || STYLES.info;

  return (
    <div
      style={{
        position: "fixed", top: 20, right: 20, zIndex: 2000,
        display: "flex", alignItems: "flex-start", gap: 10,
        background: s.bg, border: `1px solid ${s.border}`, color: s.text,
        padding: "13px 16px", borderRadius: 10, maxWidth: 380,
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)", animation: "slideIn 0.25s ease",
      }}
    >
      <s.Icon size={18} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 13.5, lineHeight: 1.45 }}>{toast.msg}</span>
    </div>
  );
}
