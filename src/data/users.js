import { mlmLevels } from './mlmLevels';

// ── Admin Profile ──────────────────────────────────────────
// Sirf admin A+ level assign kar sakta hai
export const adminData = {
  id: 'ADMIN-001',
  name: 'Super Admin',
  role: 'admin',
  email: 'admin@nairaah.com',
  mobile: '+91 99999 00000',
  canAssignAPlus: true,
  // Admin ke paas saare levels assign karne ka adhikar hai
  assignableLevels: mlmLevels.map(l => l.key),
};

// ── Distributor (self) — Level A ─────────────────────────
// Hierarchy: Admin → A+(Anil Sharma) → A(Rajesh Kumar) → B → C → ... → K
export const distributor = {
  id: 'RDK-10001',
  name: 'Rajesh Kumar',
  mobile: '+91 98765 43210',
  email: 'rajesh.kumar@email.com',
  address: '12, Green Park, Sector 5, Noida - 201301',
  city: 'Noida',
  state: 'Uttar Pradesh',
  pincode: '201301',
  joinDate: '15 Jan 2024',
  uplineId: 'RDK-10000',
  uplineName: 'Anil Sharma',
  uplineMobile: '+91 91234 00000',
  uplineLevel: 'A+',
  rank: 'Gold',
  profilePic: null,
  level: 'A',
  joiningFee: 99,
  agentFee: 99,
  rechargeFee: 91,
  registrationFee: 1,
  bv: 100,
};

// ── A+ Distributor (Admin-assigned, Rajesh's direct upline) ──
export const aplusDistributor = {
  id: 'RDK-10000',
  name: 'Anil Sharma',
  mobile: '+91 91234 00000',
  email: 'anil.sharma@mail.com',
  city: 'Lucknow',
  state: 'Uttar Pradesh',
  joinDate: '01 Jan 2024',
  level: 'A+',
  isActive: true,
  addedByAdmin: true,
  totalBusiness: 1200000,
  totalEarning: 60000,
};

// ── Joining Form fields reference ─────────────────────────
export const joiningFormFields = {
  personal: ['Name', 'Mobile No', 'Email', 'Address'],
  location: ['State', 'District', 'Pincode', 'Postal Area Name'],
};
