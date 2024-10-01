import { useState } from "react";
import { toast } from "react-toastify";
import { ColorRing } from "react-loader-spinner";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useUserStore } from "../../../lib/userStore";


// eslint-disable-next-line react/prop-types
export default function SignIn ( { goSignUp } ) {

    const [loading, setLoading] = useState(false);
    const { fetchUserInfo } = useUserStore();    

    
    async function handleForm(e) {
        e.preventDefault();
        setLoading(true);

        const email = e.target.email.value;
        const password = e.target.password.value;

        // const formData = new FormData(e.target);
        // const { email, password } = Object.fromEntries(formData);

        try {
            const loggedInUser = await signInWithEmailAndPassword(auth, email, password);
            await fetchUserInfo(loggedInUser.user.uid);

            toast.success("Logged In");
        } catch (err) {
            console.log("Error from login: ", err.message);
            toast.error(err.message);
            // toast.error("Please Enter Correct Email and Password");
        } finally {
            setLoading(false);
        }
    }

    return <>
    
        <div className="signin">
            
            <div className="item">
                <h2>Welcome</h2>
                
                <form onSubmit={handleForm}>

                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />

                    <button disabled={loading} > {loading ? <ColorRing
                            visible={true}
                            height="40"
                            width="40"
                            ariaLabel="color-ring-loading"
                            wrapperStyle={{}}
                            wrapperClass="color-ring-wrapper"
                            colors={['white', 'white', 'white', 'white', 'white']}
                        /> : "Sign In"}
                    </button>

                </form>

            </div>

            <button onClick={goSignUp} className="button-signup" > Sign Up </button>
        </div>
    
    </>
}