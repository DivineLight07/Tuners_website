const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const jsDir = path.join(__dirname, 'public', 'js');

// 1. Fix Navbar Hidden Class in JS Files
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
for (const file of jsFiles) {
  const filePath = path.join(jsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes("navbar.classList.add('hidden')")) {
    content = content.replace(/navbar\.classList\.add\('hidden'\)/g, "navbar.classList.add('-translate-y-full')");
    content = content.replace(/navbar\.classList\.remove\('hidden'\)/g, "navbar.classList.remove('-translate-y-full')");
    fs.writeFileSync(filePath, content);
    console.log(`Updated navbar logic in ${file}`);
  }
}

// 2. New Footer Template
const newFooter = `<!-- FOOTER -->
  <footer class="w-full bg-[#0a1a3e]/65 backdrop-blur-md border-t border-white/15 py-10 mt-auto relative overflow-hidden" id="site-footer">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[100px] bg-primary/10 blur-[80px] pointer-events-none"></div>
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-8 relative z-10">
      <div class="flex flex-col">
        <h3 class="text-xl font-display font-bold mb-4 tracking-wider flex items-center gap-2"><i data-lucide="music"></i> Tuners MIU</h3>
        <p class="text-white/60 text-sm mb-4 leading-relaxed">The official music club of Misr International University. Bringing harmony to campus life.</p>
        <div class="mt-auto">
          <h4 class="text-sm font-semibold mb-2 text-white/80">Contact Us</h4>
          <a href="mailto:tuners.miu.eg@gmail.com" class="inline-flex items-center gap-2 text-primary-400 hover:text-white transition-colors text-sm font-medium"><i data-lucide="mail" class="w-4 h-4"></i> tuners.miu.eg@gmail.com</a>
        </div>
      </div>
      <div>
        <h3 class="text-xl font-display font-bold mb-4 tracking-wider">Follow Us</h3>
        <ul class="space-y-3">
          <li><a href="https://www.instagram.com/tunersclubmiu" target="_blank" class="inline-flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/15 hover:text-white transition-colors text-white/80 w-full sm:w-auto"><i data-lucide="instagram" class="w-4 h-4 text-[#E1306C]"></i> Instagram</a></li>
          <li><a href="https://www.facebook.com/TunersClubMIU" target="_blank" class="inline-flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/15 hover:text-white transition-colors text-white/80 w-full sm:w-auto"><i data-lucide="facebook" class="w-4 h-4 text-[#1877F2]"></i> Facebook</a></li>
          <li><a href="https://www.tiktok.com/@tunersmusic" target="_blank" class="inline-flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/15 hover:text-white transition-colors text-white/80 w-full sm:w-auto"><i data-lucide="music-2" class="w-4 h-4 text-[#ff0050]"></i> TikTok</a></li>
        </ul>
      </div>
      <div>
        <h3 class="text-xl font-display font-bold mb-4 tracking-wider">Quick Links</h3>
        <div class="grid grid-cols-2 gap-2">
          <a href="/home" class="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/15 transition-colors text-white/80 hover:text-white text-sm text-center">Home</a>
          <a href="/about" class="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/15 transition-colors text-white/80 hover:text-white text-sm text-center">About Us</a>
          <a href="/courses" class="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/15 transition-colors text-white/80 hover:text-white text-sm text-center">Courses</a>
          <a href="/apply" class="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/15 transition-colors text-white/80 hover:text-white text-sm text-center">Apply</a>
        </div>
      </div>
    </div>
    <div class="max-w-6xl mx-auto px-8 mt-10 pt-6 border-t border-white/10 text-center">
      <p class="text-white/40 text-xs">© 2026 Tuners Club MIU. All rights reserved.</p>
    </div>
  </footer>`;

// 3. Fix EJS Files
const viewFiles = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));
for (const file of viewFiles) {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix Logout Button
  const oldLogoutBtn = 'class="px-4 py-2 bg-white/10 hover:bg-white/20 hover:-translate-y-[1px] border border-white/20 rounded-lg text-[0.9rem] font-semibold transition-all"';
  const newLogoutBtn = 'class="px-4 py-2 bg-white/10 hover:bg-white/20 hover:-translate-y-[1px] border border-white/20 rounded-lg text-[0.9rem] font-semibold transition-all text-destructive border-destructive/50 hover:bg-destructive/20"';
  content = content.replace(oldLogoutBtn, newLogoutBtn);

  // Replace Footer
  const footerStartRegex = /<!-- FOOTER -->[\s\S]*?<footer[\s\S]*?<\/footer>/;
  if (footerStartRegex.test(content)) {
    content = content.replace(footerStartRegex, newFooter);
    console.log(`Updated footer and button in ${file}`);
  }

  fs.writeFileSync(filePath, content);
}
