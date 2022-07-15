import Head from "next/head";

const NextHead: React.FC<{ title: string }> = ({ title }) => {
  const __title: string = title || "Unlonely";
  const __description = "Never watch alone again";
  return (
    <Head>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/images/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/images/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/images/favicon-16x16.png"
      />

      <link rel="icon" href="/images/favicon.ico" />

      <title>{__title}</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="description" content={__description} />

      <meta property="og:title" content={__title} />
      <meta property="og:url" content="https://unlonely.xyz" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={__title} />
      <meta property="og:image" content="/images/social_banner.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@bdguan" />
      <meta name="twitter:title" content={__title} />
      <meta name="twitter:description" content="Never watch alone again." />
      <meta name="twitter:creator" content="@bdguan" />
      <meta name="twitter:image" content="https://i.imgur.com/tldMxSw.png" />
    </Head>
  );
};

export default NextHead;
