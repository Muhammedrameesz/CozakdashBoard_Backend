require("dotenv").config();
const mongoose = require("mongoose");


const DBconnect = async () => {
  try {
    if (!process.env.DB_URI) {
      throw new Error("Missing DB_URI in environment variables");
    }

    await mongoose.connect(process.env.DB_URI); 

    console.log("✅ Database connected successfully");
    
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = DBconnect;
