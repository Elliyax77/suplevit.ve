const p = "C:\\Users\\ReneBond\\Dropbox (Personal)\\Elias - Rene\\Antigravity\\suplevit-page\\public\\tablas nutricionales\\tabla acido folinico triquetra.jpg";
const cleanPath = p.replace(/['"]/g, '');
const parts = cleanPath.split(/[\\/]/);
const file = parts[parts.length - 1];
console.log(file);
console.log('/tablas%20nutricionales/' + encodeURIComponent(file));
