"""Render and encode the original 12-second silent caption QA fixture."""
from math import sin, pi
from pathlib import Path
import random
import subprocess

from imageio_ffmpeg import get_ffmpeg_exe
from PIL import Image, ImageDraw, ImageFont

SIZE = (800, 450)
FPS = 24
DURATION = 12
DEST = Path(__file__).resolve().parent.parent / "public" / "caption"
FONT = ImageFont.load_default(size=14)
SMALL = ImageFont.load_default(size=11)


def mix(a, b, progress):
    return a + (b - a) * progress


def ease(progress):
    value = min(1, max(0, progress))
    return value * value * (3 - 2 * value)


def rounded(draw, bounds, radius, fill, outline=None):
    draw.rounded_rectangle(bounds, radius=radius, fill=fill, outline=outline)


def backdrop():
    image = Image.new("RGB", SIZE)
    draw = ImageDraw.Draw(image)
    for y in range(SIZE[1]):
        color = tuple(int(mix(a, b, y / SIZE[1])) for a, b in zip((16, 38, 53), (8, 23, 37)))
        draw.line((0, y, SIZE[0], y), fill=color)
    draw.polygon([(0, 326), (800, 308), (800, 450), (0, 450)], fill="#152839")
    for x in range(-300, 1300, 115):
        draw.line((400, 307, x, 450), fill="#294152")
    for y in (333, 357, 387, 423):
        draw.line((0, y, 800, y - 11), fill="#294152")
    draw.polygon([(35, 56), (258, 42), (258, 277), (35, 289)], fill="#1e3b47", outline="#3b6770")
    for x in range(58, 258, 36):
        draw.line((x, 54, x, 286), fill="#294751")
    for y in range(76, 280, 26):
        draw.line((35, y, 258, y-13), fill="#294751")
    draw.rectangle((645, 76, 752, 314), fill="#111f2d", outline="#456170", width=2)
    draw.rectangle((656, 87, 742, 309), fill="#152d3a", outline="#34505f")
    draw.line((739, 89, 739, 310), width=3, fill="#d8a36b")
    draw.rounded_rectangle((707, 211, 728, 216), 2, fill="#77a1b0")
    draw.line((33, 30, 767, 30), fill="#55727e")
    draw.text((33, 12), "SYNTHETIC CAPTION STUDIO", font=SMALL, fill="#c5e1e6")
    draw.text((767, 12), "CAM 01", anchor="ra", font=SMALL, fill="#c5e1e6")
    rng = random.Random(832)
    for _ in range(1700):
        x, y = rng.randrange(800), rng.randrange(32, 450)
        color = image.getpixel((x, y))
        draw.point((x, y), tuple(min(255, channel + rng.randrange(3, 11)) for channel in color))
    return image


def actor(draw, x, dominant_hand, color, shadow, label, gait):
    ground = 365
    stride = sin(gait) * 16
    draw.ellipse((x-34, ground-8, x+35, ground+7), fill="#0e202c")
    for hip, foot in ((-11, -18 + stride), (11, 18 - stride)):
        draw.line((x+hip, 276, x+hip*1.25, 318, x+foot, ground), width=17, fill="#233d50", joint="curve")
        rounded(draw, (x+foot-10, ground-6, x+foot+14, ground+4), 5, "#101e2e")
    rounded(draw, (x-27, 194, x+27, 280), 13, shadow)
    draw.polygon([(x-20, 201), (x+17, 199), (x+25, 235), (x+17, 274), (x-24, 274)], fill=color)
    draw.line((x, 200, x, 272), fill="#132b37", width=2)
    draw.rectangle((x+7, 216, x+17, 220), fill="#e1ecdf")
    rounded(draw, (x-20, 144, x+20, 187), 15, "#e2b28e")
    draw.pieslice((x-22, 140, x+22, 174), 180, 360, fill="#162634")
    draw.line((x-14, 167, x-6, 167), fill="#263640", width=2)
    draw.line((x+6, 167, x+14, 167), fill="#263640", width=2)
    draw.line((x-5, 179, x+7, 179), fill="#935b51", width=2)
    reach_x, reach_y = dominant_hand
    side = 1 if reach_x >= x else -1
    draw.line((x-side*20, 207, x-side*35, 234, x-side*31, 263), width=14, fill=shadow, joint="curve")
    draw.line((x+side*20, 207, mix(x+side*23, reach_x, .55), mix(219, reach_y, .56), reach_x, reach_y),
              width=14, fill=color, joint="curve")
    draw.ellipse((reach_x-5, reach_y-6, reach_x+5, reach_y+6), fill="#e2b28e")
    draw.rounded_rectangle((x-40, 111, x+40, 133), 2, fill="#101d2b", outline="#456279")
    draw.text((x, 122), label, anchor="mm", font=SMALL, fill="#e8f0f2")


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
    draw = ImageDraw.Draw(image)
    mira = mix(111, 308, ease(time/1.8))
    leon = mix(495, 695, ease((time-10)/1.8))
    placing = ease((time-2)/1.25)
    release = ease((time-3.3)/.5)
    pointing = ease((time-8)/.4) * (1 - ease((time-9.6)/.35))
    mira_hand = (mix(mix(mira+27, 381, placing*(1-release)), 367, pointing),
                 mix(mix(267, 237, placing*(1-release)), 224, pointing))
    lifting = ease((time-4)/1.4)
    leon_hand = (mix(leon-29, leon-49, lifting), mix(267, 216, lifting))
    actor(draw, mira, mira_hand, "#d57f8c", "#a85a6b", "P01 · MIRA", time*15 if time < 1.8 else 0)
    actor(draw, leon, leon_hand, "#6da8c3", "#426f8d", "P02 · LEON", (time-10)*15 if 10 < time < 11.8 else 0)
    draw.polygon([(353, 252), (485, 252), (513, 271), (325, 271)], fill="#566c71", outline="#789093")
    draw.rectangle((326, 272, 513, 281), fill="#304951")
    draw.line((345, 280, 339, 342), fill="#344f56", width=7)
    draw.line((494, 280, 500, 342), fill="#344f56", width=7)
    if time < 3.3:
        cube(draw, mira_hand[0], mira_hand[1]+8)
    else:
        cube(draw, 381, 250)
    if time < 4:
        folder(draw, 469, 248, 0)
    else:
        folder(draw, mix(469, leon_hand[0], lifting), mix(248, leon_hand[1]+4, lifting), ease((time-6)/1.2))
    draw.line((33, 420, 767, 420), fill="#4b6675")
    draw.text((33, 433), "SYN-CAP-01  /  PROCEDURAL VIDEO", font=SMALL, fill="#b7d1db")
    draw.text((767, 433), f"00:{time:05.2f}", anchor="ra", font=FONT, fill="#e2effa")
    return image


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

