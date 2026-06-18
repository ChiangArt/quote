export function NotesSection() {
  return (
    <div className="no-break">
      <div className="mb-1 text-xs font-bold">Nota:</div>
      <ol className="list-decimal space-y-0.5 pl-5 text-xs">
        <li>
          El cliente deberá coordinar con su ejecutivo de ventas el plazo de
          entrega de la mercadería.
        </li>
        <li>
          El cliente debe buscar su unidad de transporte para cargar sus
          materiales.
        </li>
        <li>
          No se aceptan cambios ni devoluciones una vez pagada la mercadería.
        </li>
        <li>
          Por disposición del Ministerio de Transportes, el camión cargará de
          acuerdo a pesos y medidas que figuran en la tarjeta de propiedad. Por
          el cual, el cliente al momento de programar sus despachos, confirmará
          los datos de la empresa de transporte, del conductor (Nombre y DNI) y
          de la unidad (Nº de placas y capacidad).
        </li>
        <li>
          Documentos que deberán presentar del vehículo: Tarjeta de propiedad,
          certificado de habilitación, Guia de Remisión Transportista.
        </li>
        <li>
          La empresa no se hace responsable por daños, pérdidas o perjuicios que
          puedan ocurrir durante el transporte de la mercadería una vez
          entregada al cliente o a su transportista.
        </li>
      </ol>
    </div>
  );
}
