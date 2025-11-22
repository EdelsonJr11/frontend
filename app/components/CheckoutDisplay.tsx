import { CheckoutResponse } from '../../lib/types';

interface CheckoutDisplayProps {
  checkout: CheckoutResponse;
}

export function CheckoutDisplay({ checkout }: CheckoutDisplayProps) {
  const { data } = checkout;

  return (
    <div className="border rounded p-4 space-y-3 bg-gray-50">
      <h3 className="font-semibold text-lg text-black">Detalhes do Pagamento</h3>
      
      <div className="space-y-2">
        <InfoRow label="Status" value={data.status} />
        <InfoRow label="Valor" value={`R$ ${data.valor.toFixed(2)}`} />
        <InfoRow label="Cotas" value={data.cotas.join(', ')} />
        <InfoRow 
          label="Expira em" 
          value={new Date(data.expiraEm).toLocaleString('pt-BR')} 
        />
      </div>

      {(data.qrCode || data.pixPayload) && (
        <div className="pt-2 border-t">
          <p className="text-sm font-medium text-black mb-1">QR Code / Pix Copia e Cola:</p>
          <code className="block break-all text-xs bg-white p-2 rounded border text-black">
            {data.qrCode || data.pixPayload}
          </code>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-black">{label}:</span>
      <span className="text-sm text-black">{value}</span>
    </div>
  );
}
