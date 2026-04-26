import glob
import re

html_files = glob.glob('*.html')

# We want to remove the button lines for fr, it, pt, de, ja, zh, ko from the lang-dropdown
# For example: <button class="lang-option" data-lang="fr">🇫🇷 Français</button>

pattern = re.compile(r'\s*<button class="lang-option" data-lang="(fr|it|pt|de|ja|zh|ko)">.*?</button>\n?')

count = 0
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content, num_subs = pattern.subn('', content)
    
    if num_subs > 0:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1

print(f"Updated {count} files.")
