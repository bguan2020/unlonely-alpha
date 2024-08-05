const PINATA_JWT = String(process.env.NEXT_PUBLIC_PINATA_JWT);
 
export async function pinFileWithPinata(file: File) {
  const data = new FormData();
  data.append("file", file);
 
  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: data,
  });
 
  const result = (await res.json()) as { IpfsHash: string };
 
  return `ipfs://${result.IpfsHash}`;
}
 
export async function pinJsonWithPinata(json: object) {
  const data = JSON.stringify({
    pinataContent: json,
    pinataMetadata: {
      name: "metadata.json",
    },
  });
 
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: data,
  });
 
  const result = (await res.json()) as { IpfsHash: string };
 
  return `ipfs://${result.IpfsHash}`;
}

export async function createFileBlobAndPinWithPinata(link: string, fileName: string, fileType: string) {
  if (!link) return {file: null, pinRes: null};
  const res = await fetch(link);
  const blob = await res.blob();
  const file = new File([blob], fileName, { type: fileType });
  const pinRes = await pinFileWithPinata(file);
  return { file, pinRes };
}