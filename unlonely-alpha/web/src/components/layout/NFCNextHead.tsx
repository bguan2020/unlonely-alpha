import Head from "next/head";
import centerEllipses from "../../utils/centerEllipses";

const NFCNextHead: React.FC<{
  nfc: any;
}> = ({ nfc }) => {
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

      <title>{nfc.title} | NFC</title>
      <meta
        name="viewport"
        content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"
      />
      <meta
        name="description"
        content={`${
          nfc.owner.username
            ? nfc.owner.username
            : centerEllipses(nfc.owner.address, 7)
        }'s NFC: ${nfc.title}`}
      />

      <meta property="og:title" content={`${nfc.title} | NFC`} />
      <meta property="og:url" content={`https://unlonely.app/nfc/${nfc.id}`} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={`${nfc.title} | NFC`} />
      <meta
        property="og:image"
        content={
          nfc.videoThumbnail
            ? nfc.videoThumbnail
            : "https://i.seadn.io/gae/lOQazueKW_lyerF9H7AUGVWoe8xyisnU4m8JMrj6bivAVYnNMn8dLAoH1--HQsv5GMjSkWLhndb_LsovjbjJs-pouo-xgjLlW_n1?w=500&auto=format"
        }
      />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@bdguan" />
      <meta name="twitter:title" content={`${nfc.title} | NFC`} />
      <meta
        name="twitter:description"
        content="Your cozy space on the internet. View live channels & start streaming today."
      />
      <meta name="twitter:creator" content="@bdguan" />
      <meta
        name="twitter:image"
        content={
          nfc.videoThumbnail ? nfc.videoThumbnail : "/images/social_banner.png"
        }
      />
    </Head>
  );
};

export default NFCNextHead;
