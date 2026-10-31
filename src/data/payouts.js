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
