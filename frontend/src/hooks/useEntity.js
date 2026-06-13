
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService.js';

export const useEntity = (resource) => {
    const queryClient = useQueryClient();
    const service = apiService(resource);

    // Helper centralizado para limpiar cachés dependientes
    const invalidateDependencies = () => {
        queryClient.invalidateQueries({ queryKey: [resource] });

        if (resource === 'entries' || resource === 'exits' || resource === 'products') {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            queryClient.invalidateQueries({ queryKey: ['exits'] });
        }
    };

    return {
        // Petición de lista completa
        list: useQuery({
            queryKey: [resource],
            queryFn: () => service.getAll(),
        }),

        // Registro de nuevos elementos en cada entidad
        create: useMutation({
            mutationFn: (payload) => service.create(payload),
            onSuccess: () => invalidateDependencies()
        }),

        // Actualización de registros existentes
        update: useMutation({
            mutationFn: ({ id, data }) => service.update({ id, data }),
            onSuccess: () => invalidateDependencies()
        }),

        // Eliminación física/lógica de registros
        remove: useMutation({
            mutationFn: (id) => service.delete(id),
            onSuccess: () => invalidateDependencies()
        })
    };
};