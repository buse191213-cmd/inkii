import { getHomeImages } from "@/lib/home-images";
import HomeImagesManager from "./HomeImagesManager";

export const dynamic = "force-dynamic";

export default async function HomepageAdminPage() {
  const images = await getHomeImages();
  return <HomeImagesManager images={images} />;
}
