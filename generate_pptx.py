#!/usr/bin/env python3
"""Generate the Kony to React Migration Strategy PowerPoint presentation."""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os

# Color scheme
NAVY = RGBColor(0x1B, 0x2A, 0x4A)
DARK_BLUE = RGBColor(0x2C, 0x3E, 0x6B)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_GRAY = RGBColor(0xF0, 0xF2, 0xF5)
ACCENT_BLUE = RGBColor(0x3B, 0x82, 0xF6)
ACCENT_GREEN = RGBColor(0x10, 0xB9, 0x81)
DARK_TEXT = RGBColor(0x1E, 0x29, 0x3B)
MED_TEXT = RGBColor(0x4B, 0x55, 0x63)
TABLE_HEADER_BG = RGBColor(0x1B, 0x2A, 0x4A)
TABLE_ALT_ROW = RGBColor(0xE8, 0xEE, 0xF7)
TABLE_WHITE = RGBColor(0xFF, 0xFF, 0xFF)
DEVIN_PURPLE = RGBColor(0x7C, 0x3A, 0xED)
HUMAN_ORANGE = RGBColor(0xF5, 0x9E, 0x0B)
HUMAN_CA_TEAL = RGBColor(0x06, 0xB6, 0xD4)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)


def add_slide_number(slide, num):
    """Add slide number to bottom right."""
    txBox = slide.shapes.add_textbox(Inches(12.3), Inches(7.0), Inches(0.8), Inches(0.35))
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    p.text = str(num)
    p.font.size = Pt(10)
    p.font.color.rgb = MED_TEXT
    p.alignment = PP_ALIGN.RIGHT


def add_navy_header(slide, title_text, subtitle_text=None):
    """Add a navy header bar at the top of the slide."""
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_W, Inches(1.3))
    shape.fill.solid()
    shape.fill.fore_color.rgb = NAVY
    shape.line.fill.background()

    txBox = slide.shapes.add_textbox(Inches(0.6), Inches(0.2), Inches(12), Inches(0.7))
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.size = Pt(28)
    p.font.color.rgb = WHITE
    p.font.bold = True

    if subtitle_text:
        txBox2 = slide.shapes.add_textbox(Inches(0.6), Inches(0.8), Inches(12), Inches(0.4))
        tf2 = txBox2.text_frame
        p2 = tf2.paragraphs[0]
        p2.text = subtitle_text
        p2.font.size = Pt(14)
        p2.font.color.rgb = RGBColor(0xBF, 0xDB, 0xFE)


def add_body_text(slide, left, top, width, height, bullets, font_size=16, bold_keys=True):
    """Add bulleted text to slide."""
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, bullet in enumerate(bullets):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.space_after = Pt(6)
        p.space_before = Pt(4)
        p.level = bullet.get("level", 0)

        text = bullet["text"]
        if bold_keys and ":" in text and not text.startswith('"'):
            parts = text.split(":", 1)
            run1 = p.add_run()
            run1.text = parts[0] + ":"
            run1.font.size = Pt(font_size)
            run1.font.color.rgb = DARK_TEXT
            run1.font.bold = True
            run2 = p.add_run()
            run2.text = parts[1]
            run2.font.size = Pt(font_size)
            run2.font.color.rgb = MED_TEXT
        else:
            run = p.add_run()
            run.text = text
            run.font.size = Pt(font_size)
            run.font.color.rgb = DARK_TEXT
            if bullet.get("bold"):
                run.font.bold = True
            if bullet.get("italic"):
                run.font.italic = True
            if bullet.get("color"):
                run.font.color.rgb = bullet["color"]


def add_message_box(slide, left, top, width, text, color=ACCENT_BLUE):
    """Add a highlighted message box."""
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, Inches(0.6))
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()
    tf = shape.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = text
    run.font.size = Pt(14)
    run.font.color.rgb = WHITE
    run.font.bold = True


def add_table(slide, left, top, width, height, rows_data, col_widths=None):
    """Add a formatted table to the slide."""
    n_rows = len(rows_data)
    n_cols = len(rows_data[0])
    table_shape = slide.shapes.add_table(n_rows, n_cols, left, top, width, height)
    table = table_shape.table

    if col_widths:
        for i, w in enumerate(col_widths):
            table.columns[i].width = w

    for row_idx, row_data in enumerate(rows_data):
        for col_idx, cell_text in enumerate(row_data):
            cell = table.cell(row_idx, col_idx)
            cell.text = ""
            p = cell.text_frame.paragraphs[0]
            run = p.add_run()
            run.text = str(cell_text)

            if row_idx == 0:
                # Header row
                run.font.size = Pt(12)
                run.font.bold = True
                run.font.color.rgb = WHITE
                cell.fill.solid()
                cell.fill.fore_color.rgb = TABLE_HEADER_BG
                p.alignment = PP_ALIGN.CENTER
            else:
                run.font.size = Pt(11)
                run.font.color.rgb = DARK_TEXT
                if row_idx % 2 == 0:
                    cell.fill.solid()
                    cell.fill.fore_color.rgb = TABLE_ALT_ROW
                else:
                    cell.fill.solid()
                    cell.fill.fore_color.rgb = TABLE_WHITE

            cell.text_frame.paragraphs[0].space_before = Pt(3)
            cell.text_frame.paragraphs[0].space_after = Pt(3)
            cell.margin_left = Inches(0.08)
            cell.margin_right = Inches(0.08)
            cell.margin_top = Inches(0.03)
            cell.margin_bottom = Inches(0.03)

    return table_shape


# ============================================================
# SLIDE 1: Title Slide
# ============================================================
slide1 = prs.slides.add_slide(prs.slide_layouts[6])  # Blank
bg = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_W, SLIDE_H)
bg.fill.solid()
bg.fill.fore_color.rgb = NAVY
bg.line.fill.background()

# Accent bar
accent = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.0), Inches(2.8), Inches(1.5), Inches(0.06))
accent.fill.solid()
accent.fill.fore_color.rgb = ACCENT_BLUE
accent.line.fill.background()

txBox = slide1.shapes.add_textbox(Inches(1.0), Inches(3.0), Inches(11), Inches(1.5))
tf = txBox.text_frame
p = tf.paragraphs[0]
run = p.add_run()
run.text = "Kony to React Migration Strategy"
run.font.size = Pt(44)
run.font.color.rgb = WHITE
run.font.bold = True

p2 = tf.add_paragraph()
run2 = p2.add_run()
run2.text = "Accelerating Modernization with Human + AI Collaboration"
run2.font.size = Pt(22)
run2.font.color.rgb = RGBColor(0xBF, 0xDB, 0xFE)
p2.space_before = Pt(12)

p3 = tf.add_paragraph()
run3 = p3.add_run()
run3.text = "April 2026"
run3.font.size = Pt(16)
run3.font.color.rgb = RGBColor(0x93, 0xC5, 0xFD)
p3.space_before = Pt(24)

add_slide_number(slide1, 1)

# ============================================================
# SLIDE 2: Executive Summary
# ============================================================
slide2 = prs.slides.add_slide(prs.slide_layouts[6])
add_navy_header(slide2, "Executive Summary")

add_body_text(slide2, Inches(0.8), Inches(1.8), Inches(11.5), Inches(4.5), [
    {"text": '"Proven migration playbook for Low, Medium, and High complexity Kony apps"', "bold": True},
    {"text": '"AI-augmented approach reduces migration effort by 40-65% compared to manual rewrite"', "bold": True},
    {"text": '"Every business logic path preserved \u2014 zero functional regression"', "bold": True},
], font_size=22)

add_message_box(slide2, Inches(0.8), Inches(5.5), Inches(11.5),
                "A structured, repeatable methodology that scales from 5-form apps to enterprise platforms")
add_slide_number(slide2, 2)

# ============================================================
# SLIDE 3: Why Migrate from Kony?
# ============================================================
slide3 = prs.slides.add_slide(prs.slide_layouts[6])
add_navy_header(slide3, "Why Migrate from Kony?", "Unlock your business logic from a proprietary platform")

add_body_text(slide3, Inches(0.8), Inches(1.6), Inches(5.5), Inches(5.0), [
    {"text": "Kony (Temenos Quantum) Limitations", "bold": True, "color": NAVY},
    {"text": "Vendor lock-in: proprietary UI framework", "level": 0},
    {"text": "Fabric middleware dependency", "level": 0},
    {"text": "Limited talent pool & community", "level": 0},
    {"text": "High licensing costs", "level": 0},
    {"text": "Declining ecosystem investment", "level": 0},
], font_size=16)

add_body_text(slide3, Inches(6.8), Inches(1.6), Inches(5.5), Inches(5.0), [
    {"text": "Target: React + PostgreSQL", "bold": True, "color": ACCENT_GREEN},
    {"text": "Open-source, zero licensing cost", "level": 0},
    {"text": "Massive talent pool worldwide", "level": 0},
    {"text": "Modern tooling & DevOps ecosystem", "level": 0},
    {"text": "Component-based architecture", "level": 0},
    {"text": "Vibrant community & long-term support", "level": 0},
], font_size=16)

add_message_box(slide3, Inches(0.8), Inches(6.2), Inches(11.5),
                '"Unlock your business logic from a proprietary platform"', ACCENT_GREEN)
add_slide_number(slide3, 3)

# ============================================================
# SLIDE 4: The 3-Tier Migration Playbook
# ============================================================
slide4 = prs.slides.add_slide(prs.slide_layouts[6])
add_navy_header(slide4, "The 3-Tier Migration Playbook")

table_data = [
    ["", "Low Complexity", "Medium Complexity", "High Complexity"],
    ["Forms", "3\u20135 forms", "10\u201325 forms", "25+ forms"],
    ["Entities", "\u22645 entities", "5\u201315 entities", "15+ entities"],
    ["Characteristics", "Simple CRUD\n(e.g., Team Expenses)", "Offline sync,\nrole-based access", "Complex sync, external\nintegrations, multi-tenant"],
    ["Typical Effort", "~74 hours", "~380 hours", "~1,150 hours"],
]
add_table(slide4, Inches(0.8), Inches(1.6), Inches(11.7), Inches(3.8), table_data,
          col_widths=[Inches(1.8), Inches(3.3), Inches(3.3), Inches(3.3)])

add_message_box(slide4, Inches(0.8), Inches(5.8), Inches(11.7),
                '"One methodology, three calibrated approaches"')
add_slide_number(slide4, 4)

# ============================================================
# SLIDE 5: The Collaboration Model \u2014 Three Actors
# ============================================================
slide5 = prs.slides.add_slide(prs.slide_layouts[6])
add_navy_header(slide5, "The Collaboration Model \u2014 Three Actors")

# Human box
box1 = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.6), Inches(3.8), Inches(4.5))
box1.fill.solid()
box1.fill.fore_color.rgb = RGBColor(0xFF, 0xF7, 0xED)
box1.line.color.rgb = HUMAN_ORANGE
tf1 = box1.text_frame
tf1.word_wrap = True
p = tf1.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = "\U0001F464 Human"
r.font.size = Pt(22)
r.font.bold = True
r.font.color.rgb = HUMAN_ORANGE
for item in ["Strategic decisions", "UX design", "Architecture", "Domain expertise", "Security & compliance"]:
    p2 = tf1.add_paragraph()
    p2.alignment = PP_ALIGN.LEFT
    p2.space_before = Pt(6)
    r2 = p2.add_run()
    r2.text = "\u2022 " + item
    r2.font.size = Pt(14)
    r2.font.color.rgb = DARK_TEXT

# Human + Code Assist box
box2 = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.75), Inches(1.6), Inches(3.8), Inches(4.5))
box2.fill.solid()
box2.fill.fore_color.rgb = RGBColor(0xEC, 0xFD, 0xFF)
box2.line.color.rgb = HUMAN_CA_TEAL
tf2 = box2.text_frame
tf2.word_wrap = True
p = tf2.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = "\U0001F464+\U0001F4BB Human + Code Assist"
r.font.size = Pt(20)
r.font.bold = True
r.font.color.rgb = HUMAN_CA_TEAL
for item in ["Complex logic porting", "Edge cases", "Code review", "API contract design", "Responsive design"]:
    p2 = tf2.add_paragraph()
    p2.alignment = PP_ALIGN.LEFT
    p2.space_before = Pt(6)
    r2 = p2.add_run()
    r2.text = "\u2022 " + item
    r2.font.size = Pt(14)
    r2.font.color.rgb = DARK_TEXT

# Devin box
box3 = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.9), Inches(1.6), Inches(3.8), Inches(4.5))
box3.fill.solid()
box3.fill.fore_color.rgb = RGBColor(0xF5, 0xF3, 0xFF)
box3.line.color.rgb = DEVIN_PURPLE
tf3 = box3.text_frame
tf3.word_wrap = True
p = tf3.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = "\U0001F916 Devin (AI Agent)"
r.font.size = Pt(22)
r.font.bold = True
r.font.color.rgb = DEVIN_PURPLE
for item in ["Scaffolding", "CRUD generation", "Test writing", "Mechanical porting", "Documentation"]:
    p2 = tf3.add_paragraph()
    p2.alignment = PP_ALIGN.LEFT
    p2.space_before = Pt(6)
    r2 = p2.add_run()
    r2.text = "\u2022 " + item
    r2.font.size = Pt(14)
    r2.font.color.rgb = DARK_TEXT

add_message_box(slide5, Inches(0.6), Inches(6.4), Inches(12.1),
                '"Each actor plays to their strengths \u2014 no wasted effort"')
add_slide_number(slide5, 5)

# ============================================================
# SLIDE 6: SDLC Phase Overview
# ============================================================
slide6 = prs.slides.add_slide(prs.slide_layouts[6])
add_navy_header(slide6, "SDLC Phase Overview", "AI accelerates every phase, not just implementation")

phases = ["Discovery", "Architecture", "Implementation", "Testing", "Deployment"]
colors_phases = [RGBColor(0x3B, 0x82, 0xF6), RGBColor(0x8B, 0x5C, 0xF6), RGBColor(0x10, 0xB9, 0x81),
                 RGBColor(0xF5, 0x9E, 0x0B), RGBColor(0xEF, 0x44, 0x44)]

for i, (phase, color) in enumerate(zip(phases, colors_phases)):
    x = Inches(0.6 + i * 2.5)
    y = Inches(2.2)
    box = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(2.2), Inches(1.2))
    box.fill.solid()
    box.fill.fore_color.rgb = color
    box.line.fill.background()
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = phase
    r.font.size = Pt(18)
    r.font.color.rgb = WHITE
    r.font.bold = True

    # Arrow connector (except last)
    if i < len(phases) - 1:
        arrow_x = Inches(0.6 + i * 2.5 + 2.2)
        arrow = slide6.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, arrow_x, Inches(2.55), Inches(0.3), Inches(0.5))
        arrow.fill.solid()
        arrow.fill.fore_color.rgb = MED_TEXT
        arrow.line.fill.background()

# AI involvement bar
ai_bar = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(3.8), Inches(12.1), Inches(0.7))
ai_bar.fill.solid()
ai_bar.fill.fore_color.rgb = DEVIN_PURPLE
ai_bar.line.fill.background()
tf = ai_bar.text_frame
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = "\U0001F916 Devin AI involvement spans ALL phases"
r.font.size = Pt(16)
r.font.color.rgb = WHITE
r.font.bold = True

add_body_text(slide6, Inches(0.8), Inches(4.8), Inches(11.5), Inches(2.0), [
    {"text": "Discovery: Auto-inventory Kony forms, modules, data models"},
    {"text": "Architecture: Generate DB schema, scaffolding, CI/CD pipeline"},
    {"text": "Implementation: CRUD endpoints, UI scaffolding, mechanical porting"},
    {"text": "Testing: Unit tests, integration tests, E2E test generation"},
    {"text": "Deployment: Docker setup, documentation, README generation"},
], font_size=14)
add_slide_number(slide6, 6)

# ============================================================
# SLIDE 7: Phase 1 \u2014 Discovery & Requirements
# ============================================================
slide7 = prs.slides.add_slide(prs.slide_layouts[6])
add_navy_header(slide7, "Phase 1 \u2014 Discovery & Requirements", "Acceleration Highlight")

add_body_text(slide7, Inches(0.8), Inches(1.6), Inches(11.5), Inches(5.0), [
    {"text": "Key stat: Devin autonomously inventories 100% of Kony forms, modules, and data models", "bold": True, "color": DEVIN_PURPLE},
    {"text": ""},
    {"text": "Devin (AI Agent):", "bold": True},
    {"text": "URS document auto-generated from codebase analysis", "level": 0},
    {"text": "Traceability matrix created automatically", "level": 0},
    {"text": "Form inventory with widget counts, data bindings, service calls", "level": 0},
    {"text": ""},
    {"text": "Human Focus:", "bold": True},
    {"text": "Stakeholder alignment and business rule validation", "level": 0},
    {"text": "Prioritization of migration scope", "level": 0},
    {"text": "Sign-off on requirements completeness", "level": 0},
], font_size=16)

add_message_box(slide7, Inches(0.8), Inches(6.2), Inches(11.5),
                '"75% of discovery work automated for low complexity apps"', ACCENT_GREEN)
add_slide_number(slide7, 7)

# ============================================================
# SLIDE 8: Phase 2 \u2014 Architecture & Design
# ============================================================
slide8 = prs.slides.add_slide(prs.slide_layouts[6])
add_navy_header(slide8, "Phase 2 \u2014 Architecture & Design")

table8 = [
    ["Task", "Lead Actor", "Details"],
    ["DB schema from MF_Config", "Devin", "Auto-generate Prisma/SQL schema from Kony object services"],
    ["Project scaffolding", "Devin", "React + Node.js boilerplate, folder structure, configs"],
    ["CI/CD pipeline", "Devin", "GitHub Actions / Docker build pipeline setup"],
    ["Tech stack decisions", "Human", "Framework choices, auth strategy, hosting"],
    ["UX design", "Human", "Wireframes, user flows, interaction patterns"],
    ["API contract design", "Human + Code Assist", "RESTful endpoint specs, request/response schemas"],
]
add_table(slide8, Inches(0.6), Inches(1.6), Inches(12.1), Inches(4.0), table8,
          col_widths=[Inches(2.8), Inches(2.5), Inches(6.8)])

add_message_box(slide8, Inches(0.6), Inches(6.2), Inches(12.1),
                '"Humans make the strategic calls; AI handles the structural work"')
add_slide_number(slide8, 8)

# ============================================================
# SLIDE 9: Phase 3 \u2014 Implementation (Backend)
# ============================================================
slide9 = prs.slides.add_slide(prs.slide_layouts[6])
add_navy_header(slide9, "Phase 3 \u2014 Implementation (Backend)")

table9 = [
    ["Task", "Lead Actor", "Autonomy (Low Complexity)"],
    ["CRUD endpoints", "Devin", "70% autonomous"],
    ["Aggregation queries", "Devin", "65% autonomous"],
    ["Kony SDK \u2192 REST porting", "Devin", "70% autonomous (mechanical)"],
    ["Complex transactions", "Human + Code Assist", "Guided by human"],
    ["Auth / RBAC", "Human + Code Assist", "Security-critical"],
    ["Business rule validation", "Human + Code Assist", "Domain expertise needed"],
]
add_table(slide9, Inches(0.6), Inches(1.6), Inches(12.1), Inches(3.8), table9,
          col_widths=[Inches(3.2), Inches(3.0), Inches(5.9)])

add_message_box(slide9, Inches(0.6), Inches(6.0), Inches(12.1),
                '"60-70% of backend code generated autonomously for low/medium apps"', ACCENT_GREEN)
add_slide_number(slide9, 9)

# ============================================================
# SLIDE 10: Phase 3 \u2014 Implementation (Frontend)
# ============================================================
slide10 = prs.slides.add_slide(prs.slide_layouts[6])
add_navy_header(slide10, "Phase 3 \u2014 Implementation (Frontend \u2014 Granular)")

table10 = [
    ["Sub-Category", "Lead Actor"],
    ["Layout, routing, scaffolding", "Devin"],
    ["Simple forms, data tables, API hooks", "Devin"],
    ["Design system (Tailwind/shadcn)", "Devin"],
    ["Complex forms, conditional logic", "Human + Code Assist"],
    ["Responsive design, accessibility", "Human + Code Assist"],
    ["UX polish, animations", "Human"],
]
add_table(slide10, Inches(0.6), Inches(1.6), Inches(12.1), Inches(3.5), table10,
          col_widths=[Inches(6.5), Inches(5.6)])

add_message_box(slide10, Inches(0.6), Inches(5.8), Inches(12.1),
                '"AI builds the 80% foundation; humans craft the 20% that delights users"')
add_slide_number(slide10, 10)

# ============================================================
# SLIDE 11: Phase 3 \u2014 Kony-Specific Migration Tasks
# ============================================================
slide11 = prs.slides.add_slide(prs.slide_layouts[6])
add_navy_header(slide11, "Phase 3 \u2014 Kony-Specific Migration Tasks")

table11 = [
    ["Kony Pattern", "React Equivalent", "Lead Actor"],
    ["kony.sdk.KNYObjSvc", "Prisma / REST API", "Devin"],
    ["Callback chains", "async/await", "Devin"],
    ["Client-side JOINs", "SQL JOINs (Prisma)", "Devin"],
    ["Form widget refs", "React state / hooks", "Human + Code Assist"],
    ["KonySyncLib (offline)", "Modern offline-first libs", "Human"],
]
add_table(slide11, Inches(0.6), Inches(1.6), Inches(12.1), Inches(3.5), table11,
          col_widths=[Inches(3.5), Inches(3.8), Inches(4.8)])

add_message_box(slide11, Inches(0.6), Inches(5.8), Inches(12.1),
                '"The most tedious migration work is exactly where AI shines brightest"', DEVIN_PURPLE)
add_slide_number(slide11, 11)

# ============================================================
# SLIDE 12: Phase 4 \u2014 Testing
# ============================================================
slide12 = prs.slides.add_slide(prs.slide_layouts[6])
add_navy_header(slide12, "Phase 4 \u2014 Testing (Comprehensive Coverage)")

add_body_text(slide12, Inches(0.6), Inches(1.6), Inches(5.8), Inches(5.0), [
    {"text": "\U0001F916 Devin Generates:", "bold": True, "color": DEVIN_PURPLE},
    {"text": "Unit tests (happy path)", "level": 0},
    {"text": "Integration tests (CRUD flows)", "level": 0},
    {"text": "E2E user journey tests", "level": 0},
    {"text": "Video capture of test runs", "level": 0},
    {"text": ""},
    {"text": "Key stat: 65% of test code auto-generated for low complexity", "bold": True, "color": ACCENT_GREEN},
], font_size=16)

add_body_text(slide12, Inches(6.8), Inches(1.6), Inches(5.8), Inches(5.0), [
    {"text": "\U0001F464+\U0001F4BB Human + Code Assist:", "bold": True, "color": HUMAN_CA_TEAL},
    {"text": "Edge case tests", "level": 0},
    {"text": "Error scenario coverage", "level": 0},
    {"text": ""},
    {"text": "\U0001F464 Human Leads:", "bold": True, "color": HUMAN_ORANGE},
    {"text": "Security testing", "level": 0},
    {"text": "Performance testing", "level": 0},
    {"text": "Accessibility audits", "level": 0},
], font_size=16)

add_message_box(slide12, Inches(0.6), Inches(6.2), Inches(12.1),
                '"Ship with confidence \u2014 every business logic path tested"')
add_slide_number(slide12, 12)

# ============================================================
# SLIDE 13: Phase 5 \u2014 Deployment & Handover
# ============================================================
slide13 = prs.slides.add_slide(prs.slide_layouts[6])
add_navy_header(slide13, "Phase 5 \u2014 Deployment & Handover")

table13 = [
    ["Task", "Lead Actor", "Details"],
    ["Docker setup", "Devin", "Containerized app with docker-compose"],
    ["CI/CD pipeline", "Devin", "Build, test, deploy automation"],
    ["Documentation & README", "Devin", "Auto-generated API docs, setup guides"],
    ["Production config", "Human", "Environment vars, secrets, scaling"],
    ["Data migration strategy", "Human", "Cutover plan, data validation"],
    ["Monitoring & alerting", "Human", "Observability, error tracking"],
    ["Team training", "Human", "Knowledge transfer sessions"],
]
add_table(slide13, Inches(0.6), Inches(1.6), Inches(12.1), Inches(4.0), table13,
          col_widths=[Inches(3.0), Inches(2.5), Inches(6.6)])

add_message_box(slide13, Inches(0.6), Inches(6.2), Inches(12.1),
                '"From code to production with automated DevOps"', ACCENT_GREEN)
add_slide_number(slide13, 13)

# ============================================================
# SLIDE 14: Productivity & ROI Summary
# ============================================================
slide14 = prs.slides.add_slide(prs.slide_layouts[6])
add_navy_header(slide14, "Productivity & ROI Summary")

table14 = [
    ["Metric", "Low Complexity", "Medium Complexity", "High Complexity"],
    ["Total Effort", "~74 hours", "~380 hours", "~1,150 hours"],
    ["Devin Autonomous Share", "65%", "40%", "30%"],
    ["Human + Code Assist", "20%", "35%", "35%"],
    ["Human Only", "15%", "25%", "35%"],
    ["Est. Time Saved vs Manual", "~65%", "~45%", "~35%"],
]
add_table(slide14, Inches(0.6), Inches(1.6), Inches(12.1), Inches(3.5), table14,
          col_widths=[Inches(3.2), Inches(3.0), Inches(3.0), Inches(2.9)])

# Effort distribution mini boxes
labels = [("Human", HUMAN_ORANGE), ("Human + CA", HUMAN_CA_TEAL), ("Devin", DEVIN_PURPLE)]
for i, (label, color) in enumerate(labels):
    x = Inches(1.5 + i * 4.0)
    box = slide14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(5.5), Inches(2.5), Inches(0.5))
    box.fill.solid()
    box.fill.fore_color.rgb = color
    box.line.fill.background()
    tf = box.text_frame
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = label
    r.font.size = Pt(13)
    r.font.color.rgb = WHITE
    r.font.bold = True

add_message_box(slide14, Inches(0.6), Inches(6.3), Inches(12.1),
                '"AI doesn\'t replace the team \u2014 it multiplies their output"')
add_slide_number(slide14, 14)

# ============================================================
# SLIDE 15: Without Devin vs. With Devin
# ============================================================
slide15 = prs.slides.add_slide(prs.slide_layouts[6])
add_navy_header(slide15, "Without Devin vs. With Devin", "Productivity Comparison")

# Without Devin column
box_without = slide15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.6), Inches(5.8), Inches(5.0))
box_without.fill.solid()
box_without.fill.fore_color.rgb = RGBColor(0xFE, 0xF2, 0xF2)
box_without.line.color.rgb = RGBColor(0xEF, 0x44, 0x44)

tf_w = box_without.text_frame
tf_w.word_wrap = True
p = tf_w.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = "Without Devin (Manual Only)"
r.font.size = Pt(22)
r.font.bold = True
r.font.color.rgb = RGBColor(0xEF, 0x44, 0x44)

without_items = [
    ("Low Complexity", "~210 hours (2.8x more)"),
    ("Medium Complexity", "~690 hours (1.8x more)"),
    ("High Complexity", "~1,770 hours (1.5x more)"),
    ("Discovery", "Manual form-by-form inventory"),
    ("CRUD Endpoints", "100% hand-coded"),
    ("Test Coverage", "Manual test writing only"),
    ("Schema Migration", "Manual DDL creation"),
    ("Documentation", "Manually authored"),
]
for label, val in without_items:
    p2 = tf_w.add_paragraph()
    p2.space_before = Pt(6)
    r1 = p2.add_run()
    r1.text = label + ": "
    r1.font.size = Pt(13)
    r1.font.bold = True
    r1.font.color.rgb = DARK_TEXT
    r2 = p2.add_run()
    r2.text = val
    r2.font.size = Pt(13)
    r2.font.color.rgb = MED_TEXT

# With Devin column
box_with = slide15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.6), Inches(5.8), Inches(5.0))
box_with.fill.solid()
box_with.fill.fore_color.rgb = RGBColor(0xF0, 0xFD, 0xF4)
box_with.line.color.rgb = ACCENT_GREEN

tf_wd = box_with.text_frame
tf_wd.word_wrap = True
p = tf_wd.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = "With Devin (AI-Augmented)"
r.font.size = Pt(22)
r.font.bold = True
r.font.color.rgb = ACCENT_GREEN

with_items = [
    ("Low Complexity", "~74 hours (65% savings)"),
    ("Medium Complexity", "~380 hours (45% savings)"),
    ("High Complexity", "~1,150 hours (35% savings)"),
    ("Discovery", "100% auto-inventory by Devin"),
    ("CRUD Endpoints", "70% auto-generated"),
    ("Test Coverage", "65% test code auto-generated"),
    ("Schema Migration", "Auto-generated from MF_Config"),
    ("Documentation", "Auto-generated docs & README"),
]
for label, val in with_items:
    p2 = tf_wd.add_paragraph()
    p2.space_before = Pt(6)
    r1 = p2.add_run()
    r1.text = label + ": "
    r1.font.size = Pt(13)
    r1.font.bold = True
    r1.font.color.rgb = DARK_TEXT
    r2 = p2.add_run()
    r2.text = val
    r2.font.size = Pt(13)
    r2.font.color.rgb = MED_TEXT

add_message_box(slide15, Inches(0.6), Inches(6.8), Inches(12.1),
                '"Devin turns weeks of manual effort into days of guided collaboration"', DEVIN_PURPLE)
add_slide_number(slide15, 15)

# ============================================================
# SLIDE 16: Closing \u2014 The Migration Advantage
# ============================================================
slide16 = prs.slides.add_slide(prs.slide_layouts[6])
bg16 = slide16.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_W, SLIDE_H)
bg16.fill.solid()
bg16.fill.fore_color.rgb = NAVY
bg16.line.fill.background()

txBox = slide16.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11), Inches(1.0))
tf = txBox.text_frame
p = tf.paragraphs[0]
r = p.add_run()
r.text = "The Migration Advantage"
r.font.size = Pt(36)
r.font.color.rgb = WHITE
r.font.bold = True

accent16 = slide16.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.0), Inches(1.7), Inches(2.0), Inches(0.05))
accent16.fill.solid()
accent16.fill.fore_color.rgb = ACCENT_BLUE
accent16.line.fill.background()

takeaways = [
    ("1", "Zero business logic loss \u2014 every Kony function mapped, ported, and tested"),
    ("2", "Right actor for every task \u2014 humans focus on high-value decisions, AI handles the rest"),
    ("3", "Scalable playbook \u2014 same methodology works from 5-form apps to enterprise platforms"),
]
for i, (num, text) in enumerate(takeaways):
    y = Inches(2.2 + i * 1.3)
    num_box = slide16.shapes.add_shape(MSO_SHAPE.OVAL, Inches(1.0), y, Inches(0.6), Inches(0.6))
    num_box.fill.solid()
    num_box.fill.fore_color.rgb = ACCENT_BLUE
    num_box.line.fill.background()
    tf_n = num_box.text_frame
    p_n = tf_n.paragraphs[0]
    p_n.alignment = PP_ALIGN.CENTER
    r_n = p_n.add_run()
    r_n.text = num
    r_n.font.size = Pt(20)
    r_n.font.color.rgb = WHITE
    r_n.font.bold = True

    txt_box = slide16.shapes.add_textbox(Inches(1.9), y, Inches(10), Inches(0.8))
    tf_t = txt_box.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    r_t = p_t.add_run()
    r_t.text = text
    r_t.font.size = Pt(20)
    r_t.font.color.rgb = WHITE

# Call to action
cta_box = slide16.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(5.8), Inches(11.3), Inches(0.8))
cta_box.fill.solid()
cta_box.fill.fore_color.rgb = ACCENT_GREEN
cta_box.line.fill.background()
tf_cta = cta_box.text_frame
p_cta = tf_cta.paragraphs[0]
p_cta.alignment = PP_ALIGN.CENTER
r_cta = p_cta.add_run()
r_cta.text = "Start with a low-complexity pilot to prove the approach, then scale"
r_cta.font.size = Pt(18)
r_cta.font.color.rgb = WHITE
r_cta.font.bold = True

add_slide_number(slide16, 16)

# ============================================================
# Save
# ============================================================
output_dir = "docs"
os.makedirs(output_dir, exist_ok=True)
prs.save(os.path.join(output_dir, "Kony_to_React_Migration_Strategy.pptx"))
print("Presentation saved to docs/Kony_to_React_Migration_Strategy.pptx")
