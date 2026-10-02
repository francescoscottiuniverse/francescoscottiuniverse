import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Francesco Luigi Scotti",
    short_name: "F. L. Scotti",
    description: "Photographer telling stories through art, cultures and fashion.",
    start_url: "/",
    display: "standalone",
    background_color: "#810100",
    theme_color: "#810100",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
