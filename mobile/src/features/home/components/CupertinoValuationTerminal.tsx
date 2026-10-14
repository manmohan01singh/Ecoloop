import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon, IconName } from '../../../components/ui/AppIcon';

export type TerminalCategory = 'smartphones' | 'laptops' | 'displays' | 'appliances' | 'wearables';
export type TerminalCondition = 'pristine' | 'minor_wear' | 'cracked' | 'dead';

interface CategoryOption {
  id: TerminalCategory;
  label: string;
  icon: IconName;
  defaultModel: string;
}

interface ConditionOption {
  id: TerminalCondition;
  label: string;
  badge: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'smartphones', label: 'Phones', icon: 'phone-portrait-outline', defaultModel: 'iPhone / Galaxy' },
  { id: 'laptops', label: 'Laptops', icon: 'laptop-outline', defaultModel: 'MacBook / ThinkPad' },
  { id: 'displays', label: 'Displays', icon: 'tv-outline', defaultModel: '4K Monitors / TVs' },
  { id: 'appliances', label: 'Appliances', icon: 'hardware-chip-outline', defaultModel: 'Smart Home & Audio' },
  { id: 'wearables', label: 'Wearables', icon: 'watch-outline', defaultModel: 'Apple Watch / Buds' },
];

const CONDITIONS: ConditionOption[] = [
  { id: 'pristine', label: 'Pristine', badge: 'Grade A' },
  { id: 'minor_wear', label: 'Good', badge: 'Grade B' },
  { id: 'cracked', label: 'Cracked', badge: 'Needs Screen' },
  { id: 'dead', label: 'No Power', badge: 'Parts Only' },
];

interface ValuationMetric {
  estResaleMin: number;
  estResaleMax: number;
  repairCost: number;
  co2SavedKg: number;
  mineralSavedG: number;
  recommendedPathway: string;
  recommendationReason: string;
}

const VALUATION_MATRIX: Record<TerminalCategory, Record<TerminalCondition, ValuationMetric>> = {
  smartphones: {
    pristine: {
      estResaleMin: 22000,
      estResaleMax: 35000,
      repairCost: 0,
      co2SavedKg: 38.5,
      mineralSavedG: 14.2,
      recommendedPathway: 'Resell As-Is',
      recommendationReason: 'Maximum net return; eligible for instant doorstep buyout.',
    },
    minor_wear: {
      estResaleMin: 16000,
      estResaleMax: 24000,
      repairCost: 1200,
      co2SavedKg: 35.0,
      mineralSavedG: 12.8,
      recommendedPathway: 'Certified Resale',
      recommendationReason: 'Light cosmetic refresh yields ~25% higher resale price.',
    },
    cracked: {
      estResaleMin: 7000,
      estResaleMax: 12000,
      repairCost: 3200,
      co2SavedKg: 42.0,
      mineralSavedG: 15.0,
      recommendedPathway: 'Repair & Keep',
      recommendationReason: 'Screen replacement saves 80% vs buying replacement device.',
    },
    dead: {
      estResaleMin: 2500,
      estResaleMax: 4500,
      repairCost: 5500,
      co2SavedKg: 28.0,
      mineralSavedG: 18.5,
      recommendedPathway: 'Harvest Parts / Recycle',
      recommendationReason: 'Board recovery + zero-landfill mineral extraction.',
    },
  },
  laptops: {
    pristine: {
      estResaleMin: 45000,
      estResaleMax: 78000,
      repairCost: 0,
      co2SavedKg: 125.0,
      mineralSavedG: 45.0,
      recommendedPathway: 'Resell As-Is',
      recommendationReason: 'High residual value; verified buyers compete with top offers.',
    },
    minor_wear: {
      estResaleMin: 32000,
      estResaleMax: 54000,
      repairCost: 2500,
      co2SavedKg: 110.0,
      mineralSavedG: 40.0,
      recommendedPathway: 'Refurbish & Resell',
      recommendationReason: 'Thermal repaste + battery calibration optimizes margin.',
    },
    cracked: {
      estResaleMin: 18000,
      estResaleMax: 28000,
      repairCost: 8500,
      co2SavedKg: 135.0,
      mineralSavedG: 48.0,
      recommendedPathway: 'Repair & Keep',
      recommendationReason: 'Panel replacement extends laptop life by 3+ years.',
    },
    dead: {
      estResaleMin: 6000,
      estResaleMax: 11000,
      repairCost: 14000,
      co2SavedKg: 95.0,
      mineralSavedG: 55.0,
      recommendedPathway: 'Parts Recovery',
      recommendationReason: 'SSD, RAM, keyboard, and aluminum chassis salvaged.',
    },
  },
  displays: {
    pristine: {
      estResaleMin: 12000,
      estResaleMax: 22000,
      repairCost: 0,
      co2SavedKg: 65.0,
      mineralSavedG: 22.0,
      recommendedPathway: 'Resell As-Is',
      recommendationReason: 'Monitors retain high value for dual-screen workspaces.',
    },
    minor_wear: {
      estResaleMin: 8000,
      estResaleMax: 15000,
      repairCost: 800,
      co2SavedKg: 58.0,
      mineralSavedG: 19.0,
      recommendedPathway: 'Resell As-Is',
      recommendationReason: 'Ready for plug-and-play desktop setup.',
    },
    cracked: {
      estResaleMin: 800,
      estResaleMax: 2000,
      repairCost: 9500,
      co2SavedKg: 70.0,
      mineralSavedG: 26.0,
      recommendedPathway: 'Authorized Recycle',
      recommendationReason: 'Panel replacement costs exceed value; recycle glass & power board.',
    },
    dead: {
      estResaleMin: 500,
      estResaleMax: 1500,
      repairCost: 1800,
      co2SavedKg: 50.0,
      mineralSavedG: 28.0,
      recommendedPathway: 'Board Repair or Recycle',
      recommendationReason: 'Capacitor replacement often fixes no-power displays.',
    },
  },
  appliances: {
    pristine: {
      estResaleMin: 8500,
      estResaleMax: 18000,
      repairCost: 0,
      co2SavedKg: 85.0,
      mineralSavedG: 32.0,
      recommendedPathway: 'Resell As-Is',
      recommendationReason: 'Active local demand for pre-owned appliances.',
    },
    minor_wear: {
      estResaleMin: 5000,
      estResaleMax: 11000,
      repairCost: 900,
      co2SavedKg: 75.0,
      mineralSavedG: 28.0,
      recommendedPathway: 'Certified Resale',
      recommendationReason: 'Serviced units sell swiftly with 30-day guarantee.',
    },
    cracked: {
      estResaleMin: 2000,
      estResaleMax: 4500,
      repairCost: 2200,
      co2SavedKg: 80.0,
      mineralSavedG: 30.0,
      recommendedPathway: 'Repair & Keep',
      recommendationReason: 'Component fix prevents bulky e-waste disposal.',
    },
    dead: {
      estResaleMin: 600,
      estResaleMax: 1800,
      repairCost: 3800,
      co2SavedKg: 60.0,
      mineralSavedG: 38.0,
      recommendedPathway: 'Authorized Recycle',
      recommendationReason: 'High copper and metal yield at certified recycling depots.',
    },
  },
  wearables: {
    pristine: {
      estResaleMin: 11000,
      estResaleMax: 19500,
      repairCost: 0,
      co2SavedKg: 18.0,
      mineralSavedG: 6.5,
      recommendedPathway: 'Resell As-Is',
      recommendationReason: 'High demand for verified battery health smartwatches.',
    },
    minor_wear: {
      estResaleMin: 7500,
      estResaleMax: 13000,
      repairCost: 800,
      co2SavedKg: 16.0,
      mineralSavedG: 5.8,
      recommendedPathway: 'Resell As-Is',
      recommendationReason: 'Buffing & new band maximizes sale price.',
    },
    cracked: {
      estResaleMin: 2200,
      estResaleMax: 4500,
      repairCost: 3500,
      co2SavedKg: 19.5,
      mineralSavedG: 7.0,
      recommendedPathway: 'Repair or Trade-in',
      recommendationReason: 'OLED swap viable for higher-end stainless/cellular models.',
    },
    dead: {
      estResaleMin: 800,
      estResaleMax: 1800,
      repairCost: 2900,
      co2SavedKg: 14.0,
      mineralSavedG: 8.5,
      recommendedPathway: 'Authorized Recycle',
      recommendationReason: 'Safe lithium pouch extraction and rare-earth magnet recovery.',
    },
  },
};

export interface CupertinoValuationTerminalProps {
  onAssessDevice?: (category: TerminalCategory, condition: TerminalCondition) => void;
}

export const CupertinoValuationTerminal: React.FC<CupertinoValuationTerminalProps> = ({
  onAssessDevice,
}) => {
  const theme = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState<TerminalCategory>('smartphones');
  const [selectedCondition, setSelectedCondition] = useState<TerminalCondition>('pristine');

  const currentMetrics = useMemo(() => {
    return VALUATION_MATRIX[selectedCategory][selectedCondition];
  }, [selectedCategory, selectedCondition]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <AppIcon name="analytics-outline" size={16} color={theme.colors.tint} style={{ marginRight: 6 }} />
          <AppText variant="footnote" weight="700" color="secondary" style={styles.sectionTitle}>
            DEVICE VALUATION TERMINAL
          </AppText>
        </View>
        <View
          style={[
            styles.liveIndicator,
            { backgroundColor: theme.isDark ? 'rgba(52, 199, 89, 0.2)' : 'rgba(52, 199, 89, 0.12)' },
          ]}
        >
          <View style={[styles.pulseDot, { backgroundColor: theme.colors.success }]} />
          <AppText variant="caption2" weight="700" customColor={theme.colors.success}>
            LIVE QUOTES
          </AppText>
        </View>
      </View>

      {/* Main Terminal Card */}
      <View
        style={[
          styles.terminalCard,
          {
            backgroundColor: theme.colors.secondaryBackground,
            borderColor: theme.colors.separator,
            borderWidth: theme.hairlineWidth,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: theme.isDark ? 0.3 : 0.05,
            shadowRadius: 12,
            elevation: 3,
          },
        ]}
      >
        {/* Category Horizontal Segmented Control */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.tint
                      : theme.colors.fillSecondary,
                  },
                ]}
              >
                <AppIcon
                  name={cat.icon}
                  size={14}
                  color={isSelected ? '#FFFFFF' : theme.colors.labelSecondary}
                  style={{ marginRight: 5 }}
                />
                <AppText
                  variant="caption1"
                  weight={isSelected ? '700' : '500'}
                  customColor={isSelected ? '#FFFFFF' : theme.colors.labelSecondary}
                >
                  {cat.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Condition Segmented Bar */}
        <View style={[styles.conditionBar, { backgroundColor: theme.colors.fillSecondary }]}>
          {CONDITIONS.map((cond) => {
            const isSelected = selectedCondition === cond.id;
            return (
              <TouchableOpacity
                key={cond.id}
                onPress={() => setSelectedCondition(cond.id)}
                activeOpacity={0.7}
                style={[
                  styles.conditionSegment,
                  isSelected && [
                    styles.conditionSegmentActive,
                    {
                      backgroundColor: theme.colors.card,
                      shadowColor: '#000',
                      shadowOpacity: theme.isDark ? 0.35 : 0.08,
                    },
                  ],
                ]}
              >
                <AppText
                  variant="caption2"
                  weight={isSelected ? '700' : '500'}
                  color={isSelected ? 'primary' : 'secondary'}
                  numberOfLines={1}
                >
                  {cond.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dynamic Valuation Display Grid */}
        <View style={styles.valuationGrid}>
          {/* Estimated Value Card */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(0, 122, 94, 0.04)',
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
              },
            ]}
          >
            <View style={styles.metricHeader}>
              <AppText variant="caption2" weight="600" color="secondary">
                ESTIMATED CASHOUT
              </AppText>
              <AppIcon name="cash-outline" size={14} color={theme.colors.tint} />
            </View>
            <AppText variant="title3" weight="800" customColor={theme.colors.tint} style={styles.metricValue}>
              ₹{currentMetrics.estResaleMin.toLocaleString()} – ₹{currentMetrics.estResaleMax.toLocaleString()}
            </AppText>
            <AppText variant="caption2" color="tertiary">
              Doorstep pickup • Instant payout
            </AppText>
          </View>

          {/* Environmental Offset Card */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(52, 199, 89, 0.05)',
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
              },
            ]}
          >
            <View style={styles.metricHeader}>
              <AppText variant="caption2" weight="600" color="secondary">
                CIRCULAR DIVERSION
              </AppText>
              <AppIcon name="leaf-outline" size={14} color={theme.colors.success} />
            </View>
            <AppText variant="title3" weight="800" customColor={theme.colors.success} style={styles.metricValue}>
              {currentMetrics.co2SavedKg} kg CO₂e
            </AppText>
            <AppText variant="caption2" color="tertiary">
              +{currentMetrics.mineralSavedG}g critical minerals saved
            </AppText>
          </View>
        </View>

        {/* Recommendation Pill */}
        <View
          style={[
            styles.recommendationBanner,
            {
              backgroundColor: theme.isDark
                ? 'rgba(0, 122, 255, 0.12)'
                : 'rgba(0, 122, 255, 0.06)',
              borderColor: theme.isDark ? 'rgba(0, 122, 255, 0.3)' : 'rgba(0, 122, 255, 0.18)',
              borderWidth: theme.hairlineWidth,
            },
          ]}
        >
          <View style={styles.recommendationIconBox}>
            <AppIcon name="git-branch-outline" size={16} color={theme.colors.info} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <AppText variant="caption2" weight="700" customColor={theme.colors.info} style={{ marginRight: 6 }}>
                ENGINE RECOMMENDATION:
              </AppText>
              <AppText variant="caption2" weight="800" color="primary">
                {currentMetrics.recommendedPathway}
              </AppText>
            </View>
            <AppText variant="caption2" color="secondary" numberOfLines={2}>
              {currentMetrics.recommendationReason}
            </AppText>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={() => onAssessDevice?.(selectedCategory, selectedCondition)}
          activeOpacity={0.82}
          style={[
            styles.assessButton,
            {
              backgroundColor: theme.colors.tint,
              shadowColor: theme.colors.tint,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 2,
            },
          ]}
        >
          <AppIcon name="scan-outline" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <AppText variant="subheadline" weight="700" customColor="#FFFFFF">
            Launch Rescue Assessment
          </AppText>
          <AppIcon name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    letterSpacing: 0.6,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  terminalCard: {
    borderRadius: 20,
    padding: 16,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  conditionBar: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  conditionSegment: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  conditionSegmentActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  valuationGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 3,
  },
  recommendationBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  recommendationIconBox: {
    marginRight: 8,
    marginTop: 2,
  },
  assessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
});
