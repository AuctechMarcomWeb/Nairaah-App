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
// 3 direct B-members, each has 3 C-members
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
