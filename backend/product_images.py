"""
Product image sources keyed by exact product name.
Uses Wikimedia Commons for recognizable gear where available; curated Unsplash otherwise.
Local paths (/images/products/...) are populated by sync_product_images.py after download.
"""
import re

W = "https://upload.wikimedia.org/wikipedia/commons"
U = "https://images.unsplash.com/photo"


def wiki(path: str, width: int = 800) -> str:
    """Wikimedia thumbnail URL (avoids 429 on full-resolution direct links)."""
    filename = path.rsplit("/", 1)[-1]
    return f"{W}/thumb/{path}/{width}px-{filename}"


def slugify(name: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", name.lower())).strip("-")


def unsplash(photo_id: str) -> str:
    return f"{U}-{photo_id}?w=800&auto=format&fit=crop&q=85"


def local_path(name: str, index: int = 0) -> str:
    base = slugify(name)
    if index == 0:
        return f"/images/products/{base}.jpg"
    return f"/images/products/{base}-{index + 1}.jpg"


# Remote source URLs — sync_product_images.py downloads these into frontend/public/
PRODUCT_IMAGE_SOURCES = {
    "Yamaha Electric Guitar": {
        "remote": [unsplash("1564186763535-ebb21ef5277f"), unsplash("1550291652-6ea9114a47b1")],
    },
    "Fender Acoustic Guitar": {
        "remote": [unsplash("1525201548942-d8732f6617a0"), unsplash("1516924962500-2b4b3b99ea02")],
    },
    "Gibson Bass Guitar": {
        "remote": [f"{W}/d/de/Davison_Electric_Bass_Guitar.jpg", unsplash("1605020420620-20c943cc4669")],
    },
    "Ibanez Classical Guitar": {
        "remote": [unsplash("1516924962500-2b4b3b99ea02"), unsplash("1525201548942-d8732f6617a0")],
        "generate": "Ibanez nylon-string classical guitar full instrument only, no people, no hands, isolated product on pure white background, ecommerce studio photography",
    },
    "Taylor 12-String Guitar": {
        "remote": [unsplash("1525201548942-d8732f6617a0"), unsplash("1516924962500-2b4b3b99ea02")],
    },
    "Martin Ukulele": {
        "remote": [unsplash("1516924962500-2b4b3b99ea02"), unsplash("1493225457124-a3eb161ffa5f")],
        "generate": "Martin soprano ukulele mahogany body, product photo on white background, sharp ecommerce shot",
    },
    "PRS Custom 24 Electric Guitar": {
        "remote": [unsplash("1564186763535-ebb21ef5277f"), unsplash("1550291652-6ea9114a47b1")],
    },
    "Used Fender Stratocaster": {
        "remote": [unsplash("1550291652-6ea9114a47b1"), unsplash("1564186763535-ebb21ef5277f")],
    },
    "Roland Digital Piano": {
        "remote": [unsplash("1520523839897-bd0b52f945a0"), unsplash("1513883049090-d0b7439799bf")],
    },
    "Korg Synthesizer": {
        "remote": [unsplash("1552422535-c45813c61732"), unsplash("1520523839897-bd0b52f945a0")],
    },
    "Akai MIDI Controller": {
        "remote": [unsplash("1552422535-c45813c61732"), unsplash("1598488035139-bdbb2231ce04")],
        "generate": "Akai MPK Mini MIDI keyboard controller only, no people, no hands, isolated product on white background, ecommerce product photo",
    },
    "Yamaha Stage Piano": {
        "remote": [unsplash("1513883049090-d0b7439799bf"), unsplash("1520523839897-bd0b52f945a0")],
    },
    "Native Instruments Workstation": {
        "remote": [unsplash("1552422535-c45813c61732"), unsplash("1598488035139-bdbb2231ce04")],
    },
    "Used Roland Juno Synth": {
        "remote": [unsplash("1552422535-c45813c61732"), unsplash("1614148375099-46959409df52")],
    },
    "Yamaha Montage Workstation": {
        "remote": [unsplash("1520523839897-bd0b52f945a0"), unsplash("1513883049090-d0b7439799bf")],
    },
    "Pearl Acoustic Drum Kit": {
        "remote": [
            f"{W}/1/15/Bill_with_Hank_Jr._and_The_Bama_Band_1989_Pearl_Liquid_Amber_Kit.jpg",
            unsplash("1543443258-92b04ad5ec6b"),
        ],
    },
    "Roland Electronic Drum Kit": {
        "remote": [f"{W}/8/8f/Electronic_drum_kit_Roland.jpg", unsplash("1504898770365-14faca6a7320")],
    },
    "Tama Snare Drum": {
        "remote": [unsplash("1543443258-92b04ad5ec6b"), unsplash("1504898770365-14faca6a7320")],
    },
    "African Djembe": {
        "remote": [unsplash("1524230659092-07f99a75c013"), unsplash("1543443258-92b04ad5ec6b")],
    },
    "Zildjian Cymbal Set": {
        "remote": [unsplash("1543443258-92b04ad5ec6b"), unsplash("1504898770365-14faca6a7320")],
        "generate": "Zildjian brass cymbal set hi-hat crash and ride on stand, product photo white background",
    },
    "Shure SM58 Microphone": {
        "remote": [f"{W}/5/5c/Shure_SM58.jpg", unsplash("1598488035139-bdbb2231ce04")],
    },
    "Audio-Technica Condenser Microphone": {
        "remote": [f"{W}/2/2e/Audio-technica_AT2020.JPG", unsplash("1598488035139-bdbb2231ce04")],
    },
    "Shure Wireless Microphone System": {
        "remote": [f"{W}/8/8d/Shure_Wireless_Microphone_SM58.jpg", unsplash("1598488035139-bdbb2231ce04")],
    },
    "Rode USB Microphone": {
        "remote": [wiki("e/e2/Rode_NT-USB.jpg"), unsplash("1598488035139-bdbb2231ce04")],
        "generate": "Rode NT-USB studio condenser microphone with desk stand, product photo white background",
    },
    "Sennheiser Lavalier Microphone": {
        "remote": [unsplash("1598488035139-bdbb2231ce04"), unsplash("1619983081563-430f63602796")],
        "generate": "Sennheiser lavalier clip-on microphone with cable, product only, no people, white background, ecommerce photo",
    },
    "JBL Studio Monitor Pair": {
        "remote": [unsplash("1545167622-3a6ac756afa4"), unsplash("1619983081563-430f63602796")],
        "generate": "Pair of JBL studio monitor speakers black, product only, no people, white background, ecommerce product photography",
    },
    "JBL PA Speaker": {
        "remote": [unsplash("1545167622-3a6ac756afa4"), unsplash("1619983081563-430f63602796")],
        "generate": "JBL powered PA speaker cabinet 15 inch, product only, no crowd, no people, white background, ecommerce shot",
    },
    "Yamaha Subwoofer": {
        "remote": [unsplash("1545167622-3a6ac756afa4"), unsplash("1619983081563-430f63602796")],
        "generate": "Yamaha powered subwoofer speaker cabinet black, product only, no people, white background, ecommerce photography",
    },
    "KRK Rokit Studio Monitors": {
        "remote": [unsplash("1545167622-3a6ac756afa4"), unsplash("1619983081563-430f63602796")],
        "generate": "KRK Rokit studio monitor speakers pair yellow cones, product only, no people, white background, ecommerce product photo",
    },
    "Pioneer DJ Controller": {
        "remote": [
            wiki("c/c4/Pioneer_DDJ-RX_DJ-Controller_%28front%29_with_computer_running_mixing_software_Rekordbox.jpg"),
            unsplash("1571327073757-71d13c24de30"),
        ],
    },
    "Technics Turntable": {
        "remote": [f"{W}/7/7d/Technics_1200_MK2%2C_Technics_1210_MK2_%26_Pioneer_DJM-500.jpg", unsplash("1571327073757-71d13c24de30")],
    },
    "Pioneer CDJ Player": {
        "remote": [f"{W}/5/51/CDJ_2000-edit.jpg", unsplash("1571327073757-71d13c24de30")],
    },
    "Numark DJ Mixer": {
        "remote": [unsplash("1571327073757-71d13c24de30"), unsplash("1545167622-3a6ac756afa4")],
        "generate": "Numark DJ mixer console with faders and knobs, product only, no people, white background, ecommerce photography",
    },
    "Pioneer DDJ-1000 Controller": {
        "remote": [
            wiki("c/c4/Pioneer_DDJ-RX_DJ-Controller_%28front%29_with_computer_running_mixing_software_Rekordbox.jpg"),
            unsplash("1571327073757-71d13c24de30"),
        ],
        "generate": "Pioneer DDJ-1000 4-channel DJ controller with jog wheels and mixer section, product photo white background",
    },
    "Focusrite USB Audio Interface": {
        "remote": [wiki("8/8f/Focusrite_Scarlett_18i8_Front.jpg"), unsplash("1619983081563-430f63602796")],
        "generate": "Focusrite Scarlett 2i2 red USB audio interface front view, product photo white background",
    },
    "Steinberg Thunderbolt Interface": {
        "remote": [unsplash("1619983081563-430f63602796"), unsplash("1545167622-3a6ac756afa4")],
    },
    "M-Audio Portable Interface": {
        "remote": [unsplash("1619983081563-430f63602796"), unsplash("1548123378-bde4eca81d2d")],
        "generate": "M-Audio compact portable USB audio interface, product photo white background",
    },
    "Behringer DI Box": {
        "remote": [unsplash("1619983081563-430f63602796"), unsplash("1545167622-3a6ac756afa4")],
        "generate": "Behringer DI direct injection box metal housing XLR jacks, product photo white background",
    },
    "Audio-Technica Studio Headphones": {
        "remote": [unsplash("1545167622-3a6ac756afa4"), unsplash("1619983081563-430f63602796")],
        "generate": "Audio-Technica studio headphones black over-ear, product only, no people, white background, ecommerce product photo",
    },
    "Pioneer DJ Headphones": {
        "remote": [unsplash("1545167622-3a6ac756afa4"), unsplash("1619983081563-430f63602796")],
        "generate": "Pioneer DJ headphones black over-ear, product only, no people, white background, ecommerce shot",
    },
    "Shure In-Ear Monitors": {
        "remote": [unsplash("1545167622-3a6ac756afa4"), unsplash("1619983081563-430f63602796")],
        "generate": "Shure in-ear monitor earphones with cable, product only, no people, white background, ecommerce photo",
    },
    "Sony Wireless Headphones": {
        "remote": [unsplash("1545167622-3a6ac756afa4"), unsplash("1619983081563-430f63602796")],
        "generate": "Sony wireless over-ear headphones black, product only, no people, white background, ecommerce product photo",
    },
    "Beyerdynamic Reference Headphones": {
        "remote": [unsplash("1545167622-3a6ac756afa4"), unsplash("1619983081563-430f63602796")],
        "generate": "Beyerdynamic reference studio headphones gray, product only, no people, white background, ecommerce shot",
    },
    "Fender Guitar Amplifier": {
        "remote": [wiki("d/dc/Fender_Princeton_Reverb_Amp.jpg"), unsplash("1548123378-bde4eca81d2d")],
        "generate": "Fender Princeton Reverb tube guitar amplifier combo, product photo white background",
    },
    "Ampeg Bass Amplifier": {
        "remote": [unsplash("1611532736597-de2d4265fba3"), unsplash("1548123378-bde4eca81d2d")],
    },
    "Roland Keyboard Amplifier": {
        "remote": [unsplash("1619983081563-430f63602796"), unsplash("1548123378-bde4eca81d2d")],
        "generate": "Roland keyboard amplifier combo amp, product only, no people, white background, ecommerce product photo",
    },
    "Crown Power Amplifier": {
        "remote": [unsplash("1619983081563-430f63602796"), unsplash("1545167622-3a6ac756afa4")],
        "generate": "Crown professional rack-mount power amplifier black faceplate, product photo white background",
    },
    "Chauvet LED Par Can": {
        "remote": [unsplash("1545167622-3a6ac756afa4"), unsplash("1619983081563-430f63602796")],
        "generate": "Chauvet RGB LED par can stage light, product only, no people, white background, ecommerce studio shot",
    },
    "American DJ Moving Head Light": {
        "remote": [unsplash("1545167622-3a6ac756afa4"), unsplash("1619983081563-430f63602796")],
        "generate": "American DJ moving head stage light fixture, product only, no people, white background, sharp detail",
    },
    "Laser Light Show System": {
        "remote": [unsplash("1545167622-3a6ac756afa4"), unsplash("1619983081563-430f63602796")],
        "generate": "RGB laser light show projector unit, product only, no people, dark background with subtle laser beams, ecommerce shot",
    },
    "Strobe Light": {
        "remote": [unsplash("1545167622-3a6ac756afa4"), unsplash("1619983081563-430f63602796")],
        "generate": "Professional strobe light stage unit, product only, no people, white background, ecommerce product photo",
    },
    "DMX Light Controller": {
        "remote": [unsplash("1571327073757-71d13c24de30"), unsplash("1545167622-3a6ac756afa4")],
        "generate": "DMX512 stage lighting controller console with faders and buttons, product photo white background",
    },
    "Guitar Strings Pack": {
        "remote": [unsplash("1511379938544-6d6a8132e1a5"), unsplash("1564186763535-ebb21ef5277f")],
        "generate": "Ernie Ball electric guitar strings sealed pack product photo white background",
    },
    "Professional Drum Sticks": {
        "remote": [unsplash("1543443258-92b04ad5ec6b"), unsplash("1504898770365-14faca6a7320")],
        "generate": "Pair of wooden drumsticks Vic Firth style, product only, no people, white background, ecommerce product photo",
    },
    "XLR Cable Pack": {
        "remote": [unsplash("1619983081563-430f63602796"), unsplash("1545167622-3a6ac756afa4")],
        "generate": "Coiled XLR microphone cables with gold connectors, product only, no people, white background, ecommerce shot",
    },
    "Microphone Boom Stand": {
        "remote": [unsplash("1598488035139-bdbb2231ce04"), unsplash("1619983081563-430f63602796")],
        "generate": "Professional microphone boom stand black metal telescopic arm, product only, no people, white background",
    },
    "Guitar Hard Case": {
        "remote": [unsplash("1564186763535-ebb21ef5277f"), unsplash("1525201548942-d8732f6617a0")],
        "generate": "Hard shell electric guitar flight case black tolex, product only, no people, white background",
    },
    "Guitar Effects Pedal": {
        "remote": [f"{W}/d/dd/BOSS_PW-10_V-Wah_pedal.jpg", f"{W}/thumb/1/12/BOSS_guitar_pedals.jpg/960px-BOSS_guitar_pedals.jpg"],
    },
    "Clip-On Guitar Tuner": {
        "remote": [unsplash("1511379938544-6d6a8132e1a5"), unsplash("1564186763535-ebb21ef5277f")],
        "generate": "Korg clip-on chromatic guitar tuner on headstock, product photo white background",
    },
    "Music Stand": {
        "remote": [unsplash("1519898963993-f44ef2512d88"), unsplash("1511379938544-6d6a8132e1a5")],
        "generate": "Black foldable orchestral music stand with sheet music, product photo white background",
    },
}


def local_urls_for_product(name: str) -> dict:
    """Return image_url + images list using local public paths."""
    sources = PRODUCT_IMAGE_SOURCES.get(name, {})
    remote = sources.get("remote", [])
    if not remote and "generate" not in sources:
        return {"image_url": "", "images": []}

    image_url = local_path(name, 0)
    carousel = [local_path(name, i) for i in range(1, len(remote))]
    return {"image_url": image_url, "images": carousel}
