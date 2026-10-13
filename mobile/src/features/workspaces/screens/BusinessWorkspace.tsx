import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { AppSeparator } from '../../../components/ui/AppSeparator';
import { AppTextInput } from '../../../components/ui/AppTextInput';
import {
  getInventoryItems,
  addInventoryItem,
  importInventoryFromCsv,
  CsvImportResult,
} from '../../../services/database/workspaceRepositories';
import {
  InventoryItem,
  subscribeToDataChanges,
} from '../../../services/storage/localPersistence';
import { useAuth } from '../../../services/auth/AuthContext';
import { canManageInventory } from '../../../services/auth/permissionsService';

export interface BusinessWorkspaceProps {
  onReturnToConsumer: () => void;
  onOpenWorkspaceSwitcher: () => void;
}

const SAMPLE_CSV_TEMPLATE = `sku,title,deviceCategory,brand,model,conditionGrade,quantity,unitPrice,isWholesale,minimumOrderQty,warrantyDays,notes
IPH-14-128-BLU,iPhone 14 128GB Blue (Grade A),smartphone,Apple,iPhone 14,A,8,580,true,2,180,OEM screen & 100% battery
XPS-15-OLED,Dell XPS 15 9520 4K OLED 32GB,laptop,Dell,XPS 15 9520,A+,3,1350,false,1,365,Includes 130W USB-C charger
TAB-S8-128,Galaxy Tab S8 WiFi 128GB,tablet,Samsung,Galaxy Tab S8,B,5,340,true,2,90,Minor rear scratches; S-Pen included`;

export const BusinessWorkspace: React.FC<BusinessWorkspaceProps> = ({
  onReturnToConsumer,
  onOpenWorkspaceSwitcher,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'inventory' | 'csv' | 'wholesale'>('inventory');
  const [items, setItems] = useState<InventoryItem[]>(() => getInventoryItems());

  // Add Item Modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [sku, setSku] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('smartphone');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [grade, setGrade] = useState<'A+' | 'A' | 'B' | 'C' | 'For Parts'>('A');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('250');
  const [isWholesale, setIsWholesale] = useState(false);

  // CSV Importer State
  const [csvText, setCsvText] = useState(SAMPLE_CSV_TEMPLATE);

  if (!canManageInventory(profile)) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          },
        ]}
      >
        <AppIcon name="briefcase-outline" size={54} color={theme.colors.tint} />
        <AppText variant="title2" weight="700" style={{ marginTop: 16 }}>
          Business Workspace Access Required
        </AppText>
        <AppText
          variant="subheadline"
          color="secondary"
          style={{ textAlign: 'center', marginTop: 8, marginBottom: 24 }}
        >
          Please submit a Business Partner application or switch back to Consumer Hub.
        </AppText>
        <AppButton label="Return to Consumer Hub" variant="filled" onPress={onReturnToConsumer} />
      </SafeAreaView>
    );
  }
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);

  useEffect(() => {
    const unsub = subscribeToDataChanges((type) => {
      if (type === 'inventory') {
        setItems(getInventoryItems());
      }
    });
    return unsub;
  }, []);

  const totalUnits = items.reduce((acc, i) => acc + (i.quantity || 0), 0);
  const totalValuation = items.reduce((acc, i) => acc + (i.quantity || 0) * (i.unitPrice || 0), 0);
  const wholesaleLots = items.filter((i) => i.isWholesale);

  const handleAddItem = () => {
    if (!sku.trim() || !title.trim()) {
      Alert.alert('Required Fields', 'Please specify SKU and Item Title.');
      return;
    }

    const res = addInventoryItem(user?.id || 'biz-default', {
      sku: sku.trim(),
      title: title.trim(),
      deviceCategory: category,
      brand: brand.trim() || 'Generic',
      model: model.trim() || 'Standard',
      conditionGrade: grade,
      quantity: parseInt(quantity, 10) || 1,
      unitPrice: parseFloat(unitPrice) || 0,
      isWholesale,
      refurbishedInspected: true,
    });

    if (res.success) {
      setAddModalVisible(false);
      setSku('');
      setTitle('');
      Alert.alert('Item Added', 'Inventory SKU successfully registered.');
    } else {
      Alert.alert('Error', res.error || 'Failed to add item.');
    }
  };

  const handleRunCsvImport = () => {
    if (!csvText.trim()) {
      Alert.alert('Empty CSV', 'Please enter or paste valid CSV data.');
      return;
    }

    const result = importInventoryFromCsv(user?.id || 'biz-default', csvText);
    setImportResult(result);

    if (result.successful > 0) {
      Alert.alert(
        'CSV Import Finished',
        `Successfully imported ${result.successful} items into inventory. ${result.failed} rows failed validation.`
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* App Bar */}
      <View
        style={[
          styles.appBar,
          {
            backgroundColor: theme.colors.secondaryBackground,
            borderBottomColor: theme.colors.separator,
            borderBottomWidth: theme.hairlineWidth,
            paddingTop: Math.max(insets.top, 8),
          },
        ]}
      >
        <TouchableOpacity onPress={onOpenWorkspaceSwitcher} style={styles.workspacePill}>
          <View style={[styles.bizIcon, { backgroundColor: 'rgba(16, 185, 129, 0.20)' }]}>
            <AppIcon name="briefcase" size={16} color={theme.colors.tint} />
          </View>
          <View style={{ marginLeft: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText variant="caption1" weight="700">
                Business & Inventory
              </AppText>
              <AppIcon name="chevron-down" size={14} color={theme.colors.labelSecondary} style={{ marginLeft: 4 }} />
            </View>
            <AppText variant="caption2" color="secondary">
              EcoTech Electronics • Enterprise
            </AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onReturnToConsumer} style={[styles.exitBtn, { backgroundColor: theme.colors.fill }]}>
          <AppText variant="caption1" weight="600" customColor={theme.colors.tint}>
            Consumer Hub
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Metrics Banner */}
      <View style={[styles.metricsBanner, { backgroundColor: theme.colors.secondaryBackground }]}>
        <View style={styles.metricCol}>
          <AppText variant="headline" weight="700" customColor={theme.colors.tint}>
            {items.length}
          </AppText>
          <AppText variant="caption2" color="secondary">
            Unique SKUs
          </AppText>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: theme.colors.separator }]} />
        <View style={styles.metricCol}>
          <AppText variant="headline" weight="700" color="primary">
            {totalUnits}
          </AppText>
          <AppText variant="caption2" color="secondary">
            Units in Stock
          </AppText>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: theme.colors.separator }]} />
        <View style={styles.metricCol}>
          <AppText variant="headline" weight="700" color="primary">
            ${Math.round(totalValuation).toLocaleString()}
          </AppText>
          <AppText variant="caption2" color="secondary">
            Catalog Value
          </AppText>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'inventory', label: `Inventory (${items.length})` },
          { key: 'csv', label: 'CSV Bulk Import' },
          { key: 'wholesale', label: `Wholesale (${wholesaleLots.length})` },
        ].map((t) => {
          const isSel = activeTab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setActiveTab(t.key as any)}
              style={[
                styles.tabBtn,
                {
                  borderBottomColor: isSel ? theme.colors.tint : 'transparent',
                  borderBottomWidth: isSel ? 2.5 : 0,
                },
              ]}
            >
              <AppText variant="subheadline" weight={isSel ? '700' : '500'} color={isSel ? 'tint' : 'secondary'}>
                {t.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}>
        {/* TAB 1: INVENTORY LIST */}
        {activeTab === 'inventory' && (
          <View>
            <View style={styles.inventoryActionRow}>
              <AppText variant="headline" weight="700">
                Active Product Catalog
              </AppText>
              <AppButton title="+ Add SKU" size="small" onPress={() => setAddModalVisible(true)} />
            </View>

            {items.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: theme.colors.secondaryBackground,
                    borderColor: theme.colors.separator,
                    borderWidth: theme.hairlineWidth,
                    ...theme.shadows.card,
                  },
                ]}
              >
                <View style={styles.itemTopRow}>
                  <View style={[styles.skuPill, { backgroundColor: theme.colors.fill }]}>
                    <AppText variant="caption2" weight="700" customColor={theme.colors.tint}>
                      SKU: {item.sku}
                    </AppText>
                  </View>
                  <View style={[styles.gradePill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <AppText variant="caption2" weight="700" customColor={theme.colors.tint}>
                      GRADE {item.conditionGrade}
                    </AppText>
                  </View>
                </View>

                <AppText variant="headline" weight="700" style={{ marginTop: 6 }}>
                  {item.title}
                </AppText>

                <View style={styles.priceRow}>
                  <AppText variant="subheadline" weight="700" customColor={theme.colors.tint}>
                    ${item.unitPrice} CAD
                  </AppText>
                  <AppText variant="footnote" color="secondary" style={{ marginLeft: 8 }}>
                    Stock: {item.quantity} units {item.isWholesale ? '• Wholesale Available' : ''}
                  </AppText>
                </View>

                {item.refurbishedInspected && (
                  <View style={[styles.inspectBadge, { backgroundColor: theme.colors.fill }]}>
                    <AppIcon name="checkmark-circle" size={14} color={theme.colors.tint} />
                    <AppText variant="caption2" color="secondary" style={{ marginLeft: 4 }}>
                      30-Point Refurbishment Certified • {item.warrantyDays}d Warranty
                    </AppText>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* TAB 2: BULK CSV IMPORT */}
        {activeTab === 'csv' && (
          <View>
            <AppText variant="title3" weight="700">
              Bulk CSV Inventory Importer
            </AppText>
            <AppText variant="footnote" color="secondary" style={{ marginTop: 2 }}>
              Import dozens of refurbished SKUs simultaneously. Each row is validated against condition grades and mandatory attributes.
            </AppText>

            <View
              style={[
                styles.csvBox,
                {
                  backgroundColor: theme.colors.secondaryBackground,
                  borderColor: theme.colors.separator,
                  borderWidth: theme.hairlineWidth,
                },
              ]}
            >
              <TextInput
                style={[styles.csvInput, { color: theme.colors.labelPrimary }]}
                value={csvText}
                onChangeText={setCsvText}
                multiline
                numberOfLines={8}
                placeholder="Paste CSV rows here..."
                placeholderTextColor={theme.colors.labelTertiary}
              />
            </View>

            <View style={styles.csvBtnRow}>
              <AppButton
                title="Reset to Template"
                variant="secondary"
                size="small"
                onPress={() => setCsvText(SAMPLE_CSV_TEMPLATE)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton title="Validate & Import Rows" size="small" onPress={handleRunCsvImport} style={{ flex: 1.5 }} />
            </View>

            {/* Import Results Box */}
            {importResult && (
              <View
                style={[
                  styles.resultBox,
                  {
                    backgroundColor: theme.colors.secondaryBackground,
                    borderColor: theme.colors.separator,
                    borderWidth: theme.hairlineWidth,
                  },
                ]}
              >
                <AppText variant="headline" weight="700">
                  Import Validation Summary
                </AppText>
                <View style={styles.resultStatsRow}>
                  <AppText variant="footnote" customColor={theme.colors.tint}>
                    ✓ {importResult.successful} Successfully Imported
                  </AppText>
                  <AppText variant="footnote" customColor={importResult.failed > 0 ? '#ef4444' : theme.colors.labelSecondary}>
                    ✕ {importResult.failed} Errors
                  </AppText>
                </View>

                {importResult.errors.length > 0 && (
                  <View style={styles.errorList}>
                    {importResult.errors.map((err, idx) => (
                      <AppText key={idx} variant="caption2" customColor="#ef4444" style={{ marginTop: 2 }}>
                        Row {err.row}: {err.error}
                      </AppText>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* TAB 3: WHOLESALE LOTS */}
        {activeTab === 'wholesale' && (
          <View>
            <AppText variant="title3" weight="700">
              B2B Wholesale & Surplus Lots
            </AppText>
            <AppText variant="footnote" color="secondary" style={{ marginTop: 2 }}>
              Eligible lots open for commercial buyer bulk purchases and component harvesting.
            </AppText>

            <View style={{ marginTop: 12 }}>
              {wholesaleLots.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: theme.colors.secondaryBackground,
                      borderColor: theme.colors.separator,
                      borderWidth: theme.hairlineWidth,
                    },
                  ]}
                >
                  <AppText variant="headline" weight="700">
                    {item.title}
                  </AppText>
                  <AppText variant="footnote" color="secondary">
                    Wholesale Price: ${item.unitPrice} CAD • Min Order: {item.minimumOrderQty} units
                  </AppText>
                  <AppText variant="caption1" customColor={theme.colors.tint} style={{ marginTop: 4 }}>
                    Total Available: {item.quantity} units (${item.quantity * item.unitPrice} lot total)
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add SKU Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.secondaryBackground }]}>
            <AppText variant="title3" weight="700">
              New Inventory Item
            </AppText>

            <View style={{ marginTop: 12 }}>
              <AppTextInput label="SKU Identifier" value={sku} onChangeText={setSku} placeholder="e.g. MBP-16-M1-MAX" />
              <View style={{ height: 10 }} />
              <AppTextInput label="Title" value={title} onChangeText={setTitle} placeholder="e.g. MacBook Pro 16 M1 Max" />
              <View style={{ height: 10 }} />

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <AppTextInput label="Stock Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <AppTextInput label="Unit Price ($ CAD)" value={unitPrice} onChangeText={setUnitPrice} keyboardType="numeric" />
                </View>
              </View>

              <AppText variant="caption1" weight="600" color="secondary" style={{ marginTop: 12, marginBottom: 6 }}>
                Condition Grade
              </AppText>
              <View style={styles.gradeRow}>
                {(['A+', 'A', 'B', 'C', 'For Parts'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGrade(g)}
                    style={[
                      styles.gradeBtn,
                      {
                        backgroundColor: grade === g ? theme.colors.fill : theme.colors.background,
                        borderColor: grade === g ? theme.colors.tint : theme.colors.separator,
                        borderWidth: grade === g ? 1.5 : theme.hairlineWidth,
                      },
                    ]}
                  >
                    <AppText variant="caption2" weight={grade === g ? '700' : '500'}>
                      {g}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalBtnRow}>
              <AppButton
                title="Cancel"
                variant="secondary"
                onPress={() => setAddModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton title="Save Item" onPress={handleAddItem} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  workspacePill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bizIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metricsBanner: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricCol: {
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  inventoryActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skuPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gradePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  inspectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  csvBox: {
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  csvInput: {
    fontSize: 12,
    fontFamily: 'monospace',
    height: 140,
    textAlignVertical: 'top',
  },
  csvBtnRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  resultBox: {
    padding: 14,
    borderRadius: 14,
    marginTop: 16,
  },
  resultStatsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  errorList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    padding: 20,
    borderRadius: 18,
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  gradeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
});
