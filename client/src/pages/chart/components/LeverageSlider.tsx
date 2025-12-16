const LeverageSlider: React.FC<{
    leverage: number;
    onChange: (leverage: number) => void;
}> = ({ leverage, onChange }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium dark:text-gray-700 text-gray-300">Leverage</label>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-bold">
                {leverage}x
            </span>
        </div>
        <input
            type="range"
            min={1}
            max={100}
            value={leverage}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded appearance-none cursor-pointer accent-blue-600"
        />
    </div>
);
export default LeverageSlider;