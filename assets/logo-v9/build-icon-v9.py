"""Build FotoBro v9 app icons + splash from fotobro-logo-v9-final.webp (1600x1600).
Master icon: crop square centred on subject bbox (339,397)-(1172,1289) so the
girl+camera spans ~82% of the icon width; white full-bleed, RGB (no alpha).
Maskable: same subject at ~70% width so it survives the 80% safe-zone crop.
Splash light: full logo 1400px centred on white 2732x2732.
Splash dark (muc 14, 21/11/2026): logo 1400px, NEN TRANG DA TACH (logo_transparent
- flood vung trang noi bien + vung trang kin lon, alpha mem, khu trang vien),
tren nen DEN TUYEN #000000 2732x2732 (khop systemBackground dark + --bg dark
cua app), cung co 1400px nhu ban sang. BAN CU dan nguyen logo con nen trang
len #111111 -> o vuong trang giua man hinh den (anh Viet gui 19:28 21/11).
SVG: self-contained 512x512, white rect + base64-embedded 512px PNG render.
Run from ~/workspace/fotobro-ios-v1: python3 assets/logo-v9/build-icon-v9.py
Can numpy + scipy (chi cho logo_transparent); icon/splash sang khong can.
"""
import base64, io, os
from PIL import Image, ImageFilter

def logo_transparent(src_rgb):
    """Tach nen trang cua logo v9 -> RGBA, giu vien mem mau nuoc.
    Nen giay that ra ~246-255 (khong trang tinh). Vung nen = pixel gan trang
    (>=242) NOI LIEN ra bien + vung trang KHEP KIN lon (>500px: trong vong
    quai deo, 2 ben toc); dom trang nho (highlight ong kinh...) giu nguyen.
    Alpha mem theo do trang trong vung nen (+ gian 4px, mo Gaussian), roi
    khu trang vien (un-premultiply) de khong con vien trang tren nen den."""
    import numpy as np
    from scipy import ndimage
    a = np.asarray(src_rgb).astype(np.int16)
    mn = a.min(axis=2)
    lab, n = ndimage.label(mn >= 242)
    border = set(np.unique(np.concatenate(
        [lab[0, :], lab[-1, :], lab[:, 0], lab[:, -1]])).tolist()) - {0}
    bg = np.isin(lab, list(border))
    sizes = ndimage.sum_labels(np.ones_like(lab), lab, range(1, n + 1))
    big = [i + 1 for i, s in enumerate(sizes)
           if (i + 1) not in border and s > 500]
    if big:
        bg = bg | np.isin(lab, big)
    zone = ndimage.binary_dilation(bg, iterations=4)
    ramp = np.clip((245.0 - mn) / 55.0, 0.0, 1.0)  # mn>=245 -> 0 ; mn<=190 -> 1
    alpha = np.where(zone, ramp, 1.0)
    alpha_img = Image.fromarray((alpha * 255).astype('uint8'), 'L')
    alpha_img = alpha_img.filter(ImageFilter.GaussianBlur(1.5))
    alpha = np.asarray(alpha_img).astype(np.float32) / 255.0
    af = np.asarray(src_rgb).astype(np.float32)
    ac = alpha[..., None]
    with np.errstate(divide='ignore', invalid='ignore'):
        true = np.where(ac > 0.02, (af - 255.0 * (1.0 - ac)) / np.maximum(ac, 1e-3), 0.0)
    true = np.clip(true, 0, 255).astype('uint8')
    return Image.fromarray(np.dstack([true, (alpha * 255).astype('uint8')]), 'RGBA')

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'assets/logo-v9/fotobro-logo-v9-final.webp')
src = Image.open(SRC).convert('RGB')

def crop_master(subject_w, cx, cy):
    side = int(round(subject_w / (0.82 if subject_w == 833 else 0.70)))
    x0 = max(0, int(cx - side // 2)); y0 = max(0, int(cy - side // 2))
    x0 = min(x0, 1600 - side); y0 = min(y0, 1600 - side)
    return src.crop((x0, y0, x0 + side, y0 + side)).resize((1024, 1024), Image.LANCZOS)

# subject bbox measured: x 339-1172 (w 833), y 397-1289; centre (755, 843)
master = crop_master(833, 755, 843)
mask_master = src.crop((160, 248, 160 + 1190, 248 + 1190)).resize((1024, 1024), Image.LANCZOS)

def save(im, path, size):
    out = im.resize((size, size), Image.LANCZOS) if im.size[0] != size else im
    out.save(path, 'PNG', optimize=True)
    print(path, out.size, out.mode)

targets_1024 = ['assets/icon.png', 'AppIcon-1024.png',
                'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png']
for t in targets_1024:
    save(master, os.path.join(ROOT, t), 1024)
save(master, os.path.join(ROOT, 'www/icon-512.png'), 512)
save(master, os.path.join(ROOT, 'ios/App/App/public/icon-512.png'), 512)
save(master, os.path.join(ROOT, 'www/icon-192.png'), 192)
save(master, os.path.join(ROOT, 'ios/App/App/public/icon-192.png'), 192)
save(master, os.path.join(ROOT, 'www/apple-touch-icon.png'), 180)
save(master, os.path.join(ROOT, 'ios/App/App/public/apple-touch-icon.png'), 180)
save(mask_master, os.path.join(ROOT, 'www/icon-maskable-512.png'), 512)
save(mask_master, os.path.join(ROOT, 'ios/App/App/public/icon-maskable-512.png'), 512)

# --- splash ---
def splash(bg, logo_w, path):
    canvas = Image.new('RGB', (2732, 2732), bg)
    logo = src.resize((logo_w, logo_w), Image.LANCZOS)
    canvas.paste(logo, ((2732 - logo_w) // 2, (2732 - logo_w) // 2))
    canvas.save(path, 'PNG', optimize=True)
    print(path, canvas.size, canvas.mode)

splash((255, 255, 255), 1400, os.path.join(ROOT, 'assets/splash.png'))
for name in ['Default@1x~universal~anyany.png', 'Default@2x~universal~anyany.png',
             'Default@3x~universal~anyany.png']:
    splash((255, 255, 255), 1400,
           os.path.join(ROOT, 'ios/App/App/Assets.xcassets/Splash.imageset', name))
# Dark: logo da tach nen trang, 1400px nhu ban sang, tren nen den tuyen.
_dark_logo = logo_transparent(src).resize((1400, 1400), Image.LANCZOS)
for name in ['Default@1x~universal~anyany-dark.png', 'Default@2x~universal~anyany-dark.png',
             'Default@3x~universal~anyany-dark.png']:
    _canvas = Image.new('RGB', (2732, 2732), (0, 0, 0))
    _canvas.paste(_dark_logo, ((2732 - 1400) // 2, (2732 - 1400) // 2), _dark_logo)
    _p = os.path.join(ROOT, 'ios/App/App/Assets.xcassets/Splash.imageset', name)
    _canvas.save(_p, 'PNG', optimize=True)
    print(_p, _canvas.size, _canvas.mode)

# --- SVG (self-contained, raster embedded) ---
buf = io.BytesIO()
master.resize((512, 512), Image.LANCZOS).save(buf, 'PNG', optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode()
svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" '
       'aria-label="FotoBro — co gai om may anh, ca boi qua">\n'
       '  <rect width="512" height="512" fill="#FFFFFF"/>\n'
       '  <image href="data:image/png;base64,' + b64 + '" x="0" y="0" width="512" height="512"/>\n'
       '</svg>\n')
for p in ['www/icon.svg', 'ios/App/App/public/icon.svg']:
    with open(os.path.join(ROOT, p), 'w') as f:
        f.write(svg)
    print(p, len(svg), 'bytes')
