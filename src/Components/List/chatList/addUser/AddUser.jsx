import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import "./addUser.css";
import { db } from "../../../../lib/firebase";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";

export default  function AddUser () {

    const [user, setUser] = useState(null);
    const { currentUser } = useUserStore();

    async function handleAdd() {
        const chatRef = collection(db, "chats");
        const userChatRef = collection(db, "userchats");
        
        try {
            // Get the current user's chats
            const userChatDoc = await getDoc(doc(userChatRef, currentUser.id));
            const userChats = userChatDoc.data().chats;
            const existingChat = userChats.find( chat => chat.receiverId === user.id );

            if (existingChat)   throw new Error("This Chat Already Exists");

            const newChatRef = doc(chatRef);
            
            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });

            await updateDoc(doc(userChatRef, user.id), {
                chats: arrayUnion( {
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                } )
            })

            await updateDoc(doc(userChatRef, currentUser.id), {
                chats: arrayUnion( {
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: user.id,
                    updatedAt: Date.now(),
                } )
            })

        } catch (err) {
            console.log("Error From Adding User to Chat", err.message);
        }
    }


    async function handleSearch(e) {
        e.preventDefault();
        
        const username = e.target.username.value;

        // const formData = new FormData(e.target);
        // const username = formData.get("username");

        try {
            const userRef = collection(db, "users");
            
            // checks on specific one
            const q = query(userRef, where("username", "==", username));
            const querySnapShot = await getDocs(q);

            if(!querySnapShot.empty) {
                
                if(querySnapShot.docs[0].data().username != currentUser.username) {
                    setUser(querySnapShot.docs[0].data());
                } else {
                    throw new Error("This is Your Username ");
                }
                
                // if we have more than users with the same username but in our project we have unique usernames
                // let arr = [];
                // querySnapShot.docs.forEach( data => {
                //     arr.push(data.data());
                // } );
                // setUser(arr);
                
            } else {
                throw new Error("There is no User with this Username");
            }
        } catch (err) {
            setUser(null);
            console.log('Add Users Error: ', err.message);
        }
    }


    return <>
    
        <div className="addUser">

            <form onSubmit={ handleSearch } >

                <input type="text" placeholder="Username" name="username" />
                <button>Search</button>

            </form>

            {/* { users && users.map( (user, idx) => {
                    return <div className="user" key={idx} >
                        <div className="detail">
                            <img src={ user.avatar || "./src/Images/avatar.png" } alt="" />
                            <span> { user.username } </span>
                        </div>
                        <button onClick={handleAdd} >Add User</button>
                    </div>
                } )
            } */}

            { user && <div className="user">
                    <div className="detail">
                        <img src={ user.avatar || "./src/Images/avatar.png" } alt="" />
                        <span> { user.username } </span>
                    </div>
                    <button onClick={handleAdd} >Add User</button>
                </div>
            }

            
        </div>
    
    </>
}