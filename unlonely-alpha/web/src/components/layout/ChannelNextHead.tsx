import Head from "next/head";

import centerEllipses from "../../utils/centerEllipses";

const ChannelNextHead: React.FC<{
  channel: any;
}> = ({ channel }) => {
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

      <title>{channel.name}</title>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0,"
      />
      <meta
        name="description"
        content={`${
          channel.owner.username
            ? channel.owner.username
            : centerEllipses(channel.owner.address, 7)
        }'s Unlonely Channel!`}
      />

      <meta
        property="og:title"
        content={`${channel.slug}'s channel | ${channel.name}`}
      />
      <meta
        property="og:url"
        content={`https://unlonely.app/channel/${channel.slug}`}
      />
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={channel.name} />
      <meta
        property="og:image"
        content={"https://unlonely.app/images/social_banner.png"}
      />
      <meta property="og:description" content={channel.description} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@bdguan" />
      <meta name="twitter:title" content={channel.name} />
      <meta name="twitter:description" content={channel.description} />
      <meta name="twitter:creator" content="@bdguan" />
      <meta
        name="twitter:image"
        content={"https://unlonely.app/images/social_banner.png"}
      />
    </Head>
  );
};

export default ChannelNextHead;
