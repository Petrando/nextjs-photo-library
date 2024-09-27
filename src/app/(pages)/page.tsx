import MediaGallery from '@/components/MediaGallery';
import { cloudinary } from '@/libs/cloudinary-config';

export default async function Home() {
  const { resources } = await cloudinary.api.resources_by_tag('media')
  
  return (
    <div className="h-full mt-6">
      <MediaGallery
        resources={resources}
        tag={ String(process.env.NEXT_PUBLIC_CLOUDINARY_LIBRARY_TAG) }
      />
    </div>
  )
}