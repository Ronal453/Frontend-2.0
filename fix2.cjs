const fs = require('fs');
let text = fs.readFileSync('/app/src/pages/AdminDashboard.jsx', 'utf8');

// Replace "Alerta de Stock Crítico"
text = text.replace(/Alerta de Stock.*/g, 'Alerta de Stock Crítico');

// Replace the entire paragraph for Exportar Ventas
text = text.replace(/Descarga el historial de pedidos en CSV para.*/g, 'Descarga el historial de pedidos en CSV para análisis en Excel/Sheets. Deja vacío para exportar todo el histórico.');

// Remove emoji for Top productos
text = text.replace(/.*Top productos vendidos.*/g, '            Top productos vendidos');

// Remove checkmark emoji and fix text for Ningún producto
text = text.replace(/.*Ning.*n producto est.* por debajo de su umbral.*/g, '              Ningún producto está por debajo de su umbral');

fs.writeFileSync('/app/src/pages/AdminDashboard.jsx', text, 'utf8');
