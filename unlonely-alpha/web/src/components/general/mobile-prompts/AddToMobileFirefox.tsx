import React from "react";

interface Props {
  closePrompt: () => void;
}

export default function AddToMobileFirefox(props: Props) {
  const { closePrompt } = props;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[60%] z-50 pb-12 px-4 text-white">
      <div className="relative bg-primary p-4 h-full rounded-xl flex flex-col justify-around items-center text-center">
        <button className="absolute top-0 right-0 p-3" onClick={closePrompt}>
          close
        </button>
        <p className="text-lg">
          For the best experience, we recommend installing the Valley Trader app
          to your home screen!
        </p>
      </div>
    </div>
  );
}
