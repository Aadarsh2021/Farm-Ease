const fs = require('fs');
let text = fs.readFileSync('eslint.json', 'utf8');
if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
}
const data = JSON.parse(text);
data.forEach(f => {
    if (f.errorCount > 0) {
        console.log(f.filePath.replace(process.cwd(), '.'));
        f.messages.forEach(m => {
            if (m.severity === 2) console.log('  Line ' + m.line + ': ' + m.message + ' (' + m.ruleId + ')');
        });
    }
});
