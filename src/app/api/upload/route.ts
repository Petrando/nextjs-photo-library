import { cloudinary } from "@/libs/cloudinary-config";

export async function POST (req: Request){
    const { url, publicId, tags = [] } = await req.json()
    
    const uploadOptions: Record<string, string | boolean | Array<string>> = {}

    if(typeof publicId === 'string'){
        uploadOptions.public_id = publicId
        uploadOptions.invalidate = true
    }else {
        uploadOptions.tags = [ 
            String(process.env.NEXT_PUBLIC_CLOUDINARY_LIBRARY_TAG),
            ...tags 
        ]
    }

    const result = await cloudinary.uploader.upload(url, uploadOptions)

    return Response.json({ data: result })
}