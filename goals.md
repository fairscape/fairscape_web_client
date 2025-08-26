# Metadata Display Architecture Refactoring Guide

## Context

You have access to a React/TypeScript codebase for displaying scientific metadata and evidence graphs. The current implementation works but has significant architectural issues that make it difficult to maintain and extend.

## Current Problems

1. **MetadataDisplayPage.tsx is doing too much** - It handles data fetching, state management, type determination, view switching, and rendering all in one 500+ line component
2. **Evidence graph logic is entangled with metadata display** - The useEvidenceGraphManager hook and display logic are mixed into the main page flow
3. **Duplicated download/authentication logic** - ROCrateComponent and GenericMetadataComponent both implement their own download handlers
4. **Data transformations scattered** - Processing functions in metadataProcessing.ts are called from multiple places with inconsistent patterns
5. **Prop drilling** - Data passes through many component layers unnecessarily
6. **Mixed responsibilities** - Components like ROCrateComponent handle both data processing and UI rendering

## Refactoring Goals

1. **Separate concerns** using provider patterns and specialized hooks
2. **Create clear data flow** - Data flows down from providers, actions flow up through callbacks
3. **Eliminate duplication** by centralizing services
4. **Maintain all existing functionality** - ROCrate, Release, and generic types must still work exactly as before
5. **Improve testability** through pure functions and isolated components

## Critical Requirements

### Must Preserve Type-Specific Handling

- **Release**: Needs composition processing for subcrates, distribution sections, use cases
- **ROCrate**: Needs entity categorization from @graph, tabbed display for different entity types
- **Dataset/Software/Computation/etc**: Need their specific property lists and display formats
- **Generic fallback**: For unknown types

### Must Maintain Features

- Evidence graph building/polling/display
- Authentication-aware downloads
- Embargoed content handling
- External vs API downloads
- Schema property expansion modals
- All existing metadata transformations

## Refactoring Order

Please implement this refactor in the following order, printing each file/folder completely before moving to the next:

### Phase 1: Core Services

1. Create `/services/authService.ts` - Centralized token management
2. Create `/services/downloadService.ts` - Unified download handling with embargo support
3. Update `/services/metadataService.ts` - Clean up and add ROCrate-specific fetching

### Phase 2: Providers

4. Create `/providers/MetadataProvider.tsx` - Context for metadata state and fetching
5. Create `/providers/ViewProvider.tsx` - Manages current view (metadata/serialization/graph)
6. Create `/providers/EvidenceGraphProvider.tsx` - Isolates all evidence graph logic

### Phase 3: Shared Hooks

7. Create `/hooks/useDownload.ts` - Reusable download hook using downloadService
8. Create `/hooks/useArkId.ts` - Extracts ARK ID from URL
9. Create `/hooks/useMetadataType.ts` - Type determination logic

### Phase 4: Data Processing

10. Create `/utils/processors/ReleaseProcessor.ts` - All release-specific processing
11. Create `/utils/processors/ROCrateProcessor.ts` - Entity categorization and processing
12. Create `/utils/processors/GenericProcessor.ts` - Generic type processing
13. Update `/utils/metadataProcessing.ts` - Keep only shared utilities

### Phase 5: Shared Components

14. Create `/components/shared/MetadataTable.tsx` - Replaces ConfigurableMetadataTable
15. Create `/components/shared/ValueFormatter.tsx` - Centralizes all value rendering logic
16. Create `/components/shared/DownloadButton.tsx` - Reusable download component

### Phase 6: View Components

17. Create `/components/views/ReleaseView.tsx` - Uses ReleaseProcessor
18. Create `/components/views/ROCrateView.tsx` - Uses ROCrateProcessor
19. Create `/components/views/DatasetView.tsx` - Dataset-specific view
20. Create `/components/views/GenericView.tsx` - Fallback view
21. Create `/components/views/MetadataRouter.tsx` - Routes to correct view based on type

### Phase 7: Evidence Graph Components

22. Move and update `/components/evidence-graph/EvidenceGraphContainer.tsx`
23. Keep `/components/evidence-graph/EvidenceGraphViewer.tsx` mostly unchanged
24. Create `/components/evidence-graph/EvidenceGraphStatus.tsx` - Status display component

### Phase 8: Main Page

25. Refactor `/pages/MetadataDisplayPage.tsx` - Now just composition of providers and components

## Implementation Instructions

For each file:

1. Print the complete file contents
2. Include all TypeScript types/interfaces
3. Include all imports (use relative paths consistently)
4. Add comments explaining complex logic
5. Ensure no functionality is lost from the original

## Key Patterns to Follow

### Provider Pattern

```typescript
const SomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // All state management here
  return <SomeContext.Provider value={...}>{children}</SomeContext.Provider>;
};
```

### Service Pattern

```typescript
export class SomeService {
  static async someMethod() {
    // Pure business logic, no React
  }
}
```

### Hook Pattern

```typescript
export const useSomething = () => {
  // Combines service calls with React state
  return { data, loading, error, actions };
};
```

## Start Implementation

Please begin with Phase 1, creating the `/services/authService.ts` file. Print the complete file, then wait for confirmation before proceeding to the next file.
