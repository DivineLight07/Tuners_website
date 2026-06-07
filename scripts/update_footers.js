const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '../views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));

const facebookOld = '<i data-lucide="facebook" class="w-4 h-4 text-[#1877F2]"></i>';
const facebookNew = '<img src="/images/Facebook.png" class="w-4 h-4 object-contain" alt="Facebook">';

const instagramOld = '<i data-lucide="instagram" class="w-4 h-4 text-[#E1306C]"></i>';
const instagramNew = '<img src="/images/Instagram.png" class="w-4 h-4 object-contain" alt="Instagram">';

const tiktokOld = '<i data-lucide="music-2" class="w-4 h-4 text-[#ff0050]"></i>';
const tiktokNew = '<img src="/images/Tiktok.png" class="w-4 h-4 object-contain" alt="TikTok">';

files.forEach(file => {
    const filePath = path.join(viewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    content = content.replace(facebookOld, facebookNew);
    content = content.replace(instagramOld, instagramNew);
    content = content.replace(tiktokOld, tiktokNew);
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated footer in ${file}`);
});
