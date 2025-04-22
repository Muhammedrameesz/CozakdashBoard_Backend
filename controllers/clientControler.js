const ClientSchema = require("../models/clientModal");
const CloudineryIntance = require("../config/Cloudinery");
const AdminSchema = require("../models/adminModal");
const cloudinaryIntance = require("../config/Cloudinery");

const AddClients = async (req, res) => {
  try {
    if (!req.file) {
      console.log("Image not received");
      return res.status(400).json({ message: "Cannot find image file" });
    }

    const { clientName, clientDescription } = req.body;

    if (!clientName || !clientDescription) {
      return res.status(400).json({ message: "Incomplete project data" });
    }

    const result = await CloudineryIntance.uploader.upload(req.file.path, {
      folder: "Cozak",
    });

    const imageUrl = result.secure_url;

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

    const newClient = new ClientSchema({
      clientName,
      clientDescription,
      clientLogo: imageUrl,
      adminID: adminExist._id,
    });

    await newClient.save();

    return res.status(200).json({
      message: "Client added successfully",
    });
  } catch (error) {
    console.error("Error adding client:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

const getClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const clients = await ClientSchema.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ClientSchema.countDocuments();

    return res.status(200).json({
      clients,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalClients: total,
    });
  } catch (error) {
    console.error("Error fetching clients:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch clients", error: error.message });
  }
};


const DeleteClients = async (req, res) => {
  console.log("hitted");
  
  try {
    const { clientId } = req.body;

    if (!clientId) {
      console.log("clientId not found");
      return res.status(400).json({ message: "clientId not provided" });
    }
 
    const deletedClient = await ClientSchema.findByIdAndDelete(clientId);

    if (!deletedClient) {
      console.log("client not found");
      return res.status(404).json({ message: "client not found" });
    }

   
    if (deletedClient.clientLogo) {
      const folderName = "Cozak";
      const logoPath = deletedClient.clientLogo.split("/").slice(-folderName.split("/").length - 1).join("/");
      const imagePublicId = logoPath.split(".")[0];

      try {
        await cloudinaryIntance.uploader.destroy(imagePublicId);
      } catch (cloudErr) {
        console.warn("Error deleting image from Cloudinary:", cloudErr.message);
      }
    }

    return res.status(200).json({ message: "client deleted successfully" });

  } catch (error) {
    console.error("error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const EditClient = async (req, res) => {

  try {
    const { clientId, clientName, clientDescription } = req.body;

    if (!clientId) return res.status(400).json({ message: "clientId is required" });
    if (!clientName || !clientDescription) {
      return res.status(400).json({ message: "Incomplete client data" });
    }

    const currentClient = await ClientSchema.findById(clientId).lean();
    if (!currentClient) return res.status(404).json({ message: "Client not found" });

    let clientLogo = currentClient.clientLogo;

    if (req.file) {
      const folderName = "Cozak";
      try {
        const imagePublicId = clientLogo
          .split("/")
          .slice(-folderName.split("/").length - 1)
          .join("/")
          .split(".")[0];
        await CloudineryIntance.uploader.destroy(imagePublicId);
      } catch (cloudErr) {
        console.warn("Error deleting old image:", cloudErr.message);
      }

      const uploadResult = await CloudineryIntance.uploader.upload(req.file.path, {
        folder: folderName,
        transformation: [{ width: 800, crop: "scale" }],
      });

      clientLogo = uploadResult.secure_url;
    }

    const adminEmail = req.admin;
    if (!adminEmail) return res.status(401).json({ message: "Unauthorized: Admin token missing" });

    const admin = await AdminSchema.findOne({ email: adminEmail }).select("_id");
    if (!admin) return res.status(401).json({ message: "Unauthorized: Admin not found" });

    const updatedClient = await ClientSchema.findByIdAndUpdate(
      clientId,
      {
        clientName,
        clientDescription,
        clientLogo,
        adminID: admin._id,
      },
      { new: true }
    );

    if (!updatedClient) {
      return res.status(500).json({ message: "Failed to update client" });
    }

    return res.status(200).json({
      message: "Client updated successfully",
    });
  } catch (error) {
    console.error("EditClient Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const TotalClients = async (req,res) => {
  try {
    const total = await ClientSchema.countDocuments();
    return res.status(200).json({ TotalClients: total });
  } catch (error) {
    console.error("Error getting total clients:", error);
    return res.status(500).json({ message: "Server error while fetching total projects" });
  }
};



module.exports = { AddClients, getClients,DeleteClients,EditClient,TotalClients };
