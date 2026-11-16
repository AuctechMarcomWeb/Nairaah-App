import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader } from '../../components';
import { getAllAgreements, getAgreementById } from '../../api/agreement';

// Strip HTML tags and decode common entities, preserve structure
function parseHtmlToBlocks(html) {
  if (!html) return [];

  // Normalize line breaks from block elements
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<hr[^>]*>/gi, '\n───────────────────\n')
    .replace(/<[^>]+>/g, '')           // strip remaining tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')        // max 2 blank lines
    .trim();

  // Split into paragraphs
  return text.split('\n\n').map(p => p.trim()).filter(Boolean);
}

export default function RefundPolicyScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [title,   setTitle]   = useState('Refund & Buy-Back Policy');
  const [blocks,  setBlocks]  = useState([]);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch all agreements and find the refund/policy type
        const allRes = await getAllAgreements();
        if (!allRes.success) { setError(true); return; }

        const list = allRes.data?.agreements || allRes.data || [];
        const doc =
          list.find(a => a.type === 'RefundPolicy'  && a.isActive) ||
          list.find(a => a.type === 'Refund'        && a.isActive) ||
          list.find(a => /refund|buyback|buy.back|policy/i.test(a.type || a.title) && a.isActive) ||
          list.find(a => /refund|buyback|buy.back|policy/i.test(a.title));

        if (!doc) { setError(true); return; }

        const detailRes = await getAgreementById(doc._id);
        if (!detailRes.success) { setError(true); return; }

        const d = detailRes.data?.agreement || detailRes.data;
        setTitle(d?.title || 'Refund & Buy-Back Policy');
        setBlocks(parseHtmlToBlocks(d?.content || ''));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader title="Refund Policy" onBack={() => navigation.goBack()} />

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />
      ) : error ? (
        <View style={s.errorBox}>
          <Text style={s.errorIcon}>📄</Text>
          <Text style={s.errorTitle}>Could not load</Text>
          <Text style={s.errorSub}>Refund policy is not available right now.{'\n'}Please try again later.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.card}>
            <Text style={s.title}>{title}</Text>
            <View style={s.divider} />
            {blocks.map((block, i) => {
              const isBullet  = block.startsWith('•');
              const isSep     = block.startsWith('───');
              const isHeading = block.length < 80 && !block.includes('\n') && block === block.toUpperCase();
              if (isSep) return <View key={i} style={s.sep} />;
              if (isHeading) return <Text key={i} style={s.heading}>{block}</Text>;
              if (isBullet) {
                return (
                  <View key={i} style={s.bulletRow}>
                    <Text style={s.bulletDot}>•</Text>
                    <Text style={s.bulletText}>{block.replace(/^•\s*/, '')}</Text>
                  </View>
                );
              }
              return <Text key={i} style={s.para}>{block}</Text>;
            })}
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll:    { padding: spacing.lg },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    ...elevation.level1,
  },
  title:   { ...typography.headlineSmall, color: colors.primary, marginBottom: 12, fontWeight: '700' },
  divider: { height: 1.5, backgroundColor: colors.divider, marginBottom: 20 },

  heading: {
    ...typography.titleSmall,
    color: colors.primary,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  para: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    lineHeight: 26,
    marginBottom: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 4,
  },
  bulletDot:  { ...typography.bodyMedium, color: colors.primary, marginRight: 8, marginTop: 1 },
  bulletText: { ...typography.bodyMedium, color: colors.onSurface, lineHeight: 24, flex: 1 },
  sep:        { height: 1, backgroundColor: colors.divider, marginVertical: 16 },

  errorBox:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorIcon: { fontSize: 48, marginBottom: 12 },
  errorTitle:{ ...typography.titleLarge, color: colors.onSurface, marginBottom: 8 },
  errorSub:  { ...typography.bodyMedium, color: colors.onSurfaceMuted, textAlign: 'center', lineHeight: 24 },
});
