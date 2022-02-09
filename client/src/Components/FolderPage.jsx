import React, { useEffect, useState } from 'react';
import styles from "../Styles/FolderPage.module.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Loader } from '../Components/Loader';
import { FcOpenedFolder, FcUpload, FcEmptyTrash, FcMusic, FcDocument, FcGallery, FcFilm, FcFile } from "react-icons/fc";
import { GrDocumentPdf, GrDocumentZip } from "react-icons/gr";
import { MdEdit, MdOutlineClose } from "react-icons/md";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { Progress } from '../Components/Progress';

const FolderPage = () => {
    const { folderId } = useParams();
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [folderData, setFolderData] = useState({links: []})
    const [fileList, setFileList] = useState([]);
    const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
    const [tempName, setTempName] = useState("");
    const [uploadStatus, setUploadStatus] = useState(0);
    const [showProgress, setshowProgress] = useState(false);
    const [tempUploadFileName, setTempUploadFileName] = useState("")
    const [tempUploadSize, setTempUploadSize] = useState("")
    const url = `${process.env.REACT_APP_BACKEND}/${folderId}`
    
    const getFolderData = (id = folderId) => {
        setLoading(true)
        
        axios.get(url)
        .then((res) => {
            // console.log("data get: ", res.data.data);
            let data = res.data.data;
            setFileList([...data.links])
            setFolderData(data);
            setLoading(false)
        })
        .catch((err) => {
            console.log(err);
            setLoading(false)
        })
    }
    
    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    const handleFileDelete = (para) => {
        setLoading(true)
        
        let newList = fileList.filter((el) => {
            return para.fileID !== el.fileID
        })
        
        folderData.links = newList;
        folderData.timestamp = Date.now()
        folderData.folderSize = folderData.folderSize - para.size

        console.log(folderData.folderSize);
        axios.patch(url, folderData)
        .then((res) => {
            console.log(res.data.data);
        })
        .catch((err) => {
            console.log(err);
            setLoading(false)
        })
        .finally(() => {
            getFolderData(folderId)
            setLoading(false)
        })
    }
    
    const setDateTime = (para) => {
        let newStringDate = moment(para).format("MM/DD/YYYY hh:mm");
        return newStringDate
    }
    
    const handleRenameFolderModalOpen = (para) => {
        setIsRenameFolderModalOpen(para)
    }
      
    const handleClose = () => {
        handleRenameFolderModalOpen(false)
        setTempName("")
    }
    
    const deleteFolder = () => {
        setLoading(true)
        
        axios.delete(url)
        .then((res) => {
            console.log(res);
            setLoading(false)
        })
        .catch((err) => {
            console.log(err);
            setLoading(false)
        })
        .finally(() => {
            navigate("/")
        })
    }
    
    const handleFolderNameChange = (e) => {
        setTempName(e)
    }
    
    const handleRenameFolder = (para) => {
        handleRenameFolderModalOpen(true)
        setTempName(folderData.folderName)
    }
    
    const saveRenameFolder = () => {
        setLoading(true)
        
        let crrDate = Date.now()
        
        let newData = {
            "timestamp": crrDate,
            "folderName": tempName
        }
        
        axios.patch(url, newData)
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
            setLoading(false)
        })
        .finally(() => {
            getFolderData()
            handleClose()
        })
    }
    
    const handleUpload = (e) => {
        setshowProgress(true)
        console.log("Upload initiated");
        let file = e.target.files[0];
        let fileSize = file.size
        let formData = new FormData();
        formData.append("file", file);
        
        setTempUploadFileName(file.name)
        setTempUploadSize(formatBytes(fileSize))
        
        axios.post(`https://api.anonfiles.com/upload`, formData, {
            onUploadProgress: function(progressEvent) {
                let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                setUploadStatus(percentCompleted)
            }
        })
        .then((res)=> {
            let tempData = res.data.data.file;
            let tempName = tempData.metadata.name
            let tempSize = tempData.metadata.size.bytes
            let tempLink = tempData.url.full
            let crrDate = Date.now()
            let tempID = uuid()
            let tempType = tempName.split(".").reverse()[0]
            
            let newItem = {
                "name": tempName,
                "size": tempSize,
                "link": tempLink,
                "type": tempType,
                "timestamp": crrDate,
                "fileID": tempID
            }
            
            let newData = {
                links : [...folderData.links, newItem],
                timestamp : crrDate,
                folderSize : folderData.folderSize + tempSize
            }
            
            axios.patch(url, newData)
            .then((res) => {
                console.log(res);
                setshowProgress(false)
                setUploadStatus(0)
                setTempUploadFileName("")
                setTempUploadSize(setDateTime(""))
            })
            .catch((err) => {
                console.log(err);
                setshowProgress(false)
                setUploadStatus(0)
                setTempUploadFileName("")
                setTempUploadSize(setDateTime(""))
            })
            .finally(() => {
                getFolderData()
            })
        })
        .catch((err)=> {
            setshowProgress(false)
            setUploadStatus(0)
            setTempUploadFileName("")
            setTempUploadSize(setDateTime(""))
            console.log(err);
        })
    }
    
    
    useEffect(() => {
        getFolderData(folderId)
    }, []);
    
    return (
        <div className={styles.wrapper}>
            <div className={styles.folderCard}>
                <div className={styles.metaData}>
                    <p className={styles.folderName}>{folderData.folderName}</p>
                    <div className={styles.btnDiv}>
                        <label className={styles.uploadLabel}>
                            <input type="file" onChange={(e) => handleUpload(e)}/>
                                <div className={styles.btn} >
                                <FcUpload className={styles.btnIcon}/>
                                <p className={styles.btnText}>Upload</p>
                            </div>
                        </label>
                        <div className={styles.btn} onClick={() => handleRenameFolder()}>
                            <MdEdit className={styles.btnIcon}/>
                            <p className={styles.btnText}>Rename</p>
                        </div>
                        <div className={styles.btn} onClick={() => deleteFolder()}>
                            <FcEmptyTrash className={styles.btnIcon}/>
                            <p className={styles.btnText}>Delete</p>
                        </div>
                    </div>
                </div>
                <div className={styles.fileListDiv}>
                    {
                        folderData.links.map((el) => {
                            return <div className={styles.file} >
                                {
                                    el.type === "mkv" || el.type === "mp4" || el.type === "avi" ? <FcFilm className={styles.fileIcon}/> : 
                                    el.type === "mp3" || el.type === "ogg" ? <FcMusic className={styles.fileIcon}/> :
                                    el.type === "jpeg" || el.type === "jpg" || el.type === "gif" || el.type === "svg" || el.type === "png" ? <FcGallery className={styles.fileIcon}/> :
                                    el.type === "zip" || el.type === "7z" || el.type === "xz" ? <GrDocumentZip className={styles.fileIcon}/> :
                                    el.type === "pdf" ? <GrDocumentPdf className={styles.fileIcon}/> :
                                    el.type === "ppt" ? <FcDocument className={styles.fileIcon}/> : <FcFile className={styles.fileIcon}/>
                                }
                                <p className={styles.fileName} onClick={() => window.open(el.link, '_blank')}>{el.name}</p>
                                <p className={styles.fileType} onClick={() => window.open(el.link, '_blank')}>{el.type}</p>
                                <p className={styles.fileTimestamp} onClick={() => window.open(el.link, '_blank')}>{setDateTime(el.timestamp)}</p>
                                <p className={styles.fileSize} onClick={() => window.open(el.link, '_blank')}>{formatBytes(el.size)}</p>
                                <div className={styles.fileBtnDiv}>
                                <FcEmptyTrash  className={styles.deleteIcon} onClick={() => handleFileDelete(el)}/>
                                </div>
                            </div>
                        })
                    }
                </div>
            </div>
            
            {
                isRenameFolderModalOpen && 
                <div className={styles.newFolderModalWrapper}>
                    <div className={styles.newFolderModalBackdrop} onClick={() => handleRenameFolderModalOpen(false)}/>
                    <div className={styles.newFolderModalContent}>
                        <MdOutlineClose className={styles.newFolderModalCloseIcon} onClick={() => handleClose()}/>
                        <input placeholder='New Folder' type="text" value={tempName} className={styles.newFolderNameField} onChange={(e) => handleFolderNameChange(e.target.value)}/>
                        <div className={styles.btn} onClick={() => saveRenameFolder()} style={{backgroundColor: "#74b9ff", marginTop: "20px"}}>
                            <MdEdit className={styles.btnIcon}/>
                            <p className={styles.btnText}>Rename</p>
                        </div>
                    </div>
                </div>
            }
            
            {
                showProgress && 
                <div className={styles.uploadWrapper}>
                    <div className={styles.uploadBackdrop}/>
                    <div className={styles.uploadContent}>
                        <p className={styles.uploadModalText}><b>Name : </b>{tempUploadFileName}</p>
                        <p className={styles.uploadModalText}><b>Size : </b>{tempUploadSize}</p>
                        <div className={styles.progressDivWrapper}>
                            <p className={styles.uploadPercentage}>{uploadStatus}%</p>
                            <div className={styles.uploadProgressWrapper}>
                                <div className={styles.progressDiv} style={{width: `${uploadStatus}%`}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            
            {
                loading === true && <Loader />
            }
        </div>
    )
}

export { FolderPage }