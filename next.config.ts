import type { NextConfig } from "next";
import path from "node:path";
import { redirects as siteRedirects } from "./data/redirects";

// Mettre STATIC_EXPORT=true pour générer un site 100% statique (dossier `out/`)
// destiné à un hébergement mutualisé type Hostinger (public_html).
const isStaticExport = process.env.STATIC_EXPORT === "true";

const baseConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

const dynamicConfig: NextConfig = {
  ...baseConfig,
  async redirects() {
    return siteRedirects;
  },
  async rewrites() {
    return [
      {
        source: "/infirmier-a-domicile-:slug",
        destination: "/zones/:slug",
      },
    ];
  },
};

// En export statique : pas de serveur Node, donc redirects/rewrites sont gérés
// par le fichier `.htaccess` (voir out/.htaccess). On désactive aussi
// l'optimisation d'images (pas de service d'optimisation à l'exécution).
const staticConfig: NextConfig = {
  ...baseConfig,
  output: "export",
  trailingSlash: true,
  images: {
    ...baseConfig.images,
    unoptimized: true,
  },
};

export default isStaticExport ? staticConfig : dynamicConfig;
