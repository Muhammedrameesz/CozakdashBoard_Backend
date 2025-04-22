const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },

    clientDescription: {
      type: String,
      required: true,
      trim: true,
    },
    
    clientLogo: {
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

const clientModel = mongoose.model("ClientDetails",clientSchema);
module.exports = clientModel;
