# I/ITSEC 2025 - Personalized Paper Recommendations

A beautiful single-page web application for browsing conference papers based on attendee personas.

## Features

- **Persona-Based Recommendations**: Choose from multiple attendee personas to get personalized paper recommendations
- **Smart Filtering**: Filter papers by conference day (Dec 1-4) and relevance level (High/Medium/Low)
- **Conflict Detection**: Automatically identifies and highlights papers with overlapping presentation times
- **Detailed Information**: View session details, room locations, presentation times, and relevance rationale
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Quick Start

1. Make sure all three data files are in the same directory as `index.html`:
   - `Personas.md`
   - `all_papers_merged.json`
   - `papers_by_persona.json`

2. Open `index.html` in a web browser (requires a local web server for proper file loading)

### Option 1: Using Python
```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

### Option 2: Using Node.js
```bash
# Install http-server globally
npm install -g http-server

# Run the server
http-server

# Then open http://localhost:8080 in your browser
```

### Option 3: Using VS Code
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

## Usage

1. **Select Your Persona**: Choose the persona that best describes you from the grid
2. **View Recommendations**: See all papers relevant to your persona, sorted by date and time
3. **Filter by Day**: Click day buttons to see only papers on specific conference days
4. **Filter by Relevance**: Toggle between All, High, Medium, or Low relevance papers
5. **Check for Conflicts**: Papers with overlapping times are highlighted with a ⚠️ badge
6. **Read Rationale**: Each paper shows why it's relevant to your persona

## Data Files

- **Personas.md**: Contains persona definitions with titles and descriptions
- **all_papers_merged.json**: Complete paper database with session info and persona analysis
- **papers_by_persona.json**: Mapping of papers to personas by relevance level

## Technologies Used

- HTML5
- CSS3 (with modern gradients and animations)
- Vanilla JavaScript (no external dependencies)
- Responsive design with CSS Grid and Flexbox

## Browser Compatibility

Works best in modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

This project is created for I/ITSEC 2025 conference attendees.
