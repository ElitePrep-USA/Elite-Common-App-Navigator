Elite Common App Navigator — Version 1.3.2

WHAT CHANGED IN VERSION 1.3
1. Added Print / Save PDF to My Applications.
2. Added a dedicated landscape print layout with Elite branding, print date, selected-college summary, Requirements Comparison table, college-by-college Requirements Summary, and source footer.
3. The browser print dialog supports either physical printing or Save as PDF.
4. Interactive controls are hidden from the printed report.

VERSION 1.2 FEATURES RETAINED
1. Separated the interactive Common App section map and the Step-by-Step Guides into two independent primary navigation pages.
2. Added separate Home-page entry points for Common App Sections and Step-by-Step Guides so neither resource is hidden below the other.
3. Preserved the Version 1.1 complete glossary, comparison-table fix, Ask the Navigator, and requirements-summary approach.

VERSION 1.1 FEATURES RETAINED
1. Added a complete interactive Common App section map:
   Profile, Family, Education, Testing, Activities, Writing, Courses & Grades, and My Colleges.
   Clicking a section reveals its major areas, what the area is for, and an Elite counselor tip.

2. Replaced the partial glossary with the complete glossary from the uploaded
   Common App Application Dictionary (2025), including FY and TR badges from the source.

3. Fixed the My Applications comparison-table header overlap by removing the viewport-sticky
   table-header behavior that was obscuring the first comparison rows.

4. Added Ask the Navigator, a rule-based (non-AI) tool that answers questions from the
   colleges saved in My Applications using the 2026-27 Requirements Grid.

5. Removed duplicate application progress tracking. The requirements summary is now informational;
   students should use their Common App account, and advisors/directors can use Common App's
   Advisor view, for actual completion tracking.

FILES TO UPLOAD TO GITHUB PAGES
Upload the entire contents of this folder, preserving:
- index.html
- styles.css
- app.js
- .nojekyll
- assets/
- data/

DATA FILES
- data/requirements.js — 2026-27 Common App Requirements Grid dataset
- data/glossary.js — complete uploaded Common App Application Dictionary
- data/guides.js — Common App toolkit guide content
- data/sections.js — interactive section map

NOTES
College policies can change. The app intentionally treats blank Requirements Grid cells as
'Not indicated' rather than interpreting them as 'No.'

The Writing Supplement field in the Requirements Grid should not be treated as a complete
inventory of all college-specific writing questions.

VERSION 1.3.1 FIX
- Corrected the My Applications print stylesheet so the print-only Elite seal/header is hidden during normal screen viewing and appears only when printing or saving to PDF.

VERSION 1.3.2 BUG FIX
- Fixed the Home-page “Start the walkthrough” button so it opens Common App Sections.
- No other application behavior was intentionally changed.
