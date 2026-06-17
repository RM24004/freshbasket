import { useQuery } from "@tanstack/react-query";
import api from "../services/axiosConfig.js";

export const useStockAlerts = (options = {}) => {
    return useQuery({
        queryKey: ["lowStockAlerts"],
        queryFn: async () => {
            const response = await api.get("/api/products/alerts/low-stock");
            return response.data;
        },
        refetchInterval: 60000,
        staleTime: 30000,
        ...options
    });
};