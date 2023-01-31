export const uploadToIPFS = async (data: { description: string; external_url: string; image: string; name: string; attributes: any[] }) => {
  const formData = new FormData();
  formData.append("file", JSON.stringify(data));

  const response = await axios.post("https://ipfs.infura.io:5001/api/v0/add", formData);
  if (response.status === 200) {
    const { Hash } = response.data;
    return Hash;
  }
  throw new Error("Error uploading data to IPFS");
};