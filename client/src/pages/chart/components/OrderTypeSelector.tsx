const OrderTypeSelector: React.FC<{
    orderType: string;
    order: any;
    onChange: (type: string) => void;
}> = ({ orderType, onChange, order }) => (
    <div className="grid grid-cols-2 gap-2">
        {Object.values(order.type).map((type:any) => (
            <button
                key={type}
                onClick={() => onChange(type)}
                className={`py-1.5 text-xs font-semibold rounded transition-all ${orderType === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
            >
                {type}
            </button>
        ))}
    </div>
);
export default OrderTypeSelector