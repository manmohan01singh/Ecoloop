import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ExploreItem,
  ExploreFilters,
  ExploreCategory,
  ExploreAction,
  DeviceCondition,
  ExploreSort,
} from '../types/explore.types';
import { EXPLORE_DEV_FIXTURES } from '../fixtures/exploreFixtures';
import { FilterPillItem } from '../../../components/ui/AppFilterPills';
import {
  getStoredListings,
  subscribeToDataChanges,
  DeviceListingRecord,
} from '../../../services/storage/localPersistence';

export const INITIAL_FILTERS: ExploreFilters = {
  query: '',
  category: 'all',
  action: 'all',
  condition: 'all',
  sort: 'nearest',
  onlyFree: false,
};

export function listingRecordToExploreItem(record: DeviceListingRecord): ExploreItem {
  return {
    id: record.id,
    title: record.title,
    category: record.deviceCategory as ExploreCategory,
    categoryLabel: record.deviceCategory.toUpperCase(),
    action: record.pathway,
    actionLabel:
      record.pathway === 'sell'
        ? 'For Resale'
        : record.pathway === 'repair'
        ? 'Repair Request'
        : 'Recycle Recovery',
    condition: record.condition as any,
    conditionLabel:
      record.condition === 'like_new'
        ? 'Like New'
        : record.condition === 'good'
        ? 'Good'
        : record.condition === 'fair'
        ? 'Fair'
        : 'For Parts / Recovery',
    price: record.price,
    isFree: record.isFree,
    originalPrice: record.originalPrice,
    city: record.city,
    distanceKm: 0.5,
    imageUrl:
      record.photos[0] ||
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
    additionalImages: record.photos.slice(1),
    co2SavedKg: record.co2SavedKg,
    warrantyDays: record.warrantyDays,
    description: record.description,
    specs: {
      Brand: record.brand,
      Model: record.model,
      Condition: record.condition,
    },
    sellerName: 'Community Member',
    sellerRating: 5.0,
    pickupType: record.pickupType,
    createdAt: record.createdAt,
    isDevFixture: false,
  };
}

// In-memory registry for items posted during the active app session
const sessionPostedItems: ExploreItem[] = [];
type SessionListener = () => void;
const sessionListeners = new Set<SessionListener>();

export const registerSessionPostedItem = (item: ExploreItem) => {
  sessionPostedItems.unshift(item);
  sessionListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // Ignore listener error
    }
  });
};

export const subscribeToSessionItems = (listener: SessionListener) => {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
};

export const getSessionPostedItems = (): ExploreItem[] => sessionPostedItems;

export const useExploreData = (initialCategory: ExploreCategory = 'all') => {
  const [filters, setFilters] = useState<ExploreFilters>({
    ...INITIAL_FILTERS,
    category: initialCategory,
  });
  const [sessionVersion, setSessionVersion] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExploreItem | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Subscribe to newly posted items and durable persistence updates
  React.useEffect(() => {
    const unsubscribeSession = subscribeToSessionItems(() => {
      setSessionVersion((v) => v + 1);
    });
    const unsubscribeData = subscribeToDataChanges((type) => {
      if (type === 'listings') {
        setSessionVersion((v) => v + 1);
      }
    });
    return () => {
      unsubscribeSession();
      unsubscribeData();
    };
  }, []);

  // Combine persisted durable listings, session-posted items, and development fixtures
  const allAvailableItems = useMemo<ExploreItem[]>(() => {
    const stored = getStoredListings().map(listingRecordToExploreItem);
    const itemMap = new Map<string, ExploreItem>();

    // 1. Persisted storage listings (survives app reloads)
    stored.forEach((item) => itemMap.set(item.id, item));

    // 2. Session posted items (optimistic active cache)
    sessionPostedItems.forEach((item) => itemMap.set(item.id, item));

    // 3. Baseline development fixtures
    EXPLORE_DEV_FIXTURES.forEach((item) => {
      if (!itemMap.has(item.id)) {
        itemMap.set(item.id, item);
      }
    });

    return Array.from(itemMap.values());
  }, [refreshing, sessionVersion]);

  // Dynamic category pill items with live item counts
  const categoryPills = useMemo<FilterPillItem[]>(() => {
    const rawCategories: { id: ExploreCategory; label: string; icon: any }[] = [
      { id: 'all', label: 'All Items', icon: 'grid-outline' },
      { id: 'smartphone', label: 'Phones', icon: 'phone-portrait-outline' },
      { id: 'laptop', label: 'Laptops', icon: 'laptop-outline' },
      { id: 'tablet', label: 'Tablets', icon: 'tablet-portrait-outline' },
      { id: 'audio', label: 'Audio', icon: 'headset-outline' },
      { id: 'gaming', label: 'Gaming', icon: 'game-controller-outline' },
      { id: 'parts', label: 'Parts', icon: 'hardware-chip-outline' },
      { id: 'wearable', label: 'Wearables', icon: 'watch-outline' },
    ];

    return rawCategories.map((cat) => {
      const count =
        cat.id === 'all'
          ? allAvailableItems.length
          : allAvailableItems.filter((i) => i.category === cat.id).length;
      return {
        id: cat.id,
        label: cat.label,
        icon: cat.icon,
        count,
      };
    });
  }, [allAvailableItems]);

  // Filtered & Sorted items
  const filteredItems = useMemo<ExploreItem[]>(() => {
    return allAvailableItems
      .filter((item) => {
        // Search query filter
        if (filters.query.trim()) {
          const q = filters.query.toLowerCase().trim();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchCat = item.categoryLabel.toLowerCase().includes(q);
          const matchCity = item.city.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat && !matchCity) {
            return false;
          }
        }

        // Category filter
        if (filters.category !== 'all' && item.category !== filters.category) {
          return false;
        }

        // Action pathway filter
        if (filters.action !== 'all') {
          if (filters.action === 'buy' || filters.action === 'sell') {
            if (item.action !== 'sell' && item.action !== 'buy') return false;
          } else if (item.action !== filters.action) {
            return false;
          }
        }

        // Condition filter
        if (filters.condition !== 'all' && item.condition !== filters.condition) {
          return false;
        }

        // Only free filter
        if (filters.onlyFree && !item.isFree && item.price > 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sort) {
          case 'nearest':
            return a.distanceKm - b.distanceKm;
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'co2':
            return b.co2SavedKg - a.co2SavedKg;
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });
  }, [allAvailableItems, filters]);

  // Environmental impact total for visible items
  const totalCo2SavedInView = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + (curr.co2SavedKg || 0), 0);
  }, [filteredItems]);

  const setQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, query }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category: category as ExploreCategory }));
  }, []);

  const setAction = useCallback((action: ExploreAction) => {
    setFilters((prev) => ({ ...prev, action }));
  }, []);

  const setCondition = useCallback((condition: 'all' | DeviceCondition) => {
    setFilters((prev) => ({ ...prev, condition }));
  }, []);

  const setSort = useCallback((sort: ExploreSort) => {
    setFilters((prev) => ({ ...prev, sort }));
  }, []);

  const setOnlyFree = useCallback((onlyFree: boolean) => {
    setFilters((prev) => ({ ...prev, onlyFree }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.action !== 'all') count++;
    if (filters.condition !== 'all') count++;
    if (filters.onlyFree) count++;
    if (filters.sort !== 'nearest') count++;
    return count;
  }, [filters]);

  return {
    items: filteredItems,
    allItemsCount: allAvailableItems.length,
    totalCo2SavedInView,
    filters,
    categoryPills,
    activeFiltersCount,
    selectedItem,
    setSelectedItem,
    filterModalVisible,
    setFilterModalVisible,
    refreshing,
    onRefresh,
    setQuery,
    setCategory,
    setAction,
    setCondition,
    setSort,
    setOnlyFree,
    resetFilters,
  };
};
