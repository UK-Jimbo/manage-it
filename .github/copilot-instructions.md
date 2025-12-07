# AI Coding Guidelines for Next.js + Shadcn UI + Tailwind Template

## Architecture Overview

- **Framework**: Next.js 15 with App Router (`app/` directory structure)
- **UI Library**: Shadcn UI components built on Radix UI primitives with "new-york" style
- **Styling**: Tailwind CSS v4 with CSS variables and dark mode support
- **Language**: TypeScript with strict mode enabled
- **Package Manager**: pnpm with lockfile

## Key Patterns & Conventions

### Component Structure

- Shadcn UI components in `components/ui/` use `class-variance-authority` (CVA) for variants
- All components accept `className` prop and use `cn()` utility for merging
- Radix UI primitives provide accessibility and behavior, styled with Tailwind
- Example: `Button` component uses CVA variants (default, destructive, outline, etc.)

### Styling System

- CSS variables defined in `app/globals.css` for theming
- Use `@theme inline` for custom Tailwind variables
- Dark mode implemented with `dark:` prefix and CSS variables
- Mobile-first responsive design with `sm:`, `md:`, `lg:` breakpoints

### Path Aliases

- `@/*` maps to `./*` (configured in `tsconfig.json`)
- Import components: `@/components/ui/button`
- Import utilities: `@/lib/utils`
- Import hooks: `@/hooks/use-mobile`

### Utility Functions

- `cn()` function in `lib/utils.ts` merges Tailwind classes with `clsx` + `tailwind-merge`
- Always use `cn()` when combining conditional classes
- Example: `cn("base-class", condition && "conditional-class", className)`

### Development Workflow

- **Dev server**: `pnpm dev` (uses Turbopack for faster builds)
- **Build**: `pnpm build` (with Turbopack)
- **Lint**: `pnpm lint` (ESLint with Next.js rules)
- **Type checking**: Built into Next.js dev/build process

### Form Handling

- React Hook Form with `@hookform/resolvers` for validation
- Zod schemas for type-safe validation
- Shadcn form components (`form.tsx`, `input.tsx`, etc.) integrate seamlessly

### State Management & Hooks

- `useIsMobile()` hook in `hooks/use-mobile.ts` for responsive behavior
- Uses React 19 with modern hooks patterns

### Icons & Assets

- Lucide React icons (configured in `components.json`)
- Static assets in `public/` directory
- Next.js Image component for optimized images

### Key Dependencies

- **UI Primitives**: Radix UI components for accessibility
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner for toast messages
- **Themes**: next-themes for dark/light mode
- **Animations**: tw-animate-css for Tailwind animations

## Code Examples

### Adding a new Shadcn component:

```bash
npx shadcn@latest add [component-name]
```

Components auto-install to `components/ui/` with proper imports.

### Creating a custom component with variants:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const componentVariants = cva("base-classes", {
  variants: {
    variant: { default: "styles", custom: "styles" },
  },
});

export function Component({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof componentVariants>) {
  return (
    <div className={cn(componentVariants({ variant }), className)} {...props} />
  );
}
```

### Responsive design pattern:

```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{/* Content */}</div>
```

### Form with validation:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({ name: z.string().min(1) });
const form = useForm({ resolver: zodResolver(schema) });
```

## File Organization

- `app/`: Next.js app router pages and layouts
- `components/ui/`: Reusable Shadcn UI components
- `components/`: Custom application components
- `lib/`: Utility functions and configurations
- `hooks/`: Custom React hooks
- `public/`: Static assets

## Performance Considerations

- Turbopack enabled for faster development builds
- Next.js Image optimization for images
- Tree shaking with modern bundling
- CSS variables for runtime theme switching
