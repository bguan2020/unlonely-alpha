import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentInitialProps,
  DocumentContext,
} from "next/document";
import React from "react";
import { ColorModeScript } from "@chakra-ui/react";

import chakraTheme from "../styles/theme";

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
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Anonymous+Pro&family=DM+Sans&display=swap"
            rel="stylesheet"
          />
        </Head>

        <body>
          <ColorModeScript
            initialColorMode={chakraTheme.config.initialColorMode}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
