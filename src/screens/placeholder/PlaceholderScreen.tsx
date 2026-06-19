import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/common/Button';
import { useAppTheme } from '../../hooks/useAppTheme';

interface PlaceholderScreenProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  points: string[];
  actions: string[];
  footer?: React.ReactNode;
  onActionPress?: (action: string) => void;
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  eyebrow,
  title,
  subtitle,
  points,
  actions,
  footer,
  onActionPress,
}) => {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>当前保留能力</Text>
          <View style={styles.list}>
            {points.map((point) => (
              <View key={point} style={styles.listItem}>
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.listText, { color: colors.text }]}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>下一步接入建议</Text>
          <View style={styles.actionGrid}>
            {actions.map((action) => (
              <Button
                key={action}
                title={action}
                variant="secondary"
                onPress={() => onActionPress?.(action)}
              />
            ))}
          </View>
        </View>

        {footer}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
    gap: 16,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  list: {
    marginTop: 14,
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 6,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  actionGrid: {
    marginTop: 14,
    gap: 12,
  },
});

export default PlaceholderScreen;
