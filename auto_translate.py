import re
import time
from deep_translator import GoogleTranslator

# Target languages
targets = {
    'fr': 'fr',
    'it': 'it',
    'pt': 'pt',
    'de': 'de',
    'ja': 'ja',
    'zh': 'zh-CN',
    'ko': 'ko'
}

translators = {lang: GoogleTranslator(source='es', target=code) for lang, code in targets.items()}

def translate_text(text, lang):
    try:
        # sleep slightly to avoid rate limit
        time.sleep(0.1)
        res = translators[lang].translate(text)
        return res
    except Exception as e:
        print(f"Error translating to {lang}: {e}")
        return text

with open('js/translations.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
pattern = re.compile(r'^\s*"([^"]+)"\s*:\s*\{\s*es:\s*([\'"`])(.*?)\2\s*,\s*en:\s*([\'"`])(.*?)\4\s*\},?\s*$')

count = 0
for line in lines:
    match = pattern.match(line)
    if match:
        key = match.group(1)
        es_quote = match.group(2)
        es_text = match.group(3)
        en_quote = match.group(4)
        en_text = match.group(5)
        
        # Don't translate SVG lines or very long HTML chunks if they are complex, just to be safe
        if '<svg' in es_text:
            new_lines.append(line)
            continue
            
        print(f"Translating {key}...")
        
        translated_dict = {}
        for lang in targets.keys():
            # translate text
            t = translate_text(es_text, lang)
            # escape quotes if needed based on original quote type
            if es_quote == '"':
                t = t.replace('"', '\\"')
            elif es_quote == "'":
                t = t.replace("'", "\\'")
            translated_dict[lang] = t
            
        # Build the new dict string
        new_dict_inner = f'es: {es_quote}{es_text}{es_quote}, en: {en_quote}{en_text}{en_quote}'
        for lang in targets.keys():
            new_dict_inner += f', {lang}: {es_quote}{translated_dict[lang]}{es_quote}'
            
        # Keep trailing comma if it had one
        has_comma = ',' in line.split('}')[-1]
        comma_str = ',' if has_comma else ''
        
        new_line = f'  "{key}": {{ {new_dict_inner} }}{comma_str}\n'
        new_lines.append(new_line)
        count += 1
        
        # Stop after a batch to avoid timeouts for now, or let it run fully?
        # 400 keys * 7 = 2800 calls. At 0.1s sleep = 280s. 
        # Let's just do it fully.
    else:
        new_lines.append(line)

with open('js/translations.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Done. Translated {count} keys.")
