declare module "app-env" {
  interface ENV {
    VITE_TWITCH_CLIENT_ID: string;
  }

  const appEnv: ENV;
  export default appEnv;
}
