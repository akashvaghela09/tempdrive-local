import React from 'react';
import styles from "../Styles/Progress.module.css"

const Progress = ({status}) => {
    return (
        <div className={styles.wrapper} style={{width: `${status}vw`}}></div>
    )
}

export { Progress }