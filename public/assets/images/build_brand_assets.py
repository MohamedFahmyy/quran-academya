import os
import math
from PIL import Image, ImageDraw, ImageFilter

def simplify_dp(pts, tol=1.2):
    if len(pts) <= 2:
        return pts
    dmax = 0.0
    idx = 0
    p1 = pts[0]
    p2 = pts[-1]
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    norm = math.hypot(dx, dy)
    for i in range(1, len(pts)-1):
        p = pts[i]
        d = abs(dy * p[0] - dx * p[1] + p2[0]*p1[1] - p2[1]*p1[0]) / norm if norm > 1e-6 else math.hypot(p[0]-p1[0], p[1]-p1[1])
        if d > dmax:
            dmax = d
            idx = i
    if dmax > tol:
        res1 = simplify_dp(pts[:idx+1], tol)
        res2 = simplify_dp(pts[idx:], tol)
        return res1[:-1] + res2
    else:
        return [p1, p2]

def trace_loops(grid, w, h):
    edges = set()
    for y in range(h):
        for x in range(w):
            val = grid[y][x]
            rval = grid[y][x+1] if x+1 < w else False
            if val != rval:
                edges.add(((x+1, y), (x+1, y+1)) if val else ((x+1, y+1), (x+1, y)))
            dval = grid[y+1][x] if y+1 < h else False
            if val != dval:
                edges.add(((x+1, y+1), (x, y+1)) if val else ((x, y+1), (x+1, y+1)))
            if x == 0 and val:
                edges.add(((0, y+1), (0, y)))
            if y == 0 and val:
                edges.add(((0, 0), (1, 0)))
    
    adj = {}
    for p1, p2 in edges:
        adj.setdefault(p1, []).append(p2)
    
    visited = set()
    loops = []
    for start_p in list(adj.keys()):
        while True:
            next_nodes = [n for n in adj.get(start_p, []) if (start_p, n) not in visited]
            if not next_nodes:
                break
            loop = [start_p]
            curr = start_p
            while True:
                out = [n for n in adj.get(curr, []) if (curr, n) not in visited]
                if not out:
                    break
                nxt = out[0]
                visited.add((curr, nxt))
                curr = nxt
                if curr == start_p:
                    break
                loop.append(curr)
            if len(loop) > 4:
                loops.append(loop)
    return loops

def main():
    base_dir = r"D:\laragon\www\MuslimProApp_Flutter\assets\branding"
    ref_dir = os.path.join(base_dir, "reference")
    os.makedirs(base_dir, exist_ok=True)
    
    # Load primary tight cropped asset
    tight_path = os.path.join(ref_dir, "primary_logo_tight.png")
    img_tight = Image.open(tight_path).convert("RGBA")
    tw, th = img_tight.size
    
    # 4x upscale for crisp 4K asset generation
    scale = 4
    high_w, high_h = tw * scale, th * scale
    img_hi = img_tight.resize((high_w, high_h), Image.Resampling.LANCZOS)
    
    # 1. Clean color normalization on 4x asset
    # Primary Green: #075B4E -> (7, 91, 78)
    # Deep Green: #064536 -> (6, 69, 54)
    # Gold: #D4AF37 -> (212, 175, 55)
    # Light Gold: #E8C96A -> (232, 201, 106)
    
    clean_primary = Image.new("RGBA", (high_w, high_h), (0, 0, 0, 0))
    clean_monochrome = Image.new("RGBA", (high_w, high_h), (0, 0, 0, 0))
    clean_dark = Image.new("RGBA", (high_w, high_h), (6, 69, 54, 255))
    
    hi_px = img_hi.load()
    prim_px = clean_primary.load()
    mono_px = clean_monochrome.load()
    dark_px = clean_dark.load()
    
    # Also prepare 2x grid for SVG vectorization
    svg_scale = 2
    img_svg_ref = img_tight.resize((tw * svg_scale, th * svg_scale), Image.Resampling.LANCZOS)
    sw, sh = img_svg_ref.size
    svg_px = img_svg_ref.load()
    
    green_grid = [[False]*sw for _ in range(sh)]
    gold_grid = [[False]*sw for _ in range(sh)]
    
    for y in range(sh):
        for x in range(sw):
            r, g, b, a = svg_px[x, y]
            if a > 95:
                # Green logic
                if (g > r + 5 and r < 120) or (r < 50 and g > 35 and b < 80):
                    green_grid[y][x] = True
                # Gold logic
                elif (r > b + 20 and g > b + 10 and b < 145):
                    gold_grid[y][x] = True
    
    for y in range(high_h):
        for x in range(high_w):
            r, g, b, a = hi_px[x, y]
            if a < 20:
                continue
            
            # Determine element: Green vs Gold vs Stand
            # Note: in primary logo, x < 184*scale is symbol, x >= 215*scale is text
            # In text: 'Al Quran' is upper, 'ACADEMY' is lower
            is_green = (g > r + 5 and r < 120) or (r < 50 and g > 35 and b < 80)
            is_gold = (r > b + 20 and g > b + 10 and b < 145)
            
            # Text 'Al Quran' vs 'ACADEMY' boundary in y
            # In text area, y > 75*scale is 'ACADEMY' (gold)
            if x >= 200 * scale:
                if y > 78 * scale:
                    is_gold = True
                    is_green = False
                else:
                    is_green = True
                    is_gold = False
            
            alpha_f = a / 255.0
            
            if is_gold:
                prim_px[x, y] = (212, 175, 55, a)
                mono_px[x, y] = (6, 69, 54, a)
                dark_px[x, y] = (212, 175, 55, a)
            elif is_green:
                prim_px[x, y] = (7, 91, 78, a)
                mono_px[x, y] = (6, 69, 54, a)
                # In dark version, 'Al Quran' is pure white #FFFFFF, and symbol is gold #D4AF37
                if x >= 200 * scale:
                    dark_px[x, y] = (255, 255, 255, a)
                else:
                    dark_px[x, y] = (212, 175, 55, a)
            else:
                prim_px[x, y] = (r, g, b, a)
                mono_px[x, y] = (6, 69, 54, a)
                dark_px[x, y] = (212, 175, 55, a)
    
    # Save 1. logo_primary.png
    prim_path = os.path.join(base_dir, "logo_primary.png")
    clean_primary.save(prim_path, "PNG")
    print(f"Saved: {prim_path} ({high_w}x{high_h})")
    
    # Save 4. logo_monochrome.png
    mono_path = os.path.join(base_dir, "logo_monochrome.png")
    clean_monochrome.save(mono_path, "PNG")
    print(f"Saved: {mono_path} ({high_w}x{high_h})")
    
    # Save 5. logo_dark.png
    dark_path = os.path.join(base_dir, "logo_dark.png")
    clean_dark.save(dark_path, "PNG")
    print(f"Saved: {dark_path} ({high_w}x{high_h})")
    
    # 2. Build logo_primary.svg
    print("Tracing vector contours for logo_primary.svg...")
    green_loops = trace_loops(green_grid, sw, sh)
    gold_loops = trace_loops(gold_grid, sw, sh)
    
    simp_green = [simplify_dp(loop, 0.8) for loop in green_loops if len(loop) > 5]
    simp_gold = [simplify_dp(loop, 0.8) for loop in gold_loops if len(loop) > 5]
    
    svg_lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {sw} {sh}" width="{sw}" height="{sh}">',
        f'  <title>Al Quran Academy Logo</title>',
        f'  <!-- Primary Green Elements: Open Quran Outer Pages, Crescent, Rehal Stand, "Al Quran" Text -->',
        f'  <g id="primary-green" fill="#075B4E" fill-rule="evenodd">',
    ]
    for loop in simp_green:
        if len(loop) > 2:
            d = 'M ' + ' L '.join(f'{p[0]:.1f},{p[1]:.1f}' for p in loop) + ' Z'
            svg_lines.append(f'    <path d="{d}" />')
    svg_lines.append('  </g>')
    svg_lines.append(f'  <!-- Gold Elements: Inner Page Gilding, Side Diamond Ornaments, "ACADEMY" Text -->')
    svg_lines.append(f'  <g id="gold" fill="#D4AF37" fill-rule="evenodd">')
    for loop in simp_gold:
        if len(loop) > 2:
            d = 'M ' + ' L '.join(f'{p[0]:.1f},{p[1]:.1f}' for p in loop) + ' Z'
            svg_lines.append(f'    <path d="{d}" />')
    svg_lines.append('  </g>')
    svg_lines.append('</svg>')
    
    svg_path = os.path.join(base_dir, "logo_primary.svg")
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg_lines))
    print(f"Saved: {svg_path} (Pure Vector SVG, size: {os.path.getsize(svg_path)} bytes)")
    
    # 3. Build logo_icon.png (1024x1024 Square 1:1 App Icon)
    # Extract only the symbol portion (x: 0..184*scale)
    sym_w = int(184 * scale)
    symbol_crop = clean_primary.crop((0, 0, sym_w, high_h))
    
    # Convert symbol to Gold for App Icon (as shown in reference image!)
    gold_symbol = Image.new("RGBA", symbol_crop.size, (0, 0, 0, 0))
    gs_px = gold_symbol.load()
    sc_px = symbol_crop.load()
    for y in range(high_h):
        for x in range(sym_w):
            r, g, b, a = sc_px[x, y]
            if a > 0:
                # Gold emblem on green background
                gs_px[x, y] = (212, 175, 55, a)
    
    # App icon square 1:1 (1024x1024) with rounded squircle
    icon_size = 1024
    app_icon = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(app_icon)
    # Rounded rectangle background in Deep Green #064536
    corner_r = 224
    draw.rounded_rectangle([0, 0, icon_size, icon_size], radius=corner_r, fill=(6, 69, 54, 255))
    
    # Scale gold symbol to fit with safe margin (~680x480)
    target_sym_w = 700
    target_sym_h = int(target_sym_w * (high_h / sym_w))
    scaled_gold_sym = gold_symbol.resize((target_sym_w, target_sym_h), Image.Resampling.LANCZOS)
    
    offset_x = (icon_size - target_sym_w) // 2
    offset_y = (icon_size - target_sym_h) // 2
    app_icon.paste(scaled_gold_sym, (offset_x, offset_y), scaled_gold_sym)
    
    icon_path = os.path.join(base_dir, "logo_icon.png")
    app_icon.save(icon_path, "PNG")
    print(f"Saved: {icon_path} (1024x1024)")
    
    # 6. Build splash_logo.png (1024x1024 centered for Flutter splash)
    splash_logo = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    # In splash, horizontal logo scaled to 880px wide
    splash_w = 880
    splash_h = int(splash_w * (high_h / high_w))
    scaled_prim = clean_primary.resize((splash_w, splash_h), Image.Resampling.LANCZOS)
    sp_x = (1024 - splash_w) // 2
    sp_y = (1024 - splash_h) // 2
    splash_logo.paste(scaled_prim, (sp_x, sp_y), scaled_prim)
    
    splash_path = os.path.join(base_dir, "splash_logo.png")
    splash_logo.save(splash_path, "PNG")
    print(f"Saved: {splash_path} (1024x1024)")
    
    # 7. Android Adaptive Launcher Icons
    # ic_launcher_background.png: 432x432 solid #064536
    bg_size = 432
    launcher_bg = Image.new("RGBA", (bg_size, bg_size), (6, 69, 54, 255))
    launcher_bg_path = os.path.join(base_dir, "ic_launcher_background.png")
    launcher_bg.save(launcher_bg_path, "PNG")
    print(f"Saved: {launcher_bg_path} (432x432)")
    
    # ic_launcher_foreground.png: 432x432 transparent with gold symbol inside 288x288 safe circle
    launcher_fg = Image.new("RGBA", (bg_size, bg_size), (0, 0, 0, 0))
    # Safe zone: diameter 288, center (216, 216)
    # Fit symbol inside width 250, height ~170
    fg_sym_w = 250
    fg_sym_h = int(fg_sym_w * (high_h / sym_w))
    scaled_fg_sym = gold_symbol.resize((fg_sym_w, fg_sym_h), Image.Resampling.LANCZOS)
    fg_x = (bg_size - fg_sym_w) // 2
    fg_y = (bg_size - fg_sym_h) // 2
    launcher_fg.paste(scaled_fg_sym, (fg_x, fg_y), scaled_fg_sym)
    
    launcher_fg_path = os.path.join(base_dir, "ic_launcher_foreground.png")
    launcher_fg.save(launcher_fg_path, "PNG")
    print(f"Saved: {launcher_fg_path} (432x432)")

    # Also update assets/images/splash.png with the new splash logo
    images_dir = r"D:\laragon\www\MuslimProApp_Flutter\assets\images"
    os.makedirs(images_dir, exist_ok=True)
    splash_full = Image.new("RGBA", (1080, 1920), (6, 69, 54, 255))
    # Center splash logo on dark emerald background
    dark_sym_w = 640
    dark_sym_h = int(dark_sym_w * (high_h / sym_w))
    dark_sym_scaled = gold_symbol.resize((dark_sym_w, dark_sym_h), Image.Resampling.LANCZOS)
    ds_x = (1080 - dark_sym_w) // 2
    ds_y = 650
    splash_full.paste(dark_sym_scaled, (ds_x, ds_y), dark_sym_scaled)
    splash_full.save(os.path.join(images_dir, "splash.png"), "PNG")
    print(f"Updated: {os.path.join(images_dir, 'splash.png')}")

    # Generate Android res mipmap icons for all densities
    res_dir = r"D:\laragon\www\MuslimProApp_Flutter\android\app\src\main\res"
    densities = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432),
    }
    
    for folder, (icon_sz, fg_sz) in densities.items():
        target_dir = os.path.join(res_dir, folder)
        os.makedirs(target_dir, exist_ok=True)
        
        # Legacy square/rounded icon
        res_icon = app_icon.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
        res_icon.save(os.path.join(target_dir, "ic_launcher.png"), "PNG")
        
        # Legacy circular round icon
        round_icon = Image.new("RGBA", (icon_sz, icon_sz), (0, 0, 0, 0))
        r_draw = ImageDraw.Draw(round_icon)
        r_draw.ellipse([0, 0, icon_sz, icon_sz], fill=(6, 69, 54, 255))
        sym_round_w = int(icon_sz * 0.72)
        sym_round_h = int(sym_round_w * (high_h / sym_w))
        sym_round_scaled = gold_symbol.resize((sym_round_w, sym_round_h), Image.Resampling.LANCZOS)
        rx = (icon_sz - sym_round_w) // 2
        ry = (icon_sz - sym_round_h) // 2
        round_icon.paste(sym_round_scaled, (rx, ry), sym_round_scaled)
        round_icon.save(os.path.join(target_dir, "ic_launcher_round.png"), "PNG")
        
        # Adaptive foreground png
        fg_scaled = launcher_fg.resize((fg_sz, fg_sz), Image.Resampling.LANCZOS)
        fg_scaled.save(os.path.join(target_dir, "ic_launcher_foreground.png"), "PNG")
        print(f"Generated Android icons for {folder}: {icon_sz}x{icon_sz} & fg {fg_sz}x{fg_sz}")
    
    # Generate mipmap-anydpi-v26 adaptive XMLs
    v26_dir = os.path.join(res_dir, "mipmap-anydpi-v26")
    os.makedirs(v26_dir, exist_ok=True)
    
    with open(os.path.join(v26_dir, "ic_launcher.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n')
        f.write('<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n')
        f.write('    <background android:drawable="@drawable/ic_launcher_background" />\n')
        f.write('    <foreground android:drawable="@mipmap/ic_launcher_foreground" />\n')
        f.write('</adaptive-icon>\n')
        
    with open(os.path.join(v26_dir, "ic_launcher_round.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n')
        f.write('<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n')
        f.write('    <background android:drawable="@drawable/ic_launcher_background" />\n')
        f.write('    <foreground android:drawable="@mipmap/ic_launcher_foreground" />\n')
        f.write('</adaptive-icon>\n')
    
    # Generate drawable/ic_launcher_background.xml
    drawable_dir = os.path.join(res_dir, "drawable")
    os.makedirs(drawable_dir, exist_ok=True)
    with open(os.path.join(drawable_dir, "ic_launcher_background.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n')
        f.write('<color xmlns:android="http://schemas.android.com/apk/res/android"\n')
        f.write('    android:color="#064536" />\n')
        
    print("mipmap-anydpi-v26 and drawable/ic_launcher_background.xml created successfully!")

if __name__ == "__main__":
    main()

