import React, { useEffect, useState, useRef } from 'react';
import styles from "../Styles/Home.module.css"
import { FcOpenedFolder, FcUpload, FcEmptyTrash, FcMusic, FcDocument, FcGallery, FcFilm, FcFile } from "react-icons/fc";
import { MdEdit, MdOutlineClose, MdCreateNewFolder } from "react-icons/md";
import axios from "axios";
import { Loader } from '../Components/Loader';
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { v4 as uuid } from "uuid";
import { GrDocumentPdf, GrDocumentZip } from "react-icons/gr";

const Home = () => {
    const navigate = useNavigate()
    const [folderList, setFolderList] = useState([])
    const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
    const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
    const [tempName, setTempName] = useState("");
    const [tempItem, setTempItem] = useState("");
    const [loading, setLoading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState(0);
    const [showProgress, setshowProgress] = useState(false);
    const [tempUploadFileName, setTempUploadFileName] = useState("")
    const [tempUploadSize, setTempUploadSize] = useState("")
    
    const getData = () => {
        setLoading(true)
        
        axios.get(process.env.REACT_APP_BACKEND)
        .then((res) => {
            console.log("data fetched");
            let tempfilelist = []
            let tempfolderlist = []
            
            let arr = res.data.data;
            
            for(let i = 0; i < arr.length; i++){
                if(arr[i].type === "folder"){
                    tempfolderlist.push(arr[i])
                } else {
                    tempfilelist.push(arr[i])
                }
            }
            
            let newArr = [...tempfolderlist, ...tempfilelist];
            
            setFolderList(newArr)
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
    
    const handleFolderModalOpen = (para) => {
        setIsNewFolderModalOpen(para)
    }
    
    const handleRenameFolderModalOpen = (para) => {
        setIsRenameFolderModalOpen(para)
    }
      
    const handleClose = () => {
        handleFolderModalOpen(false)
        handleRenameFolderModalOpen(false)
        setTempName("")
        setTempItem("")
    }
    
    const deleteFolder = (para) => {
        setLoading(true)
        
        let id = para._id;
        let url = `${process.env.REACT_APP_BACKEND}/${id}`
        
        axios.delete(url)
        .then((res) => {
            console.log(res);
            setLoading(false)
            getData()
        })
        .catch((err) => {
            console.log(err);
            setLoading(false)
        })
    }
    
    const handleFolderNameChange = (e) => {
        setTempName(e)
    }
    
    const handleRenameFolder = (para) => {
        handleRenameFolderModalOpen(true)
        setTempName(para.folderName)
        setTempItem(para._id)
    }
    
    const saveRenameFolder = () => {
        setLoading(true)
        
        let url = `${process.env.REACT_APP_BACKEND}/${tempItem}`
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
            getData()
            handleClose()
        })
    }
    
    const handleFolderCreate = () => {
        if(tempName == ""){
            alert("Folder name can not be empty")
        } else {
            setLoading(true)
            
            let crrDate = Date.now()
            let newFolderData = {
                "folderName": tempName,
                "folderSize": 0,
                "links": [],
                "timestamp": crrDate,
                "type": "folder"
            }
            
            axios.post(process.env.REACT_APP_BACKEND, newFolderData)
            .then((res) => {
                console.log(res);
                setLoading(false)
            })
            .catch((err) => {
                console.log(err);
                setLoading(false)
            })
            .finally(() => {
                handleClose()
                getData()
            })
        }
    }
    
    const setDateTime = (para) => {
        let newStringDate = moment(para).format("MM/DD/YYYY hh:mm");
        return newStringDate
    }
    
    
    const handleUpload = (e) => {
        setshowProgress(true)
        
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
            
            let newFolderData = {
                "folderName": tempName,
                "folderSize": tempSize,
                "links": [newItem],
                "timestamp": crrDate,
                "type": "file"
            }
            
            axios.post(process.env.REACT_APP_BACKEND, newFolderData)
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
                handleClose()
                getData()
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
        getData()
    }, []);
    
    return (
        <div className={styles.wrapper}>
            <div className={styles.btnDiv}>
                <div className={styles.btn} onClick={() => handleFolderModalOpen(true)}>
                    <FcOpenedFolder className={styles.btnIcon}/>
                    <p className={styles.btnText}>Create Folder</p>
                </div>
                <label className={styles.uploadLabel}>
                    <input type="file" onChange={(e) => handleUpload(e)}/>
                        <div className={styles.btn} >
                        <FcUpload className={styles.btnIcon}/>
                        <p className={styles.btnText}>Upload File</p>
                    </div>
                </label>
            </div>
            
            <div className={styles.folderTable}>
            {
                folderList.map((el) => {
                    return <div className={styles.folder}>
                        <div className={styles.folder_section1} onClick={() => navigate(`/folder/${el._id}`)}>
                            {
                                el.type === "folder" ? <FcOpenedFolder className={styles.folderIcon}/> :
                                el.links[0].type === "mkv" || el.links[0].type === "mp4" || el.links[0].type === "avi" ? <FcFilm className={styles.folderIcon}/> : 
                                el.links[0].type === "mp3" || el.links[0].type === "ogg" ? <FcMusic className={styles.folderIcon}/> :
                                el.links[0].type === "jpeg" || el.links[0].type === "jpg" || el.links[0].type === "gif" || el.links[0].type === "svg" || el.links[0].type === "png" ? <FcGallery className={styles.folderIcon}/> :
                                el.links[0].type === "zip" || el.links[0].type === "7z" || el.links[0].type === "xz" ? <GrDocumentZip className={styles.folderIcon}/> :
                                el.links[0].type === "pdf" ? <GrDocumentPdf className={styles.folderIcon}/> :
                                el.links[0].type === "ppt" ? <FcDocument className={styles.folderIcon}/> : <FcFile className={styles.folderIcon}/>
                            }
                            
                            <p className={styles.folderName}>{el.folderName}</p>
                        </div>
                        <div className={styles.folder_section2}>
                            <p className={styles.folderItems}>{el.type === "folder" ? `Files : ${el.links.length}` : el.links[0].type}</p>
                            <p className={styles.folderTimestamp}>{setDateTime(el.timestamp)}</p>
                            <p className={styles.folderSize}>Size : {formatBytes(el.folderSize)}</p>
                            <div className={styles.folderBtns}>
                                <MdEdit className={styles.editIcon} onClick={() => handleRenameFolder(el)}/>
                                <FcEmptyTrash className={styles.deleteIcon} onClick={() => deleteFolder(el)}/>
                            </div>
                        </div>
                    </div>
                })
            }    
            </div>
            
            {
                isNewFolderModalOpen && 
                <div className={styles.newFolderModalWrapper}>
                    <div className={styles.newFolderModalBackdrop} onClick={() => handleFolderModalOpen(false)}/>
                    <div className={styles.newFolderModalContent}>
                        <MdOutlineClose className={styles.newFolderModalCloseIcon} onClick={() => handleClose()}/>
                        <input placeholder='New Folder' type="text" value={tempName} className={styles.newFolderNameField} onChange={(e) => handleFolderNameChange(e.target.value)}/>
                        <div className={styles.btn} onClick={() => handleFolderCreate()} style={{backgroundColor: "#74b9ff", marginTop: "20px"}}>
                            <MdCreateNewFolder className={styles.btnIcon}/>
                            <p className={styles.btnText}>Create</p>
                        </div>
                    </div>
                </div>
            }
            
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

export { Home }