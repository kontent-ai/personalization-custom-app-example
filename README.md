# Kontent.ai Custom App Starter

A React + TypeScript starter template for building [Kontent.ai custom apps](https://kontent.ai/learn/docs/build-apps/custom-apps/overview). This template provides a quick setup with all the essentials to start developing your custom app.

## Features

- ✅ React 18 with TypeScript
- ✅ Vite for fast development and builds
- ✅ @kontent-ai/custom-app-sdk integration
- ✅ Custom hook for observing context changes
- ✅ Example implementations of all SDK functions
- ✅ Kontent.ai ESLint & Biome configurations
- ✅ Minimal, clean styling

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm)

### Installation

Using pnpm (recommended):

```bash
pnpm i
```

Using npm:

```bash
npm i
```

### Development

Start the development server:

```bash
pnpm dev
# or
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

Build for production:

```bash
pnpm build
# or
npm run build
```

Preview the production build:

```bash
pnpm preview
# or
npm run preview
```

## Project Structure

```
src/
├── hooks/
│   └── useCustomAppContext.ts  # Custom hook for observing context
├── App.tsx                      # Main application component
├── App.css                      # Application styles
├── main.tsx                     # Application entry point
└── index.css                    # Global styles
```

## SDK Usage

### Observing Context Changes

The `useCustomAppContext` hook automatically subscribes to context changes:

```typescript
import { useCustomAppContext } from './hooks/useCustomAppContext';

const { context, isLoading, error } = useCustomAppContext();
```

### Single Context Fetch

While the SDK provides `getCustomAppContext()` for fetching the context once without subscribing to changes, **we recommend using the reactive `useCustomAppContext` hook instead**. The hook ensures your app stays up-to-date with the latest context automatically.

If you need a single fetch for specific use cases:

```typescript
import { getCustomAppContext } from '@kontent-ai/custom-app-sdk';

const response = await getCustomAppContext();
if (!response.isError) {
  console.log(response.context);
}
```

### Adjusting Popup Size

Control the size of your custom app when displayed in a popup:

```typescript
import { setPopupSize } from '@kontent-ai/custom-app-sdk';

await setPopupSize(
  { unit: 'px', value: 800 },  // width
  { unit: 'px', value: 600 }   // height
);
```

## Deploying Your Custom App

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/kontent-ai/custom-app-starter-react.git)

1. Build the app: `pnpm build`
2. Deploy the `dist` folder to your hosting provider (Netlify, Vercel, etc.)
3. Configure the custom app in Kontent.ai:
   - Go to Environment settings > Custom apps
   - Add a new custom app with your deployed URL
   - Configure the URL pattern where the app should appear

## Learn More

- [Kontent.ai Custom Apps Documentation](https://kontent.ai/learn/docs/build-apps/custom-apps/overview)
- [Custom App SDK Reference](https://github.com/kontent-ai/custom-app-sdk-js)
- [Kontent.ai ESLint Config](https://github.com/kontent-ai/eslint-config)
- [Kontent.ai Biome Config](https://github.com/kontent-ai/biome-config)
- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)

## License

MIT
