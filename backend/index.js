const express = require("express")
const app = express();
const router = express.Router()
const mongoose = require("mongoose");
require("dotenv").config();
const PORT = 2244
const cors = require('cors');

app.use(express.json())
app.use(cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// connect express.js with mongoDB
const connect = async () => {
    return new mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
}

// Folder Schema
const folderSchema = new mongoose.Schema(
    {
        folderName: {type: String},
        links: {type: Array},
        folderSize: {type: Number},
        timestamp: {type: Number},
        type: {type: String}
    }, 
    { versionKey: false }
)

// Folder modal
const FolderModal = mongoose.model("drive", folderSchema);


// Get Endpoint
router.get("/", async (req, res) => {
    const folder = await FolderModal.find();
    return res.status(200).json({data: folder})
})


// Get by ID Endpoint
router.get("/:id", async (req, res) => {
    try {
        const folder = await FolderModal.findById(req.params.id);
        return res.status(200).json({data: folder})
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
})


// Post Endpoint
router.post("/", async (req, res) => {
    try {
        const newFolderBody = {
            "folderName": req.body.folderName,
            "links": req.body.links,
            "folderSize": req.body.folderSize,
            "timestamp": req.body.timestamp,
            "type": req.body.type
        }
        const newFolder = FolderModal.create(newFolderBody)
        return res.status(200).json({data: "Folder added successfully"})
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
})


// Patch Endpoint
router.patch("/:id", async (req, res) => {
    try {
        const allFolders = await FolderModal.findByIdAndUpdate(req.params.id, req.body, { new: true})
        return res.status(200).json({data: allFolders})
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
})


// Delete Endpoint
router.delete("/:id", async (req, res) => {
    try {
        const allFolders = await FolderModal.findByIdAndDelete(req.params.id)
        return res.status(200).json({data: "Folder deleted successfully"})
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
})


// "folders" collection connected with route
app.use("/drive", router)

app.listen(process.env.PORT || PORT, async () => {
    await connect()
    console.log(`Listening on port ${PORT}`);
})