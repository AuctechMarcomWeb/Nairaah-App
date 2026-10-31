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
