import connectDB from "../lib/mongodb";
import User from "../models/User";

async function createAdminUser() {
  try {
    await connectDB();

    const adminUser = await User.findOne({ username: "admin" });

    if (adminUser) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const newAdmin = new User({
      username: "admin",
      password: "admin123", // This will be hashed by the pre-save hook
      role: "admin",
    });

    await newAdmin.save();
    console.log("Admin user created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
