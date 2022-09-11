import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { useUserStore } from "~/store/user.store";

export const initUser = async () => {
    const auth = getAuth();
    const firebaseUser = useFirebaseUser();
    const { login } = useUserStore();
    firebaseUser.value = auth.currentUser;

    if(localStorage.getItem("user") !== null){
        firebaseUser.value = JSON.parse(localStorage.getItem("user"));
        login(firebaseUser.value);
    }
        
    onAuthStateChanged(auth, (user) => {
        firebaseUser.value = user;
        localStorage.setItem("user", JSON.stringify(user));
        login(user);
    });
};

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const data = await signInWithPopup(getAuth(), provider);
    return data.user;
};

export const signOut = async () => {
    await getAuth().signOut();
    localStorage.removeItem("user");
};