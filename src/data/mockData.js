// ── MLM Level Definitions ─────────────────────────────────
// A+ = Admin-assigned special level (assignableByAdmin: true — regular distributor assign NAHI kar sakta)
// A  = Self (top distributor)
// B–K = Downline tree levels (A se K tak — koi bhi distributor join karate waqt assign kar sakta hai)
export const mlmLevels = [
  { key: 'A+', label: 'A+', color: '#B91C1C', bgColor: '#FEF2F2', borderColor: '#FECACA', description: 'Admin-assigned top level', assignableByAdmin: true,  assignableByDistributor: false },
  { key: 'A',  label: 'A',  color: '#1A73E8', bgColor: '#EFF6FF', borderColor: '#BFDBFE', description: 'Top Distributor',          assignableByAdmin: true,  assignableByDistributor: true  },
  { key: 'B',  label: 'B',  color: '#7C3AED', bgColor: '#F5F3FF', borderColor: '#DDD6FE', description: 'Level B',                  assignableByAdmin: true,  assignableByDistributor: true  },
  { key: 'C',  label: 'C',  color: '#059669', bgColor: '#ECFDF5', borderColor: '#A7F3D0', description: 'Level C',                  assignableByAdmin: true,  assignableByDistributor: true  },
  { key: 'D',  label: 'D',  color: '#D97706', bgColor: '#FFFBEB', borderColor: '#FDE68A', description: 'Level D',                  assignableByAdmin: true,  assignableByDistributor: true  },
  { key: 'E',  label: 'E',  color: '#DC2626', bgColor: '#FEF2F2', borderColor: '#FECACA', description: 'Level E',                  assignableByAdmin: true,  assignableByDistributor: true  },
  { key: 'F',  label: 'F',  color: '#0891B2', bgColor: '#ECFEFF', borderColor: '#A5F3FC', description: 'Level F',                  assignableByAdmin: true,  assignableByDistributor: true  },
  { key: 'G',  label: 'G',  color: '#7C3AED', bgColor: '#F5F3FF', borderColor: '#DDD6FE', description: 'Level G',                  assignableByAdmin: true,  assignableByDistributor: true  },
  { key: 'H',  label: 'H',  color: '#059669', bgColor: '#ECFDF5', borderColor: '#A7F3D0', description: 'Level H',                  assignableByAdmin: true,  assignableByDistributor: true  },
  { key: 'I',  label: 'I',  color: '#D97706', bgColor: '#FFFBEB', borderColor: '#FDE68A', description: 'Level I',                  assignableByAdmin: true,  assignableByDistributor: true  },
  { key: 'J',  label: 'J',  color: '#DC2626', bgColor: '#FEF2F2', borderColor: '#FECACA', description: 'Level J',                  assignableByAdmin: true,  assignableByDistributor: true  },
  { key: 'K',  label: 'K',  color: '#6B7280', bgColor: '#F9FAFB', borderColor: '#E5E7EB', description: 'Level K (deepest)',        assignableByAdmin: true,  assignableByDistributor: true  },
];

// ── Levels jo distributor assign kar sakta hai (A+ NAHI) ──
export const distributorAssignableLevels = mlmLevels.filter(l => l.assignableByDistributor);

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

// ── MLM Commission Structure ──────────────────────────────
// Hierarchy: Admin → A+ → A → B → C → D → E → F → G → H → I → J → K
//
// Rajesh Kumar = Level A (logged-in distributor)
// When someone in Rajesh's downline makes a sale, Rajesh gets commission
// based on how many hops Rajesh is away from that seller:
//
//   Seller = B (Rajesh's direct child) → Rajesh is 1 hop away → 20%
//   Seller = C (B's child)             → Rajesh is 2 hops away → 5%
//   Seller = D                         → 4%
//   Seller = E                         → 3%
//   Seller = F                         → 2%
//   Seller = G                         → 1%
//   Seller = H                         → 1%
//   Seller = I, J, K                   → TBC
//
// Max 10 levels below A. A+ is ABOVE A — A gets 20% when A+ sells too.

export const levelCommissions = [
  { level: 1,  label: 'B', name: 'Level B (Direct)',  percent: 20, color: '#1A73E8', uplineDesc: 'B ne sale ki → A ko 20%'  },
  { level: 2,  label: 'C', name: 'Level C',           percent: 5,  color: '#7C3AED', uplineDesc: 'C ne sale ki → A ko 5%'   },
  { level: 3,  label: 'D', name: 'Level D',           percent: 4,  color: '#059669', uplineDesc: 'D ne sale ki → A ko 4%'   },
  { level: 4,  label: 'E', name: 'Level E',           percent: 3,  color: '#D97706', uplineDesc: 'E ne sale ki → A ko 3%'   },
  { level: 5,  label: 'F', name: 'Level F',           percent: 2,  color: '#DC2626', uplineDesc: 'F ne sale ki → A ko 2%'   },
  { level: 6,  label: 'G', name: 'Level G',           percent: 1,  color: '#0891B2', uplineDesc: 'G ne sale ki → A ko 1%'   },
  { level: 7,  label: 'H', name: 'Level H',           percent: 1,  color: '#7C3AED', uplineDesc: 'H ne sale ki → A ko 1%'   },
  { level: 8,  label: 'I', name: 'Level I',           percent: 1,  color: '#059669', uplineDesc: 'TBC — pending confirmation' },
  { level: 9,  label: 'J', name: 'Level J',           percent: 1,  color: '#D97706', uplineDesc: 'TBC — pending confirmation' },
  { level: 10, label: 'K', name: 'Level K (Max)',     percent: 1,  color: '#DC2626', uplineDesc: 'TBC — pending confirmation' },
];

export const monthlyCapping = 45000;
export const cappingSlots = 3;
export const cappingPerSlot = 15000;

export const bonusStructure = [
  { minSale: 10000,  bonus: 1,  type: 'Cash',          label: 'Per ₹10,000 sale' },
  { minSale: 100000, bonus: 10, type: 'Cash / Voucher', label: 'Per ₹1,00,000 sale' },
];

// ── Products ──────────────────────────────────────────────
export const products = [
  { id: 'PRD-001', name: 'Wellness Kit Pro',       category: 'Health',    mrp: 1999, sellingPrice: 1499, description: 'Complete daily wellness package',    unit: 'Box',    inStock: true  },
  { id: 'PRD-002', name: 'Immunity Booster',       category: 'Health',    mrp: 999,  sellingPrice: 799,  description: 'Natural herbal immunity formula',     unit: 'Bottle', inStock: true  },
  { id: 'PRD-003', name: 'Glow Skin Cream',        category: 'Beauty',    mrp: 2499, sellingPrice: 1999, description: 'Premium skin brightening cream',      unit: 'Jar',    inStock: true  },
  { id: 'PRD-004', name: 'Protein Nutrition Pack', category: 'Nutrition', mrp: 2999, sellingPrice: 2499, description: 'High protein meal supplement',        unit: 'Pack',   inStock: true  },
  { id: 'PRD-005', name: 'Hair Growth Oil',        category: 'Beauty',    mrp: 1299, sellingPrice: 999,  description: 'Ayurvedic hair growth formula',       unit: 'Bottle', inStock: false },
  { id: 'PRD-006', name: 'Detox Tea 30-Day',       category: 'Health',    mrp: 799,  sellingPrice: 649,  description: '30-day detox herbal tea blend',       unit: 'Box',    inStock: true  },
  { id: 'PRD-007', name: 'Joint Care Capsules',    category: 'Health',    mrp: 1599, sellingPrice: 1299, description: 'Herbal joint pain relief capsules',   unit: 'Bottle', inStock: true  },
  { id: 'PRD-008', name: 'Aloe Vera Gel',          category: 'Beauty',    mrp: 699,  sellingPrice: 549,  description: 'Pure aloe vera skin gel',             unit: 'Tube',   inStock: true  },
  { id: 'PRD-009', name: 'Weight Management Pack', category: 'Nutrition', mrp: 3499, sellingPrice: 2999, description: 'Complete weight loss support kit',    unit: 'Pack',   inStock: true  },
  { id: 'PRD-010', name: 'Tulsi Drops',            category: 'Health',    mrp: 499,  sellingPrice: 399,  description: 'Organic tulsi immune support drops',  unit: 'Bottle', inStock: true  },
];

// ── Customers ─────────────────────────────────────────────
export const customers = [
  { id: 'CUST-001', name: 'Priya Verma',    mobile: '+91 90000 11111', email: 'priya@email.com',    address: 'Sector 8, Noida',          city: 'Noida',      joinDate: '05 Mar 2024', totalOrders: 8,  totalSpent: 14200, isActive: true  },
  { id: 'CUST-002', name: 'Suresh Mehta',   mobile: '+91 80000 22222', email: 'suresh@email.com',   address: 'Lajpat Nagar, Delhi',      city: 'Delhi',      joinDate: '18 Mar 2024', totalOrders: 5,  totalSpent: 8900,  isActive: true  },
  { id: 'CUST-003', name: 'Neha Kumari',    mobile: '+91 70000 33333', email: 'neha@email.com',     address: 'Rohini, Delhi',            city: 'Delhi',      joinDate: '22 Apr 2024', totalOrders: 3,  totalSpent: 4500,  isActive: true  },
  { id: 'CUST-004', name: 'Amit Sharma',    mobile: '+91 60000 44444', email: 'amit@email.com',     address: 'Vaishali, Ghaziabad',      city: 'Ghaziabad',  joinDate: '02 May 2024', totalOrders: 12, totalSpent: 21600, isActive: true  },
  { id: 'CUST-005', name: 'Rekha Yadav',    mobile: '+91 50000 55555', email: 'rekha@email.com',    address: 'Dwarka, Delhi',            city: 'Delhi',      joinDate: '14 May 2024', totalOrders: 2,  totalSpent: 2800,  isActive: false },
  { id: 'CUST-006', name: 'Vikram Singh',   mobile: '+91 91111 66666', email: 'vikram@email.com',   address: 'Sector 62, Noida',         city: 'Noida',      joinDate: '10 Jun 2024', totalOrders: 6,  totalSpent: 11400, isActive: true  },
  { id: 'CUST-007', name: 'Seema Agarwal',  mobile: '+91 82222 77777', email: 'seema@email.com',    address: 'Janakpuri, Delhi',         city: 'Delhi',      joinDate: '20 Jun 2024', totalOrders: 4,  totalSpent: 7200,  isActive: true  },
  { id: 'CUST-008', name: 'Rajan Tiwari',   mobile: '+91 73333 88888', email: 'rajan@email.com',    address: 'Kaushambi, Ghaziabad',     city: 'Ghaziabad',  joinDate: '01 Jul 2024', totalOrders: 7,  totalSpent: 13500, isActive: true  },
];

// ═══════════════════════════════════════════════════════════
// TEAM / DOWNLINE TREE  (Levels B → K, each B-member under A)
// Level counts: B=3, C=3each(9), D=2each(18), E=2each(36),
//   F=2each, G=2each, H=1each, I=1each, J=1each, K=1each
// Total: 3+9+18+...  realistic 60+ members across all levels
// ═══════════════════════════════════════════════════════════

// ─── LEVEL K members (deepest — under J) ──────────────────
const k_under_j1 = { id:'RDK-20091', name:'Bhanu Pratap',   mobile:'+91 93001 91001', email:'bhanu@mail.com',   city:'Agra',        state:'Uttar Pradesh', joinDate:'10 Dec 2024', isActive:true,  mlmLevel:'K', totalBusiness:4800,  totalEarning:240,  children:[] };
const k_under_j2 = { id:'RDK-20092', name:'Savitri Devi',   mobile:'+91 93001 91002', email:'savitri@mail.com', city:'Mathura',     state:'Uttar Pradesh', joinDate:'15 Dec 2024', isActive:true,  mlmLevel:'K', totalBusiness:3600,  totalEarning:180,  children:[] };
const k_under_j3 = { id:'RDK-20093', name:'Govind Yadav',   mobile:'+91 93001 91003', email:'govind@mail.com',  city:'Aligarh',     state:'Uttar Pradesh', joinDate:'20 Dec 2024', isActive:false, mlmLevel:'K', totalBusiness:1200,  totalEarning:60,   children:[] };

// ─── LEVEL J members (under I) ────────────────────────────
const j_under_i1 = { id:'RDK-20071', name:'Lalita Prasad',  mobile:'+91 93001 71001', email:'lalita@mail.com',  city:'Kanpur',      state:'Uttar Pradesh', joinDate:'01 Nov 2024', isActive:true,  mlmLevel:'J', totalBusiness:9600,  totalEarning:480,  children:[k_under_j1] };
const j_under_i2 = { id:'RDK-20072', name:'Dinesh Rawat',   mobile:'+91 93001 71002', email:'dinesh@mail.com',  city:'Lucknow',     state:'Uttar Pradesh', joinDate:'10 Nov 2024', isActive:true,  mlmLevel:'J', totalBusiness:7200,  totalEarning:360,  children:[k_under_j2] };
const j_under_i3 = { id:'RDK-20073', name:'Pushpa Singh',   mobile:'+91 93001 71003', email:'pushpa@mail.com',  city:'Bareilly',    state:'Uttar Pradesh', joinDate:'20 Nov 2024', isActive:false, mlmLevel:'J', totalBusiness:3600,  totalEarning:180,  children:[k_under_j3] };

// ─── LEVEL I members (under H) ────────────────────────────
const i_under_h1 = { id:'RDK-20051', name:'Kamla Devi',     mobile:'+91 93001 51001', email:'kamla@mail.com',   city:'Meerut',      state:'Uttar Pradesh', joinDate:'01 Oct 2024', isActive:true,  mlmLevel:'I', totalBusiness:18000, totalEarning:900,  children:[j_under_i1] };
const i_under_h2 = { id:'RDK-20052', name:'Sunil Kashyap',  mobile:'+91 93001 51002', email:'sunil@mail.com',   city:'Moradabad',   state:'Uttar Pradesh', joinDate:'10 Oct 2024', isActive:true,  mlmLevel:'I', totalBusiness:14400, totalEarning:720,  children:[j_under_i2] };
const i_under_h3 = { id:'RDK-20053', name:'Geeta Mishra',   mobile:'+91 93001 51003', email:'geeta@mail.com',   city:'Firozabad',   state:'Uttar Pradesh', joinDate:'20 Oct 2024', isActive:false, mlmLevel:'I', totalBusiness:7200,  totalEarning:360,  children:[j_under_i3] };

// ─── LEVEL H members (under G) ────────────────────────────
const h_under_g1 = { id:'RDK-20031', name:'Ramesh Pandey',  mobile:'+91 93001 31001', email:'ramesh@mail.com',  city:'Varanasi',    state:'Uttar Pradesh', joinDate:'01 Sep 2024', isActive:true,  mlmLevel:'H', totalBusiness:28800, totalEarning:1440, children:[i_under_h1] };
const h_under_g2 = { id:'RDK-20032', name:'Saroj Gupta',    mobile:'+91 93001 31002', email:'saroj@mail.com',   city:'Allahabad',   state:'Uttar Pradesh', joinDate:'10 Sep 2024', isActive:true,  mlmLevel:'H', totalBusiness:21600, totalEarning:1080, children:[i_under_h2] };
const h_under_g3 = { id:'RDK-20033', name:'Naresh Tomar',   mobile:'+91 93001 31003', email:'naresh@mail.com',  city:'Jhansi',      state:'Uttar Pradesh', joinDate:'20 Sep 2024', isActive:true,  mlmLevel:'H', totalBusiness:14400, totalEarning:720,  children:[i_under_h3] };

// ─── LEVEL G members (under F) ────────────────────────────
const g_under_f1 = { id:'RDK-20011', name:'Anand Tripathi', mobile:'+91 93001 11001', email:'anand@mail.com',   city:'Gorakhpur',   state:'Uttar Pradesh', joinDate:'01 Aug 2024', isActive:true,  mlmLevel:'G', totalBusiness:48000, totalEarning:2400, children:[h_under_g1, h_under_g2] };
const g_under_f2 = { id:'RDK-20012', name:'Manju Srivastava',mobile:'+91 93001 11002',email:'manju@mail.com',   city:'Agra',        state:'Uttar Pradesh', joinDate:'10 Aug 2024', isActive:true,  mlmLevel:'G', totalBusiness:36000, totalEarning:1800, children:[h_under_g3] };
const g_under_f3 = { id:'RDK-20013', name:'Pramod Dubey',   mobile:'+91 93001 11003', email:'pramod@mail.com',  city:'Ghaziabad',   state:'Uttar Pradesh', joinDate:'20 Aug 2024', isActive:false, mlmLevel:'G', totalBusiness:18000, totalEarning:900,  children:[] };

// ─── LEVEL F members (under E) ────────────────────────────
const f_under_e1 = { id:'RDK-10091', name:'Vinod Chaudhary',mobile:'+91 92001 91001', email:'vinod@mail.com',   city:'Lucknow',     state:'Uttar Pradesh', joinDate:'01 Jul 2024', isActive:true,  mlmLevel:'F', totalBusiness:72000, totalEarning:3600, children:[g_under_f1, g_under_f2] };
const f_under_e2 = { id:'RDK-10092', name:'Rekha Chauhan',   mobile:'+91 92001 91002', email:'rekha2@mail.com',  city:'Kanpur',      state:'Uttar Pradesh', joinDate:'10 Jul 2024', isActive:true,  mlmLevel:'F', totalBusiness:54000, totalEarning:2700, children:[g_under_f3] };
const f_under_e3 = { id:'RDK-10093', name:'Mahesh Prajapati',mobile:'+91 92001 91003', email:'mahesh@mail.com',  city:'Jaipur',      state:'Rajasthan',     joinDate:'20 Jul 2024', isActive:true,  mlmLevel:'F', totalBusiness:36000, totalEarning:1800, children:[] };
const f_under_e4 = { id:'RDK-10094', name:'Shobha Rani',     mobile:'+91 92001 91004', email:'shobha@mail.com',  city:'Jodhpur',     state:'Rajasthan',     joinDate:'25 Jul 2024', isActive:false, mlmLevel:'F', totalBusiness:12000, totalEarning:600,  children:[] };

// ─── LEVEL E members (under D) ────────────────────────────
const e_under_d1 = { id:'RDK-10071', name:'Arun Kumar',      mobile:'+91 92001 71001', email:'arun@mail.com',    city:'Patna',       state:'Bihar',         joinDate:'01 Jun 2024', isActive:true,  mlmLevel:'E', totalBusiness:96000, totalEarning:4800, children:[f_under_e1, f_under_e2] };
const e_under_d2 = { id:'RDK-10072', name:'Santosh Yadav',   mobile:'+91 92001 71002', email:'santosh@mail.com', city:'Bhagalpur',   state:'Bihar',         joinDate:'10 Jun 2024', isActive:true,  mlmLevel:'E', totalBusiness:72000, totalEarning:3600, children:[f_under_e3, f_under_e4] };
const e_under_d3 = { id:'RDK-10073', name:'Savita Kumari',   mobile:'+91 92001 71003', email:'savita@mail.com',  city:'Muzaffarpur', state:'Bihar',         joinDate:'20 Jun 2024', isActive:true,  mlmLevel:'E', totalBusiness:48000, totalEarning:2400, children:[] };
const e_under_d4 = { id:'RDK-10074', name:'Deepak Ranjan',   mobile:'+91 92001 71004', email:'deepak@mail.com',  city:'Gaya',        state:'Bihar',         joinDate:'28 Jun 2024', isActive:false, mlmLevel:'E', totalBusiness:16000, totalEarning:800,  children:[] };

// ─── LEVEL D members (under C) ────────────────────────────
const d_under_c1 = { id:'RDK-10051', name:'Harish Sharma',   mobile:'+91 92001 51001', email:'harish@mail.com',  city:'Indore',      state:'Madhya Pradesh',joinDate:'01 May 2024', isActive:true,  mlmLevel:'D', totalBusiness:132000,totalEarning:6600, children:[e_under_d1, e_under_d2] };
const d_under_c2 = { id:'RDK-10052', name:'Nirmala Devi',    mobile:'+91 92001 51002', email:'nirmala@mail.com', city:'Bhopal',      state:'Madhya Pradesh',joinDate:'10 May 2024', isActive:true,  mlmLevel:'D', totalBusiness:96000, totalEarning:4800, children:[e_under_d3, e_under_d4] };
const d_under_c3 = { id:'RDK-10053', name:'Rajkumar Verma',  mobile:'+91 92001 51003', email:'rajkumar@mail.com',city:'Jabalpur',    state:'Madhya Pradesh',joinDate:'20 May 2024', isActive:true,  mlmLevel:'D', totalBusiness:72000, totalEarning:3600, children:[] };
const d_under_c4 = { id:'RDK-10054', name:'Usha Malhotra',   mobile:'+91 92001 51004', email:'usha@mail.com',    city:'Raipur',      state:'Chhattisgarh',  joinDate:'25 May 2024', isActive:false, mlmLevel:'D', totalBusiness:24000, totalEarning:1200, children:[] };
const d_under_c5 = { id:'RDK-10055', name:'Kailash Nath',    mobile:'+91 92001 51005', email:'kailash@mail.com', city:'Bilaspur',    state:'Chhattisgarh',  joinDate:'30 May 2024', isActive:true,  mlmLevel:'D', totalBusiness:48000, totalEarning:2400, children:[] };
const d_under_c6 = { id:'RDK-10056', name:'Chameli Singh',   mobile:'+91 92001 51006', email:'chameli@mail.com', city:'Durg',        state:'Chhattisgarh',  joinDate:'31 May 2024', isActive:true,  mlmLevel:'D', totalBusiness:36000, totalEarning:1800, children:[] };

// ─── LEVEL C members (under B) ────────────────────────────
const c_under_b1 = { id:'RDK-10031', name:'Kavita Singh',    mobile:'+91 88888 11111', email:'kavita@mail.com',  city:'Ahmedabad',   state:'Gujarat',       joinDate:'10 Mar 2024', isActive:true,  mlmLevel:'C', totalBusiness:168000,totalEarning:8400, children:[d_under_c1, d_under_c2] };
const c_under_b2 = { id:'RDK-10032', name:'Ravi Gupta',      mobile:'+91 77777 22222', email:'ravi@mail.com',    city:'Surat',       state:'Gujarat',       joinDate:'15 Mar 2024', isActive:true,  mlmLevel:'C', totalBusiness:120000,totalEarning:6000, children:[d_under_c3, d_under_c4] };
const c_under_b3 = { id:'RDK-10033', name:'Anita Roy',       mobile:'+91 99999 33333', email:'anita@mail.com',   city:'Vadodara',    state:'Gujarat',       joinDate:'01 Apr 2024', isActive:true,  mlmLevel:'C', totalBusiness:84000, totalEarning:4200, children:[d_under_c5, d_under_c6] };
const c_under_b4 = { id:'RDK-10034', name:'Vijay Patel',     mobile:'+91 88888 44444', email:'vijay@mail.com',   city:'Rajkot',      state:'Gujarat',       joinDate:'05 Apr 2024', isActive:false, mlmLevel:'C', totalBusiness:42000, totalEarning:2100, children:[] };
const c_under_b5 = { id:'RDK-10035', name:'Meena Joshi',     mobile:'+91 77777 55555', email:'meena@mail.com',   city:'Pune',        state:'Maharashtra',   joinDate:'10 Apr 2024', isActive:true,  mlmLevel:'C', totalBusiness:96000, totalEarning:4800, children:[] };
const c_under_b6 = { id:'RDK-10036', name:'Pravin Desai',    mobile:'+91 66666 66666', email:'pravin@mail.com',  city:'Nashik',      state:'Maharashtra',   joinDate:'15 Apr 2024', isActive:true,  mlmLevel:'C', totalBusiness:72000, totalEarning:3600, children:[] };
const c_under_b7 = { id:'RDK-10037', name:'Sundar Rao',      mobile:'+91 55555 77777', email:'sundar@mail.com',  city:'Hyderabad',   state:'Telangana',     joinDate:'20 Apr 2024', isActive:true,  mlmLevel:'C', totalBusiness:60000, totalEarning:3000, children:[] };
const c_under_b8 = { id:'RDK-10038', name:'Lakshmi Reddy',   mobile:'+91 44444 88888', email:'lakshmi@mail.com', city:'Warangal',    state:'Telangana',     joinDate:'25 Apr 2024', isActive:false, mlmLevel:'C', totalBusiness:18000, totalEarning:900,  children:[] };
const c_under_b9 = { id:'RDK-10039', name:'Balaji Iyer',     mobile:'+91 33333 99999', email:'balaji@mail.com',  city:'Chennai',     state:'Tamil Nadu',    joinDate:'30 Apr 2024', isActive:true,  mlmLevel:'C', totalBusiness:48000, totalEarning:2400, children:[] };

// ─── LEVEL B members (direct under A = Rajesh Kumar) ──────
// 3 direct B-members, each has 3 C-members (as per notes: B=35 in earningsByLevel)
const b1 = {
  id: 'RDK-10002',
  name: 'Sunita Patel',
  mobile: '+91 91234 56789',
  email: 'sunita.patel@mail.com',
  city: 'Mumbai',
  state: 'Maharashtra',
  joinDate: '20 Feb 2024',
  isActive: true,
  mlmLevel: 'A+',      // Admin-assigned special badge
  totalBusiness: 420000,
  totalEarning: 21000,
  children: [c_under_b1, c_under_b2, c_under_b3],
};

const b2 = {
  id: 'RDK-10003',
  name: 'Mohan Das',
  mobile: '+91 87654 32109',
  email: 'mohan.das@mail.com',
  city: 'Delhi',
  state: 'Delhi',
  joinDate: '05 Feb 2024',
  isActive: true,
  mlmLevel: 'B',
  totalBusiness: 360000,
  totalEarning: 18000,
  children: [c_under_b4, c_under_b5, c_under_b6],
};

const b3 = {
  id: 'RDK-10004',
  name: 'Deepa Joshi',
  mobile: '+91 76543 21098',
  email: 'deepa.joshi@mail.com',
  city: 'Bangalore',
  state: 'Karnataka',
  joinDate: '12 Mar 2024',
  isActive: true,
  mlmLevel: 'B',
  totalBusiness: 300000,
  totalEarning: 15000,
  children: [c_under_b7, c_under_b8, c_under_b9],
};

// ─── ROOT EXPORT ───────────────────────────────────────────
export const teamMembers = [b1, b2, b3];

// ── Dashboard Stats ───────────────────────────────────────
export const dashboardStats = {
  totalSales: 485000,
  totalCommission: 86400,
  pendingCommission: 12600,
  paidCommission: 73800,
  thisMonthEarning: 31200,
  cappingLimit: 45000,
  totalBV: 4850,
};

// ── Sales History ─────────────────────────────────────────
export const salesHistory = [
  { id:'ORD-001', billNo:'BILL-051', buyerName:'Priya Verma',     buyerType:'Customer',    buyerId:'CUST-001', date:'18 Jul 2025', items:[{productId:'PRD-001',name:'Wellness Kit Pro',qty:2,price:1499,gst:18,total:3536}],                                                               totalAmount:3536,  paymentStatus:'Paid',    orderStatus:'Delivered' },
  { id:'ORD-002', billNo:'BILL-050', buyerName:'Mohan Das',       buyerType:'Distributor', buyerId:'RDK-10003',date:'15 Jul 2025', items:[{productId:'PRD-004',name:'Protein Pack',qty:1,price:2499,gst:12,total:2799},{productId:'PRD-002',name:'Immunity Booster',qty:3,price:799,gst:18,total:2829}], totalAmount:5628, paymentStatus:'Paid',    orderStatus:'Delivered' },
  { id:'ORD-003', billNo:'BILL-049', buyerName:'Suresh Mehta',    buyerType:'Customer',    buyerId:'CUST-002', date:'12 Jul 2025', items:[{productId:'PRD-003',name:'Glow Skin Cream',qty:1,price:1999,gst:18,total:2359}],                                                               totalAmount:2359,  paymentStatus:'Pending', orderStatus:'Processing' },
  { id:'ORD-004', billNo:'BILL-048', buyerName:'Amit Sharma',     buyerType:'Customer',    buyerId:'CUST-004', date:'08 Jul 2025', items:[{productId:'PRD-006',name:'Detox Tea',qty:4,price:649,gst:5,total:2722}],                                                                       totalAmount:2722,  paymentStatus:'Paid',    orderStatus:'Shipped'   },
  { id:'ORD-005', billNo:'BILL-047', buyerName:'Sunita Patel',    buyerType:'Distributor', buyerId:'RDK-10002',date:'05 Jul 2025', items:[{productId:'PRD-001',name:'Wellness Kit Pro',qty:3,price:1499,gst:18,total:5307}],                                                              totalAmount:5307,  paymentStatus:'Paid',    orderStatus:'Delivered' },
  { id:'ORD-006', billNo:'BILL-046', buyerName:'Kavita Singh',    buyerType:'Distributor', buyerId:'RDK-10031',date:'02 Jul 2025', items:[{productId:'PRD-007',name:'Joint Care Capsules',qty:2,price:1299,gst:12,total:2910}],                                                           totalAmount:2910,  paymentStatus:'Paid',    orderStatus:'Delivered' },
  { id:'ORD-007', billNo:'BILL-045', buyerName:'Anita Roy',       buyerType:'Distributor', buyerId:'RDK-10033',date:'30 Jun 2025', items:[{productId:'PRD-009',name:'Weight Management Pack',qty:1,price:2999,gst:12,total:3359}],                                                        totalAmount:3359,  paymentStatus:'Paid',    orderStatus:'Delivered' },
  { id:'ORD-008', billNo:'BILL-044', buyerName:'Vikram Singh',    buyerType:'Customer',    buyerId:'CUST-006', date:'28 Jun 2025', items:[{productId:'PRD-008',name:'Aloe Vera Gel',qty:3,price:549,gst:12,total:1845}],                                                                  totalAmount:1845,  paymentStatus:'Paid',    orderStatus:'Delivered' },
  { id:'ORD-009', billNo:'BILL-043', buyerName:'Harish Sharma',   buyerType:'Distributor', buyerId:'RDK-10051',date:'25 Jun 2025', items:[{productId:'PRD-004',name:'Protein Pack',qty:2,price:2499,gst:12,total:5598}],                                                                  totalAmount:5598,  paymentStatus:'Pending', orderStatus:'Processing' },
  { id:'ORD-010', billNo:'BILL-042', buyerName:'Seema Agarwal',   buyerType:'Customer',    buyerId:'CUST-007', date:'22 Jun 2025', items:[{productId:'PRD-010',name:'Tulsi Drops',qty:5,price:399,gst:5,total:2095}],                                                                     totalAmount:2095,  paymentStatus:'Paid',    orderStatus:'Delivered' },
  { id:'ORD-011', billNo:'BILL-041', buyerName:'Arun Kumar',      buyerType:'Distributor', buyerId:'RDK-10071',date:'20 Jun 2025', items:[{productId:'PRD-002',name:'Immunity Booster',qty:6,price:799,gst:18,total:5673}],                                                               totalAmount:5673,  paymentStatus:'Paid',    orderStatus:'Delivered' },
  { id:'ORD-012', billNo:'BILL-040', buyerName:'Rajan Tiwari',    buyerType:'Customer',    buyerId:'CUST-008', date:'18 Jun 2025', items:[{productId:'PRD-001',name:'Wellness Kit Pro',qty:1,price:1499,gst:18,total:1769}],                                                              totalAmount:1769,  paymentStatus:'Paid',    orderStatus:'Delivered' },
];

// ── Commission History ────────────────────────────────────
// Per document Section 10: Commission Log required fields:
// commissionId, sourceTransactionId, sellerId, buyerId,
// receiverId, receiverLevel, percentage, amount, status,
// payoutCycleId, createdDate, remarks
// Status: Pending | Eligible | Hold | Payout Generated | Paid | Cancelled
export const commissionHistory = [
  // ORD-001: Priya Verma (CUST-001) bought from Rajesh Kumar (RDK-10001)
  // → RDK-10001's direct parent (RDK-10000 = Anil Sharma) gets 20% (but shown from Rajesh's view as "received from downline")
  // From Rajesh's view: he IS the direct parent of people below him
  // COM entries here = commissions RECEIVED by Rajesh Kumar from his downline sales

  { id:'COM-001', date:'18 Jul 2025', orderId:'ORD-001',
    sellerId:'RDK-10001', sellerName:'Rajesh Kumar',
    buyerId:'CUST-001',   buyerName:'Priya Verma',
    receiverId:'RDK-10001', receiverName:'Rajesh Kumar',
    fromName:'Priya Verma', fromId:'CUST-001',
    uplineLevel:1, level:'Direct Parent (1st Upline)', levelLabel:'1st',
    percentage:20, commissionBase:3536, saleAmount:3536, amount:707,
    payoutCycleId:'CYC-003', status:'Pending', remarks:'' },

  { id:'COM-002', date:'15 Jul 2025', orderId:'ORD-002',
    sellerId:'RDK-10003', sellerName:'Mohan Das',
    buyerId:'RDK-10003',  buyerName:'Mohan Das',
    receiverId:'RDK-10001', receiverName:'Rajesh Kumar',
    fromName:'Mohan Das', fromId:'RDK-10003',
    uplineLevel:1, level:'Direct Parent (1st Upline)', levelLabel:'1st',
    percentage:20, commissionBase:5628, saleAmount:5628, amount:1126,
    payoutCycleId:'CYC-003', status:'Eligible', remarks:'' },

  { id:'COM-003', date:'12 Jul 2025', orderId:'ORD-003',
    sellerId:'RDK-10001', sellerName:'Rajesh Kumar',
    buyerId:'CUST-002',   buyerName:'Suresh Mehta',
    receiverId:'RDK-10001', receiverName:'Rajesh Kumar',
    fromName:'Suresh Mehta', fromId:'CUST-002',
    uplineLevel:1, level:'Direct Parent (1st Upline)', levelLabel:'1st',
    percentage:20, commissionBase:2359, saleAmount:2359, amount:472,
    payoutCycleId:'CYC-003', status:'Hold', remarks:'Payment pending' },

  { id:'COM-004', date:'05 Jul 2025', orderId:'ORD-005',
    sellerId:'RDK-10002', sellerName:'Sunita Patel',
    buyerId:'RDK-10002',  buyerName:'Sunita Patel',
    receiverId:'RDK-10001', receiverName:'Rajesh Kumar',
    fromName:'Sunita Patel', fromId:'RDK-10002',
    uplineLevel:1, level:'Direct Parent (1st Upline)', levelLabel:'1st',
    percentage:20, commissionBase:5307, saleAmount:5307, amount:1061,
    payoutCycleId:'CYC-003', status:'Eligible', remarks:'' },

  { id:'COM-005', date:'02 Jul 2025', orderId:'ORD-006',
    sellerId:'RDK-10031', sellerName:'Kavita Singh',
    buyerId:'RDK-10031',  buyerName:'Kavita Singh',
    receiverId:'RDK-10001', receiverName:'Rajesh Kumar',
    fromName:'Kavita Singh', fromId:'RDK-10031',
    uplineLevel:2, level:'2nd Upline', levelLabel:'2nd',
    percentage:5, commissionBase:2910, saleAmount:2910, amount:146,
    payoutCycleId:'CYC-003', status:'Payout Generated', remarks:'' },

  { id:'COM-006', date:'30 Jun 2025', orderId:'ORD-007',
    sellerId:'RDK-10033', sellerName:'Anita Roy',
    buyerId:'RDK-10033',  buyerName:'Anita Roy',
    receiverId:'RDK-10001', receiverName:'Rajesh Kumar',
    fromName:'Anita Roy', fromId:'RDK-10033',
    uplineLevel:2, level:'2nd Upline', levelLabel:'2nd',
    percentage:5, commissionBase:3359, saleAmount:3359, amount:168,
    payoutCycleId:'CYC-002', status:'Paid', remarks:'' },

  { id:'COM-007', date:'25 Jun 2025', orderId:'ORD-009',
    sellerId:'RDK-10051', sellerName:'Harish Sharma',
    buyerId:'RDK-10051',  buyerName:'Harish Sharma',
    receiverId:'RDK-10001', receiverName:'Rajesh Kumar',
    fromName:'Harish Sharma', fromId:'RDK-10051',
    uplineLevel:3, level:'3rd Upline', levelLabel:'3rd',
    percentage:4, commissionBase:5598, saleAmount:5598, amount:224,
    payoutCycleId:'CYC-002', status:'Paid', remarks:'' },

  { id:'COM-008', date:'20 Jun 2025', orderId:'ORD-011',
    sellerId:'RDK-10071', sellerName:'Arun Kumar',
    buyerId:'RDK-10071',  buyerName:'Arun Kumar',
    receiverId:'RDK-10001', receiverName:'Rajesh Kumar',
    fromName:'Arun Kumar', fromId:'RDK-10071',
    uplineLevel:4, level:'4th Upline', levelLabel:'4th',
    percentage:3, commissionBase:5673, saleAmount:5673, amount:170,
    payoutCycleId:'CYC-002', status:'Paid', remarks:'' },

  { id:'COM-009', date:'15 Jun 2025', orderId:'ORD-013',
    sellerId:'RDK-10091', sellerName:'Vinod Chaudhary',
    buyerId:'CUST-006',   buyerName:'Vikram Singh',
    receiverId:'RDK-10001', receiverName:'Rajesh Kumar',
    fromName:'Vinod Chaudhary', fromId:'RDK-10091',
    uplineLevel:5, level:'5th Upline', levelLabel:'5th',
    percentage:2, commissionBase:4200, saleAmount:4200, amount:84,
    payoutCycleId:'CYC-002', status:'Paid', remarks:'' },

  { id:'COM-010', date:'10 Jun 2025', orderId:'ORD-014',
    sellerId:'RDK-20011', sellerName:'Anand Tripathi',
    buyerId:'CUST-007',   buyerName:'Seema Agarwal',
    receiverId:'RDK-10001', receiverName:'Rajesh Kumar',
    fromName:'Anand Tripathi', fromId:'RDK-20011',
    uplineLevel:6, level:'6th Upline', levelLabel:'6th',
    percentage:1, commissionBase:3800, saleAmount:3800, amount:38,
    payoutCycleId:'CYC-002', status:'Paid', remarks:'' },

  { id:'COM-011', date:'05 Jun 2025', orderId:'ORD-015',
    sellerId:'RDK-20031', sellerName:'Ramesh Pandey',
    buyerId:'CUST-008',   buyerName:'Rajan Tiwari',
    receiverId:'RDK-10001', receiverName:'Rajesh Kumar',
    fromName:'Ramesh Pandey', fromId:'RDK-20031',
    uplineLevel:7, level:'7th Upline', levelLabel:'7th',
    percentage:1, commissionBase:3200, saleAmount:3200, amount:32,
    payoutCycleId:'CYC-002', status:'Paid', remarks:'' },

  { id:'COM-012', date:'01 Jun 2025', orderId:'ORD-016',
    sellerId:'RDK-20051', sellerName:'Kamla Devi',
    buyerId:'CUST-003',   buyerName:'Neha Kumari',
    receiverId:'RDK-10001', receiverName:'Rajesh Kumar',
    fromName:'Kamla Devi', fromId:'RDK-20051',
    uplineLevel:8, level:'8th Upline', levelLabel:'8th',
    percentage:1, commissionBase:2800, saleAmount:2800, amount:28,
    payoutCycleId:'CYC-001', status:'Paid', remarks:'Level TBC per client' },

  { id:'COM-013', date:'28 May 2025', orderId:'ORD-017',
    sellerId:'RDK-20071', sellerName:'Lalita Prasad',
    buyerId:'CUST-004',   buyerName:'Amit Sharma',
    receiverId:'RDK-10001', receiverName:'Rajesh Kumar',
    fromName:'Lalita Prasad', fromId:'RDK-20071',
    uplineLevel:9, level:'9th Upline', levelLabel:'9th',
    percentage:1, commissionBase:2400, saleAmount:2400, amount:24,
    payoutCycleId:'CYC-001', status:'Paid', remarks:'Level TBC per client' },

  { id:'COM-014', date:'25 May 2025', orderId:'ORD-018',
    sellerId:'RDK-20091', sellerName:'Bhanu Pratap',
    buyerId:'CUST-005',   buyerName:'Rekha Yadav',
    receiverId:'RDK-10001', receiverName:'Rajesh Kumar',
    fromName:'Bhanu Pratap', fromId:'RDK-20091',
    uplineLevel:10, level:'10th Upline (Max)', levelLabel:'10th',
    percentage:1, commissionBase:2000, saleAmount:2000, amount:20,
    payoutCycleId:'CYC-001', status:'Paid', remarks:'Max level — no further upline gets commission' },
];

// ── Payout Cycles ─────────────────────────────────────────
// Per document: 15-day cycles, statuses: Generated/Pending/Processing/Paid/Failed/Hold/Cancelled
export const payoutCycles = [
  { id:'CYC-001', name:'Cycle 1 — May 2025 (1st half)', cycleStart:'01 May 2025', cycleEnd:'15 May 2025', status:'Paid',       generatedAt:'16 May 2025', closedAt:'20 May 2025' },
  { id:'CYC-002', name:'Cycle 2 — Jun 2025 (1st half)', cycleStart:'01 Jun 2025', cycleEnd:'15 Jun 2025', status:'Paid',       generatedAt:'16 Jun 2025', closedAt:'20 Jun 2025' },
  { id:'CYC-003', name:'Cycle 3 — Jul 2025 (1st half)', cycleStart:'01 Jul 2025', cycleEnd:'15 Jul 2025', status:'Processing', generatedAt:'16 Jul 2025', closedAt: null         },
  { id:'CYC-004', name:'Cycle 4 — Jul 2025 (2nd half)', cycleStart:'16 Jul 2025', cycleEnd:'31 Jul 2025', status:'Generated',  generatedAt:'01 Aug 2025', closedAt: null         },
];

// ── Payout History ────────────────────────────────────────
// Per document Section 12: payoutId, userId, cycleStart, cycleEnd,
// totalCommission, deduction, netPayable, paymentMode, paymentReference,
// status, generatedAt, paidAt, remarks
// Statuses: Generated | Pending | Processing | Paid | Failed | Hold | Cancelled
export const payoutHistory = [
  {
    id: 'PAY-001', payoutNo: 'PO-2025-001',
    userId: 'RDK-10001', userName: 'Rajesh Kumar',
    cycleId: 'CYC-001',
    cycleStart: '01 May 2025', cycleEnd: '15 May 2025',
    generatedAt: '16 May 2025', paidAt: '20 May 2025', processedDate: '20 May 2025',
    totalCommission: 24800, deduction: 2480, netPayable: 22320, netAmount: 22320,
    paymentMode: 'NEFT', referenceNo: 'NEFT2025052098765', bankName: 'SBI', accountLast4: '4321',
    status: 'Paid', remarks: '',
    totalBusiness: 248000, commissionEarned: 24800,
    tds: 2480,
    levelBreakup: [
      { level: 'Direct Parent (1st)',  count: 3,  business: 54000,  commission: 10800, percentage: 20 },
      { level: '2nd Upline',           count: 9,  business: 48000,  commission: 2400,  percentage: 5  },
      { level: '3rd Upline',           count: 18, business: 38000,  commission: 1520,  percentage: 4  },
      { level: '4th Upline',           count: 18, business: 32000,  commission: 960,   percentage: 3  },
      { level: '5th Upline',           count: 12, business: 22000,  commission: 440,   percentage: 2  },
      { level: '6th Upline',           count: 8,  business: 16000,  commission: 160,   percentage: 1  },
      { level: '7th Upline',           count: 4,  business: 8000,   commission: 80,    percentage: 1  },
      { level: '8th Upline (TBC)',     count: 2,  business: 3600,   commission: 36,    percentage: 1  },
      { level: '9th Upline (TBC)',     count: 1,  business: 2400,   commission: 24,    percentage: 1  },
    ],
  },
  {
    id: 'PAY-002', payoutNo: 'PO-2025-002',
    userId: 'RDK-10001', userName: 'Rajesh Kumar',
    cycleId: 'CYC-002',
    cycleStart: '01 Jun 2025', cycleEnd: '15 Jun 2025',
    generatedAt: '16 Jun 2025', paidAt: '20 Jun 2025', processedDate: '20 Jun 2025',
    totalCommission: 18600, deduction: 1860, netPayable: 16740, netAmount: 16740,
    paymentMode: 'NEFT', referenceNo: 'NEFT2025062000456', bankName: 'SBI', accountLast4: '4321',
    status: 'Paid', remarks: '',
    totalBusiness: 186000, commissionEarned: 18600,
    tds: 1860,
    levelBreakup: [
      { level: 'Direct Parent (1st)',  count: 3,  business: 42000,  commission: 8400,  percentage: 20 },
      { level: '2nd Upline',           count: 9,  business: 36000,  commission: 1800,  percentage: 5  },
      { level: '3rd Upline',           count: 18, business: 28000,  commission: 1120,  percentage: 4  },
      { level: '4th Upline',           count: 18, business: 24000,  commission: 720,   percentage: 3  },
      { level: '5th Upline',           count: 12, business: 16000,  commission: 320,   percentage: 2  },
      { level: '6th Upline',           count: 8,  business: 12000,  commission: 120,   percentage: 1  },
      { level: '7th Upline',           count: 4,  business: 6000,   commission: 60,    percentage: 1  },
      { level: '8th Upline (TBC)',     count: 2,  business: 2400,   commission: 24,    percentage: 1  },
    ],
  },
  {
    id: 'PAY-003', payoutNo: 'PO-2025-003',
    userId: 'RDK-10001', userName: 'Rajesh Kumar',
    cycleId: 'CYC-003',
    cycleStart: '01 Jul 2025', cycleEnd: '15 Jul 2025',
    generatedAt: '16 Jul 2025', paidAt: null, processedDate: null,
    totalCommission: 9600, deduction: null, netPayable: null, netAmount: null,
    paymentMode: null, referenceNo: null, bankName: 'SBI', accountLast4: '4321',
    status: 'Processing', remarks: 'Under review by admin',
    totalBusiness: 96000, commissionEarned: 9600,
    tds: null,
    levelBreakup: [
      { level: 'Direct Parent (1st)',  count: 3,  business: 22000,  commission: 4400,  percentage: 20 },
      { level: '2nd Upline',           count: 9,  business: 18000,  commission: 900,   percentage: 5  },
      { level: '3rd Upline',           count: 18, business: 14000,  commission: 560,   percentage: 4  },
      { level: '4th Upline',           count: 18, business: 12000,  commission: 360,   percentage: 3  },
      { level: '5th Upline',           count: 12, business: 8000,   commission: 160,   percentage: 2  },
      { level: '6th Upline',           count: 6,  business: 6000,   commission: 60,    percentage: 1  },
      { level: '7th Upline',           count: 3,  business: 4000,   commission: 40,    percentage: 1  },
    ],
  },
  {
    id: 'PAY-004', payoutNo: 'PO-2025-004',
    userId: 'RDK-10001', userName: 'Rajesh Kumar',
    cycleId: 'CYC-004',
    cycleStart: '16 Jul 2025', cycleEnd: '31 Jul 2025',
    generatedAt: '01 Aug 2025', paidAt: null, processedDate: null,
    totalCommission: 4200, deduction: null, netPayable: null, netAmount: null,
    paymentMode: null, referenceNo: null, bankName: 'SBI', accountLast4: '4321',
    status: 'Generated', remarks: 'Payout generated, pending admin approval',
    totalBusiness: 42000, commissionEarned: 4200,
    tds: null,
    levelBreakup: [
      { level: 'Direct Parent (1st)',  count: 3,  business: 10000,  commission: 2000,  percentage: 20 },
      { level: '2nd Upline',           count: 6,  business: 8000,   commission: 400,   percentage: 5  },
      { level: '3rd Upline',           count: 8,  business: 6000,   commission: 240,   percentage: 4  },
      { level: '4th Upline',           count: 5,  business: 4000,   commission: 120,   percentage: 3  },
    ],
  },
];

// ── Earnings by Level ─────────────────────────────────────
// Per document: commission received FROM downline sales
// Level here = how many hops away the seller is from Rajesh Kumar
// Level 1 = Rajesh is direct parent → gets 20%
// Level 2 = Rajesh is 2nd upline   → gets 5%  ... etc.
// NO self-commission row — commission only from downline
export const earningsByLevel = [
  { level: 1,  label: '1st', name: 'Direct Parent',  members: 3,  totalBusiness: 108000, commission: 21600, earned: 21600, percentage: 20 },
  { level: 2,  label: '2nd', name: '2nd Upline',     members: 9,  totalBusiness: 78000,  commission: 3900,  earned: 3900,  percentage: 5  },
  { level: 3,  label: '3rd', name: '3rd Upline',     members: 6,  totalBusiness: 60000,  commission: 2400,  earned: 2400,  percentage: 4  },
  { level: 4,  label: '4th', name: '4th Upline',     members: 4,  totalBusiness: 48000,  commission: 1440,  earned: 1440,  percentage: 3  },
  { level: 5,  label: '5th', name: '5th Upline',     members: 4,  totalBusiness: 24000,  commission: 480,   earned: 480,   percentage: 2  },
  { level: 6,  label: '6th', name: '6th Upline',     members: 3,  totalBusiness: 18000,  commission: 180,   earned: 180,   percentage: 1  },
  { level: 7,  label: '7th', name: '7th Upline',     members: 3,  totalBusiness: 9600,   commission: 96,    earned: 96,    percentage: 1  },
  { level: 8,  label: '8th', name: '8th Upline',     members: 3,  totalBusiness: 5400,   commission: 54,    earned: 54,    percentage: 1  },
  { level: 9,  label: '9th', name: '9th Upline',     members: 3,  totalBusiness: 3600,   commission: 36,    earned: 36,    percentage: 1  },
  { level: 10, label: '10th',name: '10th Upline',    members: 3,  totalBusiness: 2400,   commission: 24,    earned: 24,    percentage: 1  },
];

export const recentSales = salesHistory.slice(0, 4);
export const recentCommissions = commissionHistory.slice(0, 5);

// ── Joining Form fields reference ─────────────────────────
export const joiningFormFields = {
  personal: ['Name', 'Mobile No', 'Email', 'Address'],
  location: ['State', 'District', 'Pincode', 'Postal Area Name'],
};

// ── Commission Rules (configurable per document Section 14.7) ─
// Stored separately so Admin can update without code change
export const commissionRules = [
  { level: 1,  percentage: 20, isActive: true,  effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: 'Direct Parent' },
  { level: 2,  percentage: 5,  isActive: true,  effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: '2nd Upline'    },
  { level: 3,  percentage: 4,  isActive: true,  effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: '3rd Upline'    },
  { level: 4,  percentage: 3,  isActive: true,  effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: '4th Upline'    },
  { level: 5,  percentage: 2,  isActive: true,  effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: '5th Upline'    },
  { level: 6,  percentage: 1,  isActive: true,  effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: '6th Upline'    },
  { level: 7,  percentage: 1,  isActive: true,  effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: '7th Upline'    },
  { level: 8,  percentage: 1,  isActive: false, effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: 'TBC — pending client confirmation' },
  { level: 9,  percentage: 1,  isActive: false, effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: 'TBC — pending client confirmation' },
  { level: 10, percentage: 1,  isActive: false, effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: 'TBC — pending client confirmation' },
];

// ── Payout Policy ─────────────────────────────────────────
// Per document Section 11 & 12
export const payoutPolicy = {
  // Cycle options (pending client confirmation):
  // Option A: 1st–15th and 16th–month end
  // Option B: Rolling 15-day cycle
  cycleType: '1st-15th / 16th-monthend',
  cycleOpenDate: '1st and 16th of each month',
  processingDate: 'Within 5 days of cycle close',
  payoutStages: ['Generated', 'Pending', 'Processing', 'Paid', 'Failed', 'Hold', 'Cancelled'],
  // Points pending client confirmation (Section 18):
  pendingPoints: [
    '8th, 9th, 10th level commission % not confirmed',
    'Commission base: sale amount or commissionable amount?',
    'Payout cycle type: fixed or rolling?',
    'Minimum payout amount threshold?',
    'KYC/bank details mandatory before payout?',
    'Commission on cancelled/refunded sale: reverse or hold?',
    'TDS deduction applicable?',
    'Payout via payment gateway or manual by Admin?',
  ],
  maxUplineLevels: 10,
  cappingPerMonth: 45000,
  cappingSlots: 3,
  cappingPerSlot: 15000,
  cappingProducts: 10000,
  cappingResetAt: 100000,
  bonusOnCap: 1,
  megaBonus: { units: 100000, percent: 10 },
};
