import { useCallback, useState } from "react";

export type ChannelWideModalsStateType = {
  showChatCommandModal: boolean;
  handleChatCommandModal: (value: boolean) => void;
  showEditModal: boolean;
  handleEditModal: (value: boolean) => void;
  showNotificationsModal: boolean;
  handleNotificationsModal: (value: boolean) => void;
  showModeratorModal: boolean;
  handleModeratorModal: (value: boolean) => void;
  showClipDrawer: boolean;
  handleClipDrawer: (value: boolean) => void;
};

export const useChannelWideModalsInitialState: ChannelWideModalsStateType = {
  showChatCommandModal: false,
  handleChatCommandModal: () => undefined,
  showEditModal: false,
  handleEditModal: () => undefined,
  showNotificationsModal: false,
  handleNotificationsModal: () => undefined,
  showModeratorModal: false,
  handleModeratorModal: () => undefined,
  showClipDrawer: false,
  handleClipDrawer: () => undefined,
};

export const useChannelWideModalsState = () => {
  const [showChatCommandModal, setChatCommandModal] = useState<boolean>(false);
  const [showEditModal, setEditModal] = useState<boolean>(false);
  const [showNotificationsModal, setNotificationsModal] =
    useState<boolean>(false);
  const [showModeratorModal, setModeratorModal] = useState<boolean>(false);
  const [showClipDrawer, setClipDrawer] = useState<boolean>(false);

  const handleEditModal = useCallback((value: boolean) => {
    setEditModal(value);
  }, []);

  const handleNotificationsModal = useCallback((value: boolean) => {
    setNotificationsModal(value);
  }, []);

  const handleChatCommandModal = useCallback((value: boolean) => {
    setChatCommandModal(value);
  }, []);

  const handleModeratorModal = useCallback((value: boolean) => {
    setModeratorModal(value);
  }, []);

  const handleClipDrawer = useCallback((value: boolean) => {
    setClipDrawer(value);
  }, []);

  return {
    showChatCommandModal,
    handleChatCommandModal,
    showEditModal,
    handleEditModal,
    showNotificationsModal,
    handleNotificationsModal,
    showModeratorModal,
    handleModeratorModal,
    showClipDrawer,
    handleClipDrawer,
  };
};
