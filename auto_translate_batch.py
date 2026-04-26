import re
import time
from deep_translator import GoogleTranslator

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

with open('js/translations.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

pattern = re.compile(r'^(\s*"([^"]+)"\s*:\s*\{\s*es:\s*([\'"`])(.*?)\3\s*,\s*en:\s*([\'"`])(.*?)\5\s*)(.*)$')

# Collect all translatable lines
to_translate = []
for i, line in enumerate(lines):
    match = pattern.match(line)
    if match:
        key = match.group(2)
        es_quote = match.group(3)
        es_text = match.group(4)
        if '<svg' in es_text or not es_text.strip():
            continue
        to_translate.append({
            'index': i,
            'key': key,
            'text': es_text,
            'quote': es_quote,
            'prefix': match.group(1),
            'suffix': match.group(7)
        })

print(f"Total keys to translate: {len(to_translate)}")

# Batch translation
batch_size = 50
for lang in targets.keys():
    print(f"Translating to {lang}...")
    for i in range(0, len(to_translate), batch_size):
        batch = to_translate[i:i+batch_size]
        texts = [item['text'] for item in batch]
        try:
            translated_batch = translators[lang].translate_batch(texts)
            for j, t in enumerate(translated_batch):
                batch[j][lang] = t
        except Exception as e:
            print(f"Error in batch {i}: {e}")
            for j in range(len(batch)):
                batch[j][lang] = batch[j]['text']
        time.sleep(1)

# Reconstruct lines
for item in to_translate:
    idx = item['index']
    original_line = lines[idx]
    es_quote = item['quote']
    
    # We reconstruct the dict. 
    # original_line is like:   "nav.home": { es: "Inicio", en: "Home" },
    # We want to insert the new languages before the closing brace '}'
    
    # Find the closing brace in the suffix
    suffix = item['suffix']
    brace_idx = suffix.find('}')
    
    if brace_idx != -1:
        new_langs_str = ""
        for lang in targets.keys():
            t = item.get(lang, item['text'])
            if t is None: t = item['text']
            # escape quotes
            if es_quote == '"': t = t.replace('"', '\\"')
            elif es_quote == "'": t = t.replace("'", "\\'")
            new_langs_str += f", {lang}: {es_quote}{t}{es_quote}"
            
        new_line = item['prefix'] + new_langs_str + " " + suffix
        lines[idx] = new_line

with open('js/translations.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Done. File updated.")
