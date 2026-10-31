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

export const recentSales = salesHistory.slice(0, 4);

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
