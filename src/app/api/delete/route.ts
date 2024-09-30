import { cloudinary } from "@/libs/cloudinary-config";

export async function DELETE (req: Request){
    const { publicId } = await req.json()    

    const result = await cloudinary.api.delete_resources([ publicId ])

    return Response.json({ data: result })
}