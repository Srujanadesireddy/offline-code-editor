const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folder",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Folder", folderSchema);