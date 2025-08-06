# Overview

This is a Police Management System built as a full-stack web application. The system provides police departments with tools to manage cases, occurrence book (OB) entries, license plate records, and user administration. It features a React frontend with custom CSS styling, an Express.js backend, and in-memory storage for development. Successfully migrated from TypeScript to JavaScript with enhanced UI components and admin-only officer management functionality.

# User Preferences

Preferred communication style: Simple, everyday language.
User requests (January 2025):
- Logout should redirect to login page ✓
- Profile management restricted to admin users only ✓
- Collapsible sidebar with three-dot expansion ✓
- Police-specific profile management with search by departments, IDs, names ✓
- Browser back button functionality for case navigation ✓
- Cases with update/close/delete options ✓
- Add case button functionality ✓

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theming and dark mode support
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Navigation**: Browser history-aware navigation with proper back button support for case management

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Session Management**: Express-session with PostgreSQL storage for secure authentication
- **API Design**: RESTful endpoints with middleware-based authentication and authorization
- **Development**: Hot module replacement with Vite integration for rapid development

## Enhanced Features (January 2025)
- **Collapsible Sidebar**: Three-dot expandable navigation with user session persistence
- **Role-Based Profile Management**: Admin-only access to officer management with full CRUD operations
- **Advanced Search & Filtering**: Multi-criteria search by departments, badge numbers, names, and specializations
- **Case Navigation**: Browser-aware case management with proper back button functionality
- **Police-Specific Data Models**: Comprehensive officer profiles with department assignments and specializations

## Database Architecture
- **Database**: PostgreSQL with Neon serverless integration
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema**: Structured tables for users, cases, occurrence book entries, license plates, and password reset tokens
- **Authentication**: Session-based authentication with role-based access control (admin/user roles)

## Security Features
- **Authentication**: Session-based authentication with secure HTTP-only cookies and automatic logout redirection
- **Authorization**: Role-based access control with admin and user permissions, including profile management restrictions
- **Password Management**: Secure password reset functionality with time-limited tokens
- **Input Validation**: Zod schema validation on both frontend and backend
- **Admin Access Control**: Profile management section restricted to administrators only

## Project Structure
- **Monorepo Layout**: Client, server, and shared code in separate directories
- **Shared Schema**: Common TypeScript types and Zod schemas shared between frontend and backend
- **Asset Management**: Centralized asset handling with proper path resolution
- **Build Process**: Separate build processes for client (Vite) and server (esbuild)

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

## UI and Styling
- **Radix UI**: Accessible component primitives for complex UI components
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool with hot module replacement for development
- **TypeScript**: Type safety across the entire application stack
- **ESBuild**: Fast JavaScript bundler for server-side code

## Authentication and Session Management
- **Express Session**: Server-side session management
- **Connect PG Simple**: PostgreSQL session store for persistent sessions

## Data Management
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Runtime type validation and schema parsing

## Utilities
- **date-fns**: Date manipulation and formatting library
- **clsx**: Utility for constructing className strings conditionally
- **nanoid**: Secure URL-friendly unique string ID generator