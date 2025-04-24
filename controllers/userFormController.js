const UserForm = require("../models/userFormModal");

const saveUserInputs = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, message } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !message) {
      return res.status(400).json({ message: "Incomplete input fields" });
    }

    const newUserForm = new UserForm({
      firstName,
      lastName,
      email,
      phoneNumber,
      message,
    });
    await newUserForm.save();
    if(!newUserForm){
      res.status(400).json({message:"user inputs not saved"})
    }
    res.status(200).json({ message: "User form saved successfully" });
  } catch (error) {
    console.error("Error saving user form:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getAllUserInputs = async (req, res) => {
  try {
    const forms = await UserForm.find().sort({ createdAt: -1 });
    res.status(200).json(forms);
  } catch (error) {
    console.error("Error fetching user forms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


  const FormCount = async (req,res) => {
    try {
      const total = await UserForm.countDocuments();
      return res.status(200).json({ TotalForms: total });
    } catch (error) {
      console.error("Error getting total forms:", error);
      return res.status(500).json({ message: "Server error while fetching total projects" });
    }
  };

  const DeleteEnquiry = async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ message: "Enquiry ID is required" });
      }
  
      const deleted = await UserForm.findByIdAndDelete(id);
  
      if (!deleted) {
        return res.status(404).json({ message: "Enquiry not found" });
      }
  
      return res.status(200).json({ message: "Enquiry deleted successfully" });
    } catch (error) {
      console.error("DeleteEnquiry Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

module.exports = { saveUserInputs, getAllUserInputs,FormCount,DeleteEnquiry };
