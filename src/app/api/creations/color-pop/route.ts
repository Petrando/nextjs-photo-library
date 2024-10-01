import { cloudinary } from "@/libs/cloudinary-config";
import { getCldImageUrl } from "next-cloudinary";

export async function POST (req: Request){
    const { publicId } = await req.json()
    
    const bgRemovedUrl = getCldImageUrl({
        src: publicId, removeBackground: true, format: 'png', 
        quality: 'default', version: Date.now()
    })

    const checkStatus = async (url: string) => {
        const response = await fetch(url)

        if(response.ok) {
            return true
        }

        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(undefined)
            }, 500)
        })

        return await checkStatus(url)
    }

    await checkStatus(bgRemovedUrl)
        
    const uploadOptions: Record<string, string | boolean | Array<string>> = {}
    
    uploadOptions.tags = [ 'background-removed', `original-${publicId}` ]
    
    const result = await cloudinary.uploader.upload(bgRemovedUrl, uploadOptions)
    
    const creationUrl = getCldImageUrl({
        width: 1200,
        height: 1200,
        src: publicId, 
        crop: {
            type: 'fill', source: true, gravity: 'center'
        },
        grayscale: true,
        overlays: [{
            publicId: result.public_id
        }],
        version: Date.now()
    })

    return Response.json({ data: creationUrl })
}