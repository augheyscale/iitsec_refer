# I/ITSEC 2025 - Personalized Paper Recommendations

A modern, interactive web application built with Next.js for browsing I/ITSEC conference papers based on attendee personas. The application provides personalized recommendations to help conference attendees discover relevant papers and plan their schedule.

## Features

- **Persona-Based Recommendations**: Choose from 13+ attendee personas to get personalized paper recommendations
- **Smart Filtering**: Filter papers by conference day (Dec 2-4) and relevance level (High/Medium/Low)
- **Conflict Detection**: Automatically identifies and highlights papers with overlapping presentation times
- **Detailed Information**: View session details, room locations, presentation times, and AI-generated relevance rationale
- **Responsive Design**: Beautiful, modern UI that works seamlessly on desktop, tablet, and mobile devices
- **Real-time Filtering**: Instant updates as you change filters with no page reloads
- **Paper Count Badges**: See the number of recommended papers for each persona at a glance

## Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Ensure data files are in the `public/` directory:
   - `public/all_papers_merged.json`
   - `public/papers_by_persona.json`
   - `public/Personas.md`

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The page auto-updates as you edit files. Changes to `app/page.tsx` will be reflected immediately.

## Building for Production

### Option 1: Build and Run Server

```bash
npm run build
npm start
```

This creates an optimized production build and starts the Next.js server on port 3000.

### Option 2: Static Export

For static hosting (GitHub Pages, S3, etc.):

```bash
npm run export
```

This generates a static site in the `out/` directory that can be deployed to any static hosting service.

## Project Structure

```
iitsec_refer/
├── app/
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Main application page
├── public/                 # Static assets
│   ├── all_papers_merged.json
│   ├── papers_by_persona.json
│   └── Personas.md
├── out/                    # Static export output (generated)
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## Usage

### 1. Select Your Persona
Browse the persona grid on the home page and click on the persona that best matches your role and interests. Each card shows:
- Persona title
- Description
- Number of recommended papers (badge)

### 2. View Recommendations
After selecting a persona, you'll see all papers relevant to you, including:
- Paper title and authors
- Session information
- Room location
- Presentation time
- Relevance level (High/Medium/Low)
- AI-generated rationale explaining why it's relevant

### 3. Filter Papers

**By Day:**
- Dec 2, Dec 3, or Dec 4
- Shows papers scheduled for the selected day only

**By Relevance:**
- All: Show all relevant papers
- High: Show only high-relevance papers
- Medium: Show only medium-relevance papers

### 4. Scheduling Conflicts
Papers with overlapping presentation times are automatically detected and highlighted with:
- Red border
- Pink background
- "Time Conflict" badge
- Conflict count in the summary section

### 5. Return to Personas
Click the "← Back to Personas" button to select a different persona and see new recommendations.

## Data Files

### all_papers_merged.json
Complete database of conference papers including:
- Paper metadata (ID, title, authors)
- Session information (room, time, track, type)
- AI-generated persona analysis and relevance scores

### papers_by_persona.json
Organized mapping of papers to personas with three relevance tiers:
- `High_Relevance_Papers`: Core recommendations
- `Medium_Relevance_Papers`: Secondary recommendations
- `Low_Relevance_Papers`: Tertiary recommendations

### Personas.md
Text descriptions of each attendee persona type for reference.

## Available Personas

The application automatically generates personas from the data, including:
- Academic – Researcher or Professor
- Defense Industry Executive / Business Director
- Government – Acquisitions Professional
- Government – Civilian (Early-Career & Mid-Career)
- Government – Enlisted
- Government – Officer or SES
- Industry Professional (Early-Career & Mid-Career)
- International Delegate
- Recruiter/Workforce Strategist
- Small Business Innovator / Tech Entrepreneur
- Student

*Note: Only personas with 3+ recommendations are displayed.*

## Technologies Used

- **Framework**: Next.js 14.x
- **Language**: TypeScript 5.x
- **UI Library**: React 18.x
- **Styling**: Inline CSS with modern gradients and animations
- **Build Tool**: Next.js built-in compiler
- **Data Format**: JSON
- **Deployment**: Static export or Next.js server

## Browser Compatibility

Optimized for modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Client-side rendering for instant interactions
- Efficient data loading with Promise.all()
- Optimized filtering and sorting algorithms
- Minimal bundle size with no external UI dependencies

## Deployment

### Static Hosting (Recommended)

After running `npm run export`, deploy the `out/` directory to:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static file hosting service

### Server Hosting

Deploy the entire application to platforms that support Next.js:
- Vercel (optimized for Next.js)
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Troubleshooting

**Issue**: Data not loading
- **Solution**: Ensure all JSON files are in the `public/` directory and properly formatted

**Issue**: Build fails
- **Solution**: Delete `node_modules` and `.next`, then run `npm install` and `npm run build`

**Issue**: Static export missing data
- **Solution**: Verify data files are in `public/` before running `npm run export`

## Contributing

This project is designed for I/ITSEC 2025 conference attendees. For updates or improvements, ensure all changes maintain compatibility with the data file formats.

## License

This project is created for I/ITSEC 2025 conference attendees.

## Support

For questions or issues related to the conference or paper content, please contact the I/ITSEC organizing committee.
