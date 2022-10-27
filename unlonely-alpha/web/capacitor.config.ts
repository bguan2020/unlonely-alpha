import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "Unlonely",
  webDir: "out",
  bundledWebRuntime: false,
  server: {
    url: "http://192.168.x.xx:3000",
    cleartext: true,
  },
};

export default config;
