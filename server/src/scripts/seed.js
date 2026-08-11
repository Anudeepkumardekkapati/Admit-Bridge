require("dotenv").config({ path: __dirname + "/../../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const ConsultantProfile = require("../models/ConsultantProfile");
const University = require("../models/University");
const Application = require("../models/Application");
const connectDB = require("../config/db");

const universities = [
  {
    name: "Stanford University",
    country: "USA",
    location: "Stanford, California",
    worldRank: 3,
    avgGre: 330,
    avgToefl: 110,
    ieltsRequirement: 7.5,
    greRequirement: 320,
    avgCgpa: 9.5, // 10-point scale (matches StudentProfile.cgpa)
    acceptanceRate: 4,
    tuitionFee: 60000,
    eligibility: "Bachelor's degree with strong academics; GRE required",
    applicationDeadline: "Dec 5, 2026",
    requirements: ["Statement of Purpose", "2 Letters of Recommendation", "Transcripts", "GRE Scores"],
    programs: ["Computer Science", "Electrical Engineering", "Data Science"],
  },
  {
    name: "Massachusetts Institute of Technology (MIT)",
    country: "USA",
    location: "Cambridge, Massachusetts",
    worldRank: 1,
    avgGre: 332,
    avgToefl: 112,
    ieltsRequirement: 7.5,
    greRequirement: 325,
    avgCgpa: 9.6,
    acceptanceRate: 5,
    tuitionFee: 58000,
    eligibility: "Bachelor's degree in related field; GRE strongly recommended",
    applicationDeadline: "Dec 1, 2026",
    requirements: ["Statement of Purpose", "3 Letters of Recommendation", "Transcripts", "GRE Scores"],
    programs: ["Computer Science", "Artificial Intelligence", "Robotics"],
  },
  {
    name: "University of Toronto",
    country: "Canada",
    location: "Toronto, Ontario",
    worldRank: 25,
    avgGre: 320,
    avgToefl: 105,
    ieltsRequirement: 7.0,
    greRequirement: 315,
    avgCgpa: 8.5,
    acceptanceRate: 35,
    tuitionFee: 45000,
    eligibility: "Bachelor's degree; English proficiency required",
    applicationDeadline: "Jan 15, 2027",
    requirements: ["Statement of Interest", "2 Letters of Recommendation", "Transcripts"],
    programs: ["Computer Science", "Information Systems", "Data Science"],
  },
  {
    name: "Technical University of Munich",
    country: "Germany",
    location: "Munich, Bavaria",
    worldRank: 50,
    avgGre: 315,
    avgToefl: 100,
    ieltsRequirement: 6.5,
    greRequirement: 310,
    avgCgpa: 8.0,
    acceptanceRate: 20,
    tuitionFee: 3000,
    eligibility: "Bachelor's degree in a relevant field; no GRE for most programs",
    applicationDeadline: "May 31, 2027",
    requirements: ["Transcripts", "CV", "Motivation Letter", "German or English proficiency"],
    programs: ["Informatics", "Data Engineering", "Computer Science"],
  },
  {
    name: "University of British Columbia",
    country: "Canada",
    location: "Vancouver, British Columbia",
    worldRank: 40,
    avgGre: 318,
    avgToefl: 100,
    ieltsRequirement: 6.5,
    greRequirement: 310,
    avgCgpa: 8.2,
    acceptanceRate: 45,
    tuitionFee: 38000,
    eligibility: "Bachelor's degree with minimum B+ average; English proficiency required",
    applicationDeadline: "Jan 31, 2027",
    requirements: ["Statement of Interest", "2 Letters of Recommendation", "Transcripts"],
    programs: ["Computer Science", "Business Analytics", "Engineering"],
  },
  {
    name: "University of Melbourne",
    country: "Australia",
    location: "Melbourne, Victoria",
    worldRank: 33,
    avgGre: 312,
    avgToefl: 94,
    ieltsRequirement: 6.5,
    greRequirement: 305,
    avgCgpa: 7.8,
    acceptanceRate: 55,
    tuitionFee: 40000,
    eligibility: "Bachelor's degree; English proficiency required",
    applicationDeadline: "Oct 31, 2026",
    requirements: ["Transcripts", "Personal Statement", "English Proficiency"],
    programs: ["Computer Science", "Data Science", "Information Systems"],
  },
  {
    name: "National University of Singapore",
    country: "Singapore",
    location: "Singapore",
    worldRank: 8,
    avgGre: 325,
    avgToefl: 105,
    ieltsRequirement: 7.0,
    greRequirement: 318,
    avgCgpa: 9.0,
    acceptanceRate: 12,
    tuitionFee: 30000,
    eligibility: "Bachelor's degree with strong grades; GRE for competitive programs",
    applicationDeadline: "Jan 15, 2027",
    requirements: ["Statement of Purpose", "2 Letters of Recommendation", "Transcripts", "GRE Scores"],
    programs: ["Computer Science", "Data Science", "Artificial Intelligence"],
  },
  {
    name: "ETH Zurich",
    country: "Switzerland",
    location: "Zurich",
    worldRank: 9,
    avgGre: 328,
    avgToefl: 108,
    ieltsRequirement: 7.0,
    greRequirement: 320,
    avgCgpa: 9.2,
    acceptanceRate: 10,
    tuitionFee: 2500,
    eligibility: "Bachelor's degree with excellent grades; strong quantitative background",
    applicationDeadline: "Dec 15, 2026",
    requirements: ["Transcripts", "CV", "2 Letters of Recommendation", "Motivation Letter"],
    programs: ["Computer Science", "Data Science", "Robotics"],
  },
  {
    name: "University of Edinburgh",
    country: "UK",
    location: "Edinburgh, Scotland",
    worldRank: 27,
    avgGre: 315,
    avgToefl: 100,
    ieltsRequirement: 7.0,
    greRequirement: 310,
    avgCgpa: 8.3,
    acceptanceRate: 50,
    tuitionFee: 32000,
    eligibility: "Bachelor's degree; English proficiency required; GRE optional",
    applicationDeadline: "Mar 31, 2027",
    requirements: ["Personal Statement", "2 Letters of Recommendation", "Transcripts"],
    programs: ["Computer Science", "Artificial Intelligence", "Informatics"],
  },
  {
    name: "Delft University of Technology",
    country: "Netherlands",
    location: "Delft, South Holland",
    worldRank: 57,
    avgGre: 310,
    avgToefl: 95,
    ieltsRequirement: 6.5,
    greRequirement: 305,
    avgCgpa: 7.8,
    acceptanceRate: 25,
    tuitionFee: 20000,
    eligibility: "Bachelor's degree in a relevant engineering field; CGPA requirement",
    applicationDeadline: "Apr 1, 2027",
    requirements: ["Transcripts", "CV", "Motivation Letter", "Portfolio (design programs)"],
    programs: ["Computer Science", "Data Science", "Engineering"],
  },
  {
    name: "Arizona State University",
    country: "USA",
    location: "Tempe, Arizona",
    worldRank: 200,
    avgGre: 305,
    avgToefl: 90,
    ieltsRequirement: 6.5,
    greRequirement: 300,
    avgCgpa: 7.2,
    acceptanceRate: 88,
    tuitionFee: 28000,
    eligibility: "Bachelor's degree; GRE optional for most programs",
    applicationDeadline: "Jun 1, 2027",
    requirements: ["Transcripts", "Resume", "Statement of Purpose"],
    programs: ["Computer Science", "Data Science", "Business Analytics"],
  },
  {
    name: "University of Waterloo",
    country: "Canada",
    location: "Waterloo, Ontario",
    worldRank: 112,
    avgGre: 318,
    avgToefl: 100,
    ieltsRequirement: 7.0,
    greRequirement: 310,
    avgCgpa: 8.6,
    acceptanceRate: 40,
    tuitionFee: 42000,
    eligibility: "Bachelor's degree; strong math background; co-op program experience preferred",
    applicationDeadline: "Jan 15, 2027",
    requirements: ["Transcripts", "2 Letters of Recommendation", "Statement of Interest"],
    programs: ["Computer Science", "Software Engineering", "Data Science"],
  },
  {
    name: "University of Auckland",
    country: "New Zealand",
    location: "Auckland",
    worldRank: 95,
    avgGre: 305,
    avgToefl: 90,
    ieltsRequirement: 6.5,
    greRequirement: 300,
    avgCgpa: 7.5,
    acceptanceRate: 65,
    tuitionFee: 35000,
    eligibility: "Bachelor's degree; English proficiency required",
    applicationDeadline: "Jul 1, 2027",
    requirements: ["Transcripts", "Personal Statement", "English Proficiency"],
    programs: ["Computer Science", "Information Systems", "Business Analytics"],
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
    await Application.deleteMany({});
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

    const anudeepUser = await User.create({
      name: "Anudeep Kumar",
      email: "anudeep@example.com",
      password: "password123",
      role: "student",
    });

    console.log("Users seeded!");

    // Seed Profiles
    await ConsultantProfile.create({
      user: consultantUser._id,
      expertise: ["USA", "Canada", "Computer Science"],
      bio: "Expert in graduate admissions for STEM programs.",
      assignedStudents: [studentUser._id, anudeepUser._id],
    });

    await StudentProfile.create({
      user: studentUser._id,
      greScore: 325,
      toeflScore: 108,
      ieltsScore: 7.5,
      cgpa: 9.0,
      percentage: 90,
      preferredCountry: "Canada",
      budget: 45000,
      researchExperience: 12,
      workExperience: 6,
      intendedMajor: "Computer Science",
      specialization: "Artificial Intelligence",
      bachelorDegree: "B.Tech in Computer Science",
      bachelorUniversity: "IIT Delhi",
      skills: ["Python", "Machine Learning", "SQL", "PyTorch"],
      targetTerm: "Fall 2027",
    });

    await StudentProfile.create({
      user: anudeepUser._id,
      greScore: 315,
      toeflScore: 102,
      ieltsScore: 7.5,
      cgpa: 8.4,
      percentage: 84,
      preferredCountry: "USA",
      budget: 35000,
      researchExperience: 6,
      workExperience: 24,
      intendedMajor: "MS Computer Science",
      specialization: "Data Science",
      bachelorDegree: "B.Tech in Information Technology",
      bachelorUniversity: "JNTU Hyderabad",
      skills: ["Java", "Python", "AWS", "Big Data"],
      targetTerm: "Fall 2027",
    });

    console.log("Profiles seeded!");

    // Seed Applications (real records linked to students + universities)
    const byName = async (name) => University.findOne({ name });
    const uToronto = await byName("University of Toronto");
    const tum = await byName("Technical University of Munich");
    const ubc = await byName("University of British Columbia");
    const nus = await byName("National University of Singapore");

    const mkApplication = (user, uni, course, status, daysAgo) => ({
      student: user._id,
      university: uni._id,
      course,
      status,
      submittedDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      studentName: user.name,
      studentEmail: user.email,
      universityName: uni.name,
      country: uni.country,
    });

    await Application.create([
      // Alice's applications (as seen in the live app)
      mkApplication(studentUser, uToronto, "Data Science", "Shortlisted", 12),
      mkApplication(studentUser, tum, "Computer Science", "Under Review", 5),
      // Anudeep's applications: one per college, different statuses
      mkApplication(anudeepUser, uToronto, "MS Computer Science", "Applied", 10),
      mkApplication(anudeepUser, ubc, "MS Data Science", "Under Review", 7),
      mkApplication(anudeepUser, nus, "MS Artificial Intelligence", "Shortlisted", 3),
    ]);

    console.log("Applications seeded!");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
