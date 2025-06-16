// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, collection, query, where, getDoc, getDocs } from "firebase/firestore"; 
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyCaXPZi8A3qn39pULBBSHopG46gaeJ_elM",
  authDomain: "chat-app-fd69a.firebaseapp.com",
  projectId: "chat-app-fd69a",
  storageBucket: "chat-app-fd69a.firebasestorage.app", 
  messagingSenderId: "841353449189",
  appId: "1:841353449189:web:59d1c260612e3db3e28e0c",
  measurementId: "G-CP26B05KS2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
    try {
        const response = await createUserWithEmailAndPassword(auth, email, password);
        const user = response.user;

        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name: "",
            avatar: "",
            bio: "Hey, There I am using chat app",
            lastSeen: Date.now()
        });
        await setDoc(doc(db, "chats", user.uid), {
            chatsData: []
        })

    } catch (error) {
        console.error("Error signing up:", error.message);
        toast.error(error.code.split('/')[1].split('-').join(" "));

    }
};


const login = async (email, password) =>{
    try {
        await signInWithEmailAndPassword(auth, email, password);
        
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }

}

const logout = async () =>{
    try {
        await signOut(auth);
        
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "))
    }
   

}


const resetPassword = async (email) =>{
    if (!email){
        toast.error("Please enter your email");
        return null;
    }
    else{
        try {
            const userRef= collection(db, 'users');
            const q = query(userRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty){
                await sendPasswordResetEmail(auth, email);
                toast.success("Password reset link sent to your email");
            }else {
                toast.error("Email does not exist");
            }
            
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }

    }

    

}

export { signup , login, logout, resetPassword, auth, db};
