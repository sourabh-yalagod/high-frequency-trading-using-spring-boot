import { Loader } from "lucide-react";

const ActionButtons: React.FC<{
    isSubmitting: boolean;
    quantity: string;
    orderSide: string;
    orderType: string;
    onSubmit: () => void;
    onReset: () => void;
    order: any
}> = ({ isSubmitting, quantity, orderSide, orderType, onSubmit, onReset, order }) => {

    return <div className="flex gap-2 pt-1">
        <button
            onClick={onReset}
            disabled={isSubmitting}
            className="flex-1 py-2 text-xs rounded font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
            Reset
        </button>
        <button
            onClick={onSubmit}
            disabled={isSubmitting || !quantity || parseFloat(quantity) <= 0}
            className={`flex-1 py-2 px-2 text-xs rounded font-semibold text-white transition-all flex items-center justify-center gap-1 ${orderSide === order.side.buy
                ? "bg-green-600 hover:bg-green-700 disabled:bg-green-600"
                : "bg-red-600 hover:bg-red-700 disabled:bg-red-600"
                } ${isSubmitting || !quantity ? "opacity-60 cursor-not-allowed" : ""}`}
        >
            {isSubmitting && <Loader className="w-3 h-3 animate-spin" />}
            {isSubmitting ? "Processing..." : `${orderSide} ${orderType}`}
        </button>
    </div>
}

export default ActionButtons