import { useQueryClient, useQuery } from '@tanstack/react-query';
import { CloudinaryResource } from "@/app/types";

interface IUseResources {
    initialData?: Array<CloudinaryResource>;
}

export const useResources = (option?: IUseResources) => {
    const queryClient = useQueryClient()
    
    const { data: resources } = useQuery({
        queryKey: [ 'resources' ],
        queryFn: async () => {
            const { data } = await fetch('/api/resources').then(r => r.json())
            return data
        },
        initialData:option?.initialData
    })
    
    const addResources = ( results: Array<CloudinaryResource>) => {        
        queryClient.setQueryData(['resources'], (old: Array<CloudinaryResource>) => {
            return [ ...results, ...old ]
        })
    }

    return { resources, addResources }
}