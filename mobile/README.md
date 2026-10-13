# EcoLoop Mobile — React Native (Expo)

Production-grade mobile application for EcoLoop, engineered following Apple's native iOS Human Interface Guidelines.

## Architecture

```
mobile/
├── App.tsx                                  # Application shell with SafeAreaProvider, ThemeProvider, and TabBar
├── app.json                                 # Expo configuration & native permissions plugins
├── package.json                             # Dependencies (SDK 57, React 19, expo-image-picker)
├── tsconfig.json                            # Strict TypeScript configuration
├── test-register.cjs                        # Module resolution alias for testing
├── test-mock-icons.cjs                      # Vector icons test mock
├── test-mock-image-picker.cjs               # Native camera & library picker test mock
├── test-mock-safe-area.cjs                  # Safe area context test mock
├── test-mock-rn.cjs                         # React Native Web test proxy with SSR modal
└── src/
    ├── design-system/                       # Apple HIG Design Tokens & Theme Engine
    │   ├── tokens/
    │   │   ├── colors.ts                    # Light & OLED Dark palettes, pathway tints
    │   │   ├── typography.ts                # Apple HIG typography scale (largeTitle to caption2)
    │   │   ├── spacing.ts                   # 4/8pt spacing scale
    │   │   ├── radii.ts                     # Continuous squircle corner radii
    │   │   ├── shadows.ts                   # Diffuse Apple elevation shadows
    │   │   └── index.ts
    │   ├── theme/
    │   │   └── theme.tsx                    # ThemeProvider and useAppTheme hook
    │   └── tokens.test.ts                   # Unit tests verifying tokens adherence
    ├── components/
    │   ├── ui/                              # Apple-grade UI primitives
    │   │   ├── AppText.tsx                  # Dynamic Type with semantic typography variants
    │   │   ├── AppIcon.tsx                  # SF Symbols-aligned vector icon renderer
    │   │   ├── AppButton.tsx                # Filled, tinted, gray, and plain iOS button styles
    │   │   ├── AppCard.tsx                  # Tactile grouped cards with hairline borders
    │   │   ├── AppBadge.tsx                 # Capsule indicator pills
    │   │   ├── AppSeparator.tsx             # Hairline separator with inset support
    │   │   ├── AppTextInput.tsx             # HIG text field with clear button, prefixes & errors
    │   │   ├── AppFilterPills.tsx           # Horizontal scrolling category filter chips
    │   │   └── AppSegmentedControl.tsx      # Native-feeling segmented control
    │   └── navigation/
    │       ├── AppTabBar.tsx                # Apple standard bottom tab bar with 44pt touch targets
    │       └── DeferredTabPlaceholder.tsx   # Phase 3 deferred navigation shells
    └── features/
        ├── home/                            # Phase 1: Flagship Home Screen
        │   ├── screens/
        │   │   └── HomeScreen.tsx           # Assembled Home Screen with pathway routing
        │   ├── components/
        │   │   ├── HomeHeader.tsx           # Brand mark, region selector, search & notification
        │   │   ├── WelcomeSection.tsx       # Editorial headline: "Give your devices a second life"
        │   │   ├── CoreActions.tsx          # 2x2 balanced pathways: Repair, Recycle, Sell, Buy
        │   │   ├── ActionCard.tsx           # Tactile action card with micro-metrics
        │   │   ├── PostDeviceBanner.tsx     # Primary "Post a device" hero action
        │   │   ├── CommunityActivitySection.tsx # Verified circular hubs & live metrics
        │   │   ├── RecentDevicesSection.tsx # "Devices finding their next life" carousel
        │   │   ├── ActionDetailSheet.tsx    # Dedicated pathway explanation bottom sheet
        │   │   └── RegionPickerSheet.tsx    # Active region selection sheet
        │   ├── hooks/
        │   │   └── useHomeData.ts           # Circular state, pathways config, and refresh handling
        │   ├── types/
        │   │   └── home.types.ts            # Domain TypeScript types
        │   └── home.test.ts                 # Unit tests verifying Home architecture
        ├── explore/                         # Phase 2: Explore & Marketplace
        │   ├── screens/
        │   │   └── ExploreScreen.tsx        # Search, filter pills, product cards & empty states
        │   ├── components/
        │   │   ├── ExploreHeader.tsx        # Apple large title, search input & filter count badge
        │   │   ├── ExploreProductCard.tsx   # Tactile product card with condition, price & CO₂
        │   │   ├── DeviceDetailModal.tsx    # Full hardware specifications & action CTAs sheet
        │   │   └── ExploreFilterModal.tsx   # Advanced filter modal (pathways, condition, sort)
        │   ├── fixtures/
        │   │   └── exploreFixtures.ts       # Clearly identified offline/preview development fixtures
        │   ├── hooks/
        │   │   └── useExploreData.ts        # Search, category, condition filtering & session items
        │   ├── types/
        │   │   └── explore.types.ts         # Explore domain types
        │   └── explore.test.ts              # Unit tests for Explore architecture
        └── post/                            # Phase 2: Post a Device Complete Journey
            ├── screens/
            │   └── PostDeviceModal.tsx      # Multi-step post container with step validation
            ├── components/
            │   ├── PostProgressHeader.tsx   # Segmented progress bar & back/cancel navigation
            │   ├── PostPhotoStep.tsx        # Native camera & library picker with photo grid
            │   ├── PostInfoStep.tsx         # Category, title, brand/model & condition entry
            │   ├── PostActionStep.tsx       # Distinct pathways for Sell, Repair, and Recycle
            │   ├── PostReviewStep.tsx       # Overview, calculated CO₂ metrics & declaration
            │   └── PostSuccessStep.tsx      # Confirmation hero, +50 EcoKarma & Explore CTA
            ├── hooks/
            │   └── useDeviceVisionHook.ts   # Clean, honest interface for future AI vision
            ├── services/
            │   └── postDeviceService.ts     # CO₂ calculator, API posting & session registration
            ├── types/
            │   └── post.types.ts            # Post domain types
            └── post.test.ts                 # Unit tests for complete posting flow
```

## Running the Application

### Typecheck
```bash
npm run typecheck
```

### Unit Tests
```bash
npm test
```

### Run on iOS Simulator (macOS) / Expo Go
```bash
npm run ios
```

### Run on Android
```bash
npm run android
```

### Run on Web Preview
```bash
npm run web
```

### Metro Static Export (Bundler Verification)
```bash
# Verify iOS Metro bundling
npx expo export -p ios --no-bytecode

# Verify Android Metro bundling
npx expo export -p android --no-bytecode

# Verify Web Metro bundling
npx expo export -p web
```
