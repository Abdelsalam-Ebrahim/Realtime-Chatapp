import { create } from "zustand";
import { useUserStore } from "./userStore";

export const useChatStore = create( set => ({
    chatId: null,
    user: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
    changeChat: (chatId, user) => {
        const currentUser = useUserStore.getState().currentUser;

        if ( user.blocked.includes(currentUser.id) ) {
            return set( { chatId, user, isCurrentUserBlocked: true, isReceiverBlocked: false } );
        }

        if ( currentUser.blocked.includes(user.id) ) {
            return set( { chatId, user, isCurrentUserBlocked: false, isReceiverBlocked: true } );
        }

        set( { chatId, user, isCurrentUserBlocked: false , isReceiverBlocked: false } );
    },
    changeBlock:  () => {
        set(state => ( {...state, isReceiverBlocked: !state.isReceiverBlocked } ));
    },
    resetUser: () => {
        set( { chatId: null, user: null, isCurrentUserBlocked: false, isReceiverBlocked: false } );
    }
}) )