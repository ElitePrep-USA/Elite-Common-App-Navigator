Elite Common App Navigator — Version 1.1

WHAT CHANGED
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
