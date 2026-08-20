ROLE_DASHBOARD_META = {
    "administrator": {
        "title": "Administrator Dashboard",
        "subtitle": (
            "Platform-wide monitoring, user management and "
            "operational intelligence."
        ),
    },

    "manager": {
        "title": "Sustainability Manager Dashboard",
        "subtitle": (
            "Sustainability performance, environmental impact "
            "and ESG intelligence."
        ),
    },

    "manufacturer": {
        "title": "Manufacturer Dashboard",
        "subtitle": (
            "Production waste analysis, material recovery and "
            "circular-economy intelligence."
        ),
    },

    "recycler": {
        "title": "Recycling Facility Dashboard",
        "subtitle": (
            "Recycling opportunities, processing analytics and "
            "recovery performance."
        ),
    },
}


def get_role_dashboard_meta(role: str) -> dict:
    return ROLE_DASHBOARD_META.get(
        role,
        ROLE_DASHBOARD_META["manufacturer"],
    )