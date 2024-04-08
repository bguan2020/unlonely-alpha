import { AblyChannelPromise } from "../../constants";
import { useChannelContext } from "../../hooks/context/useChannel";
import ChatCommandModal from "./ChatCommandModal";
import EditChannelModal from "./EditChannelModal";
import ModeratorModal from "./ModeratorModal";
import NotificationsModal from "./NotificationsModal";

export const ChannelWideModals = ({
  ablyChannel,
}: {
  ablyChannel: AblyChannelPromise;
}) => {
  const { ui } = useChannelContext();

  const {
    handleEditModal,
    handleNotificationsModal,
    handleChatCommandModal,
    handleModeratorModal,
    showEditModal,
    showNotificationsModal,
    showChatCommandModal,
    showModeratorModal,
  } = ui;

  return (
    <>
      <ModeratorModal
        title={"manage moderators"}
        isOpen={showModeratorModal}
        handleClose={() => handleModeratorModal(false)}
        ablyChannel={ablyChannel}
      />
      <ChatCommandModal
        title={"custom commands"}
        isOpen={showChatCommandModal}
        handleClose={() => handleChatCommandModal(false)}
        ablyChannel={ablyChannel}
      />
      <EditChannelModal
        title={"edit title / description"}
        isOpen={showEditModal}
        handleClose={() => handleEditModal(false)}
        ablyChannel={ablyChannel}
      />
      <NotificationsModal
        title={"send notifications"}
        isOpen={showNotificationsModal}
        handleClose={() => handleNotificationsModal(false)}
      />
    </>
  );
};
