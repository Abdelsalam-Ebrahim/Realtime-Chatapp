// import React from 'react';
import { useUserStore } from "../../../lib/userStore";
import "./userinfo.css";

export default function Userinfo () {

    const { currentUser } = useUserStore();

    return <>
    
        <div className="userinfo">
            
            <div className="user">
                <img src={currentUser.avatar || "./src/Images/avatar.png"} alt="user photo" />
                <h2> { currentUser.username } </h2>
            </div>
            
            <div className="icons">
                <i className="fa-solid fa-ellipsis"></i>
                <i className="fa-solid fa-video"></i>
                <i className="fa-solid fa-pen-to-square"></i>
            </div>

        </div>

    </>
}