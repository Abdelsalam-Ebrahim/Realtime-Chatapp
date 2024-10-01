import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./details.css";
import { useEffect, useRef, useState } from "react";

// eslint-disable-next-line react/prop-types
export default function Details ( { sharedImages } ) {

    const showImgsRef = useRef(null);
    const [ images, setImage ] = useState(null);

    const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, chatId } = useChatStore();
    const { currentUser } = useUserStore();


    useEffect( () => {
        if(showImgsRef.current) {
            showImgsRef.current.value = false;
            showImgsRef.current.style.display = "none";
        }
    }, [chatId] );
    
    useEffect( () => {
        setImage(sharedImages);
    }, [sharedImages] );


    async function handleBlock() {
        if(!user)   return;

        const userDocRef = doc(db, "users", currentUser.id);

        try {

            await updateDoc(userDocRef, {
                blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
            });

            changeBlock();

        } catch (err) {
            console.log(err);
        }
    }

    function showPhotos() {
        if(showImgsRef.current) {
            showImgsRef.current.value = !showImgsRef.current.value;
            showImgsRef.current.style.display = showImgsRef.current.value ? "flex" : "none";
        }
    }

    return <>
    
        <div className="details">

            <div className="user">
                <img src={ user.avatar || "./src/Images/friend-05.jpg" } alt="" />
                <h3>{ user.username }</h3>
                <p>Lorem ipsum dolor sit amet consectetur.</p>
            </div>


            <div className="info">

                {/* <div className="option">
                    <div className="title">
                        <span>Chat Settings</span>
                        <img src="./src/Images/arrowUp.png" alt="" />
                    </div>
                </div>

                <div className="option">
                    <div className="title">
                        <span>Privacy & Help</span>
                        <img src="./src/Images/arrowUp.png" alt="" />
                    </div>
                </div> */}

                <div className="option" >
                    <div className="title" onClick={showPhotos} >
                        <span>Shared Photos</span>
                        <img src="./src/Images/arrowDown.png" alt="" />
                    </div>

                    <div className="photos" ref={showImgsRef} style={{display: "none"}} >

                        { images && images != "" ? 
                            images.map((image, idx) => {
                                return <div className="photoItem" key={idx}>
                                    <div className="photoDetail">
                                        <img src={image.imgUrl} alt="" />
                                        <span> { image.imgText } </span>
                                    </div>

                                    <img src="./src/Images/download.png" alt="" className="icon" />
                                </div>
                            })

                            :
                            <>

                            <div className="empty">
                                <p>No Photos Shared Yet</p>
                            </div></>
                        }
                    </div>
                </div>

                {/* <div className="option">
                    <div className="title">
                        <span>Shared Files</span>
                        <img src="./src/Images/arrowUp.png" alt="" />
                    </div>
                </div> */}

                <button onClick={handleBlock} >
                    { isCurrentUserBlocked ? "You Are Blocked" : isReceiverBlocked ? "User Blocked" : "Block User" }
                </button>
                <button className="logout" onClick={ () => auth.signOut() } >Logout</button>
            </div>

        </div>
    
    </>
}