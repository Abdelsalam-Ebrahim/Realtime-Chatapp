import "./chatlist.css";
import { useEffect, useState } from "react";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";


export default function Chatlist () {

    const [addMode, setAddMode] = useState(true);
    const [chats, setChats] = useState([]);
    const [input, setInput] = useState("");

    const { currentUser }  = useUserStore();
    const { changeChat } = useChatStore();

    useEffect( () => {
        const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
            const items = res.data().chats;

            const promises = items.map( async (item) => {
                const userDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);
                const user = userDocSnap.data();

                return { ...item, user };
            } );

            const chatData = await Promise.all(promises);

            setChats(chatData.sort( (a, b) => b.updatedAt - a.updatedAt )); // to sort the new one you text in the first
        });

        return () => unSub();

    }, [currentUser.id] );


    async function handleSelect(chat) {

        const chatIndex = chats.findIndex(item => item.chatId == chat.chatId);
        chats[chatIndex].isSeen = true;
        
        try {
            const userChatsRef = doc(db, "userchats", currentUser.id);

            // updata userchats coolection ( the update that we add property isSeen )
            await updateDoc(userChatsRef, {
                chats: chats,
            })
            
            // change the cahtStore to make the chatId in this store with the updated chat that we clicked on it
            changeChat(chat.chatId, chat.user);
        } catch(err) {
            console.log(" Cant Update The Chat Id and Add isSeen Property " ,err.message);
        }
    }

    // we filter the chats according to the writing in search
    const filteredChats = chats.filter(c => c.user.username.toLowerCase().includes(input.toLowerCase()));


    return <>
    
        <div className="chatlist">

            <div className="search">
                <div className="searchBar">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Search" onChange={ e => setInput(e.target.value) } />
                </div>

                <span onClick={ () => setAddMode(!addMode) }> {addMode ? "+" : "-"} </span>
            </div>

            <div className="items">

                { filteredChats.map( chat => {
                    return <div
                                className="item"
                                key={chat.chatId} 
                                onClick={ () => handleSelect(chat) }
                                style={{backgroundColor: chat?.isSeen ? "transparent" : "#5183fe"}}  
                            >
                                <img 
                                    src={ chat.user.blocked.includes(currentUser.id) 
                                        ? "./src/Images/friend-01.jpg"
                                        :  (chat.user.avatar || "./src/Images/friend-01.jpg") 
                                    } 
                                    alt=""
                                />
                                <div className="texts">
                                    <span> { chat.user.blocked.includes(currentUser.id) ? "User" : chat.user.username } </span>
                                    <p> { chat.lastMessage } </p>
                                </div>
                            </div>
                } ) }

            </div>

            {!addMode && <AddUser />}

        </div>
    
    </>
}