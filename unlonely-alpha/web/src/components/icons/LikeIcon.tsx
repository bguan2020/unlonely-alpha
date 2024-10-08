import { createIcon } from "@chakra-ui/icons";

export const LikeIcon = createIcon({
  displayName: "LikeIcon",
  viewBox: "0 0 24 24",
  path: (
    <g fill="none">
      <path
        strokeLinecap="round"
        stroke="white"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </g>
  ),
});

export const LikedIcon = createIcon({
  displayName: "LikedIcon",
  viewBox: "0 0 24 24",
  path: (
    <g fill="red">
      <path
        strokeLinecap="round"
        stroke="white"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </g>
  ),
});

export const SkipIcon = createIcon({
  displayName: "SkipIcon",
  viewBox: "0 0 100 100",
  path: (
    <g
      xmlns="http://www.w3.org/2000/svg"
      transform="translate(0.000000,100.000000) scale(0.100000,-0.100000)"
      fill="#00000"
      stroke="none"
    >
      <path d="M370 846 c-79 -21 -140 -59 -198 -121 -67 -71 -102 -139 -83 -158 10 -9 15 -8 25 7 109 179 179 229 336 243 137 12 261 -38 361 -145 l63 -67 -64 -5 c-49 -4 -65 -9 -65 -20 0 -12 19 -16 98 -18 l98 -3 -3 98 c-2 79 -6 98 -18 98 -11 0 -16 -14 -18 -57 l-3 -56 -68 68 c-126 125 -305 179 -461 136z" />
      <path d="M0 300 l0 -140 140 0 140 0 0 140 0 140 -140 0 -140 0 0 -140z" />
      <path d="M360 300 l0 -140 140 0 140 0 0 140 0 140 -140 0 -140 0 0 -140z m240 0 l0 -100 -100 0 -100 0 0 100 0 100 100 0 100 0 0 -100z" />
      <path d="M720 300 l0 -140 140 0 140 0 0 140 0 140 -140 0 -140 0 0 -140z" />
    </g>
  ),
});

export const SkippedIcon = createIcon({
  displayName: "SkippedIcon",
  viewBox: "0 0 100 100",
  path: (
    <g
      xmlns="http://www.w3.org/2000/svg"
      transform="translate(0.000000,100.000000) scale(0.100000,-0.100000)"
      fill="#CF3E10"
      stroke="none"
    >
      <path d="M370 846 c-79 -21 -140 -59 -198 -121 -67 -71 -102 -139 -83 -158 10 -9 15 -8 25 7 109 179 179 229 336 243 137 12 261 -38 361 -145 l63 -67 -64 -5 c-49 -4 -65 -9 -65 -20 0 -12 19 -16 98 -18 l98 -3 -3 98 c-2 79 -6 98 -18 98 -11 0 -16 -14 -18 -57 l-3 -56 -68 68 c-126 125 -305 179 -461 136z" />
      <path d="M0 300 l0 -140 140 0 140 0 0 140 0 140 -140 0 -140 0 0 -140z" />
      <path d="M360 300 l0 -140 140 0 140 0 0 140 0 140 -140 0 -140 0 0 -140z m240 0 l0 -100 -100 0 -100 0 0 100 0 100 100 0 100 0 0 -100z" />
      <path d="M720 300 l0 -140 140 0 140 0 0 140 0 140 -140 0 -140 0 0 -140z" />
    </g>
  ),
});

export const WatchIcon = createIcon({
  displayName: "WatchIcon",
  viewBox: "0 0 96 96",
  path: (
    <g
      xmlns="http://www.w3.org/2000/svg"
      transform="translate(0.000000,96.000000) scale(0.100000,-0.100000)"
      fill="#00000"
      stroke="none"
    >
      <path d="M376 790 c-112 -29 -245 -137 -305 -249 l-32 -61 32 -61 c47 -87 134 -170 226 -216 74 -37 80 -38 183 -38 103 0 108 1 184 39 94 46 177 126 225 215 l32 61 -32 61 c-47 88 -131 169 -222 214 -67 33 -86 38 -164 41 -48 2 -105 -1 -127 -6z m251 -105 c66 -29 156 -112 187 -173 17 -32 16 -34 -8 -75 -35 -60 -117 -134 -184 -165 -48 -23 -71 -27 -142 -27 -71 0 -94 4 -142 27 -67 31 -149 105 -184 165 -24 40 -25 43 -9 74 25 47 103 127 153 156 104 61 219 68 329 18z" />
      <path d="M415 626 c-101 -44 -125 -178 -46 -257 65 -65 157 -65 222 0 124 124 -15 327 -176 257z m120 -91 c16 -15 25 -36 25 -55 0 -19 -9 -40 -25 -55 -15 -16 -36 -25 -55 -25 -19 0 -40 9 -55 25 -16 15 -25 36 -25 55 0 19 9 40 25 55 15 16 36 25 55 25 19 0 40 -9 55 -25z" />
    </g>
  ),
});

export const WatchedIcon = createIcon({
  displayName: "WatchedIcon",
  viewBox: "0 0 96 96",
  path: (
    <g
      xmlns="http://www.w3.org/2000/svg"
      transform="translate(0.000000,96.000000) scale(0.100000,-0.100000)"
      fill="#3AAD76"
      stroke="none"
    >
      <path d="M376 790 c-112 -29 -245 -137 -305 -249 l-32 -61 32 -61 c47 -87 134 -170 226 -216 74 -37 80 -38 183 -38 103 0 108 1 184 39 94 46 177 126 225 215 l32 61 -32 61 c-47 88 -131 169 -222 214 -67 33 -86 38 -164 41 -48 2 -105 -1 -127 -6z m251 -105 c66 -29 156 -112 187 -173 17 -32 16 -34 -8 -75 -35 -60 -117 -134 -184 -165 -48 -23 -71 -27 -142 -27 -71 0 -94 4 -142 27 -67 31 -149 105 -184 165 -24 40 -25 43 -9 74 25 47 103 127 153 156 104 61 219 68 329 18z" />
      <path d="M415 626 c-101 -44 -125 -178 -46 -257 65 -65 157 -65 222 0 124 124 -15 327 -176 257z m120 -91 c16 -15 25 -36 25 -55 0 -19 -9 -40 -25 -55 -15 -16 -36 -25 -55 -25 -19 0 -40 9 -55 25 -16 15 -25 36 -25 55 0 19 9 40 25 55 15 16 36 25 55 25 19 0 40 -9 55 -25z" />
    </g>
  ),
});