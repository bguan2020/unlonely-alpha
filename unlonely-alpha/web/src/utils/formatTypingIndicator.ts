import { Types } from "ably";
import { User } from "../generated/graphql"

export const formatTypingIndicator = (presenseMessages:Types.PresenceMessage[],user: User) => {
   
    const presenceDataWithoutUser = presenseMessages.filter((presense) => {
    return presense.data.typing
    })
    return presenceDataWithoutUser.length
}