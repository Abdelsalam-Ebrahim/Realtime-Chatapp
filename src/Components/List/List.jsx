// import React from 'react';
import Chatlist from "./chatList/Chatlist";
import "./list.css";
import Userinfo from "./userInfo/Userinfo";

export default function List () {
    return <>
    
        <div className="list">
            <Userinfo />
            <Chatlist />
        </div>

    </>
}