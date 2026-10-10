"""Build the portable release zip. Generated zip is ignored; local music stays alongside HTML."""
from pathlib import Path
import subprocess
import zipfile
root = Path(__file__).resolve().parent
subprocess.run(['python3', str(root / 'build.py')], check=True)
files = [root / 'SmallHours.html', root / 'AUDIO_CREDITS.md', root / 'README.md', root / 'CHANGELOG.md']
files += list((root / 'assets' / 'audio').glob('*'))
output = root / 'SmallHours-v1.5-preview.zip'
with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as z:
    for f in files:
        if not f.is_file():
            raise FileNotFoundError(f)
        z.write(f, f.relative_to(root))
print(f'Packaged {len(files)} files, {output.stat().st_size / 1_000_000:.2f} MB: {output.name}')
