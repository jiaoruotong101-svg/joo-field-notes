"""Check the decoded fixture, not just the drawing instructions, for head seams."""
from pathlib import Path
from PIL import Image
from imageio_ffmpeg import read_frames

root = Path(__file__).resolve().parent.parent
reader = read_frames(str(root / "public/caption/studio.mp4"), pix_fmt="rgb24")
metadata = next(reader)
assert metadata["size"] == (800, 450)
assert metadata["fps"] == 24
assert metadata["duration"] == 12

def ease(value):
    value = min(1, max(0, value))
    return value * value * (3 - 2 * value)

worst = 0
count = 0
for index, raw in enumerate(reader):
    image = Image.frombytes("RGB", (800, 450), raw)
    time = index / 24
    centers = [111 + 197 * ease(time / 1.8), 495 + 200 * ease((time - 10) / 1.8)]
    for person, x in enumerate(centers):
        center = round(x)
        # This unmarked band lies between the eyes, below the hair and above
        # the smile. A vertical join is darker than the adjacent flat skin.
        for y in range(162, 174):
            middle = image.getpixel((center, y))
            left = image.getpixel((center - 3, y))
            right = image.getpixel((center + 3, y))
            difference = max(abs(middle[channel] - (left[channel] + right[channel]) / 2) for channel in range(3))
            worst = max(worst, difference)
            assert difference <= 12, (index, person, center, y, difference)
    count += 1
assert count == 288, count
print(f"Decoded {count} frames / {count * 2} heads: no center seam in the sampled face band; maximum RGB deviation {worst}.")
