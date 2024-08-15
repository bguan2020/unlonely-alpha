const PINATA_JWT = String(process.env.NEXT_PUBLIC_PINATA_JWT);

export async function pinFileWithPinata(file: File) {
  const data = new FormData();
  data.append("file", file);

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: data,
    });

    const result = (await res.json()) as { IpfsHash: string | undefined };
    console.log("pinFileWithPinata result: ", result);
    return { error: undefined, ipfsHash: result.IpfsHash };
  } catch (e) {
    console.log("pinFileWithPinata error: ", file.name, e);
    return { error: JSON.stringify(e), ipfsHash: undefined };
  }
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

  const result = (await res.json()) as { IpfsHash: string | undefined };

  return result.IpfsHash;
}

export async function createFileBlobAndPinWithPinata(
  link: string,
  fileName: string,
  fileType: string
) {
  if (!link)
    return { file: undefined, pinRes: undefined, error: "No link provided" };
  try {
    console.log("createFileBlobAndPinWithPinata link: ", link);
    const res = await fetch(link);
    const blob = await res.blob();
    const file = new File([blob], fileName, { type: fileType });
    console.log(
      "createFileBlobAndPinWithPinata calling pinFileWithPinata with file: ",
      file
    );
    const { error, ipfsHash } = await pinFileWithPinata(file);
    if (error) {
      return { file, pinRes: undefined, error };
    }
    console.log("createFileBlobAndPinWithPinata pinRes: ", ipfsHash);
    return { file, pinRes: ipfsHash ? `ipfs://${ipfsHash}` : undefined };
  } catch (e) {
    console.error(e);
    return {
      file: undefined,
      pinRes: undefined,
      error: `catch error from createFileBlobAndPinWithPinata: ${e}`,
    };
  }
}
