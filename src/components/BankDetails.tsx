export function BankDetails() {
  return (
    <div className="no-break">
      <div className="mb-1 text-[11px] font-bold">DATOS BANCARIOS — BANCO INTERBANK</div>
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>
            <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Tipo</th>
            <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Moneda</th>
            <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">N° Cuenta</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 px-2 py-1">Cta Corriente</td>
            <td className="border border-slate-300 px-2 py-1">Soles</td>
            <td className="border border-slate-300 px-2 py-1">200-3008316129</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-2 py-1">CCI</td>
            <td className="border border-slate-300 px-2 py-1">Soles</td>
            <td className="border border-slate-300 px-2 py-1">003-200-003008316129-36</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-2 py-1">Cta Corriente</td>
            <td className="border border-slate-300 px-2 py-1">Dólares</td>
            <td className="border border-slate-300 px-2 py-1">200-3008316136</td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-2 py-1">CCI</td>
            <td className="border border-slate-300 px-2 py-1">Dólares</td>
            <td className="border border-slate-300 px-2 py-1">003-200-003008316136-31</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
