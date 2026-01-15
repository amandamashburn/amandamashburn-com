# Personal Website - Requirements

## Project Overview
Simple "Coming Soon" landing page for personal website, built with Next.js and deployed to Vercel.

## Visual Design
- Plain white background
- Black text throughout
- All content centered on the page (both horizontally and vertically)
- Clean, minimal aesthetic

## Typography
### Fonts
- **IBM Plex Serif** - Main heading
- **IBM Plex Sans or IBM Plex Mono** - Subheading and body text (choose whichever looks better)
- Set up project to support full IBM Plex family:
  - IBM Plex Sans
  - IBM Plex Serif  
  - IBM Plex Mono
  - All weights: Extra Light, Light, Regular, Medium, Italic, etc.

### Font Styling
- Default to lightweight font weights
- Main heading: All uppercase, large size
- Use sensible default font sizes (can be adjusted later)

## Content Structure
1. **Main Heading**: "WEBSITE COMING SOON"
   - IBM Plex Serif
   - All uppercase
   - Large size
   
2. **Subheading**: "Let's connect while I build (with help from Claude Code)."
   - IBM Plex Sans or IBM Plex Mono
   
3. **Social Media Icons**
   - Square icons with rounded edges
   - Links:
     - X: https://x.com/AmandaMashburn
     - LinkedIn: https://www.linkedin.com/in/amandamashburn/
     - GitHub: https://github.com/amandamashburn
   - All links open in new tabs
   - Include `rel="noopener noreferrer"` for security

## Technical Requirements
- Built with Next.js using modern best practices
- Use App Router (current Next.js standard)
- TypeScript enabled
- Use current best practice icon library for Next.js (e.g., Lucide React, React Icons)
- Deployed to Vercel
- Responsive design (mobile-friendly)

## Accessibility
- Proper semantic HTML
- ARIA labels for icon links
- Sufficient color contrast (black on white)