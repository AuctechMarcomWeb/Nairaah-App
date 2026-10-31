import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { colors, typography, spacing, radius, elevation } from '../theme';
import Icon from './Icon';

// ── Re-exports (separate files for cleaner imports) ───────
export { SearchBar }   from './SearchBar';
export { StatsBanner } from './StatsBanner';
export { PickerModal } from './PickerModal';
export { Dropdown }    from './Dropdown';
export { InfoRow }     from './InfoRow';
export { default as Icon, Icons } from './Icon';

// ── AppHeader ─────────────────────────────────────────────
// rightIconName — MaterialCommunityIcons name (preferred)
// rightIcon     — legacy emoji/text fallback
export function AppHeader({ title, subtitle, onBack, rightIcon, rightIconName, onRightPress }) {
  return (
    <View style={hdrStyles.container}>
      {onBack ? (
        <TouchableOpacity style={hdrStyles.backBtn} onPress={onBack}>
          <Icon name="chevron-left" size={26} color={colors.primary} />
        </TouchableOpacity>
      ) : (
        <View style={hdrStyles.logoMark}>
          <Image
            source={require('../assets/images/nairaah_logo.png')}
            style={hdrStyles.logoMarkImg}
            resizeMode="contain"
          />
        </View>
      )}
      <View style={hdrStyles.titleBox}>
        <Text style={hdrStyles.title}>{title}</Text>
        {subtitle ? <Text style={hdrStyles.subtitle}>{subtitle}</Text> : null}
      </View>
      {(rightIconName || rightIcon) ? (
        <TouchableOpacity style={hdrStyles.rightBtn} onPress={onRightPress}>
          {rightIconName
            ? <Icon name={rightIconName} size={20} color={colors.primary} />
            : <Text style={hdrStyles.rightIcon}>{rightIcon}</Text>}
        </TouchableOpacity>
      ) : <View style={{ width: 40 }} />}
    </View>
  );
}

const hdrStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 28, color: colors.primary, fontWeight: '300', lineHeight: 32 },
  logoMark: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    padding: 3,
    borderWidth: 1, borderColor: colors.primaryContainer,
  },
  logoMarkImg: { width: 28, height: 28 },
  titleBox: { flex: 1, marginLeft: spacing.md },
  title: { ...typography.titleLarge, color: colors.onSurface },
  subtitle: { ...typography.bodySmall, color: colors.onSurfaceMuted, marginTop: 1 },
  rightBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  rightIcon: { fontSize: 18 },
});

// ── SummaryCard ───────────────────────────────────────────
// iconName — MaterialCommunityIcons name (preferred)
// icon     — legacy emoji fallback
export function SummaryCard({ label, value, icon, iconName, accentColor, containerColor }) {
  const bg = containerColor || colors.primaryContainer;
  const fg = accentColor || colors.primary;
  return (
    <View style={[sumStyles.card, elevation.level1]}>
      <View style={[sumStyles.iconBox, { backgroundColor: bg }]}>
        {iconName
          ? <Icon name={iconName} size={22} color={fg} />
          : <Text style={sumStyles.icon}>{icon}</Text>}
      </View>
      <Text style={[sumStyles.value, { color: fg }]}>{value}</Text>
      <Text style={sumStyles.label}>{label}</Text>
    </View>
  );
}

const sumStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'flex-start',
    minWidth: '45%',
  },
  iconBox: {
    width: 40, height: 40, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 20 },
  value: { ...typography.headlineSmall, marginBottom: 2 },
  label: { ...typography.bodySmall, color: colors.onSurfaceMuted },
});

// ── StatusChip ────────────────────────────────────────────
export function StatusChip({ status }) {
  const map = {
    Paid:              { bg: colors.successContainer,  text: colors.success },
    Approved:          { bg: colors.successContainer,  text: colors.success },
    Delivered:         { bg: colors.successContainer,  text: colors.success },
    Eligible:          { bg: colors.primaryContainer,  text: colors.primary },
    'Payout Generated':{ bg: colors.primaryContainer,  text: colors.primary },
    Generated:         { bg: colors.primaryContainer,  text: colors.primary },
    Pending:           { bg: colors.pendingContainer,  text: colors.pending },
    Processing:        { bg: colors.warningContainer,  text: colors.warning },
    Shipped:           { bg: colors.primaryContainer,  text: colors.primary },
    Hold:              { bg: colors.warningContainer,  text: colors.warning },
    Failed:            { bg: colors.errorContainer,    text: colors.error   },
    Cancelled:         { bg: colors.errorContainer,    text: colors.error   },
    Unpaid:            { bg: colors.errorContainer,    text: colors.error   },
    Inactive:          { bg: colors.errorContainer,    text: colors.error   },
    Active:            { bg: colors.successContainer,  text: colors.success },
  };
  const style = map[status] || { bg: colors.surfaceVariant, text: colors.onSurfaceMuted };
  return (
    <View style={[chipStyles.chip, { backgroundColor: style.bg }]}>
      <Text style={[chipStyles.text, { color: style.text }]}>{status}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: { ...typography.labelMedium },
});

// ── PrimaryButton ─────────────────────────────────────────
export function PrimaryButton({ label, onPress, loading, disabled, style }) {
  return (
    <TouchableOpacity
      style={[btnStyles.btn, (disabled || loading) && btnStyles.btnDisabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}>
      {loading
        ? <ActivityIndicator color={colors.white} size="small" />
        : <Text style={btnStyles.label}>{label}</Text>}
    </TouchableOpacity>
  );
}

const btnStyles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.level2,
  },
  btnDisabled: { opacity: 0.55 },
  label: { ...typography.titleMedium, color: colors.white, fontSize: 15 },
});

// ── FormField ─────────────────────────────────────────────
// Fully working labeled TextInput (replaces the old stub)
export function FormField({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, multiline, editable = true }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={fldStyles.wrapper}>
      <Text style={fldStyles.label}>{label}</Text>
      <TextInput
        style={[
          fldStyles.input,
          focused && fldStyles.inputFocused,
          multiline && fldStyles.inputMulti,
          !editable && fldStyles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || ''}
        placeholderTextColor={colors.onSurfaceMuted}
        keyboardType={keyboardType || 'default'}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        editable={editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const fldStyles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { ...typography.labelLarge, color: colors.onSurfaceVariant, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.outline,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 50,
    backgroundColor: colors.background,
    ...typography.bodyLarge,
    color: colors.onSurface,
  },
  inputFocused: { borderColor: colors.primary, backgroundColor: colors.surface },
  inputMulti: { height: 80, paddingTop: 12 },
  inputDisabled: { backgroundColor: colors.surfaceVariant, color: colors.onSurfaceMuted },
});

// ── SectionHeader ─────────────────────────────────────────
export function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={secStyles.row}>
      <Text style={secStyles.title}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={secStyles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const secStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { ...typography.titleLarge, color: colors.onSurface },
  action: { ...typography.labelLarge, color: colors.primary },
});

// ── EmptyState ────────────────────────────────────────────
// iconName — MaterialCommunityIcons name (preferred)
// icon     — legacy emoji fallback
export function EmptyState({ icon, iconName, message }) {
  return (
    <View style={emptyStyles.container}>
      {iconName
        ? <Icon name={iconName} size={48} color={colors.onSurfaceMuted} style={{ marginBottom: 12, opacity: 0.5 }} />
        : <Text style={emptyStyles.icon}>{icon || '📭'}</Text>}
      <Text style={emptyStyles.message}>{message || 'No data found'}</Text>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 48 },
  icon: { fontSize: 48, marginBottom: 12 },
  message: { ...typography.bodyMedium, color: colors.onSurfaceMuted },
});

// ── Divider ───────────────────────────────────────────────
export function Divider({ style }) {
  return <View style={[{ height: 1, backgroundColor: colors.divider }, style]} />;
}

// ── LevelBadge ────────────────────────────────────────────
// Shows MLM level badge (A+, A, B, C … K)
// A+ gets a special crown icon and red styling
const LEVEL_COLORS = {
  'A+': { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
  'A':  { color: '#1A73E8', bg: '#EFF6FF', border: '#BFDBFE' },
  'B':  { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  'C':  { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  'D':  { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  'E':  { color: '#DC2626', bg: '#FFF1F2', border: '#FECDD3' },
  'F':  { color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' },
  'G':  { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  'H':  { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  'I':  { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  'J':  { color: '#DC2626', bg: '#FFF1F2', border: '#FECDD3' },
  'K':  { color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
};

export function LevelBadge({ level, size = 'md' }) {
  if (!level) return null;
  const lc = LEVEL_COLORS[level] || LEVEL_COLORS['K'];
  const isAPlus = level === 'A+';
  const isSmall = size === 'sm';
  return (
    <View style={[
      lvlStyles.badge,
      { backgroundColor: lc.bg, borderColor: lc.border },
      isSmall && lvlStyles.badgeSm,
    ]}>
      {isAPlus && (
        <Icon
          name="crown-outline"
          size={isSmall ? 11 : 13}
          color={lc.color}
        />
      )}
      <Text style={[lvlStyles.text, { color: lc.color }, isSmall && lvlStyles.textSm]}>
        {isAPlus ? 'A+' : `Level ${level}`}
      </Text>
    </View>
  );
}

const lvlStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 4,
  },
  badgeSm: { paddingHorizontal: 7, paddingVertical: 2 },
  text:    { ...typography.labelLarge, fontWeight: '700' },
  textSm:  { fontSize: 11 },
});
