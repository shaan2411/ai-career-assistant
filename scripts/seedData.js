/**
 * seedData.js — Sample Data Seeder
 * 
 * Run with: node scripts/seedData.js
 * 
 * This script populates the database with:
 * - 1 admin user
 * - 3 sample student users
 * - 10 job listings
 * - Sample profiles
 */

require('dotenv').config({ path: '../server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai_career_assistant');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// ─── Schema Definitions (inline for seeder) ─────────────────────────────────

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'student' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  aiUsageCount: { type: Number, default: 0 },
}, { timestamps: true });

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bio: String,
  phone: String,
  location: String,
  github: String,
  linkedin: String,
  portfolio: String,
  education: Array,
  experience: Array,
  skills: [String],
  interests: [String],
  completionPercentage: { type: Number, default: 0 },
  careerGoal: String,
}, { timestamps: true });

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  type: String,
  description: String,
  requirements: [String],
  skills: [String],
  salary: Object,
  applicationUrl: String,
  isActive: { type: Boolean, default: true },
  applicantsCount: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

// ─── Seed Data ───────────────────────────────────────────────────────────────

const users = [
  {
    name: 'Admin User',
    email: 'admin@aicareer.com',
    password: 'Admin@123456',
    role: 'admin',
  },
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Student@123',
    role: 'student',
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'Student@123',
    role: 'student',
  },
  {
    name: 'Carol Williams',
    email: 'carol@example.com',
    password: 'Student@123',
    role: 'student',
  },
];

const jobListings = [
  {
    title: 'Junior Frontend Developer',
    company: 'TechStartup Inc.',
    location: 'Remote',
    type: 'full-time',
    description: 'We are looking for a passionate Junior Frontend Developer to join our growing team. You will work on building responsive web applications using modern JavaScript frameworks.',
    requirements: [
      '0-2 years of experience with React.js',
      'Understanding of HTML5, CSS3, JavaScript ES6+',
      'Familiarity with REST APIs',
      'Good communication skills',
    ],
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
    salary: { min: 50000, max: 70000, currency: 'USD' },
    applicationUrl: 'https://example.com/apply',
  },
  {
    title: 'Backend Engineer Intern',
    company: 'DataDriven Co.',
    location: 'New York, NY',
    type: 'internship',
    description: 'Exciting internship opportunity for students passionate about backend development. Work with our engineering team on real-world projects.',
    requirements: [
      'Currently pursuing CS degree',
      'Basic knowledge of Node.js or Python',
      'Understanding of databases (SQL or NoSQL)',
      'Eager to learn and grow',
    ],
    skills: ['Node.js', 'Python', 'MongoDB', 'SQL', 'REST APIs'],
    salary: { min: 20, max: 30, currency: 'USD/hr' },
    applicationUrl: 'https://example.com/intern',
  },
  {
    title: 'Full Stack Developer',
    company: 'InnovateTech',
    location: 'San Francisco, CA',
    type: 'full-time',
    description: 'Join our dynamic team as a Full Stack Developer. You will design and implement end-to-end features for our SaaS platform.',
    requirements: [
      '2+ years full-stack experience',
      'Proficiency in React and Node.js',
      'Experience with cloud services (AWS/GCP)',
      'Strong problem-solving skills',
    ],
    skills: ['React', 'Node.js', 'AWS', 'MongoDB', 'TypeScript', 'Docker'],
    salary: { min: 90000, max: 130000, currency: 'USD' },
    applicationUrl: 'https://example.com/fullstack',
  },
  {
    title: 'Machine Learning Engineer',
    company: 'AI Solutions Ltd.',
    location: 'Remote',
    type: 'full-time',
    description: 'We are building the future of AI. Join our ML team to develop and deploy machine learning models at scale.',
    requirements: [
      'Strong Python skills',
      'Experience with TensorFlow or PyTorch',
      'Understanding of ML algorithms',
      'Knowledge of data preprocessing',
    ],
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'SQL', 'Docker'],
    salary: { min: 100000, max: 150000, currency: 'USD' },
    applicationUrl: 'https://example.com/ml',
  },
  {
    title: 'DevOps Engineer',
    company: 'CloudFirst Corp.',
    location: 'Austin, TX',
    type: 'full-time',
    description: 'Looking for a DevOps engineer to manage our CI/CD pipelines and cloud infrastructure.',
    requirements: [
      'Experience with AWS, GCP, or Azure',
      'Kubernetes and Docker knowledge',
      'CI/CD pipeline experience',
      'Linux administration skills',
    ],
    skills: ['AWS', 'Kubernetes', 'Docker', 'Jenkins', 'Linux', 'Terraform'],
    salary: { min: 95000, max: 135000, currency: 'USD' },
    applicationUrl: 'https://example.com/devops',
  },
  {
    title: 'Data Analyst Intern',
    company: 'Analytics Corp.',
    location: 'Boston, MA',
    type: 'internship',
    description: 'Summer internship for data-driven students. Work with large datasets and create meaningful insights.',
    requirements: [
      'Enrolled in a quantitative degree program',
      'Proficiency in Excel or Google Sheets',
      'Basic SQL knowledge',
      'Familiarity with Python or R',
    ],
    skills: ['SQL', 'Python', 'Excel', 'Tableau', 'Statistics'],
    salary: { min: 18, max: 25, currency: 'USD/hr' },
    applicationUrl: 'https://example.com/data-intern',
  },
  {
    title: 'UI/UX Designer',
    company: 'Creative Studios',
    location: 'Los Angeles, CA',
    type: 'full-time',
    description: 'We need a talented UI/UX Designer to create stunning user experiences for our digital products.',
    requirements: [
      'Portfolio demonstrating UI/UX work',
      'Proficiency in Figma or Adobe XD',
      'Understanding of user research',
      'Eye for detail and aesthetics',
    ],
    skills: ['Figma', 'Adobe XD', 'Sketch', 'CSS', 'User Research', 'Prototyping'],
    salary: { min: 70000, max: 100000, currency: 'USD' },
    applicationUrl: 'https://example.com/ux',
  },
  {
    title: 'React Native Developer',
    company: 'MobileFirst App',
    location: 'Remote',
    type: 'contract',
    description: 'Contract role for an experienced React Native developer to build our cross-platform mobile app.',
    requirements: [
      '2+ years React Native experience',
      'Published apps on App Store or Google Play',
      'Strong JavaScript/TypeScript skills',
      'REST API integration experience',
    ],
    skills: ['React Native', 'JavaScript', 'TypeScript', 'Redux', 'iOS', 'Android'],
    salary: { min: 60, max: 90, currency: 'USD/hr' },
    applicationUrl: 'https://example.com/rn',
  },
  {
    title: 'Cybersecurity Analyst',
    company: 'SecureNet Inc.',
    location: 'Washington, DC',
    type: 'full-time',
    description: 'Protect our organization from cyber threats as a Cybersecurity Analyst.',
    requirements: [
      'Degree in Cybersecurity or related field',
      'Knowledge of network security',
      'SIEM tools experience',
      'Security certifications preferred (CEH, CISSP)',
    ],
    skills: ['Network Security', 'SIEM', 'Penetration Testing', 'Linux', 'Python', 'Firewalls'],
    salary: { min: 80000, max: 110000, currency: 'USD' },
    applicationUrl: 'https://example.com/cyber',
  },
  {
    title: 'Cloud Solutions Architect',
    company: 'Enterprise Cloud Co.',
    location: 'Seattle, WA',
    type: 'full-time',
    description: 'Lead our cloud architecture initiatives and help enterprise clients migrate to the cloud.',
    requirements: [
      '5+ years cloud architecture experience',
      'AWS/GCP/Azure certifications',
      'Strong communication skills',
      'Experience with enterprise clients',
    ],
    skills: ['AWS', 'GCP', 'Azure', 'Terraform', 'Kubernetes', 'Solution Architecture'],
    salary: { min: 130000, max: 180000, currency: 'USD' },
    applicationUrl: 'https://example.com/architect',
  },
];

const profiles = [
  {
    bio: 'Passionate frontend developer with a love for creating beautiful user interfaces. Currently pursuing my CS degree.',
    phone: '+1-555-0101',
    location: 'New York, NY',
    github: 'https://github.com/alice',
    linkedin: 'https://linkedin.com/in/alice',
    education: [
      {
        institution: 'MIT',
        degree: 'B.Sc.',
        field: 'Computer Science',
        startYear: 2021,
        endYear: 2025,
        grade: '3.8 GPA',
      },
    ],
    experience: [
      {
        company: 'Summer Tech Inc.',
        title: 'Frontend Intern',
        location: 'Remote',
        startDate: '2023-06-01',
        endDate: '2023-08-31',
        current: false,
        description: 'Built React components for the main dashboard, improved page load by 30%.',
      },
    ],
    skills: ['JavaScript', 'React', 'CSS', 'HTML', 'Git', 'Bootstrap'],
    interests: ['Web Development', 'Open Source', 'UI Design'],
    completionPercentage: 85,
    careerGoal: 'Frontend Developer',
  },
  {
    bio: 'Backend enthusiast who loves solving complex algorithms. Interested in distributed systems and cloud computing.',
    phone: '+1-555-0102',
    location: 'San Francisco, CA',
    github: 'https://github.com/bobsmith',
    linkedin: 'https://linkedin.com/in/bobsmith',
    education: [
      {
        institution: 'Stanford University',
        degree: 'B.Eng.',
        field: 'Software Engineering',
        startYear: 2020,
        endYear: 2024,
        grade: '3.6 GPA',
      },
    ],
    experience: [],
    skills: ['Python', 'Node.js', 'MongoDB', 'Docker', 'AWS'],
    interests: ['Backend Development', 'Cloud Computing', 'AI/ML'],
    completionPercentage: 60,
    careerGoal: 'Backend Engineer',
  },
];

// ─── Main Seeder Function ────────────────────────────────────────────────────

const seedDatabase = async () => {
  await connectDB();

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Job.deleteMany({});

    // Create users with hashed passwords
    console.log('👤 Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      const user = await User.create({ ...userData, password: hashedPassword });
      createdUsers.push(user);
      console.log(`   ✅ Created: ${user.email} (${user.role})`);
    }

    // Create profiles for student users
    console.log('\n📋 Creating profiles...');
    const studentUsers = createdUsers.filter(u => u.role === 'student');
    for (let i = 0; i < Math.min(profiles.length, studentUsers.length); i++) {
      await Profile.create({ userId: studentUsers[i]._id, ...profiles[i] });
      console.log(`   ✅ Profile created for: ${studentUsers[i].email}`);
    }

    // Create empty profiles for remaining students
    for (let i = profiles.length; i < studentUsers.length; i++) {
      await Profile.create({ userId: studentUsers[i]._id, completionPercentage: 0 });
    }

    // Create job listings
    console.log('\n💼 Creating job listings...');
    for (const job of jobListings) {
      await Job.create({ ...job, postedBy: createdUsers[0]._id });
    }
    console.log(`   ✅ Created ${jobListings.length} job listings`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Test Credentials:');
    console.log('  Admin:   admin@aicareer.com / Admin@123456');
    console.log('  Student: alice@example.com / Student@123');
    console.log('  Student: bob@example.com / Student@123');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
