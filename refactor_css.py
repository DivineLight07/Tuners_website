import os
import re

ejs_dir = r'c:\Users\Nour Azmy\Desktop\Tuners\views'
css_dir = r'c:\Users\Nour Azmy\Desktop\Tuners\public\css'

base_css = '''html {
    scroll-behavior: smooth;
}
body {
    font-family: 'Poppins', sans-serif;
    color: #ffffff;
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    min-height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
    background-image: url('/images/IMG_4362.png');
}
body::after {
    content: '';
    position: fixed;
    inset: 0;
    background-color: rgba(10, 26, 62, 0.65);
    z-index: -1;
}
.lucide { width: 1em; height: 1em; }
.hidden { display: none !important; }

/* Admin Modal Styles */
.modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    backdrop-filter: blur(4px);
    display: none;
}
.modal-content {
    background-color: #0a1a3e;
    border-radius: 1rem;
    padding: 2rem;
    width: 100%;
    max-width: 42rem;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
.modal-close {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    font-size: 1.5rem;
    line-height: 1;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: color 150ms;
}
.modal-close:hover {
    color: #ffffff;
}
.form-input {
    width: 100%;
    height: 2.75rem;
    padding-left: 1rem;
    padding-right: 1rem;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: #ffffff;
    transition: all 150ms;
}
.form-input:focus {
    outline: none;
    border-color: #1f6feb;
    box-shadow: 0 0 0 1px #1f6feb;
}
.form-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
}
.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.8);
}
.btn-primary {
    padding: 0.5rem 1rem;
    background-color: #1f6feb;
    color: #ffffff;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 150ms;
    border: none;
    cursor: pointer;
}
.btn-primary:hover {
    background-color: #1a48a8;
}
#Msg {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background-color: rgba(34, 197, 94, 0.9);
    backdrop-filter: blur(4px);
    color: #ffffff;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    z-index: 10001;
    display: none;
    font-weight: 500;
}
'''

admin_dashboard_css = '''
.admin-card {
    background-color: rgba(10, 26, 62, 0.45);
    backdrop-filter: blur(12px);
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.09);
    padding: 1.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    margin-bottom: 1.5rem;
}
.card-title {
    font-size: 1.5rem;
    font-weight: 700;
    font-family: 'Bebas Neue', sans-serif;
    letter-spacing: 0.025em;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.btn-delete {
    padding: 0.5rem 1rem;
    background-color: rgba(255, 107, 107, 0.8);
    color: #ffffff;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 150ms;
    border: none;
    cursor: pointer;
}
.btn-delete:hover {
    background-color: #ff6b6b;
}
.status-available {
    color: #4ade80;
    font-weight: 500;
    background-color: rgba(74, 222, 128, 0.1);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
}
.status-occupied {
    color: #f87171;
    font-weight: 500;
    background-color: rgba(248, 113, 113, 0.1);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
}
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
    display: none;
}
'''

member_dashboard_css = '''
.dashboard-card {
    background-color: rgba(10, 26, 62, 0.45);
    backdrop-filter: blur(12px);
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.09);
    padding: 1.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
.card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.card-title {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: 'Bebas Neue', sans-serif;
    letter-spacing: 0.025em;
}
.badge-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
}
.badge-item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 600;
    background: linear-gradient(to right, rgba(31, 111, 235, 0.3), rgba(31, 111, 235, 0.1));
    color: #ffffff;
    border: 1px solid rgba(31, 111, 235, 0.4);
    box-shadow: 0 0 10px rgba(31, 111, 235, 0.15);
    transition: transform 150ms;
    cursor: default;
}
.badge-item:hover {
    transform: translateY(-0.125rem);
}
.status-active {
    color: #4ade80;
    font-weight: 500;
    background-color: rgba(74, 222, 128, 0.1);
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
}
.status-pending {
    color: #f87171;
    font-weight: 500;
    background-color: rgba(248, 113, 113, 0.1);
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
}
.application-card {
    padding: 1rem;
    border-radius: 0.75rem;
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 1rem;
    font-size: 0.875rem;
}
.application-meta {
    color: rgba(255, 255, 255, 0.6);
    margin-top: 0.25rem;
    font-size: 0.75rem;
}
.course-item {
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 0.5rem;
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.875rem;
}
.course-meta {
    margin-bottom: 0.5rem;
    color: rgba(255, 255, 255, 0.8);
}
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
    display: none;
}
'''

courses_css = '''
#search-btn:hover {
    background-color: #1f6feb;
    color: #ffffff;
    border-color: #1f6feb;
}
'''

home_page_css = '''
/* Gallery showcase section styles */
#gallery-showcase .group:nth-child(2) { transform: translateY(12px); }
#gallery-showcase .group:nth-child(5) { transform: translateY(12px); }

@keyframes gallery-shimmer {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
#gallery-showcase .group::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  border: 1px solid rgba(31, 111, 235, 0);
  transition: border-color 0.5s ease;
  pointer-events: none;
}
#gallery-showcase .group:hover::after {
  border-color: rgba(31, 111, 235, 0.4);
}
'''

login_css = '''
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
    display: none;
}
'''

files = [
    "About_us.ejs",
    "Admin_Dashboard.ejs",
    "Apply_Form.ejs",
    "Courses.ejs",
    "Gallery.ejs",
    "Login.ejs",
    "home_page.ejs",
    "member_dashboard.ejs"
]

for f in files:
    ejs_path = os.path.join(ejs_dir, f)
    css_name = f.replace(".ejs", ".css")
    css_path = os.path.join(css_dir, css_name)
    
    if not os.path.exists(ejs_path):
        continue

    with open(ejs_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Check if <style type="text/tailwindcss"> exists
    match = re.search(r'<style type="text/tailwindcss">.*?</style>\s*', content, flags=re.DOTALL)
    
    # Remove it if it exists
    if match:
        new_content = content[:match.start()] + content[match.end():]
        
        # Link the CSS right before the tailwind CDN script
        if f'<link href="/css/{css_name}" rel="stylesheet">' not in new_content:
            new_content = new_content.replace(
                '<script src="https://cdn.tailwindcss.com"></script>',
                f'<link href="/css/{css_name}" rel="stylesheet">\n  <script src="https://cdn.tailwindcss.com"></script>'
            )
        
        with open(ejs_path, 'w', encoding='utf-8') as file:
            file.write(new_content)
            
        print(f"Updated {f}")
        
    # Write to external CSS regardless of whether the style block existed (to ensure it's updated)
    final_css = base_css
    if f == "Admin_Dashboard.ejs":
        final_css += admin_dashboard_css
    elif f == "member_dashboard.ejs":
        final_css += member_dashboard_css
    elif f == "Courses.ejs":
        final_css += courses_css
    elif f == "home_page.ejs":
        final_css += home_page_css
    elif f == "Login.ejs":
        final_css += login_css
        
    with open(css_path, 'w', encoding='utf-8') as file:
        file.write(final_css)
    print(f"Wrote {css_name}")
