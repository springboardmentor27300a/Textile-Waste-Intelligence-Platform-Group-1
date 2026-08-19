MATERIAL_CLASSES = [
    "COTTON",
    "POLYESTER",
    "WOOL",
    "SILK",
    "DENIM",
    "NYLON",
    "LINEN",
    "RAYON",
    "ACRYLIC",
    "BLENDED",
    "UNKNOWN",
]


MATERIAL_GROUPS = {
    "COTTON": "NATURAL",
    "WOOL": "NATURAL",
    "SILK": "NATURAL",
    "LINEN": "NATURAL",

    "POLYESTER": "SYNTHETIC",
    "NYLON": "SYNTHETIC",
    "ACRYLIC": "SYNTHETIC",

    "RAYON": "REGENERATED",

    "DENIM": "FABRIC_TYPE",

    "BLENDED": "BLENDED",
    "UNKNOWN": "UNKNOWN",
}


def normalize_material(material: str) -> str:
    value = material.strip().upper()

    aliases = {
        "POLY": "POLYESTER",
        "POLYESTER FABRIC": "POLYESTER",
        "COTTON FABRIC": "COTTON",
        "WOOLLEN": "WOOL",
        "WOOLEN": "WOOL",
        "VISCOSE": "RAYON",
        "VISCOSE RAYON": "RAYON",
        "JEANS": "DENIM",
        "JEAN": "DENIM",
        "MIXED": "BLENDED",
        "MIX": "BLENDED",
    }

    value = aliases.get(value, value)

    if value not in MATERIAL_CLASSES:
        return "UNKNOWN"

    return value


def get_material_group(material: str) -> str:
    normalized = normalize_material(material)

    return MATERIAL_GROUPS[normalized]