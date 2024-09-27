import { cloudinary } from "@/libs/cloudinary-config";

export async function GET (){
    const { resources } = await cloudinary.api.resources()

    return Response.json({ data: resources })
}