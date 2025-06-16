import React, { useContext, useState } from 'react';
import './LeftSidebar.css';
import assets from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { userData, chatData, chatUser, setChatUser, setMessagesId, messagesId } = useContext(AppContext); 
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  console.log("chatData:", chatData); 

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, 'users');
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);

        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExists = chatData.some(user => user.id === querySnap.docs[0].data().id);

          if (!userExists) {
            setUser(querySnap.docs[0].data());
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const addChat = async () => {
    if (!user) return; 
    const existingChat = chatData.find(chat => chat.userData.id === user.id);
    
    if (existingChat) {
        setMessagesId(existingChat.messageId);
        setChatUser(existingChat);
        return;
    }

    const messagesRef = collection(db, 'messages');
    const chatsRef = collection(db, 'chats');

    try {
        const newMessageRef = doc(messagesRef);
        await setDoc(newMessageRef, {
            createdAt: serverTimestamp(),
            messages: []
        });

        await updateDoc(doc(chatsRef, user.id), {
            chatsData: arrayUnion({
                messageId: newMessageRef.id,
                lastMessage: "",
                rId: userData.id,
                updatedAt: Date.now(),
                messageSeen: true
            })
        });

        await updateDoc(doc(chatsRef, userData.id), {
            chatsData: arrayUnion({
                messageId: newMessageRef.id,
                lastMessage: "",
                rId: user.id,
                updatedAt: Date.now(),
                messageSeen: true
            })
        });
        setMessagesId(newMessageRef.id);
        setChatUser({ userData: user, messageId: newMessageRef.id });

        toast.success("Chat added successfully!");

    } catch (error) {
        toast.error(error.message);
        console.error(error);
    }
};




  const setChat = async (item)=>{
    try {
      setMessagesId(item.messageId);
    setChatUser(item);
    const userChatsRef = doc(db, 'chats', userData.id);
    const userChatsSnapshot = await getDoc(userChatsRef);
    const userChatsData= userChatsSnapshot.data();
    const chatIndex= userChatsData.chatsData.findIndex((c)=>c.messageId === item.messageId);
    userChatsData.chatsData[chatIndex].messageSeen= true;
    await updateDoc(userChatsRef, {
      chatsData: userChatsData.chatsData
    });
      
    } catch (error) {
      toast.error(error.message)
    }
    

  }

  return (
    <div className='ls'>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" alt="Logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="Menu Icon" />
            <div className='sub-menu'>
              <p>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="Search Icon" />
          <input onChange={inputHandler} type="text" placeholder='Search here...' />
        </div>
      </div>

      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className='friends add-user'>
            <img src={user.avatar || assets.default_avatar} alt="User Avatar" />
            <p>{user.name || "Unknown User"}</p>
          </div>
        ) : (
          Array.isArray(chatData) && chatData.length > 0 ? (
            chatData.map((item, index) => (
              <div  onClick={()=>setChat(item)} className={`friends ${item.messageSeen || item.messageId === messagesId ? "" : "border"}`} key={index}>
                <img src={item.userData?.avatar || assets.default_avatar} alt="Profile" />
                <div>
                  <p>{item.userData?.name || "Unknown User"}</p>
                  <span>{item.lastMessage || "No messages yet"}</span>
                </div>
              </div>
            ))
          ) : (
            <p>No chats available yet</p>
          )
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
