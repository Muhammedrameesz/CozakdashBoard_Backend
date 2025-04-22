const ProjectSchema = require("../models/projectModel");
const CloudineryIntance = require("../config/Cloudinery");
const AdminSchema = require("../models/adminModal");

const AddProjects = async (req, res) => {
  try {
    if (!req.file) {
      console.log("Image not received");
      return res.status(400).json({ message: "Cannot find image file" });
    }

    const result = await CloudineryIntance.uploader.upload(req.file.path, {
      folder: "Cozak",
    });

    const imageUrl = result.secure_url;
    const { projectName, projectLink, projectDescription, projectStatus } =
      req.body;

    if (!projectName || !projectLink || !projectDescription || !projectStatus) {
      return res.status(400).json({ message: "Incomplete project data" });
    }

    const adminEmail = req.admin;
    if (!adminEmail) {
      console.log("Admin token failed");
      return res
        .status(401)
        .json({ message: "Unauthorized: Admin token missing" });
    }

    const adminExist = await AdminSchema.findOne({ email: adminEmail });

    if (!adminExist) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const newProject = new ProjectSchema({
      projectName,
      projectLink,
      projectDescription,
      projectStatus,
      projectImage: imageUrl,
      adminID: adminExist._id,
    });

    await newProject.save();

    return res.status(200).json({
      message: "Project added successfully",
      project: newProject,
    });
  } catch (error) {
    console.error("Error adding project:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

      //Get Project 

const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const projects = await ProjectSchema.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ProjectSchema.countDocuments();

    return res.status(200).json({
      projects,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProjects: total,
    });
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch projects", error: error.message });
  }
};


          // Update Status
const updateProjectStatus = async (req, res) => {
  try {
    const { projectId, status } = req.body;

    if (!projectId || !status) {
      return res
        .status(400)
        .json({ message: "Project ID and status are required." });
    }

    const newStatus = status === "Active" ? "Inactive" : "Active";

    const updatedProject = await ProjectSchema.findByIdAndUpdate(
      projectId,
      { projectStatus: newStatus },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.status(200).json({
      message: "Project status updated successfully.",
    });
  } catch (error) {
    console.error("Error updating project status:", error);
    res
      .status(500)
      .json({ message: "Internal server error while updating status." });
  }
};

        // Delete Project
const DeleteProjects = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      console.log("projectId not found");
      return res.status(400).json({ message: "projectId not provided" });
    }

    const deletedProject = await ProjectSchema.findByIdAndDelete(projectId);

    if (!deletedProject) {
      console.log("project not found");
      return res.status(404).json({ message: "project not found" });
    }

   
    if (deletedProject.projectImage) {
      const folderName = "Cozak";
      const ImagePath = deletedProject.projectImage.split("/").slice(-folderName.split("/").length - 1).join("/");
      const imagePublicId = ImagePath.split(".")[0];

      try {
        await CloudineryIntance.uploader.destroy(imagePublicId);
      } catch (cloudErr) {
        console.warn("Error deleting image from Cloudinary:", cloudErr.message);
      }
    }

    return res.status(200).json({ message: "project deleted successfully" });

  } catch (error) {
    console.error("error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const EditProject = async (req, res) => {
  
  try {
    const { projectId, projectName, projectLink, projectDescription, projectStatus } = req.body;

    if (!projectId) return res.status(400).json({ message: "projectId is required" });
    if (!projectName || !projectLink || !projectDescription || !projectStatus) {
      return res.status(400).json({ message: "Incomplete project data" });
    }

    const currentProject = await ProjectSchema.findById(projectId).lean();
    if (!currentProject) return res.status(404).json({ message: "Project not found" });

    let projectImage = currentProject.projectImage; 

    if (req.file) {
      // Delete old image from Cloudinary
      const folderName = "Cozak";
      try {
        const imagePublicId = projectImage
          .split("/")
          .slice(-folderName.split("/").length - 1)
          .join("/")
          .split(".")[0];
        await CloudineryIntance.uploader.destroy(imagePublicId);
      } catch (cloudErr) {
        console.warn("Error deleting old image:", cloudErr.message);
      }

      // Upload new image
      const uploadResult = await CloudineryIntance.uploader.upload(req.file.path, {
        folder: folderName,
        transformation: [{ width: 800, crop: "scale" }],
      });

      projectImage = uploadResult.secure_url; 
    }

    const adminEmail = req.admin;
    if (!adminEmail) return res.status(401).json({ message: "Unauthorized: Admin token missing" });

    const admin = await AdminSchema.findOne({ email: adminEmail }).select("_id");
    if (!admin) return res.status(401).json({ message: "Unauthorized: Admin not found" });

    const updatedProject = await ProjectSchema.findByIdAndUpdate(
      projectId,
      {
        projectName,
        projectLink,
        projectDescription,
        projectStatus,
        projectImage,
        adminID: admin._id,
      },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(500).json({ message: "Failed to update project" });
    }

    return res.status(200).json({
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("EditProject Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const TotalProjects = async (req, res) => {
  try {
    const [total, active, inactive] = await Promise.all([
      ProjectSchema.countDocuments(),
      ProjectSchema.countDocuments({ projectStatus: "Active" }),
      ProjectSchema.countDocuments({ projectStatus: "Inactive" }),
    ]);

    return res.status(200).json({
      TotalProjects: total,
      ActiveProjects: active,
      InactiveProjects: inactive,
    });
  } catch (error) {
    console.error("Error getting total projects:", error);
    return res.status(500).json({
      message: "Server error while fetching total projects",
    });
  }
};




module.exports = { AddProjects, getProjects, updateProjectStatus,DeleteProjects,EditProject,TotalProjects};
