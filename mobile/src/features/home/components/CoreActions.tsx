import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { ActionCard } from './ActionCard';
import { CoreActionConfig } from '../types/home.types';

export interface CoreActionsProps {
  actions: CoreActionConfig[];
  onActionPress: (action: CoreActionConfig) => void;
}

export const CoreActions: React.FC<CoreActionsProps> = ({
  actions,
  onActionPress,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <AppText variant="footnote" weight="600" color="secondary" style={styles.sectionTitle}>
          CORE PATHWAYS
        </AppText>
        <AppText variant="caption2" color="tertiary" weight="500">
          SELECT AN ACTION
        </AppText>
      </View>

      {/* 2x2 Balanced Action Grid */}
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          {actions.slice(0, 2).map((action) => (
            <View key={action.id} style={styles.gridItem}>
              <ActionCard action={action} onPress={onActionPress} />
            </View>
          ))}
        </View>
        <View style={styles.gridRow}>
          {actions.slice(2, 4).map((action) => (
            <View key={action.id} style={styles.gridItem}>
              <ActionCard action={action} onPress={onActionPress} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    letterSpacing: 0.8,
  },
  grid: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
});
