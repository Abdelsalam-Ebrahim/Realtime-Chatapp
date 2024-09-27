// import "./signup.css";
import { useState } from "react";
import upload from "../../../lib/upload";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../../../lib/firebase";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { ColorRing } from "react-loader-spinner";

// eslint-disable-next-line react/prop-types
export default function Signup ( { setLogged } ) {

    const [avatar, setAvatar] = useState({
        file: null,
        src: "./src/Images/friend-02.jpg",
    });

    const [loading, setLoading] = useState(false);


    function handleAvatar(e) {
        if(e.target.files.length) {
            setAvatar({
                file: e.target.files[0],
                src: URL.createObjectURL(e.target.files[0]),
            });
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        setLoading(true);

        const username = e.target.username.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        
        // const formData = new FormData(e.target);
        // // convert array to an object
        // const { username, email, password } = Object.fromEntries(formData);
        
        try {

            // handle when error occurs dont push it to database firebase or storage
            // we have also to check that the username is unique

            await getDocs(collection(db, "users")).then(snapshot => {
                snapshot.docs.forEach(doc => {
                    if(doc.data().username == username) throw new Error("This Username is Already Used");
                })
            })
            
            const res = await createUserWithEmailAndPassword(auth, email, password);
            
            let imgUrl = "";
            if(avatar.file) imgUrl = await upload(avatar.file);
            
            // create on our database users collection
            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: [],
            });

            // create on our database userchats collection
            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: [],
            });
            
            await signOut(auth); // to dont go to the chat immediately, go to login first
            toast.success("Account Created! You can login now!");
        } catch(err) {
            toast.error( "Please " + err.message );
            console.log("Error From Sign Up: ", err.message);
        } finally {
            // Reset the inputs
            setAvatar( { file: null, src: "./src/Images/friend-02.jpg" } );
            e.target.reset();
            setLoading(false);
        }
    }

    return <>
    
        <div className="signup">
            <div className="item">
                <h2>Create an Account</h2>
                
                <form onSubmit={handleRegister}>

                    <label htmlFor="file">
                        <img src={avatar.src} alt="" style={{maxWidth:"150px"}} />
                        Upload an Image
                    </label>
                    <input type="file" id="file" style={{display: "none"}} onChange={ e => handleAvatar(e) } />
                    
                    <input type="text" placeholder="Username" name="username" />
                    <input type="email" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />

                    <button disabled={loading} >
                        { loading ? <ColorRing
                                visible={true}
                                height="40"
                                width="40"
                                ariaLabel="color-ring-loading"
                                wrapperStyle={{}}
                                wrapperClass="color-ring-wrapper"
                                colors={['white', 'white', 'white', 'white', 'white']}
                            /> : "Sign Up"
                        }
                    </button>
                    
                    <button onClick={ (e) => {e.preventDefault(); setLogged(true)} } >Already have account</button>
                </form>
                
            </div>
        </div>
    
    </>
}