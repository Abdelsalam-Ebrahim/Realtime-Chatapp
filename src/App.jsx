import Chat from './Components/Chat/Chat';
import List from './Components/List/List';
import "../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import Notification from './Components/Notification/Notification';
import Login from './Components/Login/Login';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useUserStore } from './lib/userStore';
import { useChatStore } from './lib/chatStore';


function App() {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId,resetUser } = useChatStore();
  
  useEffect( () => {
    const unSub = onAuthStateChanged(auth, user => {
      fetchUserInfo(user?.uid);
      resetUser();
    });
    
    return () => unSub();
    
  }, [ fetchUserInfo, resetUser ] );
  
  if(isLoading) return <div className='loading' >Loading...</div>


  return <>
  
    <div className='container'>

      { currentUser ?
        <>
          <List />
          { chatId && <Chat /> }
        </> : <Login />
      }
      
      <Notification />
    </div>
  
  </>
}

export default App
