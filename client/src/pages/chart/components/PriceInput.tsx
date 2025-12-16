import { DollarSign } from "lucide-react";

const PriceInput: React.FC<{
    orderType: string;
    price: string;
    order: any;
    onChange: (price: string) => void;
}> = ({ orderType, price, onChange, order }) => {
    if (orderType !== order.type.limit) return null;

    return (
        <div>
            <label className="flex items-center text-xs font-medium dark:text-gray-700 text-gray-300 mb-1">
                <DollarSign className="w-3 h-3 mr-1" />
                Price
            </label>
            <input
                type="number"
                value={price}
                step="0.01"
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 outline-none"
                placeholder="0.00"
            />
        </div>
    );
};

export default PriceInput