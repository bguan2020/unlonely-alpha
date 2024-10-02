import { useCallback, useEffect, useState } from "react";
import { NEW_STREAMER_URL_QUERY_PARAM } from "../../constants";
import { useRouter } from "next/router";
import { StepType, useTour } from "@reactour/tour";

export type WelcomeTourStateType = {
  welcomeStreamerModal: "welcome" | "off" | "bye";
  startedWelcomeTour: boolean;
  isTourOpen: boolean;
  handleWelcomeStreamerModal: (state: "welcome" | "off" | "bye") => void;
  handleStartedWelcomeTour: (state: boolean) => void;
  handleIsTourOpen: (state: boolean) => void;
  handleSetTourSteps: (steps: StepType[]) => void;
};

export const welcomeTourStateInitial: WelcomeTourStateType = {
  welcomeStreamerModal: "off",
  startedWelcomeTour: false,
  isTourOpen: false,
  handleWelcomeStreamerModal: () => undefined,
  handleStartedWelcomeTour: () => undefined,
  handleIsTourOpen: () => undefined,
  handleSetTourSteps: () => undefined,
};

export const useWelcomeTourState = (isOwner: boolean): WelcomeTourStateType => {
  const router = useRouter();
  const {
    setIsOpen: setIsTourOpen,
    setSteps: setTourSteps,
    isOpen: isTourOpen,
  } = useTour();

  const [welcomeStreamerModal, setWelcomeStreamerModal] = useState<
    "welcome" | "off" | "bye"
  >("off");
  const [startedWelcomeTour, setStartedWelcomeTour] = useState(false);

  const handleWelcomeStreamerModal = useCallback(
    (state: "welcome" | "off" | "bye") => {
      setWelcomeStreamerModal(state);
    },
    []
  );

  const handleStartedWelcomeTour = useCallback((state: boolean) => {
    setStartedWelcomeTour(state);
  }, []);

  const handleIsTourOpen = useCallback((state: boolean) => {
    setIsTourOpen(state);
  }, []);

  const handleSetTourSteps = useCallback((steps: StepType[]) => {
    setTourSteps?.(steps);
  }, []);

  useEffect(() => {
    if (router.query[NEW_STREAMER_URL_QUERY_PARAM]) {
      setWelcomeStreamerModal("welcome");
      const newPath = router.pathname;
      const newQuery = { ...router.query };
      delete newQuery[NEW_STREAMER_URL_QUERY_PARAM];

      router.replace(
        {
          pathname: newPath,
          query: newQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [router, isOwner]);

  useEffect(() => {
    if (!isTourOpen && startedWelcomeTour) handleWelcomeStreamerModal("bye");
  }, [isTourOpen, startedWelcomeTour]);

  return {
    welcomeStreamerModal,
    startedWelcomeTour,
    isTourOpen: isTourOpen as boolean,
    handleWelcomeStreamerModal,
    handleStartedWelcomeTour,
    handleIsTourOpen,
    handleSetTourSteps,
  };
};
