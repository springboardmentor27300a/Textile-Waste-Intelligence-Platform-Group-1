import {
  AlertCircle,
  Loader2,
  ImagePlus,
  Plus,
  ClipboardList,
  FileText,
  Recycle,
  Leaf,
  Factory,
  Users,
  BarChart3,
  Package,
  ShieldCheck,
  Activity,
} from "lucide-react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import KPIGrid from "../../components/dashboard/KPIGrid";
import QuickActionCard from "../../components/dashboard/QuickActionCard";
import SectionHeader from "../../components/dashboard/SectionHeader";

import RecentAnalysisTable from "../../components/dashboard/RecentAnalysisTable";
import RecentCollectionsTable from "../../components/dashboard/RecentCollectionsTable";
import CompanyRankingCard from "../../components/dashboard/CompanyRankingCard";
import MaterialDistributionChart from "../../components/dashboard/MaterialDistributionChart";
import WasteDistributionChart from "../../components/dashboard/WasteDistributionChart";
import MonthlyTrendChart from "../../components/dashboard/MonthlyTrendChart";
import RoleDashboardSummary from "../../components/dashboard/RoleDashboardSummary";

import { Card } from "../../components/ui";

import useDashboard from "../../hooks/useDashboard";


function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch {
    return {};
  }
}


function normalizeRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();

  if (
    value === "administrator" ||
    value === "admin"
  ) {
    return "administrator";
  }

  if (
    value === "manager" ||
    value === "sustainability_manager" ||
    value === "sustainability manager"
  ) {
    return "manager";
  }

  if (
    value === "manufacturer" ||
    value === "manufacturing"
  ) {
    return "manufacturer";
  }

  if (
    value === "recycler" ||
    value === "recycling_facility" ||
    value === "recycling facility"
  ) {
    return "recycler";
  }

  if (value === "operator") {
    return "manufacturer";
  }

  return "manufacturer";
}


function Dashboard() {

  const user = getStoredUser();

  const role = normalizeRole(
    user?.role
  );

  const {
    kpis,
    trends,
    companySummary,
    companyRanking,
    materialDistribution,
    wasteDistribution,
    recentCollections,
    recentAnalysis,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useDashboard();


  if (isLoading) {

    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2
          size={42}
          className="animate-spin text-blue-600"
        />
      </div>
    );
  }


  if (error) {

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8">

        <div className="flex items-start gap-4">

          <AlertCircle
            size={24}
            className="mt-1 shrink-0 text-red-600"
          />

          <div>

            <h2 className="text-lg font-semibold text-red-700">
              Failed to load dashboard
            </h2>

            <p className="mt-2 text-sm text-red-600">
              The dashboard data could not be loaded.
              Please try again.
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Retry
            </button>

          </div>

        </div>

      </div>
    );
  }


  const roleTitles = {

    administrator: {
      title: "Administrator Dashboard",
      subtitle:
        "Platform-wide administration, monitoring, analytics and report management.",
    },

    manager: {
      title: "Sustainability Manager Dashboard",
      subtitle:
        "Sustainability performance, environmental impact, waste diversion and ESG intelligence.",
    },

    manufacturer: {
      title: "Manufacturer Dashboard",
      subtitle:
        "Production waste, material intelligence, recovery and circular economy performance.",
    },

    recycler: {
      title: "Recycling Facility Dashboard",
      subtitle:
        "Waste inventory, recycling opportunities, processing analytics and recovery statistics.",
    },

  };


  const currentRole =
    roleTitles[role] ||
    roleTitles.manufacturer;


  return (

    <div className="space-y-10">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                {role === "administrator" && (
                  <ShieldCheck size={23} />
                )}

                {role === "manager" && (
                  <Leaf size={23} />
                )}

                {role === "manufacturer" && (
                  <Factory size={23} />
                )}

                {role === "recycler" && (
                  <Recycle size={23} />
                )}

              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {role.replace("_", " ")}
              </span>

            </div>

            <h1 className="text-3xl font-bold text-heading md:text-4xl">
              {currentRole.title}
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
              {currentRole.subtitle}
            </p>

          </div>

          <DashboardHeader
            onRefresh={refetch}
            isFetching={isFetching}
          />

        </div>

      </div>


      {/* =====================================================
          ROLE-SPECIFIC KPI GRID
          ===================================================== */}

      <SectionHeader
        title={
          role === "administrator"
            ? "Platform Overview"
            : role === "manager"
              ? "Sustainability Overview"
              : role === "manufacturer"
                ? "Production & Recovery Overview"
                : "Recycling & Recovery Overview"
        }
        subtitle={
          role === "administrator"
            ? "Key operational indicators across the TWIP platform."
            : role === "manager"
              ? "Key sustainability and environmental performance indicators."
              : role === "manufacturer"
                ? "Key production waste, recovery and circularity indicators."
                : "Key waste processing, recycling and recovery indicators."
        }
      />

      <KPIGrid
        role={role}
        kpis={kpis}
      />


      {/* =====================================================
          ROLE SUMMARY
          ===================================================== */}

      <RoleDashboardSummary
        role={role}
        kpis={kpis}
        trends={trends}
      />


      {/* =====================================================
          ADMINISTRATOR
          ===================================================== */}

      {role === "administrator" && (

        <>

          <SectionHeader
            title="Platform Analytics"
            subtitle="Monitor activity across organizations, collections and AI analysis."
          />

          <div className="grid gap-6 xl:grid-cols-2">

            <MaterialDistributionChart
              data={materialDistribution}
            />

            <WasteDistributionChart
              data={wasteDistribution}
            />

          </div>

          <MonthlyTrendChart
            role={role}
            trends={trends}
          />


          <SectionHeader
            title="Organization Performance"
            subtitle="Compare sustainability and operational performance across organizations."
          />

          <CompanyRankingCard
            companies={companyRanking}
            summary={companySummary}
          />


          <SectionHeader
            title="Recent Platform Activity"
            subtitle="Latest AI analyses and textile collection activities."
          />

          <div className="grid gap-8 xl:grid-cols-2">

            <RecentAnalysisTable
              data={recentAnalysis}
            />

            <RecentCollectionsTable
              data={recentCollections}
            />

          </div>

        </>

      )}


      {/* =====================================================
          SUSTAINABILITY MANAGER
          ===================================================== */}

      {role === "manager" && (

        <>

          <SectionHeader
            title="Environmental & Sustainability Intelligence"
            subtitle="Monitor environmental impact, resource conservation and circular economy performance."
          />

          <div className="grid gap-6 xl:grid-cols-2">

            <WasteDistributionChart
              data={wasteDistribution}
            />

            <MaterialDistributionChart
              data={materialDistribution}
            />

          </div>

          <MonthlyTrendChart
            role={role}
            trends={trends}
          />


          <SectionHeader
            title="Organization Sustainability Performance"
            subtitle="Benchmark organizational sustainability performance."
          />

          <CompanyRankingCard
            companies={companyRanking}
            summary={companySummary}
          />

        </>

      )}


      {/* =====================================================
          MANUFACTURER
          ===================================================== */}

      {role === "manufacturer" && (

        <>

          <SectionHeader
            title="Production Waste Intelligence"
            subtitle="Understand textile materials, waste categories and recovery opportunities."
          />

          <div className="grid gap-6 xl:grid-cols-2">

            <MaterialDistributionChart
              data={materialDistribution}
            />

            <WasteDistributionChart
              data={wasteDistribution}
            />

          </div>

          <MonthlyTrendChart
            role={role}
            trends={trends}
          />


          <SectionHeader
            title="Recent Production Waste Analysis"
            subtitle="Latest AI-powered textile analysis and collection records."
          />

          <div className="grid gap-8 xl:grid-cols-2">

            <RecentAnalysisTable
              data={recentAnalysis}
            />

            <RecentCollectionsTable
              data={recentCollections}
            />

          </div>

        </>

      )}


      {/* =====================================================
          RECYCLER
          ===================================================== */}

      {role === "recycler" && (

        <>

          <SectionHeader
            title="Waste Inventory & Material Intelligence"
            subtitle="Identify recyclable materials and prioritize high-value recovery opportunities."
          />

          <div className="grid gap-6 xl:grid-cols-2">

            <WasteDistributionChart
              data={wasteDistribution}
            />

            <MaterialDistributionChart
              data={materialDistribution}
            />

          </div>


          <MonthlyTrendChart
            role={role}
            trends={trends}
          />


          <SectionHeader
            title="Recycling Activity"
            subtitle="Latest incoming waste collections and AI analysis records."
          />

          <div className="grid gap-8 xl:grid-cols-2">

            <RecentCollectionsTable
              data={recentCollections}
            />

            <RecentAnalysisTable
              data={recentAnalysis}
            />

          </div>

        </>

      )}


      {/* =====================================================
          ROLE-SPECIFIC QUICK ACTIONS
          ===================================================== */}

      <SectionHeader
        title="Quick Actions"
        subtitle="Actions relevant to your role."
      />


      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">


        {role === "administrator" && (
          <>
            <QuickActionCard
              title="User Management"
              description="Manage platform users and roles."
              icon={Users}
              to="/users"
            />

            <QuickActionCard
              title="Platform Reports"
              description="Review analytics and reports."
              icon={FileText}
              to="/reports"
            />

            <QuickActionCard
              title="Collections"
              description="Monitor textile collection activity."
              icon={Package}
              to="/collections"
            />

            <QuickActionCard
              title="Analytics"
              description="Open platform analytics."
              icon={BarChart3}
              to="/analytics"
            />
          </>
        )}


        {role === "manager" && (
          <>
            <QuickActionCard
              title="Sustainability"
              description="Review sustainability intelligence."
              icon={Leaf}
              to="/sustainability"
            />

            <QuickActionCard
              title="Environmental Reports"
              description="Generate environmental reports."
              icon={Activity}
              to="/reports"
            />

            <QuickActionCard
              title="Reports"
              description="Review sustainability and ESG reports."
              icon={FileText}
              to="/reports"
            />

            <QuickActionCard
              title="Analytics"
              description="Review sustainability analytics."
              icon={BarChart3}
              to="/analytics"
            />
          </>
        )}


        {role === "manufacturer" && (
          <>
            <QuickActionCard
              title="New Collection"
              description="Register production waste."
              icon={Plus}
              to="/collections/add"
            />

            <QuickActionCard
              title="AI Analysis"
              description="Analyze textile waste."
              icon={ImagePlus}
              to="/image-analysis"
            />

            <QuickActionCard
              title="Inventory"
              description="Manage textile inventory."
              icon={ClipboardList}
              to="/inventory"
            />

            <QuickActionCard
              title="Reports"
              description="Review waste and recovery reports."
              icon={FileText}
              to="/reports"
            />
          </>
        )}


        {role === "recycler" && (
          <>
            <QuickActionCard
              title="Waste Inventory"
              description="Review available textile waste."
              icon={Package}
              to="/inventory"
            />

            <QuickActionCard
              title="AI Analysis"
              description="Analyze incoming textile waste."
              icon={ImagePlus}
              to="/image-analysis"
            />

            <QuickActionCard
              title="Recycling Engine"
              description="Review recycling recommendations."
              icon={Recycle}
              to="/recycling-engine"
            />

            <QuickActionCard
              title="Reports"
              description="Review recycling and recovery reports."
              icon={FileText}
              to="/reports"
            />
          </>
        )}

      </div>


      {/* =====================================================
          ROLE FOOTER SUMMARY
          ===================================================== */}

      <Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          <div>
            <p className="text-sm text-muted">
              Total Waste
            </p>

            <h3 className="mt-2 text-2xl font-bold text-heading">
              {Number(
                kpis?.total_waste ?? 0
              ).toFixed(2)} kg
            </h3>
          </div>


          <div>
            <p className="text-sm text-muted">
              Recyclable Waste
            </p>

            <h3 className="mt-2 text-2xl font-bold text-heading">
              {Number(
                kpis?.recyclable_weight ?? 0
              ).toFixed(2)} kg
            </h3>
          </div>


          <div>
            <p className="text-sm text-muted">
              Recovery Rate
            </p>

            <h3 className="mt-2 text-2xl font-bold text-heading">
              {Number(
                kpis?.recovery_percentage ??
                kpis?.recovery_rate ??
                0
              ).toFixed(1)}%
            </h3>
          </div>


          <div>
            <p className="text-sm text-muted">
              Sustainability
            </p>

            <h3 className="mt-2 text-2xl font-bold text-heading">
              {Number(
                kpis?.sustainability_score ?? 0
              ).toFixed(1)}%
            </h3>
          </div>

        </div>

      </Card>

    </div>
  );
}


export default Dashboard;