// utils/userToastMessages.ts
import { toast } from "sonner";

export type ToastType = "success" | "error" | "warning" | "info";

export const userToastMessages = (
    type: ToastType,
    message: string,
    description: string = ""
) => {
    const commonOptions = {
        duration: 2500,
        position: "top-center" as const,
        description,
    };

    switch (type) {
        case "success":
            toast.success(message, commonOptions);
            break;
        case "error":
            toast.error(message, commonOptions);
            break;
        case "warning":
            toast.warning(message, commonOptions);
            break;
        case "info":
            toast(message, commonOptions);
            break;
        default:
            toast(message, commonOptions);
    }
};
