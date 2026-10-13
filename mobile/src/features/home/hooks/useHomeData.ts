import { useState, useCallback, useMemo } from 'react';
import { useAppTheme } from '../../../design-system/theme/theme';
import { ColorPalette } from '../../../design-system/tokens/colors';
import {
  CoreActionConfig,
  RecentDeviceItem,
  CommunityHubItem,
  CircularStatItem,
} from '../types/home.types';

/**
 * Returns the four foundational circular pathways conforming to Apple HIG design specs.
 * Exported as a pure function for both the hook and direct test verification.
 */
export const getCoreActions = (colors: ColorPalette): CoreActionConfig[] => [
  {
    id: 'repair',
    title: 'Repair',
    tagline: 'Diagnostics & Fixes',
    description: 'Find certified specialists to repair your devices.',
    icon: 'construct',
    tintColor: colors.actionRepair.tint,
    bgColor: colors.actionRepair.background,
    badgeTextColor: colors.actionRepair.badgeText,
    statsLabel: 'Specialists Active',
  },
  {
    id: 'recycle',
    title: 'Recycle',
    tagline: 'Responsible E-Waste',
    description: 'Give damaged or end-of-life gear a clean recovery.',
    icon: 'sync',
    tintColor: colors.actionRecycle.tint,
    bgColor: colors.actionRecycle.background,
    badgeTextColor: colors.actionRecycle.badgeText,
    statsLabel: 'Zero Landfill Guarantee',
  },
  {
    id: 'sell',
    title: 'Sell',
    tagline: 'Direct Listing',
    description: 'Pass working devices directly to verified buyers.',
    icon: 'pricetag',
    tintColor: colors.actionSell.tint,
    bgColor: colors.actionSell.background,
    badgeTextColor: colors.actionSell.badgeText,
    statsLabel: 'Verified Peer Match',
  },
  {
    id: 'buy',
    title: 'Buy',
    tagline: 'Pre-owned & Inspected',
    description: 'Discover tested second-life phones, laptops & gear.',
    icon: 'bag-check',
    tintColor: colors.actionBuy.tint,
    bgColor: colors.actionBuy.background,
    badgeTextColor: colors.actionBuy.badgeText,
    statsLabel: '30-Day Function Guarantee',
  },
];

// Pilot region demonstration listings with explicit pilot indicator
const PILOT_DEVICES: RecentDeviceItem[] = [
  {
    id: 'dev-1',
    title: 'iPhone 13 Pro 128GB',
    category: 'smartphone',
    action: 'sell',
    actionLabel: 'Pilot Listing • For Resale',
    condition: 'good',
    conditionLabel: 'Good (88% Battery)',
    price: 430,
    distanceKm: 2.4,
    city: 'Vancouver',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
    co2SavedKg: 68,
  },
  {
    id: 'dev-2',
    title: 'MacBook Air M1 256GB',
    category: 'laptop',
    action: 'repair',
    actionLabel: 'Pilot Request • Battery Service',
    condition: 'fair',
    conditionLabel: 'Cosmetically Clean',
    isFree: false,
    distanceKm: 4.1,
    city: 'Burnaby',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    co2SavedKg: 195,
  },
  {
    id: 'dev-3',
    title: 'Sony WH-1000XM4',
    category: 'audio',
    action: 'buy',
    actionLabel: 'Refurbished Studio Sound',
    condition: 'like_new',
    conditionLabel: 'New Ear Pads Installed',
    price: 185,
    distanceKm: 1.8,
    city: 'Vancouver',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    co2SavedKg: 24,
  },
  {
    id: 'dev-4',
    title: 'iPad 9th Gen 64GB',
    category: 'tablet',
    action: 'recycle',
    actionLabel: 'Pilot Dropoff • Material Recovery',
    condition: 'for_parts',
    conditionLabel: 'Cracked Digitizer',
    isFree: true,
    distanceKm: 3.5,
    city: 'Richmond',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    co2SavedKg: 42,
  },
];

const PILOT_HUBS: CommunityHubItem[] = [
  {
    id: 'hub-1',
    name: 'Main Street Circular Tech Depot',
    type: 'Drop-off Depot',
    distance: '1.2 km away',
    address: '2490 Main St, Vancouver',
    verified: true,
    rating: 4.9,
  },
  {
    id: 'hub-2',
    name: 'Pacific Electronics Repair Collective',
    type: 'Repair Cafe',
    distance: '2.8 km away',
    address: '812 Broadway W, Vancouver',
    verified: true,
    rating: 4.8,
  },
  {
    id: 'hub-3',
    name: 'EcoCycle Micro-Electronics Facility',
    type: 'Refurbisher',
    distance: '4.5 km away',
    address: '105 Boundary Rd, Burnaby',
    verified: true,
    rating: 5.0,
  },
];

const PLATFORM_CIRCULAR_BENCHMARKS: CircularStatItem[] = [
  {
    id: 'stat-1',
    label: 'Diverted',
    value: '4,850 kg',
    icon: 'leaf-outline',
    detail: 'Target toxic e-waste kept from landfills',
  },
  {
    id: 'stat-2',
    label: 'Circulated',
    value: '1,420 units',
    icon: 'sync-outline',
    detail: 'Target second-life electronics in circulation',
  },
  {
    id: 'stat-3',
    label: 'CO₂ Offset',
    value: '38.4 tonnes',
    icon: 'cloud-outline',
    detail: 'Target emissions avoided through hardware reuse',
  },
];

export const useHomeData = () => {
  const theme = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('Metro Vancouver');

  const coreActions = useMemo<CoreActionConfig[]>(() => {
    return getCoreActions(theme.colors);
  }, [theme.colors]);

  const isPilotRegion = selectedRegion === 'Metro Vancouver' || selectedRegion === 'All Circular Regions';

  // Devices finding their next life - empty in non-pilot regions to test thoughtful empty states
  const recentDevices: RecentDeviceItem[] = useMemo(() => {
    return isPilotRegion ? PILOT_DEVICES : [];
  }, [isPilotRegion]);

  // Community Activity & Verified Hubs - empty in non-pilot regions
  const communityHubs: CommunityHubItem[] = useMemo(() => {
    return isPilotRegion ? PILOT_HUBS : [];
  }, [isPilotRegion]);

  const circularStats: CircularStatItem[] = useMemo(() => {
    return PLATFORM_CIRCULAR_BENCHMARKS;
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  return {
    coreActions,
    recentDevices,
    communityHubs,
    circularStats,
    refreshing,
    onRefresh,
    selectedRegion,
    setSelectedRegion,
  };
};
