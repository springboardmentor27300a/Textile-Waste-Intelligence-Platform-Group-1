from types import SimpleNamespace


def _to_report_object(data):
    """
    Convert dictionary data into an object for report classes
    that use attribute access.
    """

    if isinstance(data, SimpleNamespace):
        return data

    if isinstance(data, dict):
        return SimpleNamespace(**data)

    return data


class PDFService:
    """
    Central dispatcher for all TWIP PDF report generators.
    """

    # ==========================================================
    # ANALYSIS
    # ==========================================================

    @staticmethod
    def analysis(data):
        from .analysis_report import AnalysisReport

        return AnalysisReport(
            _to_report_object(data)
        ).generate()

    # ==========================================================
    # MATERIAL
    # ==========================================================

    @staticmethod
    def material(data):
        from .material_report import MaterialReport

        # MaterialReport uses dictionary access:
        # data["material"]
        # data["material_category"]
        #
        # Therefore DO NOT convert the dictionary.
        return MaterialReport(
            data
        ).generate()

    # ==========================================================
    # WASTE
    # ==========================================================

    @staticmethod
    def waste(data):
        from .waste_report import WasteReport

        # WasteReport uses dictionary access:
        # data["waste_category"]
        # data["waste_subcategory"]
        #
        # Therefore DO NOT convert the dictionary.
        return WasteReport(
            data
        ).generate()

    # ==========================================================
    # INVENTORY
    # ==========================================================

    @staticmethod
    def inventory(data):
        from .inventory_report import InventoryReport

        return InventoryReport(
            _to_report_object(data)
        ).generate()

    # ==========================================================
    # SUSTAINABILITY
    # ==========================================================

    @staticmethod
    def sustainability(data):
        from .sustainability_report import SustainabilityReport

        # SustainabilityReport uses attribute access:
        # data.carbon_savings
        # data.water_savings
        # data.energy_savings
        #
        # Therefore convert dictionary -> SimpleNamespace.
        return SustainabilityReport(
            _to_report_object(data)
        ).generate()

    # ==========================================================
    # COLLECTION
    # ==========================================================

    @staticmethod
    def collection(data):
        from .collection_report import CollectionReport

        return CollectionReport(
            _to_report_object(data)
        ).generate()

    # ==========================================================
    # WASTE SOURCE
    # ==========================================================

    @staticmethod
    def waste_source(data):
        from .waste_source_report import WasteSourceReport

        return WasteSourceReport(
            _to_report_object(data)
        ).generate()

    # ==========================================================
    # DASHBOARD
    # ==========================================================

    @staticmethod
    def dashboard(data):
        from .dashboard_report import DashboardReport

        return DashboardReport(
            _to_report_object(data)
        ).generate()

    # ==========================================================
    # COMPREHENSIVE
    # ==========================================================

    @staticmethod
    def comprehensive(data):
        from .comprehensive_report import ComprehensiveReport

        return ComprehensiveReport(
            _to_report_object(data)
        ).generate()

    # ==========================================================
    # FOCUSED REPORTS
    # ==========================================================

    @staticmethod
    def focused(
        data,
        report_type,
        title,
    ):
        from .focused_report import FocusedReport

        # FocusedReport uses dictionary methods:
        # data.get(...)
        # data["..."]
        #
        # Therefore DO NOT convert to SimpleNamespace.
        return FocusedReport(
            data,
            report_type,
            title,
        ).generate()