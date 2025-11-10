import { useQueryClient } from "@tanstack/react-query"

const useUpdateTanstackCache = () => {
    const queryClent = useQueryClient()
    function invalidateCache(key: string) {
        queryClent.invalidateQueries({ queryKey: [key] })
    }
    return { invalidateCache };
}

export default useUpdateTanstackCache