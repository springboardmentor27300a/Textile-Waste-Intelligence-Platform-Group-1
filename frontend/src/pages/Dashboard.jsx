// import {
//   ArrowRight,
//   BrainCircuit,
//   ClipboardPlus,
//   Factory,
//   Leaf,
//   PackageSearch,
//   Recycle,
//   ScanLine,
//   TrendingUp,
// } from "lucide-react";

// import { Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function Dashboard() {
//   const { user } = useAuth();

//   return (
//     <div className="page">
//       <div className="page-header dashboard-header">
//         <div>
//           <span className="page-eyebrow">
//             OVERVIEW
//           </span>

//           <h1>
//             Welcome back,{" "}
//             {user?.full_name?.split(" ")[0] || "User"}
//           </h1>

//           <p>
//             Monitor textile waste operations,
//             material intelligence and sustainability
//             performance.
//           </p>
//         </div>

//         <Link
//           to="/waste/register"
//           className="primary-action"
//         >
//           <ClipboardPlus size={18} />
//           Register Waste
//         </Link>
//       </div>

//       <section className="metric-grid">
//         <article className="metric-card">
//           <div className="metric-icon">
//             <PackageSearch size={21} />
//           </div>

//           <div>
//             <span>Total Waste Batches</span>
//             <strong>--</strong>
//             <small>Inventory records</small>
//           </div>
//         </article>

//         <article className="metric-card">
//           <div className="metric-icon">
//             <Factory size={21} />
//           </div>

//           <div>
//             <span>Facilities</span>
//             <strong>--</strong>
//             <small>Active facilities</small>
//           </div>
//         </article>

//         <article className="metric-card">
//           <div className="metric-icon">
//             <BrainCircuit size={21} />
//           </div>

//           <div>
//             <span>Analysed Batches</span>
//             <strong>--</strong>
//             <small>AI classifications</small>
//           </div>
//         </article>

//         <article className="metric-card">
//           <div className="metric-icon">
//             <Leaf size={21} />
//           </div>

//           <div>
//             <span>Recovery Potential</span>
//             <strong>--</strong>
//             <small>Available after analysis</small>
//           </div>
//         </article>
//       </section>

//       <div className="dashboard-columns">
//         <section className="content-card">
//           <div className="card-heading">
//             <div>
//               <h2>Waste Intelligence Workflow</h2>
//               <p>
//                 Follow the textile waste analysis
//                 lifecycle.
//               </p>
//             </div>
//           </div>

//           <div className="workflow-list">
//             <Link
//               to="/waste/register"
//               className="workflow-item"
//             >
//               <div className="workflow-number">01</div>

//               <div className="workflow-icon">
//                 <ClipboardPlus size={20} />
//               </div>

//               <div>
//                 <strong>Register Waste</strong>
//                 <span>
//                   Record a textile waste batch and its
//                   source information.
//                 </span>
//               </div>

//               <ArrowRight size={18} />
//             </Link>

//             <Link
//               to="/analysis/images"
//               className="workflow-item"
//             >
//               <div className="workflow-number">02</div>

//               <div className="workflow-icon">
//                 <ScanLine size={20} />
//               </div>

//               <div>
//                 <strong>Image Analysis</strong>
//                 <span>
//                   Upload textile images for automated
//                   material analysis.
//                 </span>
//               </div>

//               <ArrowRight size={18} />
//             </Link>

//             <Link
//               to="/classification/material"
//               className="workflow-item"
//             >
//               <div className="workflow-number">03</div>

//               <div className="workflow-icon">
//                 <BrainCircuit size={20} />
//               </div>

//               <div>
//                 <strong>Classification</strong>
//                 <span>
//                   Identify material and waste
//                   characteristics.
//                 </span>
//               </div>

//               <ArrowRight size={18} />
//             </Link>

//             <Link
//               to="/recommendations"
//               className="workflow-item"
//             >
//               <div className="workflow-number">04</div>

//               <div className="workflow-icon">
//                 <Recycle size={20} />
//               </div>

//               <div>
//                 <strong>Recovery Intelligence</strong>
//                 <span>
//                   Discover reuse, recycling and recovery
//                   opportunities.
//                 </span>
//               </div>

//               <ArrowRight size={18} />
//             </Link>
//           </div>
//         </section>

//         <section className="content-card">
//           <div className="card-heading">
//             <div>
//               <h2>Platform Status</h2>
//               <p>Milestone capability overview</p>
//             </div>
//           </div>

//           <div className="capability-list">
//             <div className="capability-row">
//               <span>Authentication & RBAC</span>
//               <span className="status-badge success">
//                 Active
//               </span>
//             </div>

//             <div className="capability-row">
//               <span>Organization Management</span>
//               <span className="status-badge success">
//                 Active
//               </span>
//             </div>

//             <div className="capability-row">
//               <span>Waste Inventory</span>
//               <span className="status-badge success">
//                 Active
//               </span>
//             </div>

//             <div className="capability-row">
//               <span>Image Management</span>
//               <span className="status-badge success">
//                 Active
//               </span>
//             </div>

//             <div className="capability-row">
//               <span>Material AI</span>
//               <span className="status-badge pending">
//                 Pipeline Ready
//               </span>
//             </div>

//             <div className="capability-row">
//               <span>Sustainability Engine</span>
//               <span className="status-badge future">
//                 Upcoming
//               </span>
//             </div>
//           </div>

//           <div className="sustainability-callout">
//             <TrendingUp size={22} />

//             <div>
//               <strong>
//                 Sustainability intelligence
//               </strong>

//               <p>
//                 Environmental impact metrics will
//                 populate as analysed waste data becomes
//                 available.
//               </p>
//             </div>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";

import {
  ArrowRight,
  BrainCircuit,
  ClipboardPlus,
  Factory,
  Leaf,
  PackageSearch,
  Recycle,
  ScanLine,
  TrendingUp,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  getWasteBatches,
} from "../services/wasteBatchService";

import {
  getFacilities,
} from "../services/facilityService";


export default function Dashboard() {
  const { user } =
    useAuth();


  const [stats, setStats] =
    useState({
      batches: 0,
      facilities: 0,
      analysed: 0,
      recovery: null,
    });


  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    async function loadDashboard() {
      try {

        const [
          batchData,
          facilitiesData,
        ] = await Promise.all([
          getWasteBatches({
            page: 1,
            page_size: 100,
          }),

          getFacilities(),
        ]);


        const batches =
          batchData.items || [];


        const analysed =
          batches.filter(
            (batch) =>
              batch.processing_status ===
              "ANALYZED"
          );


        const saved =
          localStorage.getItem(
            "latestAnalysis"
          );


        let recovery = null;


        if (saved) {
          try {

            const analysis =
              JSON.parse(saved);

            recovery =
              analysis?.waste_score
                ?.circularity_score ??
              null;

          } catch {
            recovery = null;
          }
        }


        setStats({
          batches:
            batchData.pagination
              ?.total_items ??
            batches.length,

          facilities:
            facilitiesData.filter(
              (facility) =>
                facility.is_active
            ).length,

          analysed:
            analysed.length,

          recovery,
        });

      } catch (error) {

        console.error(
          "Dashboard loading error:",
          error
        );

      } finally {

        setLoading(false);

      }
    }


    loadDashboard();

  }, []);


  return (
    <div className="page">

      <div className="page-header dashboard-header">

        <div>

          <span className="page-eyebrow">
            OVERVIEW
          </span>

          <h1>
            Welcome back,{" "}
            {user?.full_name
              ?.split(" ")[0] ||
              "User"}
          </h1>

          <p>
            Monitor textile waste
            operations, material
            intelligence and
            sustainability performance.
          </p>

        </div>


        <Link
          to="/waste/register"
          className="primary-action"
        >

          <ClipboardPlus
            size={18}
          />

          Register Waste

        </Link>

      </div>


      <section className="metric-grid">

        <article className="metric-card">

          <div className="metric-icon">
            <PackageSearch
              size={21}
            />
          </div>

          <div>

            <span>
              Total Waste Batches
            </span>

            <strong>
              {loading
                ? "..."
                : stats.batches}
            </strong>

            <small>
              Inventory records
            </small>

          </div>

        </article>


        <article className="metric-card">

          <div className="metric-icon">
            <Factory
              size={21}
            />
          </div>

          <div>

            <span>
              Facilities
            </span>

            <strong>
              {loading
                ? "..."
                : stats.facilities}
            </strong>

            <small>
              Active facilities
            </small>

          </div>

        </article>


        <article className="metric-card">

          <div className="metric-icon">
            <BrainCircuit
              size={21}
            />
          </div>

          <div>

            <span>
              Analysed Batches
            </span>

            <strong>
              {loading
                ? "..."
                : stats.analysed}
            </strong>

            <small>
              AI classifications
            </small>

          </div>

        </article>


        <article className="metric-card">

          <div className="metric-icon">
            <Leaf
              size={21}
            />
          </div>

          <div>

            <span>
              Recovery Potential
            </span>

            <strong>
              {stats.recovery !== null
                ? `${stats.recovery}%`
                : "--"}
            </strong>

            <small>
              Latest circularity score
            </small>

          </div>

        </article>

      </section>


      <div className="dashboard-columns">

        <section className="content-card">

          <div className="card-heading">

            <div>

              <h2>
                Waste Intelligence Workflow
              </h2>

              <p>
                Follow the textile waste
                analysis lifecycle.
              </p>

            </div>

          </div>


          <div className="workflow-list">

            <Link
              to="/waste/register"
              className="workflow-item"
            >

              <div className="workflow-number">
                01
              </div>

              <div className="workflow-icon">
                <ClipboardPlus
                  size={20}
                />
              </div>

              <div>

                <strong>
                  Register Waste
                </strong>

                <span>
                  Record a textile waste
                  batch and source information.
                </span>

              </div>

              <ArrowRight
                size={18}
              />

            </Link>


            <Link
              to="/analysis/images"
              className="workflow-item"
            >

              <div className="workflow-number">
                02
              </div>

              <div className="workflow-icon">
                <ScanLine
                  size={20}
                />
              </div>

              <div>

                <strong>
                  Image Analysis
                </strong>

                <span>
                  Upload textile images
                  for automated analysis.
                </span>

              </div>

              <ArrowRight
                size={18}
              />

            </Link>


            <Link
              to="/classification/material"
              className="workflow-item"
            >

              <div className="workflow-number">
                03
              </div>

              <div className="workflow-icon">
                <BrainCircuit
                  size={20}
                />
              </div>

              <div>

                <strong>
                  Material Classification
                </strong>

                <span>
                  Identify textile material
                  composition.
                </span>

              </div>

              <ArrowRight
                size={18}
              />

            </Link>


            <Link
              to="/classification/waste"
              className="workflow-item"
            >

              <div className="workflow-number">
                04
              </div>

              <div className="workflow-icon">
                <Recycle
                  size={20}
                />
              </div>

              <div>

                <strong>
                  Waste Classification
                </strong>

                <span>
                  Assess recyclability,
                  reuse and circularity.
                </span>

              </div>

              <ArrowRight
                size={18}
              />

            </Link>


            <Link
              to="/recommendations"
              className="workflow-item"
            >

              <div className="workflow-number">
                05
              </div>

              <div className="workflow-icon">
                <TrendingUp
                  size={20}
                />
              </div>

              <div>

                <strong>
                  Recommendations
                </strong>

                <span>
                  Identify recovery and
                  reuse strategies.
                </span>

              </div>

              <ArrowRight
                size={18}
              />

            </Link>


            <Link
              to="/sustainability"
              className="workflow-item"
            >

              <div className="workflow-number">
                06
              </div>

              <div className="workflow-icon">
                <Leaf
                  size={20}
                />
              </div>

              <div>

                <strong>
                  Sustainability
                </strong>

                <span>
                  Measure environmental
                  impact and circularity.
                </span>

              </div>

              <ArrowRight
                size={18}
              />

            </Link>

          </div>

        </section>


        <section className="content-card">

          <div className="card-heading">

            <div>

              <h2>
                Platform Status
              </h2>

              <p>
                Milestone capability overview
              </p>

            </div>

          </div>


          <div className="capability-list">

            <div className="capability-row">
              <span>
                Authentication & RBAC
              </span>

              <span className="status-badge success">
                Active
              </span>
            </div>


            <div className="capability-row">
              <span>
                Organization Management
              </span>

              <span className="status-badge success">
                Active
              </span>
            </div>


            <div className="capability-row">
              <span>
                Waste Inventory
              </span>

              <span className="status-badge success">
                Active
              </span>
            </div>


            <div className="capability-row">
              <span>
                Image Analysis
              </span>

              <span className="status-badge success">
                Active
              </span>
            </div>


            <div className="capability-row">
              <span>
                Material Classification
              </span>

              <span className="status-badge success">
                Active
              </span>
            </div>


            <div className="capability-row">
              <span>
                Waste Classification
              </span>

              <span className="status-badge success">
                Active
              </span>
            </div>


            <div className="capability-row">
              <span>
                Recommendation Engine
              </span>

              <span className="status-badge success">
                Active
              </span>
            </div>


            <div className="capability-row">
              <span>
                Sustainability Engine
              </span>

              <span className="status-badge success">
                Active
              </span>
            </div>

          </div>

        </section>

      </div>

    </div>
  );
}