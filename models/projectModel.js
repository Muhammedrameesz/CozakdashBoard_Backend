const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    projectLink: {
      type: String,
      required: true,
    },
    projectDescription: {
      type: String,
      required: true,
      trim: true,
    },
    projectStatus: {
      type: String,
      required: true,
      enum: ["Active","Inactive"],
    },
    projectImage: {
      type: String,
      required: true,
    },
    adminID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

const ProjectModel = mongoose.model("ProjectDetails", projectSchema);
module.exports = ProjectModel;
