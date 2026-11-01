/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CARTO_API_KEY?: string;
  readonly VITE_AWS_LOCATION_API_KEY?: string;
  readonly VITE_AWS_REGION?: string;
  readonly VITE_AWS_MAP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

