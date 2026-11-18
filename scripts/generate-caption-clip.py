"""Render and encode the original 12-second silent caption QA fixture."""
from math import sin
from pathlib import Path
import subprocess

from imageio_ffmpeg import get_ffmpeg_exe
from PIL import Image, ImageDraw, ImageFont

SIZE = (800, 450)
FPS = 24
DURATION = 12
DEST = Path(__file__).resolve().parent.parent / "public" / "caption"
FONT = ImageFont.load_default(size=28)
SMALL = ImageFont.load_default(size=22)


def mix(a, b, progress):
    return a + (b - a) * progress


def ease(progress):
    value = min(1, max(0, progress))
    return value * value * (3 - 2 * value)


def rounded(draw, bounds, radius, fill, outline=None):
    draw.rounded_rectangle(bounds, radius=radius, fill=fill, outline=outline)



class SoftDraw:
    """Draw in authored coordinates at 2x, then downsample once."""
    def __init__(self, image):
        self.draw = ImageDraw.Draw(image)
    def __getattr__(self, name):
        method = getattr(self.draw, name)
        def call(xy, *args, **kwargs):
            def scale(value):
                return tuple(scale(v) for v in value) if isinstance(value, (tuple, list)) else value * 2
            if name == "rounded_rectangle" and args:
                args = (args[0] * 2,) + args[1:]
            for key in ("width", "radius"):
                if key in kwargs:
                    kwargs[key] *= 2
            return method(scale(xy), *args, **kwargs)
        return call


def backdrop():
    image = Image.new("RGB", (1600, 900), "#e8eff9")
    draw = SoftDraw(image)
    draw.rounded_rectangle((25, 48, 270, 308), 30, fill="#d4e6ff")
    draw.rounded_rectangle((43, 65, 252, 278), 23, fill="#002060")
    draw.ellipse((142, 83, 214, 155), fill="#f25767")
    draw.polygon([(43, 247), (104, 189), (164, 233), (202, 201), (252, 241), (252, 278), (43, 278)], fill="#97b8e5")
    draw.line((146, 65, 146, 278), fill="#d4e6ff", width=5)
    draw.line((43, 174, 252, 174), fill="#d4e6ff", width=5)
    draw.rounded_rectangle((0, 317, 800, 474), 36, fill="#cbd9ea")
    draw.rounded_rectangle((639, 65, 759, 323), 30, fill="#b2c7df")
    draw.rounded_rectangle((652, 80, 745, 319), 22, fill="#dbe6f4")
    draw.rounded_rectangle((714, 212, 733, 219), 3, fill="#002060")
    draw.rounded_rectangle((291, 79, 422, 117), 19, fill="#f5f5f2")
    draw.text((356, 98), "A little field study", anchor="mm", font=SMALL, fill="#002060")
    draw.text((28, 24), "SYNTHETIC CAPTION STUDIO", font=SMALL, fill="#002060")
    draw.text((772, 24), "CAM 01", anchor="ra", font=SMALL, fill="#002060")
    return image


def actor(draw, x, dominant_hand, color, shadow, label, gait):
    # Soft editorial silhouettes; the two characters keep the original QA IDs.
    skin = "#d99b7a" if "MIRA" in label else "#efbb91"
    hair = "#30304b" if "MIRA" in label else "#5b3d38"
    ground = 365
    stride = sin(gait) * 13
    draw.ellipse((x-36, ground-6, x+37, ground+9), fill="#afc1d8")
    for hip, foot in ((-12, -18 + stride), (12, 18 - stride)):
        draw.line((x+hip, 273, x+hip*1.1, 319, x+foot, ground-4), width=19, fill="#344769", joint="curve")
        draw.rounded_rectangle((x+foot-11, ground-10, x+foot+18, ground+3), 6, fill="#f5f5f2")
        draw.line((x+foot-9, ground+3, x+foot+18, ground+3), fill="#344769", width=3)
    if "MIRA" in label:
        draw.ellipse((x-28, 132, x+28, 213), fill=hair)
    draw.rounded_rectangle((x-8, 183, x+8, 209), 7, fill=skin)
    draw.rounded_rectangle((x-29, 200, x+29, 282), 23, fill=color)
    draw.rounded_rectangle((x-27, 259, x+27, 281), 9, fill=color)
    draw.arc((x-11, 193, x+11, 215), 0, 180, fill=shadow, width=3)
    draw.ellipse((x-21, 140, x+21, 196), fill=skin)
    draw.ellipse((x-24, 165, x-15, 178), fill=skin)
    draw.ellipse((x+16, 165, x+25, 178), fill=skin)
    # A closed, overlapping cap. No triangular fringe edges crossing the face.
    draw.pieslice((x-24, 132, x+24, 174), 180, 360, fill=hair)

    if "MIRA" in label:
        draw.polygon([(x-25, 149), (x-18, 149), (x-18, 185), (x-25, 189)], fill=hair)
    draw.ellipse((x-10, 165, x-7, 169), fill="#30304b")
    draw.ellipse((x+8, 165, x+11, 169), fill="#30304b")
    draw.arc((x-5, 175, x+7, 183), 5, 175, fill="#985d53", width=2)
    reach_x, reach_y = dominant_hand
    side = 1 if reach_x >= x else -1
    # Round sleeve and elbow joints avoid the former disconnected puppet arms.
    paths = [
        ([(x-side*22, 216), (x-side*36, 239), (x-side*32, 264)], shadow),
        ([(x+side*22, 216), (mix(x+side*27, reach_x, .5), mix(235, reach_y, .5)), (reach_x, reach_y)], color)
    ]
    for pts, sleeve in paths:
        draw.line(pts, fill=sleeve, width=15, joint="curve")
        for px, py in pts:
            draw.ellipse((px-7.5, py-7.5, px+7.5, py+7.5), fill=sleeve)
    draw.ellipse((x-side*32-6, 260, x-side*32+6, 272), fill=skin)
    draw.ellipse((reach_x-6, reach_y-6, reach_x+6, reach_y+6), fill=skin)
    draw.rounded_rectangle((x-40, 108, x+40, 131), 11, fill="#f5f5f2")
    draw.text((x, 120), label, anchor="mm", font=SMALL, fill="#002060")


def cube(draw, x, y):
    draw.polygon([(x-12, y-11), (x, y-17), (x+13, y-11), (x, y-5)], fill="#ffe19a")
    draw.polygon([(x-12, y-11), (x, y-5), (x, y+10), (x-12, y+4)], fill="#c49b50")
    draw.polygon([(x, y-5), (x+13, y-11), (x+13, y+4), (x, y+10)], fill="#edc46d")


def folder(draw, x, y, opening):
    span = mix(8, 31, opening)
    draw.polygon([(x-24, y-15), (x, y-8), (x, y+15), (x-24, y+7)], fill="#4e9ace", outline="#98cbf1")
    draw.polygon([(x, y-8), (x+span, y-15-opening*3), (x+span, y+7), (x, y+15)],
                 fill="#74b4de", outline="#a4d4f8")
    if opening > .45:
        draw.line((x+4, y-4, x+span-5, y-9), fill="#e7f2e8", width=2)


def frame(background, time):
    image = background.copy()
    draw = SoftDraw(image)
    mira = mix(111, 308, ease(time/1.8))
    leon = mix(495, 695, ease((time-10)/1.8))
    placing = ease((time-2)/1.25)
    release = ease((time-3.3)/.5)
    pointing = ease((time-8)/.4) * (1 - ease((time-9.6)/.35))
    mira_hand = (mix(mix(mira+27, 381, placing*(1-release)), 367, pointing),
                 mix(mix(267, 237, placing*(1-release)), 224, pointing))
    lifting = ease((time-4)/1.4)
    leon_hand = (mix(leon-29, leon-49, lifting), mix(267, 216, lifting))
    actor(draw, mira, mira_hand, "#f25767", "#cd485a", "P01 · MIRA", time*15 if time < 1.8 else 0)
    actor(draw, leon, leon_hand, "#6d9ad2", "#4d78b3", "P02 · LEON", (time-10)*15 if 10 < time < 11.8 else 0)
    draw.polygon([(353, 252), (485, 252), (513, 271), (325, 271)], fill="#f5f5f2")
    draw.rectangle((326, 272, 513, 281), fill="#b1c3dc")
    draw.line((345, 280, 339, 342), fill="#829bbb", width=7)
    draw.line((494, 280, 500, 342), fill="#829bbb", width=7)
    if time < 3.3:
        cube(draw, mira_hand[0], mira_hand[1]+8)
    else:
        cube(draw, 381, 250)
    if time < 4:
        folder(draw, 469, 248, 0)
    else:
        folder(draw, mix(469, leon_hand[0], lifting), mix(248, leon_hand[1]+4, lifting), ease((time-6)/1.2))
    draw.line((33, 420, 767, 420), fill="#a4b8d1")
    draw.text((33, 433), "SYN-CAP-01  /  PROCEDURAL VIDEO", font=SMALL, fill="#002060")
    draw.text((767, 433), f"00:{time:05.2f}", anchor="ra", font=FONT, fill="#002060")
    return image.resize(SIZE, Image.Resampling.LANCZOS)


def main():
    DEST.mkdir(exist_ok=True, parents=True)
    background = backdrop()
    frame(background, 0).save(DEST / "studio-poster.webp", quality=87)
    process = subprocess.Popen([
        get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error", "-y",
        "-f", "rawvideo", "-pixel_format", "rgb24", "-video_size", "800x450", "-framerate", str(FPS),
        "-i", "pipe:0", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "21",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(DEST / "studio.mp4"),
    ], stdin=subprocess.PIPE)
    with process.stdin:
        for index in range(DURATION * FPS):
            process.stdin.write(frame(background, index / FPS).tobytes())
    if process.wait():
        raise SystemExit("Could not encode the synthetic clip")
    print(DEST / "studio.mp4")


if __name__ == "__main__":
    main()
