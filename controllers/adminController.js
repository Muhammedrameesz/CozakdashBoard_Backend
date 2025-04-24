const AdminModel = require("../models/adminModal");
const bcrypt = require("bcrypt");
const { GenerateAdminToken } = require("../utils/AccessToken");

const adminSignUp = async (req, res) => {
  try {
    const { firstName, lastName, password, email, phoneNumber, role } =
      req.body;

    if (!firstName || !lastName || !password || !email || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = new AdminModel({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashPassword,
      role: role || "admin",
    });

    await newAdmin.save();
    console.log("Admin registered:");

    res.status(200).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("Error in adminSignUp:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = GenerateAdminToken(admin.email);
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log("Login successful");

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error in adminLogin:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyAdmin = async (req, res) => {
  try {
    const email = req.admin;

    if (!email) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      message: "Admin verified",
      admin: admin,
    });
  } catch (error) {
    console.error("Error in verifyAdmin:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const adminLogout = (req, res) => {
  try {
    if (!req.cookies.adminToken) {
      return res
        .status(400)
        .json({ message: "No token found, already logged out" });
    }
    console.log("Admin logout successful");
    res.cookie("adminToken", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error in adminLogout:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { firstName, lastName, id, email, phoneNumber, role } = req.body;
    if (!firstName || !lastName || !id || !email || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingAdmin = await AdminModel.findById(id).lean();
    if (!existingAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const existingPhone = await AdminModel.findOne({
      phoneNumber,
      _id: { $ne: id },
    });

    if (existingPhone) {
      return res
        .status(409)
        .json({ message: "Phone number is already in use" });
    }

    const updatedAdmin = await AdminModel.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        email,
        phoneNumber,
        role: role || existingAdmin.role,
        password: existingAdmin.password,
      },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(403).json({ message: "Failed to update admin" });
    }

    return res.status(200).json({ message: "Admin updated successfully" });
  } catch (error) {
    console.error("Update admin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const UpdatePassword = async (req, res) => {
  try {
    const { adminId, currentPassword, newPassword } = req.body;

    if (!adminId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const admin = await AdminModel.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const updateResult = await AdminModel.updateOne(
      { _id: adminId },
      { password: hashedPassword }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({ message: "Failed to update password" });
    }

    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Error in UpdatePassword:", error);
    res.status(500).json({ message: "An unexpected error occurred while updating password" });
  }
};

module.exports = {
  adminSignUp,
  adminLogin,
  verifyAdmin,
  adminLogout,
  updateAdmin,
  UpdatePassword,
};
