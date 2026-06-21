import { useEffect, useState } from "react";
import { Car, Plus, ChevronRight, RefreshCw } from "lucide-react";
import { filaService } from "../services/filaService";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { PrimaryButton, SecondaryButton } from "../components/ui/Buttons";
import Spinner from "../components/ui/Spinner";

// Cola virtual de vehículos: listar, agregar y atender (avanza la fila y
// dispara la revisión en ms-operaciones).
export default function FilaVirtual({ notify }) {
  const [fila, setFila] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [modal, setModal] = useState(false);
  const [atendiendo, setAtendiendo] = useState(false);
  const [form, setForm] = useState({ patente: "", conductor: "", tipo: "Auto Particular" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const cargar = async (tipo = "") => {
    setLoading(true);
    try {
      const data = tipo ? await filaService.porTipo(tipo) : await filaService.listar();
      setFila(Array.isArray(data) ? data : []);
    } catch (e) {
      notify("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, []);

  const aplicarFiltro = (tipo) => { setFiltro(tipo); cargar(tipo); };

  const agregar = async () => {
    if (!form.patente || !form.conductor) return notify("error", "Patente y conductor son obligatorios.");
    try {
      await filaService.agregar(form);
      notify("success", `Vehículo ${form.patente} ingresado a la fila.`);
      setModal(false);
      setForm({ patente: "", conductor: "", tipo: "Auto Particular" });
      cargar(filtro);
    } catch (e) {
      notify("error", e.message);
    }
  };

  const atender = async () => {
    setAtendiendo(true);
    try {
      const msg = await filaService.atender();
      const permitido = typeof msg === "string" && msg.includes("PERMITIDO");
      notify(permitido ? "success" : "info", String(msg));
      cargar(filtro);
    } catch (e) {
      notify("error", e.message);
    } finally {
      setAtendiendo(false);
    }
  };

  return (
    <div style={{ padding: 28 }}>
      {/* Barra superior */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["", "Camión", "Auto Particular"].map((t) => (
            <button
              key={t || "todos"}
              onClick={() => aplicarFiltro(t)}
              style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600,
                border: "1px solid " + (filtro === t ? "#185FA5" : "#e2e7f0"),
                background: filtro === t ? "#185FA5" : "#fff",
                color: filtro === t ? "#fff" : "#6b7c93",
              }}
            >
              {t || "Todos"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <SecondaryButton onClick={() => cargar(filtro)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={14} /> Actualizar
          </SecondaryButton>
          <PrimaryButton onClick={() => setModal(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={15} /> Agregar
          </PrimaryButton>
          <button
            onClick={atender}
            disabled={atendiendo || fila.length === 0}
            style={{ display: "flex", alignItems: "center", gap: 6, background: fila.length === 0 ? "#bfe6d6" : "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 14, fontWeight: 600, cursor: fila.length === 0 ? "not-allowed" : "pointer" }}
          >
            {atendiendo ? <Spinner size={15} color="#fff" /> : <ChevronRight size={15} />} Atender primero
          </button>
        </div>
      </div>

      {/* Lista de la fila */}
      <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontWeight: 700, color: "#0c1f3f", fontSize: 14 }}>Vehículos en espera</span>
          <span style={{ fontSize: 12.5, color: "#9ab5cc" }}>{fila.length} en fila</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 30 }}><Spinner size={26} /></div>
        ) : fila.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30, fontSize: 13, color: "#9ab5cc" }}>No hay vehículos en la fila.</div>
        ) : (
          fila.map((v, i) => (
            <div key={v.patente + i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 10px", borderBottom: i < fila.length - 1 ? "1px solid #f4f6fa" : "none" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: i === 0 ? "#185FA5" : "#eaf2fb", color: i === 0 ? "#fff" : "#185FA5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "#f4f6fa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Car size={17} color="#6b7c93" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0c1f3f", letterSpacing: 0.5 }}>{v.patente}</div>
                <div style={{ fontSize: 12.5, color: "#9ab5cc" }}>{v.conductor}</div>
              </div>
              <span style={{ background: "#f4f6fa", color: "#6b7c93", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{v.tipo}</span>
              {i === 0 && <span style={{ fontSize: 11, color: "#1D9E75", fontWeight: 700 }}>SIGUIENTE</span>}
            </div>
          ))
        )}
      </div>

      {/* Modal agregar */}
      {modal && (
        <Modal title="Agregar vehículo a la fila" onClose={() => setModal(false)}>
          <Input label="Patente" value={form.patente} onChange={(v) => set("patente", v)} placeholder="AB-123-CD" required />
          <Input label="Conductor" value={form.conductor} onChange={(v) => set("conductor", v)} required />
          <Input label="Tipo de vehículo" value={form.tipo} onChange={(v) => set("tipo", v)} options={["Auto Particular", "Camión", "Bus", "Moto"]} required />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
            <SecondaryButton onClick={() => setModal(false)}>Cancelar</SecondaryButton>
            <PrimaryButton onClick={agregar}>Agregar a la fila</PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}
