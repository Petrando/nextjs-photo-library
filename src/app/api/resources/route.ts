import { cloudinary } from "@/libs/cloudinary-config";

export async function GET (){
    const { resources } = await cloudinary.api.resources_by_tag(String(process.env.NEXT_PUBLIC_CLOUDINARY_LIBRARY_TAG))

    return Response.json({ data: resources })
}