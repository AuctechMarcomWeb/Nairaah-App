import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, elevation, typography } from '../../themes';
import { AppHeader } from '../../components';
import { getAgreementById } from '../../api/agreement';

const REFUND_POLICY_ID = '6a7434eb52886ea51a838741';

export default function RefundPolicyScreen({ navigation }) {
  const [loading,  setLoading]  = useState(true);
  const [title,    setTitle]    = useState('Refund & Buy-Back Policy');
  const [content,  setContent]  = useState('');
  const [error,    setError]    = useState(false);

  useEffect(() => {
    getAgreementById(REFUND_POLICY_ID)
      .then(res => {
        if (res.success) {
          const d = res.data?.agreement || res.data;
          setTitle(d?.title || 'Refund & Buy-Back Policy');
          const raw = d?.content || '';
          // Strip HTML tags
          const plain = raw.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
          setContent(plain || 'No refund policy available.');
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <AppHeader title="Refund Policy" onBack={() => navigation.goBack()} />

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.card}>
            <Text style={s.title}>{title}</Text>
            <View style={s.divider} />
            <Text style={s.content}>
              {error ? 'Refund policy load nahi ho saki. Please try again later.' : content}
            </Text>
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
  card:      { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, ...elevation.level1 },
  title:     { ...typography.headlineSmall, color: colors.onSurface, marginBottom: 12 },
  divider:   { height: 1, backgroundColor: colors.divider, marginBottom: 16 },
  content:   { ...typography.bodyMedium, color: colors.onSurface, lineHeight: 26 },
});
