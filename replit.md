# Overview

This is a full-stack blockchain analytics application built to provide comprehensive wallet analysis and transaction monitoring. The application features a React frontend with a modern OriginTrail-inspired dark theme, an Express.js backend with Drizzle ORM for database operations, and is designed to analyze Ethereum wallet activities including balance tracking, transaction history, and network statistics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript and follows a component-based architecture. Key design decisions include:

- **UI Framework**: Built with Radix UI components and shadcn/ui for consistent, accessible design patterns
- **Styling**: Tailwind CSS with custom CSS variables for theming, following OriginTrail's dark aesthetic with purple-to-cyan gradients
- **State Management**: TanStack Query for server state management and React hooks for local state
- **Routing**: React Router for client-side navigation with a catch-all 404 handler
- **Data Visualization**: Recharts library for balance charts and transaction analytics
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing

The design system emphasizes a true dark UI with careful use of color for emphasis only, large radii for soft aesthetics, and calm micro-interactions without bouncy animations.

## Backend Architecture
The backend follows a minimal Express.js architecture with clear separation of concerns:

- **Framework**: Express.js with TypeScript for type safety
- **Database Layer**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Storage Interface**: Abstract storage interface (IStorage) with in-memory implementation for development
- **API Structure**: RESTful endpoints under `/api` prefix with centralized error handling
- **Development Setup**: Vite integration for hot module replacement and development tooling

The backend is designed to be easily extensible with proper CRUD operations and database migrations support.

## Database Design
The database schema is defined using Drizzle ORM with the following structure:

- **Users Table**: Simple user management with id, username, and password fields
- **Schema Validation**: Zod schemas for runtime type checking and validation
- **Migration Support**: Drizzle Kit for database schema migrations and evolution

The database is configured for PostgreSQL with connection via environment variables.

## Component Architecture
The frontend components are organized into several key categories:

- **UI Components**: Reusable shadcn/ui components with consistent theming
- **Feature Components**: Specialized components for blockchain data (BalanceChart, TransactionList, NetworkStats, etc.)
- **Layout Components**: Hero section and form components for user interaction
- **Utility Components**: Toast notifications and error boundaries

Components follow the compound component pattern where appropriate and maintain separation between presentation and business logic.

# External Dependencies

## Database Services
- **Neon Database**: PostgreSQL database hosting via `@neondatabase/serverless` package
- **Connection Pool**: PostgreSQL connection management with session storage support via `connect-pg-simple`

## UI and Design Libraries
- **Radix UI**: Comprehensive set of low-level UI primitives for accessibility and keyboard navigation
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Data visualization library for charts and analytics
- **Date-fns**: Date manipulation and formatting utilities

## Development and Build Tools
- **Vite**: Fast build tool and development server with HMR support
- **TypeScript**: Static type checking across the entire stack
- **Drizzle Kit**: Database schema management and migration tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer plugins

## Form and State Management
- **React Hook Form**: Performant form handling with minimal re-renders
- **TanStack Query**: Server state management with caching and synchronization
- **Zod**: Runtime type validation and schema definition

## Blockchain Integration (Planned)
The application is architected to integrate with Ethereum blockchain APIs for wallet analysis, though specific blockchain service dependencies are not yet implemented in the current codebase. The component structure suggests future integration with:
- Ethereum RPC providers for transaction data
- Block explorer APIs for comprehensive wallet analytics
- Real-time network statistics services