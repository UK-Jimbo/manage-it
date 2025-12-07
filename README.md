# Next.js + Shadcn UI + Tailwind CSS DevContainer Template

A ready-to-use development environment template for building modern web applications with Next.js 15, Shadcn UI components, and Tailwind CSS v4.

## 🚀 Quick Start

This template comes pre-configured with a complete development environment in a DevContainer. All Shadcn UI components are pre-installed for your convenience.

### Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Getting Started

1. **Open in DevContainer**: Clone this repository and open it in VS Code. When prompted, click "Reopen in Container" or use Command Palette: `Dev Containers: Reopen in Container`

2. **Start Development Server**:

   ```bash
   pnpm dev
   ```

3. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## ✨ What's Included

### Framework & Tools

- **Next.js 15** with App Router
- **TypeScript** with strict mode
- **Tailwind CSS v4** with custom CSS variables and dark mode
- **pnpm** package manager
- **Turbopack** for fast development builds
- **ESLint** with Next.js configuration

### UI Components

- **Shadcn UI** with "New York" style - all components pre-installed
- **Radix UI** primitives for accessibility
- **Lucide React** icons
- **Responsive design** utilities

### Key Features

- **50+ Shadcn UI components** ready to use (buttons, forms, dialogs, charts, etc.)
- **Dark mode support** with CSS variables
- **Form handling** with React Hook Form + Zod validation
- **Toast notifications** with Sonner
- **Charts** with Recharts
- **Mobile-responsive** hooks and utilities

### Development Environment

- Pre-configured DevContainer with Node.js and TypeScript
- VS Code extensions for React, Tailwind, ESLint, and Prettier
- Auto-formatting and linting on save
- Port forwarding for localhost:3000

## 📁 Project Structure

```
├── app/                 # Next.js app router pages and layouts
├── components/
│   ├── ui/             # Pre-installed Shadcn UI components
│   └── ...             # Custom components
├── hooks/              # Custom React hooks (useIsMobile, etc.)
├── lib/                # Utilities (cn function, configs)
└── public/             # Static assets
```

## 🛠️ Available Scripts

```bash
pnpm dev      # Start development server with Turbopack
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## 🎨 Adding New Components

Add new Shadcn UI components easily:

```bash
npx shadcn@latest add [component-name]
```

Components will be installed to `components/ui/` with proper TypeScript types and styling.

## 🚀 Deployment

This template is optimized for deployment on Vercel, but works with any platform supporting Next.js:

- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Use the Next.js build command
- **Railway/DigitalOcean**: Standard Node.js deployment

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Dev Containers](https://containers.dev/)

## 🤝 Contributing

This is a template repository. Feel free to customize it for your needs!
