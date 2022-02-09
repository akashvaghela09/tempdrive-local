import React from 'react';
import styles from "../Styles/Loader.module.css"

const Loader = () => {
    return (
        <div className={styles.container}>
            <div className={styles.overlay}></div>
            <div className={styles.wrapper}>
                <div className={styles.content}>
                    <div>
                        <div></div>
                        <div></div>
                        <div></div>
                        </div><div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { Loader }