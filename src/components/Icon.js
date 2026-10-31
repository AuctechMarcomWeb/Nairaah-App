/**
 * Icon.js — Central icon wrapper for Nairaah
 *
 * Uses MaterialCommunityIcons from react-native-vector-icons.
 * All icon names: https://materialdesignicons.com
 *
 * Usage:
 *   import Icon from '../components/Icon';
 *   <Icon name="home" size={24} color={colors.primary} />
 */
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Icon({ name, size = 22, color, style }) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      style={style}
    />
  );
}

// ── Named icon map ────────────────────────────────────────
// Central map so icon names never scatter across screens.
// Update here → updates everywhere.
export const Icons = {
  // Navigation tabs
  dashboard:       'view-dashboard-outline',
  dashboardActive: 'view-dashboard',
  orders:          'receipt-outline',
  ordersActive:    'receipt',
  downline:        'account-group-outline',
  downlineActive:  'account-group',
  payout:          'briefcase-outline',
  payoutActive:    'briefcase',
  profile:         'account-circle-outline',
  profileActive:   'account-circle',

  // Actions
  back:            'chevron-left',
  add:             'plus',
  edit:            'pencil-outline',
  delete:          'trash-can-outline',
  search:          'magnify',
  filter:          'filter-outline',
  close:           'close',
  check:           'check',
  chevronRight:    'chevron-right',
  chevronDown:     'chevron-down',
  phone:           'phone-outline',
  logout:          'logout',
  eye:             'eye-outline',
  eyeOff:          'eye-off-outline',
  lock:            'lock-outline',
  dropdownArrow:   'menu-down',

  // Entities
  customer:        'account-outline',
  distributor:     'handshake-outline',
  product:         'package-variant-outline',
  sale:            'cart-outline',
  commission:      'cash-multiple',
  team:            'account-multiple-outline',
  upline:          'link-variant',
  level:           'medal-outline',
  crown:           'crown-outline',

  // Info fields (Profile / modals)
  idCard:          'card-account-details-outline',
  joinDate:        'calendar-outline',
  mobile:          'cellphone',
  email:           'email-outline',
  address:         'home-outline',
  city:            'city-variant-outline',
  state:           'map-outline',
  pincode:         'map-marker-outline',
  pinNumber:       'numeric',

  // Status icons
  pending:         'clock-outline',
  eligible:        'check-circle-outline',
  hold:            'pause-circle-outline',
  paid:            'check-decagram-outline',
  payoutGenerated: 'cash-check',
  cancelled:       'close-circle-outline',
  target:          'bullseye-arrow',
  trophy:          'trophy-outline',
  cycle:           'calendar-month-outline',

  // Misc
  empty:           'inbox-outline',
  emptySearch:     'magnify-close',
  emptyUser:       'account-off-outline',
  noProduct:       'package-variant-remove',
};
