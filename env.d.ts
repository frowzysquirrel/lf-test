declare module "app-env" {
  interface ENV {
    VITE_TWITCH_CLIENT_ID: string;
    VITE_MIXPANEL_PROJECT_TOKEN: string;
    VITE_HOTJAR_SITE_ID: number;
  }

  const appEnv: ENV;
  export default appEnv;
}
