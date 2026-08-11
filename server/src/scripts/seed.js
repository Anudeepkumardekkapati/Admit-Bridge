require("dotenv").config({ path: __dirname + "/../../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const ConsultantProfile = require("../models/ConsultantProfile");
const University = require("../models/University");
const connectDB = require("../config/db");

const universities = [
  {
    name: "Stanford University",
    country: "USA",
    worldRank: 3,
    avgGre: 330,
    avgToefl: 110,
    avgCgpa: 3.8, // on 4.0 scale, wait our schema is up to 10? let's use 10 point scale. 3.8 is ~ 9.5
    acceptanceRate: 4,
    tuitionFee: 60000,
    programs: ["Computer Science", "Electrical Engineering", "Data Science"],
  },
  {
    name: "Massachusetts Institute of Technology (MIT)",
    country: "USA",
    worldRank: 1,
    avgGre: 332,
    avgToefl: 112,
    avgCgpa: 9.6,
    acceptanceRate: 5,
    tuitionFee: 58000,
    programs: ["Computer Science", "Artificial Intelligence", "Robotics"],
  },
  {
    name: "University of Toronto",
    country: "Canada",
    worldRank: 25,
    avgGre: 320,
    avgToefl: 105,
    avgCgpa: 8.5,
    acceptanceRate: 35,
    tuitionFee: 45000,
    programs: ["Computer Science", "Information Systems"],
  },
  {
    name: "Technical University of Munich",
    country: "Germany",
    worldRank: 50,
    avgGre: 315,
    avgToefl: 100,
    avgCgpa: 8.0,
    acceptanceRate: 20,
    tuitionFee: 3000,
    programs: ["Informatics", "Data Engineering"],
  },
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await ConsultantProfile.deleteMany({});
    await University.deleteMany({});
    console.log("Existing data cleared!");

    // Seed Universities
    await University.insertMany(universities);
    console.log("Universities seeded!");

    // Seed Users
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@admitbridge.com",
      password: "password123",
      role: "admin",
    });

    const consultantUser = await User.create({
      name: "John Consultant",
      email: "consultant@admitbridge.com",
      password: "password123",
      role: "consultant",
    });

    const studentUser = await User.create({
      name: "Alice Student",
      email: "student@admitbridge.com",
      password: "password123",
      role: "student",
    });

    console.log("Users seeded!");

    // Seed Profiles
    await ConsultantProfile.create({
      user: consultantUser._id,
      expertise: ["USA", "Computer Science"],
      bio: "Expert in Ivy League admissions.",
      assignedStudents: [studentUser._id],
    });

    await StudentProfile.create({
      user: studentUser._id,
      greScore: 325,
      toeflScore: 108,
      cgpa: 9.0,
      researchExperience: 12,
      intendedMajor: "Computer Science",
      targetTerm: "Fall 2027",
    });

    console.log("Profiles seeded!");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
