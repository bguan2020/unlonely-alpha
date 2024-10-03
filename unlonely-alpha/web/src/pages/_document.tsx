import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentInitialProps,
  DocumentContext,
} from "next/document";
import React from "react";
// import { ColorModeScript } from "@chakra-ui/react";

// import chakraTheme from "../styles/theme";
import { GA_TRACKING_ID } from "../utils/gtag";

// This Next.js document exists only for Chakra color mode:
// https://chakra-ui.com/docs/features/color-mode#for-nextjs
export default class UnlonelyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render(): JSX.Element {
    return (
      <Html>
        <Head>
          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
          `,
            }}
          />
          <link rel="manifest" href="/manifest.webmanifest" />
          <script src="https://cdnjs.cloudflare.com/ajax/libs/video.js/7.6.6/video.min.js"></script>

          {/*
          commented out because we do not want these to automatically load on every page
          
          <script src="https://player.live-video.net/1.2.0/amazon-ivs-videojs-tech.min.js"></script>
          <script src="https://player.live-video.net/1.2.0/amazon-ivs-quality-plugin.min.js"></script> */}
        </Head>
        <body>
          {/* <ColorModeScript
            initialColorMode={chakraTheme.config.initialColorMode}
          /> */}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
