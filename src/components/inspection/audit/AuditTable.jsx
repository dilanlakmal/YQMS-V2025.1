// import { Check, Table as TableIcon, X as XIcon } from "lucide-react"; // Using XIcon to avoid conflict
// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import AuditImageUpload from "./AuditImageUpload"; // Import the image upload component

// // Helper for Observation Cell Table
// const ObservationTableInput = ({ rows, cols, data = [], onChange }) => {
//   const [tableData, setTableData] = useState(data);

//   useEffect(() => {
//     // Ensure data is always an array of arrays
//     const initialData = Array(rows)
//       .fill(null)
//       .map((_, rIndex) =>
//         Array(cols)
//           .fill(null)
//           .map((__, cIndex) => (data[rIndex] && data[rIndex][cIndex]) || "")
//       );
//     setTableData(initialData);
//   }, [rows, cols, data]);

//   const handleCellChange = (rIndex, cIndex, value) => {
//     const newData = tableData.map((row, rowIndex) =>
//       rowIndex === rIndex
//         ? row.map((cell, colIndex) => (colIndex === cIndex ? value : cell))
//         : row
//     );
//     setTableData(newData);
//     onChange(newData); // Propagate change up
//   };

//   if (rows < 1 || cols < 1) return null;

//   return (
//     <div className="overflow-x-auto my-1">
//       <table className="min-w-full border-collapse text-xs">
//         <tbody>
//           {Array(rows)
//             .fill(null)
//             .map((_, rIndex) => (
//               <tr key={rIndex}>
//                 {Array(cols)
//                   .fill(null)
//                   .map((_, cIndex) => (
//                     <td key={cIndex} className="border border-gray-300 p-0.5">
//                       <input
//                         type="text"
//                         value={tableData[rIndex]?.[cIndex] || ""}
//                         onChange={(e) =>
//                           handleCellChange(rIndex, cIndex, e.target.value)
//                         }
//                         className="w-full p-0.5 text-xs bg-white focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
//                       />
//                     </td>
//                   ))}
//               </tr>
//             ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// const AuditTableRow = ({ item, index, onUpdate, sectionEnabled }) => {
//   const { t } = useTranslation();
//   const [observationText, setObservationText] = useState(
//     item.observationData?.text || ""
//   );
//   const [showObsTableControls, setShowObsTableControls] = useState(
//     item.observationData?.isTable || false
//   );
//   const [obsTableRows, setObsTableRows] = useState(
//     item.observationData?.table?.rows || 2
//   );
//   const [obsTableCols, setObsTableCols] = useState(
//     item.observationData?.table?.cols || 2
//   );
//   const [obsTableData, setObsTableData] = useState(
//     item.observationData?.table?.data || []
//   );
//   const [images, setImages] = useState(item.images || []);

//   const handleStatusClick = (statusField) => {
//     if (!sectionEnabled) return;
//     let newStatus = { ok: false, toImprove: false, na: false };
//     newStatus[statusField] = true; // Only one can be true

//     let newScore = 0;
//     let newNaScore = 0;
//     const levelScore = parseInt(item.level, 10) || 0;

//     if (statusField === "ok") {
//       newScore = levelScore;
//     } else if (statusField === "na") {
//       newNaScore = levelScore;
//     }
//     // If 'toImprove', score is 0 (default)

//     onUpdate(index, { ...newStatus, score: newScore, naScore: newNaScore });
//   };

//   const handleMustHaveClick = () => {
//     if (!sectionEnabled) return;
//     onUpdate(index, { mustHave: !item.mustHave });
//   };

//   const handleObservationChange = (e) => {
//     if (!sectionEnabled) return;
//     const text = e.target.value;
//     if (text.length <= 500) {
//       setObservationText(text);
//       onUpdate(index, {
//         observationData: {
//           ...item.observationData,
//           text: text,
//           isTable: false,
//         },
//       }); // Clear table if typing
//     }
//   };

//   const toggleObsTable = () => {
//     if (!sectionEnabled) return;
//     const newIsTable = !showObsTableControls;
//     setShowObsTableControls(newIsTable);
//     if (newIsTable && !observationText) {
//       // Only create table if text is empty or user forces it
//       onUpdate(index, {
//         observationData: {
//           text: "",
//           isTable: true,
//           table: { rows: obsTableRows, cols: obsTableCols, data: obsTableData },
//         },
//       });
//     } else if (!newIsTable) {
//       // Switching back to text
//       onUpdate(index, {
//         observationData: { text: observationText, isTable: false, table: null },
//       });
//     }
//   };

//   const handleObsTableDimensionChange = (dim, value) => {
//     if (!sectionEnabled) return;
//     const numValue = Math.max(1, Math.min(10, parseInt(value, 10) || 1));
//     if (dim === "rows") setObsTableRows(numValue);
//     if (dim === "cols") setObsTableCols(numValue);
//     // Debounce or update on blur for performance if many rows
//     onUpdate(index, {
//       observationData: {
//         ...item.observationData,
//         isTable: true,
//         table: {
//           rows: dim === "rows" ? numValue : obsTableRows,
//           cols: dim === "cols" ? numValue : obsTableCols,
//           data: obsTableData,
//         },
//       },
//     });
//   };

//   const handleObsTableDataChange = (tableCellData) => {
//     if (!sectionEnabled) return;
//     setObsTableData(tableCellData);
//     onUpdate(index, {
//       observationData: {
//         ...item.observationData,
//         isTable: true,
//         table: { rows: obsTableRows, cols: obsTableCols, data: tableCellData },
//       },
//     });
//   };

//   const handleImagesChange = (newImages) => {
//     if (!sectionEnabled) return;
//     setImages(newImages);
//     onUpdate(index, { images: newImages });
//   };

//   const getStatusCellStyle = (statusField) => {
//     if (!sectionEnabled) return "bg-gray-100 cursor-not-allowed";
//     if (item[statusField]) {
//       if (statusField === "ok") return "bg-green-100 hover:bg-green-200";
//       if (statusField === "toImprove") return "bg-red-100 hover:bg-red-200";
//       if (statusField === "na") return "bg-gray-200 hover:bg-gray-300";
//     }
//     return "hover:bg-gray-50";
//   };

//   return (
//     <tr className={`${!sectionEnabled ? "opacity-70" : ""}`}>
//       {/* Main Topic, No, Points - these come from item directly */}
//       <td className="border p-1.5 align-top text-xs w-[15%]">
//         {t(item.mainTopicKey)}
//       </td>
//       <td className="border p-1.5 align-top text-xs text-center w-[5%]">
//         {item.no}
//       </td>
//       <td className="border p-1.5 align-top text-xs w-[30%]">
//         <strong className="font-medium">{t(item.titleKey)}:</strong>{" "}
//         {t(item.descKey)}
//       </td>

//       {/* OK, To Improve, N/A */}
//       {["ok", "toImprove", "na"].map((status) => (
//         <td
//           key={status}
//           className={`border p-1.5 align-middle text-center cursor-pointer w-[5%] ${getStatusCellStyle(
//             status
//           )}`}
//           onClick={() => handleStatusClick(status)}
//         >
//           {item[status] && (
//             <Check size={16} className="mx-auto text-gray-700" />
//           )}
//         </td>
//       ))}

//       {/* Observations */}
//       <td className="border p-1.5 align-top text-xs w-[20%]">
//         <div className="flex items-center justify-end mb-1 gap-1">
//           <button
//             onClick={toggleObsTable}
//             title={t("auditTable.insertTable")}
//             className={`p-0.5 rounded ${
//               showObsTableControls
//                 ? "bg-indigo-100 text-indigo-600"
//                 : "hover:bg-gray-100"
//             } ${!sectionEnabled ? "cursor-not-allowed" : ""}`}
//             disabled={!sectionEnabled}
//           >
//             <TableIcon size={14} />
//           </button>
//           {showObsTableControls && (
//             <>
//               <input
//                 type="number"
//                 value={obsTableRows}
//                 onChange={(e) =>
//                   handleObsTableDimensionChange("rows", e.target.value)
//                 }
//                 min="1"
//                 max="10"
//                 className={`w-10 text-xs p-0.5 border rounded ${
//                   !sectionEnabled ? "bg-gray-100 cursor-not-allowed" : ""
//                 }`}
//                 disabled={!sectionEnabled}
//                 title={t("auditTable.rows")}
//               />
//               <span className="text-xs">x</span>
//               <input
//                 type="number"
//                 value={obsTableCols}
//                 onChange={(e) =>
//                   handleObsTableDimensionChange("cols", e.target.value)
//                 }
//                 min="1"
//                 max="10"
//                 className={`w-10 text-xs p-0.5 border rounded ${
//                   !sectionEnabled ? "bg-gray-100 cursor-not-allowed" : ""
//                 }`}
//                 disabled={!sectionEnabled}
//                 title={t("auditTable.cols")}
//               />
//             </>
//           )}
//         </div>
//         {showObsTableControls ? (
//           <ObservationTableInput
//             rows={obsTableRows}
//             cols={obsTableCols}
//             data={obsTableData}
//             onChange={handleObsTableDataChange}
//           />
//         ) : (
//           <textarea
//             value={observationText}
//             onChange={handleObservationChange}
//             rows="3"
//             maxLength={500}
//             className={`w-full p-1 text-xs border rounded ${
//               !sectionEnabled
//                 ? "bg-gray-100 cursor-not-allowed"
//                 : "focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
//             }`}
//             disabled={!sectionEnabled}
//           />
//         )}
//         {!showObsTableControls && (
//           <div className="text-right text-xs text-gray-400 mt-0.5">
//             {observationText.length}/500
//           </div>
//         )}
//       </td>

//       {/* Images */}
//       <td className="border p-1.5 align-top text-xs w-[10%]">
//         <AuditImageUpload
//           images={images}
//           onImagesChange={handleImagesChange}
//           requirementId={item.no}
//           maxImages={5}
//         />
//       </td>

//       {/* Level, Must Have, Score, N/A Score */}
//       <td className="border p-1.5 align-middle text-center text-xs w-[5%]">
//         {item.level}
//       </td>
//       <td
//         className={`border p-1.5 align-middle text-center cursor-pointer w-[5%] ${
//           item.mustHave ? "bg-blue-100" : ""
//         } ${!sectionEnabled ? "cursor-not-allowed" : "hover:bg-blue-50"}`}
//         onClick={handleMustHaveClick}
//       >
//         {item.mustHave && <XIcon size={16} className="mx-auto text-gray-700" />}
//       </td>
//       <td className="border p-1.5 align-middle text-center text-xs w-[5%]">
//         {item.score}
//       </td>
//       <td className="border p-1.5 align-middle text-center text-xs w-[5%]">
//         {item.naScore}
//       </td>
//     </tr>
//   );
// };

// const AuditTable = ({ auditData, onAuditDataChange, sectionEnabled }) => {
//   const { t } = useTranslation();

//   const handleUpdateRow = (index, updatedValues) => {
//     const newData = [...auditData];
//     newData[index] = { ...newData[index], ...updatedValues };
//     onAuditDataChange(newData);
//   };

//   return (
//     <div className="overflow-x-auto mx-4 sm:mx-6 my-4 shadow-md rounded-lg">
//       <table className="min-w-full border-collapse border border-gray-300 bg-white">
//         <thead className="bg-gray-100 text-xs sticky top-0 z-10">
//           <tr>
//             <th className="border p-1.5 text-center" colSpan="3">
//               {t("auditTable.requirement")}
//             </th>
//             <th className="border p-1.5 text-center">{t("auditTable.ok")}</th>
//             <th className="border p-1.5 text-center">
//               {t("auditTable.toImprove")}
//             </th>
//             <th className="border p-1.5 text-center">{t("auditTable.na")}</th>
//             <th className="border p-1.5 text-center">
//               {t("auditTable.observations")}
//             </th>
//             <th className="border p-1.5 text-center">
//               {t("auditTable.images")}
//             </th>
//             <th className="border p-1.5 text-center">
//               {t("auditTable.level")}
//             </th>
//             <th className="border p-1.5 text-center">
//               {t("auditTable.mustHave")}
//             </th>
//             <th className="border p-1.5 text-center">
//               {t("auditTable.score")}
//             </th>
//             <th className="border p-1.5 text-center">
//               {t("auditTable.naScore")}
//             </th>
//           </tr>
//           <tr>
//             <th className="border p-1.5 text-center font-medium">
//               {t("auditTable.mainTopic")}
//             </th>
//             <th className="border p-1.5 text-center font-medium">
//               {t("auditTable.no")}
//             </th>
//             <th className="border p-1.5 text-center font-medium">
//               {t("auditTable.points")}
//             </th>
//             <th className="border p-1.5"></th> {/* Placeholder for OK */}
//             <th className="border p-1.5"></th>{" "}
//             {/* Placeholder for To Improve */}
//             <th className="border p-1.5"></th> {/* Placeholder for N/A */}
//             <th className="border p-1.5"></th>{" "}
//             {/* Placeholder for Observations */}
//             <th className="border p-1.5"></th> {/* Placeholder for Images */}
//             <th className="border p-1.5"></th> {/* Placeholder for Level */}
//             <th className="border p-1.5"></th> {/* Placeholder for Must Have */}
//             <th className="border p-1.5"></th> {/* Placeholder for Score */}
//             <th className="border p-1.5"></th> {/* Placeholder for N/A Score */}
//           </tr>
//         </thead>
//         <tbody>
//           {auditData.map((item, index) => (
//             <AuditTableRow
//               key={item.no || index} // Prefer a unique item.id if available
//               item={item}
//               index={index}
//               onUpdate={handleUpdateRow}
//               sectionEnabled={sectionEnabled}
//             />
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default AuditTable;

// import React from "react";
// import { useTranslation } from "react-i18next";
// import AuditTableRow from "./AuditTableRow"; // Assuming AuditTableRow is in the same folder or path adjusted

// const AuditTable = ({
//   auditData,
//   onAuditDataChange,
//   sectionEnabled,
//   currentLang,
// }) => {
//   const { t } = useTranslation();

//   const handleUpdateRow = (index, updatedValues) => {
//     const newData = auditData.map((item, i) =>
//       i === index ? { ...item, ...updatedValues } : item
//     );
//     onAuditDataChange(newData);
//   };

//   return (
//     <div className="overflow-x-auto mx-4 sm:mx-6 my-4 shadow-md rounded-lg">
//       <table className="min-w-full border-collapse border border-gray-300 bg-white">
//         <thead className="bg-gray-100 text-xs sticky top-0 z-10">
//           <tr>
//             <th className="border p-1.5 text-center" colSpan="3">
//               {t("auditTable.requirement")}
//             </th>
//             <th className="border p-1.5 text-center">{t("auditTable.ok")}</th>
//             <th className="border p-1.5 text-center">
//               {t("auditTable.toImprove")}
//             </th>
//             <th className="border p-1.5 text-center">{t("auditTable.na")}</th>
//             <th className="border p-1.5 text-center">
//               {t("auditTable.observations")}
//             </th>
//             <th className="border p-1.5 text-center">
//               {t("auditTable.images")}
//             </th>
//             <th className="border p-1.5 text-center">
//               {t("auditTable.level")}
//             </th>
//             <th className="border p-1.5 text-center">
//               {t("auditTable.mustHave")}
//             </th>
//             <th className="border p-1.5 text-center">
//               {t("auditTable.score")}
//             </th>
//             <th className="border p-1.5 text-center">
//               {t("auditTable.naScore")}
//             </th>
//           </tr>
//           <tr>
//             <th className="border p-1.5 text-center font-medium">
//               {t("auditTable.mainTopic")}
//             </th>
//             <th className="border p-1.5 text-center font-medium">
//               {t("auditTable.no")}
//             </th>
//             <th className="border p-1.5 text-center font-medium">
//               {t("auditTable.points")}
//             </th>
//             <th className="border p-1.5"></th>
//             <th className="border p-1.5"></th>
//             <th className="border p-1.5"></th>
//             <th className="border p-1.5"></th>
//             <th className="border p-1.5"></th>
//             <th className="border p-1.5"></th>
//             <th className="border p-1.5"></th>
//             <th className="border p-1.5"></th>
//             <th className="border p-1.5"></th>
//           </tr>
//         </thead>
//         <tbody>
//           {auditData.map((item, index) => (
//             <AuditTableRow
//               key={item.uniqueId || item.no || index} // Use a truly unique key if available
//               item={item}
//               index={index}
//               onUpdate={handleUpdateRow}
//               sectionEnabled={sectionEnabled}
//               currentLang={currentLang} // Pass current language
//             />
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default AuditTable;

import React from "react";
import { useTranslation } from "react-i18next";
import AuditTableRow from "./AuditTableRow"; // Ensure this path is correct

const AuditTable = ({
  auditData,
  onAuditDataChange,
  sectionEnabled,
  currentLang,
}) => {
  const { t } = useTranslation();

  console.log(
    "AuditTable rendering, currentLang:",
    currentLang,
    "auditData length:",
    auditData.length
  );

  const handleUpdateRow = (index, updatedValues) => {
    const newData = auditData.map((item, i) =>
      i === index ? { ...item, ...updatedValues } : item
    );
    onAuditDataChange(newData);
  };

  return (
    <div className="overflow-x-auto mx-4 sm:mx-6 my-4 shadow-md rounded-lg">
      <table className="min-w-full border-collapse border border-gray-300 bg-white">
        <thead className="bg-gray-100 text-xs sticky top-0 z-10">
          <tr>
            <th className="border p-1.5 text-center" colSpan="3">
              {t("auditTable.requirement")}
            </th>
            <th className="border p-1.5 text-center">{t("auditTable.ok")}</th>
            <th className="border p-1.5 text-center">
              {t("auditTable.toImprove")}
            </th>
            <th className="border p-1.5 text-center">{t("auditTable.na")}</th>
            <th className="border p-1.5 text-center">
              {t("auditTable.observations")}
            </th>
            <th className="border p-1.5 text-center">
              {t("auditTable.images")}
            </th>
            <th className="border p-1.5 text-center">
              {t("auditTable.level")}
            </th>
            <th className="border p-1.5 text-center">
              {t("auditTable.mustHave")}
            </th>
            <th className="border p-1.5 text-center">
              {t("auditTable.score")}
            </th>
            <th className="border p-1.5 text-center">
              {t("auditTable.naScore")}
            </th>
          </tr>
          <tr>
            <th className="border p-1.5 text-center font-medium">
              {t("auditTable.mainTopic")}
            </th>
            <th className="border p-1.5 text-center font-medium">
              {t("auditTable.no")}
            </th>
            <th className="border p-1.5 text-center font-medium">
              {t("auditTable.points")}
            </th>
            <th className="border p-1.5"></th>
            <th className="border p-1.5"></th>
            <th className="border p-1.5"></th>
            <th className="border p-1.5"></th>
            <th className="border p-1.5"></th>
            <th className="border p-1.5"></th>
            <th className="border p-1.5"></th>
            <th className="border p-1.5"></th>
            <th className="border p-1.5"></th>
          </tr>
        </thead>
        <tbody>
          {auditData.map((item, index) => (
            <AuditTableRow
              key={item.uniqueId || item.no || index}
              item={item}
              index={index}
              onUpdate={handleUpdateRow}
              sectionEnabled={sectionEnabled}
              currentLang={currentLang}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTable;
