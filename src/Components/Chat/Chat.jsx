// import React from 'react';
import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import Details from "../Details/Detials";


export default function Chat () {

    const endRef = useRef(null);
    const textRef = useRef(null);
    const openEmojiRef = useRef(null);
    const [chat, setChat] = useState(null);
    const [sharedImages, setSharedImages] = useState([]);
    const [img, setImg] = useState({
        file: null,
        url: "",
    });

    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const { currentUser } = useUserStore();
    
    useEffect( () => {
        setImg( {file: null, url: ""} );

        if(openEmojiRef.current) {
            openEmojiRef.current.value = false;
            openEmojiRef.current.style.display = "none";
        }

        const unSub = onSnapshot( doc(db, "chats", chatId), (res) => {
            setChat(res.data());
            setSharedImages([]);
        } );

        return () => unSub();
    }, [chatId] );

    useEffect( () => {
        // to scroll automatic when you write new message and when you entered the chat (overall when the chat change)
        endRef.current.scrollIntoView({ behavior: "smooth" });

        if(sharedImages.length == 0 && chat) {
            const imagesArr = chat.messages;
            let arr = [];

            imagesArr.forEach( image => {
                if(image.imgText) {
                    arr.push( { imgUrl: image.img, imgText: image.imgText } );
                }
            } );

            setSharedImages(arr);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chat] );
    
    function hanldeImg(e) {
        if(e.target.files.length) {
            setImg({
                file: e.target.files[0],
                src: URL.createObjectURL(e.target.files[0]),
            });
        }
    }

    function hanldeEmojiOpen() {
        if(openEmojiRef.current) {
            openEmojiRef.current.value = !openEmojiRef.current.value;
            openEmojiRef.current.style.display = openEmojiRef.current.value ? "block" : "none";
        }
    }

    async function handleSend() {
        let message = textRef.current.value;
        
        if(message == "" || message.trim() == "") {
            textRef.current.value = "";
            return;
        }
        
        let imgUrl = null;

        try {

            if(img.file) {
                imgUrl = await upload(img.file);
                setSharedImages( [ ...sharedImages, { imgUrl, imgText: img.file.name  } ] );
            }

            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text: message,
                    createdAt: new Date(),
                    ...(imgUrl && { img: imgUrl } ),
                    ...(imgUrl && { imgText: img.file.name } ),
                })
            })

            const userIds = [currentUser.id, user.id];

            userIds.forEach( async (id) => {
                const userChatRef = doc(db, "userchats", id);
                const userChatsSnapshot = await getDoc(userChatRef);
                
                if(userChatsSnapshot.exists()) {

                    const userChatsData = userChatsSnapshot.data();
                    const chatIndex = userChatsData.chats.findIndex( c => c.chatId === chatId );
    
                    userChatsData.chats[chatIndex].lastMessage = message;
                    userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
                    userChatsData.chats[chatIndex].updatedAt = Date.now();
    
                    await updateDoc(userChatRef, {
                        chats: userChatsData.chats,
                    })
                }
            } )

        } catch(err) {
            console.log("Error When Sending Messages", err.message);
        } finally {
            textRef.current.value = "";
            setImg({
                file: null,
                url: "",
            })
        }
    }

    return <>
        <div className="chat">

            <div className="top">

                <div className="user">
                    <img src={ user?.avatar || "./src/Images/friend-01.jpg" } alt="" />
                    <div className="texts">
                        <span>{ user.username }</span>
                        <p>Lorem ipsum dolor sit amet consectetur quos.</p>
                    </div>
                </div>

                <div className="icons">
                    <i className="fa-solid fa-phone"></i>
                    <i className="fa-solid fa-video"></i>
                    <i className="fa-solid fa-circle-info"></i>
                </div>
            </div>


            <div className="center">

                { chat && chat.messages.map( message => {
                    // key={idx}
                    return <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt} >
                            <div className="text">

                                { message.img && <img src={ message.img } alt="" /> }
                                <p> { message.text } </p>

                                {/* <img src={user.avatar || "./src/Images/friend-02.jpg" } alt="" /> // the photo beside the message */}

                                
                                {/* <span> { message.createdAt } </span> */}
                            </div>
                        </div>
                    } )
                }

                {/* when click on sending image it appear on the chat message */}
                { img.src && 
                    <div className="message own">
                        <div className="text">
                            <img src={img.src} alt="" />
                        </div>
                    </div>
                }

                <div ref={endRef}></div>
            
            </div>


            <div className="bottom">
                <div className={`icons ${(isCurrentUserBlocked || isReceiverBlocked) ? "blocked" : "" }`}>

                    <label htmlFor="file">
                        <i className="fa-regular fa-image"></i>
                        {/* <img src="./src/Images/img.png" alt="" /> */}
                    </label>
                    <input type="file" id="file" style={{display: 'none'}} onChange={hanldeImg} disabled={isCurrentUserBlocked || isReceiverBlocked} />

                    <i className="fa-solid fa-camera"></i>
                    <i className="fa-solid fa-microphone"></i>
                </div>

                <input 
                    type="text" 
                    placeholder={ isCurrentUserBlocked || isReceiverBlocked ? "You Can Not Send a Message" :  "Type a message..." }
                    ref={textRef}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                />
                
                <div className="emoji">

                    <div className="picker" ref={openEmojiRef} style={{display: "none"}} >
                        <EmojiPicker onEmojiClick={ e => textRef.current.value += e.emoji } width={"280px"} height={"360px"} />
                    </div>

                    <img src="./src/Images/emoji.png" alt="" onClick={ hanldeEmojiOpen } className={isCurrentUserBlocked || isReceiverBlocked ? "blocked" : ""}  />
                    {/* <i className="fa-solid fa-face-smile" onClick={ () => setOpen(!open) }></i> */}
                </div>

                <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked} >Send</button>
            </div>
        </div>

        <Details sharedImages={sharedImages} />
    </>
}


