import MediaGallery from '@/components/MediaGallery';
import { cloudinary } from '@/libs/cloudinary-config';

export default async function Home() {
  const { resources } = await cloudinary.api.resources()
  
  return (
    <div className="h-full mt-6">
      <MediaGallery
        resources={resources}
      />
    </div>
  )
}