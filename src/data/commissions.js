// ─────────────────────────────────────────────────────────────
// commissions.js  –  Commission data for Nairaah MLM platform
// ─────────────────────────────────────────────────────────────
// Per document Section 10 — Commission Log required fields:
//   commissionId | sourceTransactionId | sellerId | buyerId
//   receiverId   | receiverLevel       | percentage | amount
//   status       | payoutCycleId       | createdDate | remarks
//
// Status values:
//   Pending | Eligible | Hold | Payout Generated | Paid | Cancelled
// ─────────────────────────────────────────────────────────────

// ── 1. Commission Rules ───────────────────────────────────────
// Per document Section 14.7 — stored separately so Admin can
// update percentages without touching application code.
export const commissionRules = [
  { level: 1,  percentage: 20, isActive: true,  effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: 'Direct Parent'                       },
  { level: 2,  percentage: 5,  isActive: true,  effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: '2nd Upline'                          },
  { level: 3,  percentage: 4,  isActive: true,  effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: '3rd Upline'                          },
  { level: 4,  percentage: 3,  isActive: true,  effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: '4th Upline'                          },
  { level: 5,  percentage: 2,  isActive: true,  effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: '5th Upline'                          },
  { level: 6,  percentage: 1,  isActive: true,  effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: '6th Upline'                          },
  { level: 7,  percentage: 1,  isActive: true,  effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: '7th Upline'                          },
  { level: 8,  percentage: 1,  isActive: false, effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: 'TBC — pending client confirmation'   },
  { level: 9,  percentage: 1,  isActive: false, effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: 'TBC — pending client confirmation'   },
  { level: 10, percentage: 1,  isActive: false, effectiveFrom: '01 Jan 2024', effectiveTo: null, remarks: 'TBC — pending client confirmation'   },
];

// ── 2. Earnings by Level ──────────────────────────────────────
// Commission received by Rajesh Kumar FROM his downline sales.
// Level = hops away from Rajesh:
//   Level 1 → Rajesh is direct parent  → 20%
//   Level 2 → Rajesh is 2nd upline     →  5%
//   …and so on.
// No self-commission row — commissions are earned only from downline.
export const earningsByLevel = [
  { level: 1,  label: '1st',  name: 'Direct Parent', members: 3,  totalBusiness: 108000, commission: 21600, earned: 21600, percentage: 20 },
  { level: 2,  label: '2nd',  name: '2nd Upline',    members: 9,  totalBusiness: 78000,  commission: 3900,  earned: 3900,  percentage: 5  },
  { level: 3,  label: '3rd',  name: '3rd Upline',    members: 6,  totalBusiness: 60000,  commission: 2400,  earned: 2400,  percentage: 4  },
  { level: 4,  label: '4th',  name: '4th Upline',    members: 4,  totalBusiness: 48000,  commission: 1440,  earned: 1440,  percentage: 3  },
  { level: 5,  label: '5th',  name: '5th Upline',    members: 4,  totalBusiness: 24000,  commission: 480,   earned: 480,   percentage: 2  },
  { level: 6,  label: '6th',  name: '6th Upline',    members: 3,  totalBusiness: 18000,  commission: 180,   earned: 180,   percentage: 1  },
  { level: 7,  label: '7th',  name: '7th Upline',    members: 3,  totalBusiness: 9600,   commission: 96,    earned: 96,    percentage: 1  },
  { level: 8,  label: '8th',  name: '8th Upline',    members: 3,  totalBusiness: 5400,   commission: 54,    earned: 54,    percentage: 1  },
  { level: 9,  label: '9th',  name: '9th Upline',    members: 3,  totalBusiness: 3600,   commission: 36,    earned: 36,    percentage: 1  },
  { level: 10, label: '10th', name: '10th Upline',   members: 3,  totalBusiness: 2400,   commission: 24,    earned: 24,    percentage: 1  },
];

// ── 3. Commission History ─────────────────────────────────────
// Full log of commissions RECEIVED by Rajesh Kumar (RDK-10001)
// from his downline's sales activity.
export const commissionHistory = [
  {
    id: 'COM-001', date: '18 Jul 2025', orderId: 'ORD-001',
    sellerId: 'RDK-10001', sellerName: 'Rajesh Kumar',
    buyerId: 'CUST-001',   buyerName: 'Priya Verma',
    receiverId: 'RDK-10001', receiverName: 'Rajesh Kumar',
    fromId: 'CUST-001',    fromName: 'Priya Verma',
    uplineLevel: 1,  level: 'Direct Parent (1st Upline)', levelLabel: '1st',
    percentage: 20,  commissionBase: 3536, saleAmount: 3536, amount: 707,
    payoutCycleId: 'CYC-003', status: 'Pending',   remarks: '',
  },
  {
    id: 'COM-002', date: '15 Jul 2025', orderId: 'ORD-002',
    sellerId: 'RDK-10003', sellerName: 'Mohan Das',
    buyerId: 'RDK-10003',  buyerName: 'Mohan Das',
    receiverId: 'RDK-10001', receiverName: 'Rajesh Kumar',
    fromId: 'RDK-10003',   fromName: 'Mohan Das',
    uplineLevel: 1,  level: 'Direct Parent (1st Upline)', levelLabel: '1st',
    percentage: 20,  commissionBase: 5628, saleAmount: 5628, amount: 1126,
    payoutCycleId: 'CYC-003', status: 'Eligible',  remarks: '',
  },
  {
    id: 'COM-003', date: '12 Jul 2025', orderId: 'ORD-003',
    sellerId: 'RDK-10001', sellerName: 'Rajesh Kumar',
    buyerId: 'CUST-002',   buyerName: 'Suresh Mehta',
    receiverId: 'RDK-10001', receiverName: 'Rajesh Kumar',
    fromId: 'CUST-002',    fromName: 'Suresh Mehta',
    uplineLevel: 1,  level: 'Direct Parent (1st Upline)', levelLabel: '1st',
    percentage: 20,  commissionBase: 2359, saleAmount: 2359, amount: 472,
    payoutCycleId: 'CYC-003', status: 'Hold',      remarks: 'Payment pending',
  },
  {
    id: 'COM-004', date: '05 Jul 2025', orderId: 'ORD-005',
    sellerId: 'RDK-10002', sellerName: 'Sunita Patel',
    buyerId: 'RDK-10002',  buyerName: 'Sunita Patel',
    receiverId: 'RDK-10001', receiverName: 'Rajesh Kumar',
    fromId: 'RDK-10002',   fromName: 'Sunita Patel',
    uplineLevel: 1,  level: 'Direct Parent (1st Upline)', levelLabel: '1st',
    percentage: 20,  commissionBase: 5307, saleAmount: 5307, amount: 1061,
    payoutCycleId: 'CYC-003', status: 'Eligible',  remarks: '',
  },
  {
    id: 'COM-005', date: '02 Jul 2025', orderId: 'ORD-006',
    sellerId: 'RDK-10031', sellerName: 'Kavita Singh',
    buyerId: 'RDK-10031',  buyerName: 'Kavita Singh',
    receiverId: 'RDK-10001', receiverName: 'Rajesh Kumar',
    fromId: 'RDK-10031',   fromName: 'Kavita Singh',
    uplineLevel: 2,  level: '2nd Upline', levelLabel: '2nd',
    percentage: 5,   commissionBase: 2910, saleAmount: 2910, amount: 146,
    payoutCycleId: 'CYC-003', status: 'Payout Generated', remarks: '',
  },
  {
    id: 'COM-006', date: '30 Jun 2025', orderId: 'ORD-007',
    sellerId: 'RDK-10033', sellerName: 'Anita Roy',
    buyerId: 'RDK-10033',  buyerName: 'Anita Roy',
    receiverId: 'RDK-10001', receiverName: 'Rajesh Kumar',
    fromId: 'RDK-10033',   fromName: 'Anita Roy',
    uplineLevel: 2,  level: '2nd Upline', levelLabel: '2nd',
    percentage: 5,   commissionBase: 3359, saleAmount: 3359, amount: 168,
    payoutCycleId: 'CYC-002', status: 'Paid',      remarks: '',
  },
  {
    id: 'COM-007', date: '25 Jun 2025', orderId: 'ORD-009',
    sellerId: 'RDK-10051', sellerName: 'Harish Sharma',
    buyerId: 'RDK-10051',  buyerName: 'Harish Sharma',
    receiverId: 'RDK-10001', receiverName: 'Rajesh Kumar',
    fromId: 'RDK-10051',   fromName: 'Harish Sharma',
    uplineLevel: 3,  level: '3rd Upline', levelLabel: '3rd',
    percentage: 4,   commissionBase: 5598, saleAmount: 5598, amount: 224,
    payoutCycleId: 'CYC-002', status: 'Paid',      remarks: '',
  },
  {
    id: 'COM-008', date: '20 Jun 2025', orderId: 'ORD-011',
    sellerId: 'RDK-10071', sellerName: 'Arun Kumar',
    buyerId: 'RDK-10071',  buyerName: 'Arun Kumar',
    receiverId: 'RDK-10001', receiverName: 'Rajesh Kumar',
    fromId: 'RDK-10071',   fromName: 'Arun Kumar',
    uplineLevel: 4,  level: '4th Upline', levelLabel: '4th',
    percentage: 3,   commissionBase: 5673, saleAmount: 5673, amount: 170,
    payoutCycleId: 'CYC-002', status: 'Paid',      remarks: '',
  },
  {
    id: 'COM-009', date: '15 Jun 2025', orderId: 'ORD-013',
    sellerId: 'RDK-10091', sellerName: 'Vinod Chaudhary',
    buyerId: 'CUST-006',   buyerName: 'Vikram Singh',
    receiverId: 'RDK-10001', receiverName: 'Rajesh Kumar',
    fromId: 'RDK-10091',   fromName: 'Vinod Chaudhary',
    uplineLevel: 5,  level: '5th Upline', levelLabel: '5th',
    percentage: 2,   commissionBase: 4200, saleAmount: 4200, amount: 84,
    payoutCycleId: 'CYC-002', status: 'Paid',      remarks: '',
  },
  {
    id: 'COM-010', date: '10 Jun 2025', orderId: 'ORD-014',
    sellerId: 'RDK-20011', sellerName: 'Anand Tripathi',
    buyerId: 'CUST-007',   buyerName: 'Seema Agarwal',
    receiverId: 'RDK-10001', receiverName: 'Rajesh Kumar',
    fromId: 'RDK-20011',   fromName: 'Anand Tripathi',
    uplineLevel: 6,  level: '6th Upline', levelLabel: '6th',
    percentage: 1,   commissionBase: 3800, saleAmount: 3800, amount: 38,
    payoutCycleId: 'CYC-002', status: 'Paid',      remarks: '',
  },
  {
    id: 'COM-011', date: '05 Jun 2025', orderId: 'ORD-015',
    sellerId: 'RDK-20031', sellerName: 'Ramesh Pandey',
    buyerId: 'CUST-008',   buyerName: 'Rajan Tiwari',
    receiverId: 'RDK-10001', receiverName: 'Rajesh Kumar',
    fromId: 'RDK-20031',   fromName: 'Ramesh Pandey',
    uplineLevel: 7,  level: '7th Upline', levelLabel: '7th',
    percentage: 1,   commissionBase: 3200, saleAmount: 3200, amount: 32,
    payoutCycleId: 'CYC-002', status: 'Paid',      remarks: '',
  },
  {
    id: 'COM-012', date: '01 Jun 2025', orderId: 'ORD-016',
    sellerId: 'RDK-20051', sellerName: 'Kamla Devi',
    buyerId: 'CUST-003',   buyerName: 'Neha Kumari',
    receiverId: 'RDK-10001', receiverName: 'Rajesh Kumar',
    fromId: 'RDK-20051',   fromName: 'Kamla Devi',
    uplineLevel: 8,  level: '8th Upline', levelLabel: '8th',
    percentage: 1,   commissionBase: 2800, saleAmount: 2800, amount: 28,
    payoutCycleId: 'CYC-001', status: 'Paid',      remarks: 'Level TBC per client',
  },
  {
    id: 'COM-013', date: '28 May 2025', orderId: 'ORD-017',
    sellerId: 'RDK-20071', sellerName: 'Lalita Prasad',
    buyerId: 'CUST-004',   buyerName: 'Amit Sharma',
    receiverId: 'RDK-10001', receiverName: 'Rajesh Kumar',
    fromId: 'RDK-20071',   fromName: 'Lalita Prasad',
    uplineLevel: 9,  level: '9th Upline', levelLabel: '9th',
    percentage: 1,   commissionBase: 2400, saleAmount: 2400, amount: 24,
    payoutCycleId: 'CYC-001', status: 'Paid',      remarks: 'Level TBC per client',
  },
  {
    id: 'COM-014', date: '25 May 2025', orderId: 'ORD-018',
    sellerId: 'RDK-20091', sellerName: 'Bhanu Pratap',
    buyerId: 'CUST-005',   buyerName: 'Rekha Yadav',
    receiverId: 'RDK-10001', receiverName: 'Rajesh Kumar',
    fromId: 'RDK-20091',   fromName: 'Bhanu Pratap',
    uplineLevel: 10, level: '10th Upline (Max)', levelLabel: '10th',
    percentage: 1,   commissionBase: 2000, saleAmount: 2000, amount: 20,
    payoutCycleId: 'CYC-001', status: 'Paid',      remarks: 'Max level — no further upline gets commission',
  },
];

// ── 4. Derived / Convenience Exports ─────────────────────────
/** Most recent 5 commissions — used on dashboard summary cards. */
export const recentCommissions = commissionHistory.slice(0, 5);
