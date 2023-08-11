import React from "react";

interface Props {
  closePrompt: () => void;
}

export default function AddToIosSafari(props: Props) {
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
        <div className="flex flex-col gap-2 items-center text-lg w-full px-4">
          <p>Scroll down and then click:</p>
          <div className="bg-zinc-800 flex justify-between items-center w-full px-4 py-2 rounded-lg">
            <p>Add to Home Screen</p>
          </div>
        </div>
      </div>
    </div>
  );
}
