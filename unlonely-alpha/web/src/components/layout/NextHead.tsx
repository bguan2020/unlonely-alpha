import Head from "next/head";

const NextHead: React.FC<{ title: string, image: string, description: string }> = ({ title, image, description }) => {
  const __title: string = title || "Unlonely";
  const __image = image === "" ? "/images/social_banner.png" : image;
  const __description = description === "" ? "Never watch alone again" : description;
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
      <meta
        name="viewport"
        content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"
      />
      <meta name="description" content={__description} />

      <meta property="og:title" content={__title} />
      <meta property="og:url" content="https://unlonely.app" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={__title} />
      <meta property="og:image" content={__image} key="image"/>

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@bdguan" />
      <meta name="twitter:title" content={__title} />
      <meta name="twitter:description" content="Never watch alone again." />
      <meta name="twitter:creator" content="@bdguan" />
      <meta name="twitter:image" content="https://i.imgur.com/7Uqq9IB.png" />
    </Head>
  );
};

export default NextHead;
