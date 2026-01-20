# Personalization Example Client

A React application demonstrating how to consume personalized content from Kontent.ai using the content model and variant structure created by the Personalization custom app.

## Overview

This example shows how personalized content variants work on the frontend:

1. **Base content items** have a `content_variants` linked items field containing all their variants
2. **Variant resolution** happens client-side by matching the current user's audience against variant audiences

The example includes a hero section with 5 content variations (1 base + 4 audience-specific variants) to demonstrate the complete flow.

## How It Works

### Content Structure

The personalization custom app creates content items with this structure:

```
Homepage Hero (base)
├── variant_type: "base_content"
├── personalization_audience: (empty)
└── content_variants: [
      Homepage Hero (New Visitors),
      Homepage Hero (Returning Visitors),
      Homepage Hero (Premium Members),
      Homepage Hero (Enterprise)
    ]
```

Each variant links back to the base and all other variants, enabling navigation between them.

### Variant Resolution

The `resolveVariant` function in `src/lib/variantResolver.ts` handles content resolution:

```typescript
const resolveVariant = (baseItem, currentAudience) => {
  // If no audience, return base content
  if (currentAudience === null) return baseItem;

  // Find variant matching current audience
  const variants = baseItem.elements.personalization__content_variants.linkedItems;
  const matchingVariant = variants.find((variant) =>
    variant.elements.personalization__personalization_audience.value.some(
      (term) => term.codename === currentAudience
    )
  );

  // Return matching variant or fall back to base
  return matchingVariant ?? baseItem;
};
```

### Audience Detection

In this example, audience selection is manual via a UI selector for demonstration purposes. In production, you would determine audiences programmatically based on:

- User authentication status
- User profile attributes
- Cookies or session data
- Behavioral signals
- Third-party data

The `useAudience` hook in `src/context/AudienceContext.tsx` provides the current audience to components.

## Project Structure

```
example-client/
├── src/
│   ├── components/
│   │   ├── AudienceSelector.tsx    # UI for manual audience selection
│   │   └── PersonalizedHero.tsx    # Example personalized component
│   ├── context/
│   │   └── AudienceContext.tsx     # Audience state management
│   ├── hooks/
│   │   └── usePersonalizedContent.ts # Content fetching hook
│   ├── lib/
│   │   ├── kontentClient.ts        # Kontent.ai Delivery SDK setup
│   │   └── variantResolver.ts      # Variant resolution logic
│   ├── types/
│   │   └── content.ts              # TypeScript types for content
│   └── App.tsx                     # Main application
├── scripts/
│   ├── sync-model.ts               # Syncs content model to Kontent.ai
│   └── sync-content.ts             # Imports example content items
└── kontent-ai-data/
    ├── contentItems.json           # Example content with variants
    └── contentTypes.json           # Content type definitions
```

## Running the Example

### Prerequisites

- Node.js 20+
- pnpm
- A Kontent.ai environment (use an **empty or test environment** - the sync scripts will create content)

### Setup

1. **Install dependencies**

   ```bash
   cd example-client
   pnpm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.template .env
   ```

   Edit `.env` with your Kontent.ai credentials:

   ```env
   VITE_KONTENT_ENVIRONMENT_ID=your_environment_id
   VITE_KONTENT_PREVIEW_API_KEY=your_preview_api_key
   KONTENT_MANAGEMENT_API_KEY=your_management_api_key
   ```

3. **Sync content model and example content**

   > **Warning**: Run this on an empty or test environment only. The sync scripts will create content types and items that may conflict with existing content.

   ```bash
   pnpm sync:all
   ```

   This runs both `sync:model` (creates content types) and `sync:content` (imports example items).

4. **Start development server**

   ```bash
   pnpm dev
   ```

   Open the URL shown in the terminal.

5. **Test personalization**

   Use the audience selector in the bottom-right corner to switch between audiences and see the hero content change.

## Adapting for Your Project

### 1. Determine User Audience

Replace the manual audience selector with your audience detection logic:

```typescript
// Instead of manual selection
const { currentAudience } = useAudience();

// Use your own logic
const currentAudience = determineAudience(user, cookies, analytics);
```

### 2. Fetch Base Content with Variants

Always fetch the base content item with sufficient depth to include linked variants:

```typescript
const response = await deliveryClient
  .item(codename)
  .depthParameter(3) // Include nested linked items
  .toPromise();
```

### 3. Resolve Variants at Render Time

Call the resolver when rendering personalized components:

```typescript
const PersonalizedSection = ({ baseItem }) => {
  const audience = useAudience();
  const resolved = resolveVariant(baseItem, audience);
  return <Section data={resolved} />;
};
```

### 4. Handle Multiple Personalized Components

The pattern works for any number of components on a page. Each component independently resolves its variant based on the shared audience context.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm sync:model` | Sync content types to Kontent.ai |
| `pnpm sync:content` | Import example content items |
| `pnpm sync:all` | Run both sync scripts |

## License

MIT
