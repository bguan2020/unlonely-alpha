import Head from "next/head";

const NextHead: React.FC<{
  title: string;
  image: string;
  description: string;
  pageUrl?: string;
}> = ({ title, image, description, pageUrl }) => {
  const __title = `Unlonely${title ? ` | ${title}` : ""}`;
  const __image =
    image === ""
      ? "https://unlonely.app/images/social_banner.png"
      : `https://unlonely.app${image}`;
  const __description =
    description === ""
      ? "Your cozy space on the internet. View live channels & start streaming today."
      : description;
  const __pageUrl = pageUrl ?? "";
  return (
    <Head>
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
        content="width=device-width, initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"
      />
      <meta name="description" content={__description} />

      <meta property="og:title" content={__title} />
      <meta property="og:url" content={`https://unlonely.app${__pageUrl}`} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={__title} />
      <meta property="og:image" content={__image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@bdguan" />
      <meta name="twitter:title" content={__title} />
      <meta name="twitter:description" content={__description} />
      <meta name="twitter:creator" content="@bdguan" />
      <meta name="twitter:image" content={__image} />
    </Head>
  );
};

export default NextHead;
