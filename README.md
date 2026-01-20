# Personalization Custom App for Kontent.ai

A custom app for managing content personalization variants in Kontent.ai. This app allows content editors to create, view, and delete personalized content variants for different audiences directly within the item editor.

## Features

- **View Variants**: See all content variants (including base content) for the current item
- **Create Variants**: Create new personalized variants for different audiences
- **Delete Variants**: Remove variants
- **Audience Management**: Track which audiences already have variants
- **Cross-linking**: Automatically links all variants together for easy navigation

## Prerequisites

- Node.js 20+
- pnpm
- A Kontent.ai environment with Management API access

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file and add your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your Kontent.ai credentials:

```env
KONTENT_MANAGEMENT_API_KEY=your-management-api-key-here
KONTENT_ENVIRONMENT_ID=your-environment-id-here
```

### 3. Configure Your Audiences

The app includes an example audiences taxonomy that you must customize for your needs.

1. Copy the example taxonomy file:

```bash
cp scripts/content-model/taxonomyGroups.json.example scripts/content-model/taxonomyGroups.json
```

2. Edit `scripts/content-model/taxonomyGroups.json` and customize the `personalization_audiences` taxonomy with your own audience terms:

```json
{
  "name": "Personalization Audiences",
  "codename": "personalization_audiences",
  "terms": [
    { "name": "Your Audience 1", "codename": "your_audience_1", "terms": [] },
    { "name": "Your Audience 2", "codename": "your_audience_2", "terms": [] }
  ]
}
```

> **Important**: Keep the `variant_type` taxonomy unchanged - it's required by the app. Only customize the `personalization_audiences` section.

### 4. Sync Content Model

Run the sync command to create the required taxonomies and content type snippet in your Kontent.ai environment:

```bash
pnpm sync
```

This uses [@kontent-ai/data-ops](https://github.com/kontent-ai/data-ops) to sync only the personalization-related content model entities.

### 5. Add Snippet to Content Type

1. Go to your Kontent.ai environment
2. Navigate to **Content model** > **Content types**
3. Edit the content type you want to enable personalization for
4. Click **Add element** > **Snippet** > Select **Personalization**
5. Save the content type

### 6. Configure Custom App in Kontent.ai

1. Go to **Environment settings** > **Custom apps**
2. Click **Create new**
3. Configure the app:
   - **Name**: Personalization
   - **Source URL**: Your deployed app URL (or `https://localhost:8888` for development)
   - **Display mode**: Dialog
4. Save the configuration

### 7. Start Development Server

```bash
pnpm dev
```

The app will be available at `https://localhost:8888`.

## Content Model Structure

### Taxonomies

The app requires two taxonomies:

#### Variant Type (`variant_type`)

Identifies whether an item is base content or a personalized variant. **Do not modify this taxonomy.**

| Term | Codename |
|------|----------|
| Base Content | `base_content` |
| Variant | `variant` |

#### Personalization Audiences (`personalization_audiences`)

User-defined audiences for targeting. **Customize this taxonomy with your own audiences.**

### Content Type Snippet

The **Personalization** snippet adds these elements to your content type:

| Element | Type | Purpose |
|---------|------|---------|
| Variant Type | Taxonomy | Identifies base content vs variant |
| Personalization Audience | Taxonomy | Target audience for the variant |
| Content Variants | Linked Items | Links to all variants (managed by the app) |

## How It Works

### Creating a Variant

1. Open a base content item in the item editor
2. The Personalization app shows in the sidebar
3. Select an audience from the dropdown
4. Click **Create** to create a new variant

The app will:
- Create a new content item named `{Original Name} ({Audience})`
- Copy all content from the base item
- Set the variant type to "Variant"
- Set the personalization audience
- Link the new variant in all related items' Content Variants field

### Viewing Variants

When viewing any item with the personalization snippet:
- The app shows whether it's base content or a variant
- Lists all other variants with their audiences
- Provides links to open each variant in the editor

### Deleting a Variant

Only available when viewing base content:
1. Click the trash icon on a variant card
2. Confirm the deletion in the modal
3. The variant is unlinked from all items and deleted

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Netlify |
| `pnpm build` | Build for production |
| `pnpm lint` | Run ESLint |
| `pnpm sync` | Sync content model to Kontent.ai using data-ops |

## Deployment

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR-REPO-HERE)

1. Click the deploy button or connect your repository to Netlify
2. Add the `KONTENT_MANAGEMENT_API_KEY` environment variable in Netlify settings
3. Deploy the site
4. Update the custom app URL in Kontent.ai to your Netlify URL

## Updating Audiences

To add, remove, or modify your personalization audiences:

1. Edit `scripts/content-model/taxonomyGroups.json`
2. Run `pnpm sync` to update the taxonomy in Kontent.ai

Note: Removing audience terms that are in use by existing variants may cause issues. Update your content items first.

## Example Client

See the [example-client](./example-client/README.md) directory for a React application demonstrating how to consume personalized content on the frontend. The example shows:

- How to fetch base content with linked variants
- Resolving the correct variant based on user audience
- Fallback behavior when no matching variant exists

## License

MIT
