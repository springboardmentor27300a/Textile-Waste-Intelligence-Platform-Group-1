// import  useInventory  from "../../hooks/useInventory";

// const statusBadge = (condition) => {
//   switch (condition) {
//     case "Excellent":
//       return {
//         text: "Reusable",
//         style: "bg-green-100 text-green-700",
//       };

//     case "Good":
//       return {
//         text: "Recyclable",
//         style: "bg-blue-100 text-blue-700",
//       };

//     case "Fair":
//       return {
//         text: "Processing",
//         style: "bg-yellow-100 text-yellow-700",
//       };

//     case "Poor":
//       return {
//         text: "Inspection",
//         style: "bg-red-100 text-red-700",
//       };

//     default:
//       return {
//         text: "Unknown",
//         style: "bg-gray-100 text-gray-700",
//       };
//   }
// };

// function WasteTable() {
//   const { inventory } = useInventory();

//   const recentWaste = [...inventory]
//     .sort(
//       (a, b) =>
//         new Date(b.collection_date) -
//         new Date(a.collection_date)
//     )
//     .slice(0, 5);

//   return (
//     <div className="overflow-hidden rounded-2xl bg-white shadow-card">

//       <table className="w-full">

//         <thead className="bg-gray-50">

//           <tr>

//             <th className="px-6 py-4 text-left">
//               Batch ID
//             </th>

//             <th className="px-6 py-4 text-left">
//               Material
//             </th>

//             <th className="px-6 py-4 text-left">
//               Quantity
//             </th>

//             <th className="px-6 py-4 text-left">
//               Status
//             </th>

//           </tr>

//         </thead>

//         <tbody>

//           {recentWaste.map((row) => {
//             const badge = statusBadge(row.condition);

//             return (
//               <tr
//                 key={row.id}
//                 className="border-t transition hover:bg-blue-50/40"
//               >

//                 <td className="px-6 py-4 font-medium">
//                   {row.batch_id}
//                 </td>

//                 <td className="px-6 py-4">
//                   {row.fabric}
//                 </td>

//                 <td className="px-6 py-4">
//                   {row.quantity} kg
//                 </td>

//                 <td className="px-6 py-4">

//                   <span
//                     className={`rounded-full px-3 py-1 text-sm font-medium ${badge.style}`}
//                   >
//                     {badge.text}
//                   </span>

//                 </td>

//               </tr>
//             );
//           })}

//           {recentWaste.length === 0 && (

//             <tr>

//               <td
//                 colSpan={4}
//                 className="py-10 text-center text-muted"
//               >
//                 No waste batches available.
//               </td>

//             </tr>

//           )}

//         </tbody>

//       </table>

//     </div>
//   );
// }

// export default WasteTable;