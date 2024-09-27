import { cloudinary } from '@/libs/cloudinary-config';
import MediaViewer from '@/components/MediaViewer';

async function Resource( {params:{assetId}}: { params: { assetId: string}} ) {
  
  const { resources } = await cloudinary.api.resources_by_asset_ids(assetId)
  
  return (
    <MediaViewer
      resource={resources[0]}
    />
  );
}

export default Resource;