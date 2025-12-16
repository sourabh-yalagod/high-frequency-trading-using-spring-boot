import { AlertCircle } from "lucide-react";

const OrderSummary: React.FC<{
  totalValue: number;
  requiredMargin: number;
  leverage: number;
}> = ({ totalValue, requiredMargin, leverage }) => (
  <>
    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2.5 space-y-1 text-xs">
      <div className="flex justify-between">
        <span className="text-gray-600 dark:text-gray-400">Total</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">${totalValue.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600 dark:text-gray-400">Margin</span>
        <span className="font-semibold text-blue-600 dark:text-blue-400">${requiredMargin.toFixed(2)}</span>
      </div>
    </div>

    {leverage > 20 && (
      <div className="flex items-start gap-1.5 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
        <AlertCircle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-800 dark:text-yellow-200">High leverage warning</p>
      </div>
    )}
  </>
);

export default OrderSummary