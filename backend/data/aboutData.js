// backend/data/aboutData.js

const teamMembers = [
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
];

const stats = [
  { value: "10,000+", label: "Lives Saved" },
  { value: "5,000+", label: "Active Donors" },
  { value: "200+", label: "Partner Hospitals" },
  { value: "24/7", label: "Emergency Support" }
];

const partners = [
  { name: "Red Cross", logo: "https://via.placeholder.com/150x60?text=Red+Cross" },
  { name: "Children's Hospital", logo: "https://via.placeholder.com/150x60?text=Children's+Hospital" },
  { name: "National Blood Service", logo: "https://via.placeholder.com/150x60?text=National+Blood+Service" },
  { name: "City Medical Center", logo: "https://via.placeholder.com/150x60?text=City+Medical+Center" }
];

module.exports = { teamMembers, stats, partners };
