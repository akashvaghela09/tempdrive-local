import React from 'react';
import styles from "../Styles/Header.module.css";
import { ImDrive } from "react-icons/im";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate()
    
    return (
        <div className={styles.wrapper}>
            <div className={styles.iconDiv} onClick={() => navigate("/")}>
                <ImDrive className={styles.icon}/>
                <p className={styles.title}>Temp Drive</p>
            </div>
        </div>
    )
}

export { Header }