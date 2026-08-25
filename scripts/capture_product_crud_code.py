from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from pygments import lex
from pygments.lexers import JavascriptLexer, TypeScriptLexer
from pygments.token import Comment, Keyword, Name, Number, Operator, String, Text


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "deliverables" / "code-captures"

COLORS = {
    "background": "#07111F",
    "header": "#10243A",
    "card": "#0D1726",
    "line_number": "#5D7390",
    "code": "#E8EEF7",
    "comment": "#7E93A8",
    "keyword": "#FF8BCB",
    "name": "#8BD5FF",
    "string": "#B8E986",
    "number": "#FFD580",
    "operator": "#C6A0F6",
    "muted": "#A7B7CA",
    "accent": "#56D6C9",
    "accent_2": "#FFB86B",
    "focus": "#173A4A",
}


def load_font(size: int, bold: bool = False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf"
        if bold
        else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def load_mono(size: int, bold: bool = False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
        if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationMono-Bold.ttf"
        if bold
        else "/usr/share/fonts/truetype/liberation2/LiberationMono-Regular.ttf",
    ]
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def token_color(token_type):
    if token_type in Comment:
        return COLORS["comment"]
    if token_type in Keyword:
        return COLORS["keyword"]
    if token_type in String:
        return COLORS["string"]
    if token_type in Number:
        return COLORS["number"]
    if token_type in Operator:
        return COLORS["operator"]
    if token_type in Name:
        return COLORS["name"]
    if token_type in Text:
        return COLORS["code"]
    return COLORS["code"]


def snippet_lines(path: Path, ranges):
    source = path.read_text(encoding="utf-8").splitlines()
    result = []
    for index, (start, end) in enumerate(ranges):
        if index:
            result.append((None, "// … omitted …"))
        for line_number in range(start, end + 1):
            result.append((line_number, source[line_number - 1]))
    return result


def render_code_line(draw, x, y, text, font, lexer):
    cursor = x
    for token_type, value in lex(text, lexer):
        if not value:
            continue
        value = value.replace("\n", "").replace("\r", "")
        if not value:
            continue
        draw.text((cursor, y), value, font=font, fill=token_color(token_type))
        cursor += draw.textlength(value, font=font)


def render_capture(filename, title, subtitle, source_path, ranges, focus_ranges, font_size=18):
    lines = snippet_lines(source_path, ranges)
    line_height = font_size + 11
    header_height = 158
    footer_height = 72
    width = 2400
    height = header_height + len(lines) * line_height + footer_height

    image = Image.new("RGB", (width, height), COLORS["background"])
    draw = ImageDraw.Draw(image)
    title_font = load_font(42, bold=True)
    subtitle_font = load_font(22)
    file_font = load_font(19, bold=True)
    code_font = load_mono(font_size)
    line_font = load_mono(font_size - 1)
    footer_font = load_font(18)

    draw.rectangle((0, 0, width, header_height), fill=COLORS["header"])
    draw.rectangle((0, 0, 18, height), fill=COLORS["accent"])
    draw.text((68, 34), title, font=title_font, fill=COLORS["code"])
    draw.text((70, 96), subtitle, font=subtitle_font, fill=COLORS["muted"])

    file_label = str(source_path.relative_to(ROOT))
    file_box = draw.textbbox((0, 0), file_label, font=file_font)
    file_width = file_box[2] - file_box[0] + 34
    draw.rounded_rectangle(
        (width - file_width - 68, 42, width - 68, 88),
        radius=12,
        fill=COLORS["accent"],
    )
    draw.text(
        (width - file_width - 51, 53),
        file_label,
        font=file_font,
        fill=COLORS["background"],
    )

    card_top = header_height
    card_bottom = height - footer_height
    draw.rounded_rectangle((50, card_top, width - 50, card_bottom), radius=18, fill=COLORS["card"])

    lexer = JavascriptLexer() if source_path.suffix == ".js" else TypeScriptLexer()
    y = card_top + 24
    for line_number, code in lines:
        if line_number is not None and any(start <= line_number <= end for start, end in focus_ranges):
            draw.rectangle((64, y - 4, width - 64, y + line_height - 4), fill=COLORS["focus"])
        number_label = "•" if line_number is None else str(line_number)
        draw.text((82, y), number_label.rjust(4), font=line_font, fill=COLORS["line_number"])
        render_code_line(draw, 178, y, code, code_font, lexer)
        y += line_height

    footer = "AppAshif product CRUD  •  highlighted lines are the key flow"
    draw.text((70, height - 48), footer, font=footer_font, fill=COLORS["muted"])
    output_path = OUTPUT_DIR / filename
    image.save(output_path, "PNG", optimize=True)
    print(output_path)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    render_capture(
        "01-add-edit-form.png",
        "01  PRODUCT FORM  |  ADD + EDIT",
        "The same screen decides whether to create a new product or update the loaded product.",
        ROOT / "src/app/add.tsx",
        [(109, 113), (126, 151), (165, 223)],
        [(217, 222)],
        font_size=17,
    )
    render_capture(
        "02-product-context.png",
        "02  PRODUCT CONTEXT  |  STATE SYNC",
        "The shared context calls the API and immediately updates the product list in memory.",
        ROOT / "src/context/product-context.tsx",
        [(85, 118)],
        [(109, 118)],
        font_size=20,
    )
    render_capture(
        "03-api-client.png",
        "03  API CLIENT  |  POST + PATCH",
        "Create uses POST /products; edit uses PATCH /products/:id with the admin token.",
        ROOT / "src/lib/api.ts",
        [(128, 133), (163, 179)],
        [(163, 179)],
        font_size=22,
    )
    render_capture(
        "04-backend-routes.png",
        "04  BACKEND ROUTES  |  VALIDATE + SAVE",
        "The server protects admin mutations, validates the body, then writes through the repository.",
        ROOT / "backend/src/routes/products.js",
        [(22, 33)],
        [(22, 29)],
        font_size=24,
    )
    render_capture(
        "05-search-products.png",
        "05  PRODUCT SEARCH  |  FILTER + MATCH",
        "Search is deferred for responsive typing, then matched against product name, category, and description.",
        ROOT / "src/app/products.tsx",
        [(81, 120), (237, 246)],
        [(84, 111), (237, 245)],
        font_size=19,
    )
    render_capture(
        "06-delete-product.png",
        "06  DELETE PRODUCT  |  CONFIRM + UNDO",
        "The UI confirms the action, prevents double-submit, calls deleteProduct, and offers a five-second undo.",
        ROOT / "src/app/products.tsx",
        [(122, 164), (166, 176), (297, 307)],
        [(122, 164), (166, 176), (302, 306)],
        font_size=18,
    )
    render_capture(
        "07-search-delete-api.png",
        "07  API CLIENT  |  SEARCH + DELETE",
        "Search becomes query parameters; delete sends DELETE /products/:id with the admin token.",
        ROOT / "src/lib/api.ts",
        [(135, 149), (181, 186)],
        [(140, 148), (181, 185)],
        font_size=21,
    )
    render_capture(
        "08-search-delete-routes.png",
        "08  BACKEND ROUTES  |  READ + REMOVE",
        "The backend lists products from query parameters and removes or archives an identified product.",
        ROOT / "backend/src/routes/products.js",
        [(13, 19), (35, 39)],
        [(13, 19), (35, 39)],
        font_size=23,
    )


if __name__ == "__main__":
    main()
