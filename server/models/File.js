const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      default: "",
    },

    language: {
      type: String,
      default: "javascript",
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("File", fileSchema);