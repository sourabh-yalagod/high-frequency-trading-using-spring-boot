import { useState } from "react";
import { qnaData } from "../../../utils/assetConstant";
import { Minus, Plus } from "lucide-react";

const Qna = () => {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="py-6 space-y-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white">
                All You Need to Know
            </h2>

            <div className="space-y-4">
                {qnaData.map((item: any) => (
                    <div
                        key={item.id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all"
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === item.id ? null : item.id)}
                            className="w-full flex items-center justify-between px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 bg-yellow-400 dark:bg-yellow-500 rounded-lg flex items-center justify-center text-gray-900 font-bold">
                                    {item.id}
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white text-lg">
                                    {item.question}
                                </span>
                            </div>
                            {openIndex === item.id ? (
                                <Minus className="text-gray-600 dark:text-gray-400 flex-shrink-0" size={24} />
                            ) : (
                                <Plus className="text-gray-600 dark:text-gray-400 flex-shrink-0" size={24} />
                            )}
                        </button>

                        <div
                            className={`overflow-hidden transition-all duration-300 ${openIndex === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <div className="p-3 pl-16 text-gray-700 dark:text-gray-300">
                                {item.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Qna;