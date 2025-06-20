# Frontend Components

This directory contains all the React components used in the CredBuzz application.

## Directory Structure

```
components/
├── common/           # Common components used across multiple pages
│   ├── Navbar/      # Navigation bar component
│   ├── Footer/      # Footer component
│   └── ProtectedRoute/  # Route protection component
├── home/            # Components specific to the home page
│   ├── HeroSection/     # Hero section component
│   ├── FeaturedTasks/   # Featured tasks section
│   └── HowItWorks/      # How it works section
└── shared/          # Reusable UI components
    ├── Button/      # Button component
    └── Card/        # Card component
```

## Component Details

### Common Components
- **Navbar**: Main navigation bar with responsive design
- **Footer**: Site footer with links and copyright
- **ProtectedRoute**: Route protection for authenticated users

### Home Components
- **HeroSection**: Main hero section with call-to-action
- **FeaturedTasks**: Display of featured tasks
- **HowItWorks**: Step-by-step guide section

### Shared Components
- **Button**: Reusable button component with variants
- **Card**: Reusable card component for content display

## Styling
All components use styled-components for styling, following a black and white color scheme.

## Usage
Import components as needed:
```jsx
import { Button } from '../components/shared/Button';
import { Navbar } from '../components/common/Navbar';
``` 