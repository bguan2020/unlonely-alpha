import React from "react";
import { Text, Flex, Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useAccount } from "wagmi";

type Props = {
  color: string;
  x: number;
  y: number;
  message?: string;
  username: string | null;
  address: string | undefined;
};

export default function Cursor({ color, x, y, message, username }: Props) {
  const [{ data: accountData }] = useAccount();
  return (
    <div
      className="absolute pointer-events-none top-0 left-0"
      style={{
        transition: "transform 0.5s cubic-bezier(.17,.93,.38,1)",
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
    >
      <Flex direction="row">
        <svg
          className="relative"
          width="24"
          height="36"
          viewBox="0 0 24 36"
          fill="none"
          stroke="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
            fill={color}
          />
        </svg>

        <Text>{username}</Text>
        {accountData?.address && (
          <Link href={`https://app.zerion.io/${accountData.address}/overview`}>
            <ExternalLinkIcon mx="2px" />
          </Link>
        )}
      </Flex>
      {message && (
        <div
          className="absolute top-5 left-2 px-4 py-2 rounded-3xl"
          style={{ backgroundColor: color, borderRadius: 20 }}
        >
          <p className="leading-relaxed text-white whitespace-pre-line text-sm">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
