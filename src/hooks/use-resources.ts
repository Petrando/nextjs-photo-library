import { useQueryClient, useQuery } from '@tanstack/react-query';
import { CloudinaryResource } from "@/app/types";

interface IUseResources {
    initialData?: Array<CloudinaryResource>;
    disableFetch?: boolean;
    tag?: string;
}

export const useResources = (option?: IUseResources) => {
    const queryClient = useQueryClient()
    const { disableFetch = false } = option || {}
    
    const { data: resources } = useQuery({
        queryKey: [ 'resources', option?.tag ],
        queryFn: async () => {
            const { data } = await fetch('/api/resources').then(r => r.json())
            return data
        },
        initialData:option?.initialData,
        enabled: !disableFetch
    })
    
    const addResources = ( results: Array<CloudinaryResource>) => {        
        queryClient.setQueryData(['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_LIBRARY_TAG)], (old: Array<CloudinaryResource>) => {
            return [ ...results, ...old ]
        })
        queryClient.invalidateQueries({
            queryKey: ['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_LIBRARY_TAG)]
        })
    }

    return { resources, addResources }
}