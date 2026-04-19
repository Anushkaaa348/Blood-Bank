const mongoose = require('mongoose');
const DonationCenter = require('./models/DonationCenter');
require('dotenv').config();

const sampleCenters = [
  // Original 6 centers
  {
    name: "LifeBlood Pune Center",
    address: "45 Wellness Road, Shivajinagar",
    city: "Pune",
    state: "Maharashtra",
    zipCode: "411005",
    location: {
      type: "Point",
      coordinates: [73.8567, 18.5204]
    },
    hours: "Mon-Sat: 8:30AM-7:30PM",
    phone: "9123456780",
    services: ["Whole Blood", "Plasma", "Platelets", "Pediatric Donation"]
  },
  {
    name: "Gift of Life Ahmedabad",
    address: "32 Health Avenue, Navrangpura",
    city: "Ahmedabad",
    state: "Gujarat",
    zipCode: "380009",
    location: {
      type: "Point",
      coordinates: [72.5714, 23.0225]
    },
    hours: "Mon-Fri: 9AM-6PM, Sat: 9AM-2PM",
    phone: "9123456781",
    services: ["Whole Blood", "Platelets", "Double Red Cell"]
  },
  {
    name: "Jaipur Blood Care",
    address: "78 Vitality Circle, Vaishali Nagar",
    city: "Jaipur",
    state: "Rajasthan",
    zipCode: "302021",
    location: {
      type: "Point",
      coordinates: [75.7873, 26.9124]
    },
    hours: "Mon-Sun: 8AM-8PM",
    phone: "9123456782",
    services: ["Whole Blood", "Plasma", "Autologous Donation"]
  },
  {
    name: "Lucknow Hematology Hub",
    address: "12 Lifeline Plaza, Gomti Nagar",
    city: "Lucknow",
    state: "Uttar Pradesh",
    zipCode: "226010",
    location: {
      type: "Point",
      coordinates: [80.9462, 26.8467]
    },
    hours: "Mon-Sat: 8AM-6PM",
    phone: "9123456783",
    services: ["Whole Blood", "Platelets", "Therapeutic Phlebotomy"]
  },
  {
    name: "Coimbatore Blood Bank",
    address: "56 Transfusion Tower, RS Puram",
    city: "Coimbatore",
    state: "Tamil Nadu",
    zipCode: "641002",
    location: {
      type: "Point",
      coordinates: [76.9558, 11.0168]
    },
    hours: "Mon-Fri: 7:30AM-5:30PM, Sat: 8AM-1PM",
    phone: "9123456784",
    services: ["Whole Blood", "Plasma", "Cord Blood"]
  },
  {
    name: "Chandigarh Blood Services",
    address: "89 Donation Street, Sector 34",
    city: "Chandigarh",
    state: "Chandigarh",
    zipCode: "160022",
    location: {
      type: "Point",
      coordinates: [76.7794, 30.7333]
    },
    hours: "Mon-Sat: 8AM-7PM",
    phone: "9123456785",
    services: ["Whole Blood", "Platelets", "Stem Cell"]
  },

  // Previous 9 centers
  {
    name: "Delhi National Blood Center",
    address: "1 Health Plaza, Connaught Place",
    city: "New Delhi",
    state: "Delhi",
    zipCode: "110001",
    location: {
      type: "Point",
      coordinates: [77.2090, 28.6139]
    },
    hours: "Mon-Sun: 8AM-8PM",
    phone: "9111223344",
    services: ["Whole Blood", "Plasma", "Platelets", "Rare Blood Types"]
  },
  {
    name: "Mumbai Central Blood Bank",
    address: "25 Lifeline Building, Colaba",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400005",
    location: {
      type: "Point",
      coordinates: [72.8258, 18.9220]
    },
    hours: "24/7",
    phone: "9122334455",
    services: ["Whole Blood", "Platelets", "Emergency Services"]
  },
  {
    name: "Bangalore Health Donors",
    address: "78 Medical Complex, MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    zipCode: "560001",
    location: {
      type: "Point",
      coordinates: [77.5946, 12.9716]
    },
    hours: "Mon-Sat: 9AM-6PM",
    phone: "9180445566",
    services: ["Whole Blood", "Plasma", "Pediatric Donation"]
  },
  {
    name: "Hyderabad Blood Care",
    address: "32 Donation Point, Banjara Hills",
    city: "Hyderabad",
    state: "Telangana",
    zipCode: "500034",
    location: {
      type: "Point",
      coordinates: [78.4564, 17.3850]
    },
    hours: "Mon-Fri: 8AM-7PM, Sat: 8AM-3PM",
    phone: "9140456789",
    services: ["Whole Blood", "Plasma", "Platelets"]
  },
  {
    name: "Kolkata Lifesavers",
    address: "12 Health Avenue, Park Street",
    city: "Kolkata",
    state: "West Bengal",
    zipCode: "700016",
    location: {
      type: "Point",
      coordinates: [88.3639, 22.5726]
    },
    hours: "Mon-Sat: 8:30AM-6:30PM",
    phone: "9133678901",
    services: ["Whole Blood", "Platelets", "Emergency Services"]
  },
  {
    name: "Chennai Blood Foundation",
    address: "56 Medical Plaza, T Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    zipCode: "600017",
    location: {
      type: "Point",
      coordinates: [80.2707, 13.0827]
    },
    hours: "Mon-Fri: 8AM-6PM, Sat: 8AM-2PM",
    phone: "9144890123",
    services: ["Whole Blood", "Plasma", "Cord Blood"]
  },
  {
    name: "Indore Blood Services",
    address: "34 Wellness Center, Vijay Nagar",
    city: "Indore",
    state: "Madhya Pradesh",
    zipCode: "452010",
    location: {
      type: "Point",
      coordinates: [75.8577, 22.7196]
    },
    hours: "Mon-Sat: 9AM-5PM",
    phone: "9173123456",
    services: ["Whole Blood", "Platelets"]
  },
  {
    name: "Bhopal Donation Hub",
    address: "78 Health Street, Arera Colony",
    city: "Bhopal",
    state: "Madhya Pradesh",
    zipCode: "462016",
    location: {
      type: "Point",
      coordinates: [77.4126, 23.2599]
    },
    hours: "Mon-Fri: 8:30AM-5:30PM",
    phone: "9176543210",
    services: ["Whole Blood", "Plasma", "Pediatric Donation"]
  },
  {
    name: "Goa Blood Center",
    address: "12 Beachside Medical, Panaji",
    city: "Panaji",
    state: "Goa",
    zipCode: "403001",
    location: {
      type: "Point",
      coordinates: [73.8278, 15.4909]
    },
    hours: "Mon-Sat: 9AM-4PM",
    phone: "9188123456",
    services: ["Whole Blood", "Platelets", "Tourist Donations"]
  },

  // NEW 20 CENTERS
  {
    name: "Kochi Marine Blood Bank",
    address: "21 Coastal Medical Hub, Marine Drive",
    city: "Kochi",
    state: "Kerala",
    zipCode: "682031",
    location: {
      type: "Point",
      coordinates: [76.2673, 9.9312]
    },
    hours: "Mon-Sat: 8AM-6PM",
    phone: "9148567890",
    services: ["Whole Blood", "Platelets", "Marine Emergency Services"]
  },
  {
    name: "Thiruvananthapuram Capital Blood Center",
    address: "67 Government Hospital Road, Pattom",
    city: "Thiruvananthapuram",
    state: "Kerala",
    zipCode: "695004",
    location: {
      type: "Point",
      coordinates: [76.9366, 8.5241]
    },
    hours: "Mon-Fri: 8AM-5PM, Sat: 8AM-1PM",
    phone: "9147123456",
    services: ["Whole Blood", "Plasma", "Government Services"]
  },
  {
    name: "Visakhapatnam Port Blood Bank",
    address: "45 Naval Hospital Complex, Beach Road",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    zipCode: "530003",
    location: {
      type: "Point",
      coordinates: [83.3005, 17.6868]
    },
    hours: "24/7",
    phone: "9186234567",
    services: ["Whole Blood", "Emergency Services", "Naval Support"]
  },
  {
    name: "Vijayawada Krishna Blood Center",
    address: "89 MG Road, Labbipet",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    zipCode: "520010",
    location: {
      type: "Point",
      coordinates: [80.6480, 16.5062]
    },
    hours: "Mon-Sat: 8:30AM-6:30PM",
    phone: "9186345678",
    services: ["Whole Blood", "Platelets", "Plasma"]
  },
  {
    name: "Bhubaneswar Temple City Blood Bank",
    address: "34 Kalinga Hospital Road, Patia",
    city: "Bhubaneswar",
    state: "Odisha",
    zipCode: "751024",
    location: {
      type: "Point",
      coordinates: [85.8245, 20.2961]
    },
    hours: "Mon-Sat: 9AM-5PM",
    phone: "9167456789",
    services: ["Whole Blood", "Platelets", "Pediatric Donation"]
  },
  {
    name: "Cuttack Silver City Blood Services",
    address: "12 Medical College Road, Buxi Bazaar",
    city: "Cuttack",
    state: "Odisha",
    zipCode: "753003",
    location: {
      type: "Point",
      coordinates: [85.8830, 20.4625]
    },
    hours: "Mon-Fri: 8AM-6PM",
    phone: "9167567890",
    services: ["Whole Blood", "Plasma", "Medical College Support"]
  },
  {
    name: "Ranchi Jharkhand Blood Center",
    address: "56 Main Road, Hindpiri",
    city: "Ranchi",
    state: "Jharkhand",
    zipCode: "834001",
    location: {
      type: "Point",
      coordinates: [85.3096, 23.3441]
    },
    hours: "Mon-Sat: 8AM-6PM",
    phone: "9165678901",
    services: ["Whole Blood", "Platelets", "Tribal Health Support"]
  },
  {
    name: "Jamshedpur Steel City Blood Bank",
    address: "78 Bistupur Market, Sakchi",
    city: "Jamshedpur",
    state: "Jharkhand",
    zipCode: "831001",
    location: {
      type: "Point",
      coordinates: [86.1844, 22.8046]
    },
    hours: "Mon-Sat: 8:30AM-6:30PM",
    phone: "9165789012",
    services: ["Whole Blood", "Plasma", "Industrial Health Services"]
  },
  {
    name: "Patna Capital Blood Services",
    address: "23 Boring Road, Patna",
    city: "Patna",
    state: "Bihar",
    zipCode: "800001",
    location: {
      type: "Point",
      coordinates: [85.1376, 25.5941]
    },
    hours: "Mon-Fri: 8AM-6PM, Sat: 8AM-2PM",
    phone: "9161234567",
    services: ["Whole Blood", "Platelets", "Government Hospital Support"]
  },
  {
    name: "Gaya Buddha Blood Center",
    address: "45 Station Road, Gaya",
    city: "Gaya",
    state: "Bihar",
    zipCode: "823001",
    location: {
      type: "Point",
      coordinates: [85.0002, 24.7914]
    },
    hours: "Mon-Sat: 9AM-5PM",
    phone: "9161345678",
    services: ["Whole Blood", "Platelets", "Pilgrimage Support"]
  },
  {
    name: "Guwahati Northeast Blood Hub",
    address: "67 GS Road, Paltan Bazaar",
    city: "Guwahati",
    state: "Assam",
    zipCode: "781001",
    location: {
      type: "Point",
      coordinates: [91.7362, 26.1445]
    },
    hours: "Mon-Sat: 8AM-6PM",
    phone: "9136123456",
    services: ["Whole Blood", "Platelets", "Northeast Regional Support"]
  },
  {
    name: "Shillong Hills Blood Center",
    address: "89 Police Bazaar, Shillong",
    city: "Shillong",
    state: "Meghalaya",
    zipCode: "793001",
    location: {
      type: "Point",
      coordinates: [91.8933, 25.5788]
    },
    hours: "Mon-Fri: 9AM-5PM",
    phone: "9136234567",
    services: ["Whole Blood", "Platelets", "Hill Station Services"]
  },
  {
    name: "Imphal Valley Blood Bank",
    address: "12 Thangal Bazaar, Imphal West",
    city: "Imphal",
    state: "Manipur",
    zipCode: "795001",
    location: {
      type: "Point",
      coordinates: [93.9063, 24.8170]
    },
    hours: "Mon-Sat: 8:30AM-5:30PM",
    phone: "9138567890",
    services: ["Whole Blood", "Platelets", "Border Area Support"]
  },
  {
    name: "Agartala Tripura Blood Services",
    address: "34 Kaman Chowmuhani, West Tripura",
    city: "Agartala",
    state: "Tripura",
    zipCode: "799001",
    location: {
      type: "Point",
      coordinates: [91.2868, 23.8315]
    },
    hours: "Mon-Fri: 8AM-6PM",
    phone: "9138678901",
    services: ["Whole Blood", "Platelets", "State Capital Support"]
  },
  {
    name: "Nashik Wine City Blood Bank",
    address: "56 College Road, Nashik",
    city: "Nashik",
    state: "Maharashtra",
    zipCode: "422005",
    location: {
      type: "Point",
      coordinates: [73.7804, 19.9975]
    },
    hours: "Mon-Sat: 8AM-7PM",
    phone: "9125123456",
    services: ["Whole Blood", "Plasma", "Wine Industry Support"]
  },
  {
    name: "Aurangabad Heritage Blood Center",
    address: "78 Station Road, Aurangabad",
    city: "Aurangabad",
    state: "Maharashtra",
    zipCode: "431001",
    location: {
      type: "Point",
      coordinates: [75.3433, 19.8762]
    },
    hours: "Mon-Sat: 8:30AM-6:30PM",
    phone: "9125234567",
    services: ["Whole Blood", "Platelets", "Heritage Tourism Support"]
  },
  {
    name: "Nagpur Orange City Blood Bank",
    address: "23 Medical Square, Sitabuldi",
    city: "Nagpur",
    state: "Maharashtra",
    zipCode: "440012",
    location: {
      type: "Point",
      coordinates: [79.0882, 21.1458]
    },
    hours: "Mon-Sat: 8AM-6PM",
    phone: "9125345678",
    services: ["Whole Blood", "Plasma", "Central India Hub"]
  },
  {
    name: "Solapur Cotton City Blood Services",
    address: "45 Budhwar Peth, Solapur",
    city: "Solapur",
    state: "Maharashtra",
    zipCode: "413002",
    location: {
      type: "Point",
      coordinates: [75.9064, 17.6599]
    },
    hours: "Mon-Fri: 8AM-6PM, Sat: 8AM-2PM",
    phone: "9125456789",
    services: ["Whole Blood", "Platelets", "Textile Industry Support"]
  },
  {
    name: "Rajkot Kathiawad Blood Center",
    address: "67 Jawahar Road, Rajkot",
    city: "Rajkot",
    state: "Gujarat",
    zipCode: "360001",
    location: {
      type: "Point",
      coordinates: [70.7833, 22.3039]
    },
    hours: "Mon-Sat: 8:30AM-6:30PM",
    phone: "9127123456",
    services: ["Whole Blood", "Platelets", "Kathiawad Regional Support"]
  },
  {
    name: "Vadodara Baroda Blood Bank",
    address: "89 Sayajigunj, Vadodara",
    city: "Vadodara",
    state: "Gujarat",
    zipCode: "390005",
    location: {
      type: "Point",
      coordinates: [73.2083, 22.3072]
    },
    hours: "Mon-Sat: 8AM-7PM",
    phone: "9127234567",
    services: ["Whole Blood", "Plasma", "Petrochemical Industry Support"]
  }
];

async function seedDB() {
  try {
    console.log('🌐 Connecting to MongoDB Atlas...');
    
    mongoose.set('debug', true);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      dbName: 'test'
    });
    
    console.log('✅ Connected successfully to:', mongoose.connection.host);
    
    await DonationCenter.deleteMany({});
    console.log('♻️ Cleared existing data');
    
    const result = await DonationCenter.insertMany(sampleCenters, {
      ordered: false
    });
    
    console.log(`🌱 Successfully seeded ${result.length} centers`);
    
    const count = await DonationCenter.countDocuments();
    console.log(`🔍 Total centers in database: ${count}`);
    
    const sampleDocs = await DonationCenter.find().limit(2);
    console.log('First 2 centers:', JSON.stringify(sampleDocs, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    if (err.writeErrors) {
      console.error('Detailed errors:', err.writeErrors.map(e => e.errmsg));
    }
    process.exit(1);
  }
}

seedDB();