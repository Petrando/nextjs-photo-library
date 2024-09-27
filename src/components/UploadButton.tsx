'use client'
import { CldUploadButton, CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Upload } from "lucide-react";
import { useResources } from "@/hooks/use-resources";
import { CloudinaryResource } from "@/app/types";

const UploadButton = () => {
    const { addResources} = useResources({ disableFetch: true })

    const handleOnSuccess = (results: CloudinaryUploadWidgetResults) => {        
        addResources([ results.info as CloudinaryResource ])
    }

    return (
        <CldUploadButton 
            signatureEndpoint="/api/signed-cloudinary-params"
            options={{
                autoMinimize: true,
                tags: [ String(process.env.NEXT_PUBLIC_CLOUDINARY_LIBRARY_TAG) ]
            }}
            onSuccess={handleOnSuccess}
        >
            <span className="flex gap-2 items-center">
                <Upload className="w-4 h-4" />
            </span>
        </CldUploadButton>
    )
}

export default UploadButton