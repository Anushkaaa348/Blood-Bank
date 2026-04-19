const mongoose = require('mongoose');
const TeamMember = require('./models/TeamMember');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await TeamMember.deleteMany();

  await TeamMember.insertMany([
    {
      name: "Dr. Sarah Johnson",
      role: "Medical Director",
      bio: "Board-certified hematologist with 15+ years experience in transfusion medicine."
    },
    {
      name: "Michael Chen",
      role: "Technology Lead",
      bio: "Software engineer passionate about using technology to save lives."
    },
    {
      name: "Priya Patel",
      role: "Community Outreach",
      bio: "Public health specialist connecting donors with local blood banks."
    }
  ]);

  console.log("✅ Team members seeded!");
  mongoose.disconnect();
});
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});