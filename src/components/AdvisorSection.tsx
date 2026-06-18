export function AdvisorSection({
  nombre,
  telefono,
  correo,
}: {
  nombre: string;
  telefono: string;
  correo: string;
}) {
  return (
    <div className="no-break">
      <div className="mb-1 text-xs font-bold">ASESOR COMERCIAL</div>

      <div className="space-y-1 text-xs">
        <div>
          <strong>Nombre:</strong> {nombre || "-"}
        </div>

        <div>
          <strong>Teléfono:</strong> {telefono || "-"}
        </div>

        <div style={{ marginTop: 4 }}>
          <strong>Correo:</strong> {correo || "-"}
        </div>
      </div>
    </div>
  );
}
