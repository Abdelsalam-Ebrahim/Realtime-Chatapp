import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";

export default async function upload(file) {
    const date = new Date();
    
    const storageRef = ref(storage, `images/${ date + file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise( (resolve, reject) => {
        uploadTask.on( "state_changed",
            null,
            (error) => {
                reject("Please Upload Photo" + error);
            }, () => {
                getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
                    resolve(downloadURL);
                });
            }
        );
    });
}