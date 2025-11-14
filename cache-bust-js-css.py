import os
import hashlib
import re
from pathlib import Path

def generate_file_hash(file_path):
    """Generate a hash of the file's content"""
    with open(file_path, 'rb') as f:
        file_hash = hashlib.md5(f.read()).hexdigest()[:8]
    return file_hash

def update_file_references(html_path, file_name, new_hash):
    """Update HTML file with new hashed filenames"""
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match existing hashed or non-hashed filenames
    pattern_map = {
        'css': r'(href="[^"]*?/?)(' + re.escape(file_name) + r')(\?v=[a-f0-9]*)?(")',
        'js': r'(src="[^"]*?/?)(' + re.escape(file_name) + r')(\?v=[a-f0-9]*)?(")'
    }
    
    replacement = fr'\1\2?v={new_hash}\4'
    updated_content, subs = re.subn(
        pattern_map[file_name.split('.')[-1]],
        replacement,
        content,
        flags=re.IGNORECASE
    )
    
    if subs > 0:
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        return True
    return False

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = Path(os.path.join(base_dir, 'public'))
    html_path = public_dir / 'index.html'
    
    if not html_path.exists():
        print("Error: index.html not found in the public directory")
        return
    
    for file in public_dir.iterdir():
        if not file.is_file():
            continue
        if not (file.name.endswith('.css') or file.name.endswith('.js')):
            continue
        
        file_path = public_dir / file.name
        file_hash = generate_file_hash(file_path)
        updated = update_file_references(html_path, file.name, file_hash)
        
        if updated:
            print(f"Updated {file.name} with hash: {file_hash}")
        else:
            print(f"Warning: Could not update reference to {file.name} in HTML")

if __name__ == "__main__":
    main()