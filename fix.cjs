const fs = require('fs');
let text = fs.readFileSync('/app/src/pages/AdminDashboard.jsx', 'utf8');

text = text.replace(/CrÃtico/g, 'Crítico');
text = text.replace(/âœ…/g, '✅');
text = text.replace(/NingÃºn/g, 'Ningún');
text = text.replace(/estÃ¡/g, 'está');
text = text.replace(/vacÃo/g, 'vacío');
text = text.replace(/histÃ³rico/g, 'histórico');
text = text.replace(/anÃ¡lisis/g, 'análisis');
text = text.replace(/SECCIÃ“N/g, 'SECCIÓN');
text = text.replace(/RevisiÃ³n/g, 'Revisión');

fs.writeFileSync('/app/src/pages/AdminDashboard.jsx', text, 'utf8');
