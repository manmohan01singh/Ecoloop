import React, { useState } from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { AppSeparator } from '../../../components/ui/AppSeparator';
import { AppTextInput } from '../../../components/ui/AppTextInput';
import {
  evaluateCircularRoutes,
  DecisionInput,
  DecisionResult,
  CircularRouteKey,
  DevicePowerState,
  ScreenCondition,
  BatteryCondition,
  CircularPriority,
} from '../services/decisionEngine';

export interface CircularDecisionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectRoute: (
    route: CircularRouteKey,
    deviceInfo: { brand: string; model: string; category: string }
  ) => void;
}

const CATEGORIES = [
  { id: 'smartphone', label: 'Phone', icon: 'phone-portrait-outline' },
  { id: 'laptop', label: 'Laptop', icon: 'laptop-outline' },
  { id: 'tablet', label: 'Tablet', icon: 'tablet-portrait-outline' },
  { id: 'audio', label: 'Audio', icon: 'headset-outline' },
  { id: 'gaming', label: 'Gaming', icon: 'game-controller-outline' },
  { id: 'other', label: 'Other', icon: 'hardware-chip-outline' },
];

export const CircularDecisionModal: React.FC<CircularDecisionModalProps> = ({
  visible,
  onClose,
  onSelectRoute,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [category, setCategory] = useState('smartphone');
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('iPhone 13');
  const [ageYears, setAgeYears] = useState(2);
  const [powerState, setPowerState] = useState<DevicePowerState>('powers_on');
  const [screenCondition, setScreenCondition] = useState<ScreenCondition>('cracked');
  const [batteryCondition, setBatteryCondition] = useState<BatteryCondition>('normal');
  const [priority, setPriority] = useState<CircularPriority>('max_value');

  // Evaluation output
  const [result, setResult] = useState<DecisionResult | null>(null);

  const handleRunEvaluation = () => {
    const input: DecisionInput = {
      deviceCategory: category,
      brand,
      model,
      ageYears,
      powerState,
      screenCondition,
      batteryCondition,
      userPriority: priority,
    };
    const evalResult = evaluateCircularRoutes(input);
    setResult(evalResult);
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header Bar */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: theme.colors.separator,
              borderBottomWidth: theme.hairlineWidth,
              backgroundColor: theme.colors.secondaryBackground,
            },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <AppIcon name="close" size={22} color={theme.colors.labelSecondary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <AppText variant="headline" weight="700">
              Circular Decision Engine
            </AppText>
            <AppText variant="caption2" color="secondary">
              Step {step} of 4 • Smart Route Analysis
            </AppText>
          </View>
          {step > 1 ? (
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
              <AppText variant="subheadline" customColor={theme.colors.tint}>
                Reset
              </AppText>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}>
          {/* STEP 1: DEVICE IDENTIFICATION */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.stepIntro}>
                <AppText variant="title2" weight="700">
                  What device do you have?
                </AppText>
                <AppText variant="subheadline" color="secondary" style={{ marginTop: 4 }}>
                  Select category and tell us the brand and model to begin.
                </AppText>
              </View>

              {/* Category pills */}
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((c) => {
                  const isSel = category === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => setCategory(c.id)}
                      style={[
                        styles.catPill,
                        {
                          backgroundColor: isSel
                            ? theme.isDark
                              ? 'rgba(16, 185, 129, 0.20)'
                              : 'rgba(0, 122, 94, 0.12)'
                            : theme.colors.secondaryBackground,
                          borderColor: isSel ? theme.colors.tint : theme.colors.separator,
                          borderWidth: isSel ? 1.5 : theme.hairlineWidth,
                        },
                      ]}
                    >
                      <AppIcon name={c.icon as any} size={20} color={isSel ? theme.colors.tint : theme.colors.labelPrimary} />
                      <AppText variant="subheadline" weight={isSel ? '700' : '500'} style={{ marginTop: 6 }}>
                        {c.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ marginTop: 18 }}>
                <AppTextInput label="Device Brand" value={brand} onChangeText={setBrand} placeholder="e.g. Apple, Dell, Samsung" />
                <View style={{ height: 12 }} />
                <AppTextInput label="Device Model" value={model} onChangeText={setModel} placeholder="e.g. iPhone 13 Pro, XPS 15" />
              </View>

              <View style={styles.ageSelector}>
                <AppText variant="subheadline" weight="600" color="secondary">
                  Approximate Age: {ageYears} {ageYears === 1 ? 'year' : 'years'}
                </AppText>
                <View style={styles.ageBtnRow}>
                  {[1, 2, 3, 4, 5].map((y) => (
                    <TouchableOpacity
                      key={y}
                      onPress={() => setAgeYears(y)}
                      style={[
                        styles.ageBtn,
                        {
                          backgroundColor: ageYears === y ? theme.colors.tint : theme.colors.secondaryBackground,
                        },
                      ]}
                    >
                      <AppText variant="callout" weight="700" customColor={ageYears === y ? '#ffffff' : theme.colors.labelPrimary}>
                        {y}y
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <AppButton title="Next: Check Condition" onPress={() => setStep(2)} style={{ marginTop: 24 }} />
            </View>
          )}

          {/* STEP 2: CONDITION & DIAGNOSTICS */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.stepIntro}>
                <AppText variant="title2" weight="700">
                  Physical & Hardware State
                </AppText>
                <AppText variant="subheadline" color="secondary" style={{ marginTop: 4 }}>
                  Accurate diagnostic details ensure safe and realistic recommendations.
                </AppText>
              </View>

              {/* Power State */}
              <AppText variant="subheadline" weight="700" style={{ marginTop: 16 }}>
                Power & Boot Status
              </AppText>
              <View style={styles.pillRow}>
                {[
                  { id: 'powers_on', label: 'Powers On Normally' },
                  { id: 'intermittent', label: 'Restarts / Freezes' },
                  { id: 'dead', label: 'Completely Dead' },
                ].map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setPowerState(p.id as any)}
                    style={[
                      styles.choicePill,
                      {
                        backgroundColor: powerState === p.id ? theme.colors.fill : theme.colors.secondaryBackground,
                        borderColor: powerState === p.id ? theme.colors.tint : theme.colors.separator,
                        borderWidth: powerState === p.id ? 1.5 : theme.hairlineWidth,
                      },
                    ]}
                  >
                    <AppText variant="subheadline" weight={powerState === p.id ? '700' : '500'}>
                      {p.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Screen State */}
              <AppText variant="subheadline" weight="700" style={{ marginTop: 18 }}>
                Display & Glass Condition
              </AppText>
              <View style={styles.pillRow}>
                {[
                  { id: 'flawless', label: 'Flawless' },
                  { id: 'scratched', label: 'Scratched' },
                  { id: 'cracked', label: 'Cracked Glass' },
                  { id: 'unresponsive', label: 'Black / Touch Dead' },
                ].map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setScreenCondition(s.id as any)}
                    style={[
                      styles.choicePill,
                      {
                        backgroundColor: screenCondition === s.id ? theme.colors.fill : theme.colors.secondaryBackground,
                        borderColor: screenCondition === s.id ? theme.colors.tint : theme.colors.separator,
                        borderWidth: screenCondition === s.id ? 1.5 : theme.hairlineWidth,
                      },
                    ]}
                  >
                    <AppText variant="subheadline" weight={screenCondition === s.id ? '700' : '500'}>
                      {s.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Battery State */}
              <AppText variant="subheadline" weight="700" style={{ marginTop: 18 }}>
                Battery Health & Safety
              </AppText>
              <View style={styles.pillRow}>
                {[
                  { id: 'normal', label: 'Normal Health (>80%)' },
                  { id: 'degraded', label: 'Degraded / Drains Fast' },
                  { id: 'swollen', label: '⚠️ Swollen / Bloating' },
                ].map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    onPress={() => setBatteryCondition(b.id as any)}
                    style={[
                      styles.choicePill,
                      {
                        backgroundColor:
                          batteryCondition === b.id
                            ? b.id === 'swollen'
                              ? 'rgba(239, 68, 68, 0.20)'
                              : theme.colors.fill
                            : theme.colors.secondaryBackground,
                        borderColor:
                          batteryCondition === b.id
                            ? b.id === 'swollen'
                              ? '#ef4444'
                              : theme.colors.tint
                            : theme.colors.separator,
                        borderWidth: batteryCondition === b.id ? 1.5 : theme.hairlineWidth,
                      },
                    ]}
                  >
                    <AppText
                      variant="subheadline"
                      weight={batteryCondition === b.id ? '700' : '500'}
                      customColor={b.id === 'swollen' && batteryCondition === 'swollen' ? '#ef4444' : undefined}
                    >
                      {b.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              {batteryCondition === 'swollen' && (
                <View
                  style={[
                    styles.warningBox,
                    {
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      borderColor: '#ef4444',
                    },
                  ]}
                >
                  <AppIcon name="warning" size={20} color="#ef4444" />
                  <AppText variant="caption1" weight="600" customColor="#ef4444" style={{ marginLeft: 8, flex: 1 }}>
                    Hazard Warning: Swollen batteries pose a combustion risk. Normal shipping & resale will be disabled.
                  </AppText>
                </View>
              )}

              <View style={styles.btnRow}>
                <AppButton title="Back" variant="secondary" onPress={() => setStep(1)} style={{ flex: 1, marginRight: 8 }} />
                <AppButton title="Next: Priorities" onPress={() => setStep(3)} style={{ flex: 2 }} />
              </View>
            </View>
          )}

          {/* STEP 3: USER PRIORITIES */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.stepIntro}>
                <AppText variant="title2" weight="700">
                  What is your primary goal?
                </AppText>
                <AppText variant="subheadline" color="secondary" style={{ marginTop: 4 }}>
                  The engine weights financial return against speed and environmental impact.
                </AppText>
              </View>

              <View style={{ marginTop: 16 }}>
                {[
                  {
                    id: 'max_value',
                    title: 'Maximize Financial Return',
                    desc: 'Willing to invest in repair or wait for top buyer to get maximum dollars.',
                    icon: 'cash-outline',
                  },
                  {
                    id: 'fast_cash',
                    title: 'Quick Cash & Minimum Hassle',
                    desc: 'Sell or trade as-is immediately without dealing with repair time.',
                    icon: 'flash-outline',
                  },
                  {
                    id: 'extend_life',
                    title: 'Keep Device in Active Use',
                    desc: 'Prioritize repair and reuse over scrapping or replacing.',
                    icon: 'refresh-outline',
                  },
                  {
                    id: 'zero_waste',
                    title: 'Zero Waste & Certified Recycling',
                    desc: 'Guaranteed safe e-waste destruction with official material recovery receipt.',
                    icon: 'leaf-outline',
                  },
                ].map((opt) => {
                  const isSel = priority === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => setPriority(opt.id as any)}
                      style={[
                        styles.priorityCard,
                        {
                          backgroundColor: theme.colors.secondaryBackground,
                          borderColor: isSel ? theme.colors.tint : theme.colors.separator,
                          borderWidth: isSel ? 2 : theme.hairlineWidth,
                          ...theme.shadows.card,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.priorityIcon,
                          {
                            backgroundColor: isSel
                              ? theme.isDark
                                ? 'rgba(16, 185, 129, 0.20)'
                                : 'rgba(0, 122, 94, 0.12)'
                              : theme.colors.fill,
                          },
                        ]}
                      >
                        <AppIcon name={opt.icon as any} size={22} color={isSel ? theme.colors.tint : theme.colors.labelSecondary} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <AppText variant="headline" weight="700" color={isSel ? 'tint' : 'primary'}>
                          {opt.title}
                        </AppText>
                        <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
                          {opt.desc}
                        </AppText>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.btnRow}>
                <AppButton title="Back" variant="secondary" onPress={() => setStep(2)} style={{ flex: 1, marginRight: 8 }} />
                <AppButton title="Analyze Device" onPress={handleRunEvaluation} style={{ flex: 2 }} />
              </View>
            </View>
          )}

          {/* STEP 4: DECISION MATRIX & ACTION */}
          {step === 4 && result && (
            <View style={styles.stepContainer}>
              {result.isHazardous ? (
                <View
                  style={[
                    styles.hazardHero,
                    {
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      borderColor: '#ef4444',
                    },
                  ]}
                >
                  <AppIcon name="warning" size={32} color="#ef4444" />
                  <AppText variant="headline" weight="700" customColor="#ef4444" style={{ marginTop: 8 }}>
                    HAZARDOUS LITHIUM-ION BATTERY
                  </AppText>
                  <AppText variant="footnote" customColor="#ef4444" style={{ textAlign: 'center', marginTop: 4 }}>
                    {result.hazardNotice}
                  </AppText>
                </View>
              ) : (
                <View
                  style={[
                    styles.successHero,
                    {
                      backgroundColor: theme.colors.secondaryBackground,
                      borderColor: theme.colors.separator,
                      borderWidth: theme.hairlineWidth,
                      ...theme.shadows.card,
                    },
                  ]}
                >
                  <View style={styles.heroPill}>
                    <AppIcon name="sparkles" size={14} color={theme.colors.tint} />
                    <AppText variant="caption2" weight="700" customColor={theme.colors.tint} style={{ marginLeft: 4 }}>
                      TOP CIRCULAR MATCH • {result.confidenceScore}% CONFIDENCE
                    </AppText>
                  </View>

                  <AppText variant="title2" weight="700" style={{ marginTop: 8 }}>
                    {result.primaryRecommendation.title}
                  </AppText>
                  <AppText variant="subheadline" color="secondary" style={{ marginTop: 2 }}>
                    {result.primaryRecommendation.tagline}
                  </AppText>

                  {/* Metrics Badge Row */}
                  <View style={styles.metricsBadgeRow}>
                    <View style={styles.metricBadge}>
                      <AppText variant="headline" weight="700" customColor={theme.colors.tint}>
                        {result.primaryRecommendation.estimatedFinancialValue > 0
                          ? `~$${result.primaryRecommendation.estimatedFinancialValue}`
                          : 'Free'}
                      </AppText>
                      <AppText variant="caption2" color="secondary">
                        Est. Value
                      </AppText>
                    </View>

                    <View style={styles.metricBadge}>
                      <AppText variant="headline" weight="700" color="primary">
                        +{result.carbonDivertedKg} kg
                      </AppText>
                      <AppText variant="caption2" color="secondary">
                        CO₂ Diverted
                      </AppText>
                    </View>

                    <View style={styles.metricBadge}>
                      <AppText variant="headline" weight="700" color="primary">
                        {result.repairabilityScore}/10
                      </AppText>
                      <AppText variant="caption2" color="secondary">
                        Repair Score
                      </AppText>
                    </View>
                  </View>

                  <AppSeparator verticalMargin={12} />

                  <AppText variant="footnote" color="secondary" style={{ fontStyle: 'italic' }}>
                    "{result.primaryRecommendation.rationale}"
                  </AppText>

                  <AppButton
                    title="Proceed with This Route"
                    onPress={() => {
                      onClose();
                      onSelectRoute(result.primaryRecommendation.route, { brand, model, category });
                    }}
                    style={{ marginTop: 16 }}
                  />
                </View>
              )}

              {/* Alternative Pathways */}
              <AppText variant="headline" weight="700" style={{ marginTop: 24, marginBottom: 8 }}>
                All Available Pathways
              </AppText>

              {result.availableRoutes.map((route, idx) => {
                if (route.isRecommended) return null; // Already highlighted in hero

                return (
                  <View
                    key={route.route + idx}
                    style={[
                      styles.routeCard,
                      {
                        backgroundColor: theme.colors.secondaryBackground,
                        borderColor: theme.colors.separator,
                        borderWidth: theme.hairlineWidth,
                        opacity: route.isHazardBlocked ? 0.5 : 1,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AppText variant="subheadline" weight="700">
                          {route.title}
                        </AppText>
                        {route.isHazardBlocked && (
                          <View style={styles.blockedPill}>
                            <AppText variant="caption2" weight="700" customColor="#ef4444">
                              BLOCKED
                            </AppText>
                          </View>
                        )}
                      </View>
                      <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
                        {route.isHazardBlocked ? route.hazardReason : route.rationale}
                      </AppText>
                    </View>

                    {!route.isHazardBlocked && (
                      <TouchableOpacity
                        onPress={() => {
                          onClose();
                          onSelectRoute(route.route, { brand, model, category });
                        }}
                        style={[styles.selectRouteBtn, { backgroundColor: theme.colors.fill }]}
                      >
                        <AppText variant="caption1" weight="600" customColor={theme.colors.tint}>
                          Choose
                        </AppText>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    padding: 6,
  },
  resetBtn: {
    padding: 6,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  stepContainer: {
    flex: 1,
  },
  stepIntro: {
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  catPill: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  ageSelector: {
    marginTop: 20,
  },
  ageBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  ageBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  choicePill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  priorityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  priorityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successHero: {
    padding: 18,
    borderRadius: 18,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricsBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingVertical: 8,
  },
  metricBadge: {
    alignItems: 'center',
  },
  hazardHero: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  blockedPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.20)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  selectRouteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
});
