const fs = require('fs');
const filePath = 'C:/Users/sande/Downloads/2nd COURSE APP EMBE1/frontend/tailwind.config.js';

let content = fs.readFileSync(filePath, 'utf8');

// The error is because `designTokens.colors.radii` should be `designTokens.radii`, etc.
content = content.replace(/designTokens\.colors\.radii/g, 'designTokens.radii');
content = content.replace(/designTokens\.colors\.spacing/g, 'designTokens.spacing');
content = content.replace(/designTokens\.colors\.shadows/g, 'designTokens.shadows');
content = content.replace(/designTokens\.colors\.typography/g, 'designTokens.typography');
content = content.replace(/designTokens\.colors\.transitions/g, 'designTokens.transitions');
content = content.replace(/designTokens\.colors\.zIndex/g, 'designTokens.zIndex');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed tailwind.config.js');
