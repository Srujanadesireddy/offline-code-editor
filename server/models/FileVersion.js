const mongoose = require("mongoose");

const fileVersionSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },

    content: {
      type: String,
      default: "",
    },

    versionNumber: {
      type: Number,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "FileVersion",
  fileVersionSchema
);