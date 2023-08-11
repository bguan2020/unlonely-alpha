import React from "react";

interface Props {
  closePrompt: () => void;
}

export default function AddToSamsung(props: Props) {
  const { closePrompt } = props;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[80%] z-50 pb-12 px-4 text-white">
      <div className="relative bg-primary p-4 h-full rounded-xl flex flex-col justify-around items-center text-center">
        <button className="absolute top-0 right-0 p-3" onClick={closePrompt}>
          close
        </button>
        <p className="text-lg">
          For the best experience, we recommend installing the Valley Trader app
          to your home screen!
        </p>
        <div className="flex gap-2 items-center text-lg">
          <p>Click the</p>
          <p>icon</p>
        </div>
        <div className="flex flex-col gap-2 items-center text-lg w-full px-4">
          <p>Scroll down and then click:</p>
          <div className="bg-white text-zinc-800 flex flex-col gap-2 items-center p-4 rounded-lg">
            <p>Add page to</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-center text-lg w-full px-4">
          <p>Then select:</p>
          <div className="bg-white text-zinc-800 flex flex-col gap-2 items-center py-2 px-4 rounded-lg">
            <p>Home screen</p>
          </div>
        </div>
      </div>
    </div>
  );
}
