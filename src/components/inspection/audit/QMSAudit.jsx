// import { Award, Table as TableIcon, TrendingUp } from "lucide-react"; // Icons for cards
// import React, { useEffect, useMemo, useState } from "react";
// import { useTranslation } from "react-i18next";
// import AuditHeader from "./AuditHeader";
// import AuditLegend from "./AuditLegend";
// import AuditTable from "./AuditTable";

// // Initial data structure for QMS audit points
// const initialQMSData = [
//   {
//     mainTopicKey: "qmsAudit.qualityPolicy",
//     no: "1.05",
//     titleKey: "qmsAudit.point_1_05_title",
//     descKey: "qmsAudit.point_1_05_desc",
//     ok: true,
//     toImprove: false,
//     na: false, // Default to OK
//     observationData: {
//       text: "",
//       isTable: false,
//       table: { rows: 2, cols: 2, data: [] },
//     },
//     images: [],
//     level: 4, // From image
//     mustHave: true, // From image (X means true)
//     score: 4, // Calculated: if ok, then level; else 0
//     naScore: 0, // Calculated: if na, then level; else 0
//   },
//   {
//     mainTopicKey: "qmsAudit.performanceAndPlanning",
//     no: "1.21",
//     titleKey: "qmsAudit.point_1_21_title",
//     descKey: "qmsAudit.point_1_21_desc",
//     ok: true,
//     toImprove: false,
//     na: false,
//     observationData: {
//       text: "",
//       isTable: false,
//       table: { rows: 2, cols: 2, data: [] },
//     },
//     images: [],
//     level: 4, // From image
//     mustHave: true, // From image
//     score: 4,
//     naScore: 0,
//   },
//   {
//     mainTopicKey: "qmsAudit.performanceAndPlanning",
//     no: "1.25",
//     titleKey: "qmsAudit.point_1_25_title",
//     descKey: "qmsAudit.point_1_25_desc",
//     ok: true,
//     toImprove: false,
//     na: false,
//     observationData: {
//       text: "",
//       isTable: false,
//       table: { rows: 2, cols: 2, data: [] },
//     },
//     images: [],
//     level: 3, // From image
//     mustHave: false, // From image (empty means false)
//     score: 3,
//     naScore: 0,
//   },
// ];

// const ScoreCard = ({ title, value, icon, colorClass = "bg-blue-500" }) => (
//   <div className={`p-4 rounded-lg shadow-md text-white ${colorClass}`}>
//     <div className="flex items-center mb-2">
//       {icon && React.cloneElement(icon, { size: 20, className: "mr-2" })}
//       <h4 className="text-sm font-semibold">{title}</h4>
//     </div>
//     <p className="text-2xl font-bold text-center">{value}</p>
//   </div>
// );

// // Helper for Additional Comments Table
// const AdditionalCommentsTableInput = ({ rows, cols, data = [], onChange }) => {
//   const [tableData, setTableData] = useState(data);

//   useEffect(() => {
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
//     onChange(newData);
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

// const QMSAudit = () => {
//   const { t } = useTranslation();
//   const [auditItems, setAuditItems] = useState(initialQMSData);
//   const [sectionEnabled, setSectionEnabled] = useState(true); // Default to Yes

//   const [additionalCommentsText, setAdditionalCommentsText] = useState("");
//   const [showAdditionalCommentsTable, setShowAdditionalCommentsTable] =
//     useState(false);
//   const [additionalCommentsTableRows, setAdditionalCommentsTableRows] =
//     useState(2);
//   const [additionalCommentsTableCols, setAdditionalCommentsTableCols] =
//     useState(2);
//   const [additionalCommentsTableData, setAdditionalCommentsTableData] =
//     useState([]);

//   const handleAuditDataChange = (updatedData) => {
//     setAuditItems(updatedData);
//   };

//   const maxScore = useMemo(
//     () =>
//       auditItems.reduce(
//         (sum, item) => sum + (parseInt(item.level, 10) || 0),
//         0
//       ),
//     [auditItems]
//   );

//   const maxPossibleScore = useMemo(() => {
//     const totalLevelScore = auditItems.reduce(
//       (sum, item) => sum + (parseInt(item.level, 10) || 0),
//       0
//     );
//     const totalNaDeduction = auditItems.reduce(
//       (sum, item) => sum + (parseInt(item.naScore, 10) || 0),
//       0
//     );
//     return totalLevelScore - totalNaDeduction;
//   }, [auditItems]);

//   const totalScoreAchieved = useMemo(
//     () =>
//       auditItems.reduce(
//         (sum, item) => sum + (parseInt(item.score, 10) || 0),
//         0
//       ),
//     [auditItems]
//   );

//   const handleAdditionalCommentsTextChange = (e) => {
//     const text = e.target.value;
//     if (text.length <= 1000) {
//       setAdditionalCommentsText(text);
//       // If user types, assume they don't want the table for comments anymore
//       if (showAdditionalCommentsTable) setShowAdditionalCommentsTable(false);
//     }
//   };

//   const toggleAdditionalCommentsTable = () => {
//     const newIsTable = !showAdditionalCommentsTable;
//     setShowAdditionalCommentsTable(newIsTable);
//     if (newIsTable && !additionalCommentsText) {
//       // Only enable table if text is empty or forced
//       // Initialize table data if needed
//       if (additionalCommentsTableData.length === 0) {
//         setAdditionalCommentsTableData(
//           Array(additionalCommentsTableRows).fill(
//             Array(additionalCommentsTableCols).fill("")
//           )
//         );
//       }
//     }
//   };
//   const handleAdditionalCommentsTableDimensionChange = (dim, value) => {
//     const numValue = Math.max(1, Math.min(10, parseInt(value, 10) || 1));
//     if (dim === "rows") setAdditionalCommentsTableRows(numValue);
//     if (dim === "cols") setAdditionalCommentsTableCols(numValue);
//     // Reinitialize table data if dimensions change
//     setAdditionalCommentsTableData(
//       Array(dim === "rows" ? numValue : additionalCommentsTableRows).fill(
//         Array(dim === "cols" ? numValue : additionalCommentsTableCols).fill("")
//       )
//     );
//   };

//   return (
//     <div className="p-1">
//       {" "}
//       {/* Minimal padding for the tab content itself */}
//       {/* ============== TITLE HERE ============== */}
//       <h2 className="text-sm sm:text-lg font-semibold text-gray-800 my-4 px-4 sm:px-6 text-center sm:text-left">
//         {t("qmsAudit.sectionTitle")}
//       </h2>
//       <AuditHeader />
//       <AuditLegend />
//       {/* Enable/Disable Section Option */}
//       <div className="mx-4 sm:mx-6 my-3 flex items-center gap-2">
//         <label
//           htmlFor="enableSectionToggle"
//           className="text-sm font-medium text-gray-700"
//         >
//           {t("auditTable.enableTable")}:
//         </label>
//         <div className="flex items-center">
//           <button
//             onClick={() => setSectionEnabled(true)}
//             className={`px-3 py-1 text-xs rounded-l-md border ${
//               sectionEnabled
//                 ? "bg-indigo-600 text-white border-indigo-600"
//                 : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//             }`}
//           >
//             {t("auditTable.yes")}
//           </button>
//           <button
//             onClick={() => setSectionEnabled(false)}
//             className={`px-3 py-1 text-xs rounded-r-md border ${
//               !sectionEnabled
//                 ? "bg-indigo-600 text-white border-indigo-600"
//                 : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//             }`}
//           >
//             {t("auditTable.no")}
//           </button>
//         </div>
//       </div>
//       <AuditTable
//         auditData={auditItems}
//         onAuditDataChange={handleAuditDataChange}
//         sectionEnabled={sectionEnabled}
//       />
//       {/* Additional Comments Section */}
//       <div
//         className={`mx-4 sm:mx-6 my-4 p-3 border rounded-lg shadow ${
//           !sectionEnabled ? "opacity-60 bg-gray-50" : "bg-white"
//         }`}
//       >
//         <div className="flex justify-between items-center mb-1">
//           <label
//             htmlFor="additionalComments"
//             className="text-sm font-semibold text-gray-700"
//           >
//             {t("auditTable.additionalComments")}
//           </label>
//           <button
//             onClick={toggleAdditionalCommentsTable}
//             title={t("auditTable.insertTable")}
//             className={`p-1 rounded ${
//               showAdditionalCommentsTable
//                 ? "bg-indigo-100 text-indigo-600"
//                 : "hover:bg-gray-100"
//             } ${!sectionEnabled ? "cursor-not-allowed" : ""}`}
//             disabled={!sectionEnabled}
//           >
//             <TableIcon size={16} />
//           </button>
//         </div>
//         {showAdditionalCommentsTable && sectionEnabled && (
//           <div className="flex items-center gap-2 mb-2">
//             <input
//               type="number"
//               value={additionalCommentsTableRows}
//               onChange={(e) =>
//                 handleAdditionalCommentsTableDimensionChange(
//                   "rows",
//                   e.target.value
//                 )
//               }
//               min="1"
//               max="10"
//               className="w-12 text-xs p-1 border rounded"
//               title={t("auditTable.rows")}
//               disabled={!sectionEnabled}
//             />
//             <span className="text-xs">x</span>
//             <input
//               type="number"
//               value={additionalCommentsTableCols}
//               onChange={(e) =>
//                 handleAdditionalCommentsTableDimensionChange(
//                   "cols",
//                   e.target.value
//                 )
//               }
//               min="1"
//               max="10"
//               className="w-12 text-xs p-1 border rounded"
//               title={t("auditTable.cols")}
//               disabled={!sectionEnabled}
//             />
//           </div>
//         )}
//         {showAdditionalCommentsTable && sectionEnabled ? (
//           <AdditionalCommentsTableInput
//             rows={additionalCommentsTableRows}
//             cols={additionalCommentsTableCols}
//             data={additionalCommentsTableData}
//             onChange={setAdditionalCommentsTableData}
//           />
//         ) : (
//           <textarea
//             id="additionalComments"
//             value={additionalCommentsText}
//             onChange={handleAdditionalCommentsTextChange}
//             rows="4"
//             maxLength={1000}
//             className={`w-full p-2 text-sm border rounded ${
//               !sectionEnabled
//                 ? "bg-gray-100 cursor-not-allowed"
//                 : "focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
//             }`}
//             disabled={!sectionEnabled}
//           />
//         )}
//         {!showAdditionalCommentsTable && (
//           <div className="text-right text-xs text-gray-400 mt-0.5">
//             {additionalCommentsText.length}/1000
//           </div>
//         )}
//       </div>
//       {/* Score Cards Section */}
//       <div
//         className={`grid md:grid-cols-3 gap-4 mx-4 sm:mx-6 my-6 ${
//           !sectionEnabled ? "opacity-60" : ""
//         }`}
//       >
//         <ScoreCard
//           title={t("auditTable.maxScoreCardTitle")}
//           value={maxScore}
//           icon={<Award />}
//           colorClass="bg-blue-500"
//         />
//         <ScoreCard
//           title={t("auditTable.maxPossibleScoreCardTitle")}
//           value={maxPossibleScore}
//           icon={<TrendingUp />}
//           colorClass="bg-yellow-500"
//         />
//         <ScoreCard
//           title={t("auditTable.totalScoreCardTitle")}
//           value={totalScoreAchieved}
//           icon={<TrendingUp />}
//           colorClass="bg-green-500"
//         />
//       </div>
//     </div>
//   );
// };

// export default QMSAudit;

// import axios from "axios"; // For fetching data
// import { Award, Table as TableIcon, TrendingUp } from "lucide-react";
// import React, { useCallback, useEffect, useMemo, useState } from "react"; // Added useCallback
// import { useTranslation } from "react-i18next";
// import { API_BASE_URL } from "../../../../config"; // Adjust path
// import AuditHeader from "./AuditHeader";
// import AuditLegend from "./AuditLegend";
// import AuditTable from "./AuditTable";

// // Helper: Initialize dynamic fields for an audit item based on static data
// const initializeInteractiveAuditItem = (staticRequirement, currentLang) => {
//   const level = parseInt(staticRequirement.levelValue, 10) || 0;
//   const initialOk = true; // Default to OK
//   const initialScore = initialOk ? level : 0;

//   // Select text based on current language for display
//   let mainTopicDisplay, pointTitleDisplay, pointDescriptionDisplay;
//   switch (currentLang) {
//     case "km":
//       mainTopicDisplay = staticRequirement.mainTopicKhmer;
//       pointTitleDisplay = staticRequirement.pointTitleKhmer;
//       pointDescriptionDisplay = staticRequirement.pointDescriptionKhmer;
//       break;
//     case "zh":
//       mainTopicDisplay = staticRequirement.mainTopicChinese;
//       pointTitleDisplay = staticRequirement.pointTitleChinese;
//       pointDescriptionDisplay = staticRequirement.pointDescriptionChinese;
//       break;
//     default: // eng
//       mainTopicDisplay = staticRequirement.mainTopicEng;
//       pointTitleDisplay = staticRequirement.pointTitleEng;
//       pointDescriptionDisplay = staticRequirement.pointDescriptionEng;
//   }

//   return {
//     // Static data from backend (also keep original lang versions for reference if needed)
//     ...staticRequirement, // Includes no, levelValue, mustHave (as mustHaveDefault now)
//     mainTopicDisplay,
//     pointTitleDisplay,
//     pointDescriptionDisplay,
//     levelDisplay: level, // Use levelValue for display consistently
//     mustHaveDefault: staticRequirement.mustHave, // Store the default from DB

//     // Dynamic, user-interactive fields
//     ok: initialOk,
//     toImprove: false,
//     na: false,
//     observationData: {
//       text: "",
//       isTable: false,
//       table: { rows: 2, cols: 2, data: [] },
//     },
//     images: [],
//     mustHave: staticRequirement.mustHave, // Initial user-toggleable state, defaults to DB value
//     score: initialScore,
//     naScore: 0,
//     uniqueId: staticRequirement._id || staticRequirement.no, // Use MongoDB _id if available, or 'no' as fallback
//   };
// };

// // ScoreCard and AdditionalCommentsTableInput remain the same as your provided QMSAudit.jsx

// const ScoreCard = ({ title, value, icon, colorClass = "bg-blue-500" }) => (
//   <div className={`p-4 rounded-lg shadow-md text-white ${colorClass}`}>
//     <div className="flex items-center mb-2">
//       {icon && React.cloneElement(icon, { size: 20, className: "mr-2" })}
//       <h4 className="text-sm font-semibold">{title}</h4>
//     </div>
//     <p className="text-2xl font-bold text-center">{value}</p>
//   </div>
// );

// const AdditionalCommentsTableInput = ({
//   rows,
//   cols,
//   data = [],
//   onChange,
//   sectionEnabled,
// }) => {
//   const [tableData, setTableData] = useState(data);
//   useEffect(() => {
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
//     if (!sectionEnabled) return;
//     const newData = tableData.map((row, rowIndex) =>
//       rowIndex === rIndex
//         ? row.map((cell, colIndex) => (colIndex === cIndex ? value : cell))
//         : row
//     );
//     setTableData(newData);
//     onChange(newData);
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
//                         className={`w-full p-0.5 text-xs bg-white ${
//                           !sectionEnabled
//                             ? "cursor-not-allowed bg-gray-100"
//                             : "focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
//                         }`}
//                         disabled={!sectionEnabled}
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

// const QMSAudit = () => {
//   const { t, i18n } = useTranslation();
//   const [auditItems, setAuditItems] = useState([]);
//   const [staticSectionData, setStaticSectionData] = useState(null); // To store the fetched section data
//   const [sectionTitle, setSectionTitle] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [sectionEnabled, setSectionEnabled] = useState(true);
//   const [additionalCommentsText, setAdditionalCommentsText] = useState("");
//   const [showAdditionalCommentsTable, setShowAdditionalCommentsTable] =
//     useState(false);
//   const [additionalCommentsTableRows, setAdditionalCommentsTableRows] =
//     useState(2);
//   const [additionalCommentsTableCols, setAdditionalCommentsTableCols] =
//     useState(2);
//   const [additionalCommentsTableData, setAdditionalCommentsTableData] =
//     useState([]);

//   const mainTitleForThisTab = "QMS"; // This should match the mainTitle in your JSON/DB

//   const fetchAndInitializeData = useCallback(
//     async (lang) => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/api/audit-checkpoints`
//         );
//         const allCheckpoints = response.data;
//         const currentTabData = allCheckpoints.find(
//           (cp) => cp.mainTitle === mainTitleForThisTab
//         );

//         if (currentTabData) {
//           setStaticSectionData(currentTabData); // Store the raw fetched data for this section

//           // Set section title based on language
//           switch (lang) {
//             case "km":
//               setSectionTitle(
//                 currentTabData.sectionTitleKhmer ||
//                   currentTabData.sectionTitleEng
//               );
//               break;
//             case "zh":
//               setSectionTitle(
//                 currentTabData.sectionTitleChinese ||
//                   currentTabData.sectionTitleEng
//               );
//               break;
//             default:
//               setSectionTitle(currentTabData.sectionTitleEng);
//           }

//           // Initialize interactive items
//           const initializedItems = currentTabData.requirements.map((req) =>
//             initializeInteractiveAuditItem(req, lang)
//           );
//           setAuditItems(initializedItems);
//         } else {
//           setError(`Audit data for "${mainTitleForThisTab}" not found.`);
//         }
//       } catch (err) {
//         setError(
//           err.response?.data?.message ||
//             err.message ||
//             "Failed to fetch audit data"
//         );
//         console.error("Fetch error:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [mainTitleForThisTab]
//   ); // Add mainTitleForThisTab to dependencies

//   useEffect(() => {
//     fetchAndInitializeData(i18n.language);
//   }, [fetchAndInitializeData, i18n.language]); // Fetch when component mounts or language changes

//   const handleAuditDataChange = (updatedData) => {
//     setAuditItems(updatedData);
//   };

//   // Score calculations remain the same, but ensure they use 'levelDisplay' or the correct level value
//   const maxScore = useMemo(
//     () =>
//       auditItems.reduce(
//         (sum, item) => sum + (parseInt(item.levelDisplay, 10) || 0),
//         0
//       ),
//     [auditItems]
//   );

//   const maxPossibleScore = useMemo(() => {
//     const totalLevelScore = auditItems.reduce(
//       (sum, item) => sum + (parseInt(item.levelDisplay, 10) || 0),
//       0
//     );
//     const totalNaDeduction = auditItems.reduce(
//       (sum, item) => sum + (parseInt(item.naScore, 10) || 0),
//       0
//     );
//     return totalLevelScore - totalNaDeduction;
//   }, [auditItems]);

//   const totalScoreAchieved = useMemo(
//     () =>
//       auditItems.reduce(
//         (sum, item) => sum + (parseInt(item.score, 10) || 0),
//         0
//       ),
//     [auditItems]
//   );

//   // Additional comments handlers remain the same
//   const handleAdditionalCommentsTextChange = (e) => {
//     if (!sectionEnabled) return;
//     const text = e.target.value;
//     if (text.length <= 1000) {
//       setAdditionalCommentsText(text);
//       if (showAdditionalCommentsTable) setShowAdditionalCommentsTable(false);
//     }
//   };

//   const toggleAdditionalCommentsTable = () => {
//     if (!sectionEnabled) return;
//     const newIsTable = !showAdditionalCommentsTable;
//     setShowAdditionalCommentsTable(newIsTable);
//     if (newIsTable && !additionalCommentsText) {
//       if (additionalCommentsTableData.length === 0) {
//         setAdditionalCommentsTableData(
//           Array(additionalCommentsTableRows).fill(
//             Array(additionalCommentsTableCols).fill("")
//           )
//         );
//       }
//     }
//   };
//   const handleAdditionalCommentsTableDimensionChange = (dim, value) => {
//     if (!sectionEnabled) return;
//     const numValue = Math.max(1, Math.min(10, parseInt(value, 10) || 1));
//     if (dim === "rows") setAdditionalCommentsTableRows(numValue);
//     if (dim === "cols") setAdditionalCommentsTableCols(numValue);
//     setAdditionalCommentsTableData(
//       Array(dim === "rows" ? numValue : additionalCommentsTableRows).fill(
//         Array(dim === "cols" ? numValue : additionalCommentsTableCols).fill("")
//       )
//     );
//   };

//   if (isLoading)
//     return <div className="p-6 text-center">Loading audit data...</div>;
//   if (error)
//     return <div className="p-6 text-center text-red-500">Error: {error}</div>;
//   if (!staticSectionData)
//     return <div className="p-6 text-center">Audit section data not found.</div>;

//   return (
//     <div className="p-1">
//       <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 my-4 px-4 sm:px-6 text-center sm:text-left">
//         {sectionTitle}{" "}
//         {/* Display the dynamic section title from fetched data */}
//       </h2>
//       <AuditHeader />
//       <AuditLegend />
//       <div className="mx-4 sm:mx-6 my-3 flex items-center gap-2">
//         <label
//           htmlFor="enableSectionToggleQMS"
//           className="text-sm font-medium text-gray-700"
//         >
//           {t("auditTable.enableTable")}:
//         </label>
//         <div className="flex items-center">
//           <button
//             onClick={() => setSectionEnabled(true)}
//             className={`px-3 py-1 text-xs rounded-l-md border ${
//               sectionEnabled
//                 ? "bg-indigo-600 text-white border-indigo-600"
//                 : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//             }`}
//           >
//             {t("auditTable.yes")}
//           </button>
//           <button
//             onClick={() => setSectionEnabled(false)}
//             className={`px-3 py-1 text-xs rounded-r-md border ${
//               !sectionEnabled
//                 ? "bg-indigo-600 text-white border-indigo-600"
//                 : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//             }`}
//           >
//             {t("auditTable.no")}
//           </button>
//         </div>
//       </div>
//       <AuditTable
//         auditData={auditItems}
//         onAuditDataChange={handleAuditDataChange}
//         sectionEnabled={sectionEnabled}
//         currentLang={i18n.language} // Pass current language to table
//       />
//       <div
//         className={`mx-4 sm:mx-6 my-4 p-3 border rounded-lg shadow ${
//           !sectionEnabled ? "opacity-60 bg-gray-50" : "bg-white"
//         }`}
//       >
//         <div className="flex justify-between items-center mb-1">
//           <label
//             htmlFor="additionalCommentsQMS"
//             className="text-sm font-semibold text-gray-700"
//           >
//             {t("auditTable.additionalComments")}
//           </label>
//           <button
//             onClick={toggleAdditionalCommentsTable}
//             title={t("auditTable.insertTable")}
//             className={`p-1 rounded ${
//               showAdditionalCommentsTable
//                 ? "bg-indigo-100 text-indigo-600"
//                 : "hover:bg-gray-100"
//             } ${!sectionEnabled ? "cursor-not-allowed" : ""}`}
//             disabled={!sectionEnabled}
//           >
//             <TableIcon size={16} />
//           </button>
//         </div>
//         {showAdditionalCommentsTable && sectionEnabled && (
//           <div className="flex items-center gap-2 mb-2">
//             <input
//               type="number"
//               value={additionalCommentsTableRows}
//               onChange={(e) =>
//                 handleAdditionalCommentsTableDimensionChange(
//                   "rows",
//                   e.target.value
//                 )
//               }
//               min="1"
//               max="10"
//               className="w-12 text-xs p-1 border rounded"
//               title={t("auditTable.rows")}
//               disabled={!sectionEnabled}
//             />
//             <span className="text-xs">x</span>
//             <input
//               type="number"
//               value={additionalCommentsTableCols}
//               onChange={(e) =>
//                 handleAdditionalCommentsTableDimensionChange(
//                   "cols",
//                   e.target.value
//                 )
//               }
//               min="1"
//               max="10"
//               className="w-12 text-xs p-1 border rounded"
//               title={t("auditTable.cols")}
//               disabled={!sectionEnabled}
//             />
//           </div>
//         )}
//         {showAdditionalCommentsTable && sectionEnabled ? (
//           <AdditionalCommentsTableInput
//             rows={additionalCommentsTableRows}
//             cols={additionalCommentsTableCols}
//             data={additionalCommentsTableData}
//             onChange={setAdditionalCommentsTableData}
//             sectionEnabled={sectionEnabled}
//           />
//         ) : (
//           <textarea
//             id="additionalCommentsQMS"
//             value={additionalCommentsText}
//             onChange={handleAdditionalCommentsTextChange}
//             rows="4"
//             maxLength={1000}
//             className={`w-full p-2 text-sm border rounded ${
//               !sectionEnabled
//                 ? "bg-gray-100 cursor-not-allowed"
//                 : "focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
//             }`}
//             disabled={!sectionEnabled}
//           />
//         )}
//         {!showAdditionalCommentsTable && (
//           <div className="text-right text-xs text-gray-400 mt-0.5">
//             {additionalCommentsText.length}/1000
//           </div>
//         )}
//       </div>
//       <div
//         className={`grid md:grid-cols-3 gap-4 mx-4 sm:mx-6 my-6 ${
//           !sectionEnabled ? "opacity-60" : ""
//         }`}
//       >
//         <ScoreCard
//           title={t("auditTable.maxScoreCardTitle")}
//           value={maxScore}
//           icon={<Award />}
//           colorClass="bg-blue-500"
//         />
//         <ScoreCard
//           title={t("auditTable.maxPossibleScoreCardTitle")}
//           value={maxPossibleScore}
//           icon={<TrendingUp />}
//           colorClass="bg-yellow-500"
//         />
//         <ScoreCard
//           title={t("auditTable.totalScoreCardTitle")}
//           value={totalScoreAchieved}
//           icon={<TrendingUp />}
//           colorClass="bg-green-500"
//         />
//       </div>
//     </div>
//   );
// };

// export default QMSAudit;

// import axios from "axios";
// import { Award, Table as TableIcon, TrendingUp } from "lucide-react";
// import React, { useEffect, useMemo, useState } from "react";
// import { useTranslation } from "react-i18next";
// import { API_BASE_URL } from "../../../../config"; // Adjust path
// import AuditHeader from "./AuditHeader"; // Path relative to QMSAudit.jsx
// import AuditLegend from "./AuditLegend"; // Path relative to QMSAudit.jsx
// import AuditTable from "./AuditTable"; // Path relative to QMSAudit.jsx

// // Helper: Initialize dynamic fields for an audit item and store static multilingual data
// // This function prepares the interactive shell around the static data.
// const initializeInteractiveAuditItem = (staticRequirementFromDB) => {
//   const level = parseInt(staticRequirementFromDB.levelValue, 10) || 0;
//   const initialOk = true; // Default to OK
//   const initialScore = initialOk ? level : 0;

//   return {
//     staticData: staticRequirementFromDB, // Contains all Eng, Khmer, Chinese texts, levelValue, mustHave (from DB)
//     ok: initialOk,
//     toImprove: false,
//     na: false,
//     observationData: {
//       text: "",
//       isTable: false,
//       table: { rows: 2, cols: 2, data: [] },
//     },
//     images: [],
//     mustHave: staticRequirementFromDB.mustHave, // User toggleable, initialized from DB default
//     score: initialScore,
//     naScore: 0,
//     uniqueId: staticRequirementFromDB._id || staticRequirementFromDB.no, // For React key
//   };
// };

// const ScoreCard = ({ title, value, icon, colorClass = "bg-blue-500" }) => (
//   <div className={`p-4 rounded-lg shadow-md text-white ${colorClass}`}>
//     <div className="flex items-center mb-2">
//       {icon && React.cloneElement(icon, { size: 20, className: "mr-2" })}
//       <h4 className="text-sm font-semibold">{title}</h4>
//     </div>
//     <p className="text-2xl font-bold text-center">{value}</p>
//   </div>
// );

// const AdditionalCommentsTableInput = ({
//   rows,
//   cols,
//   data = [],
//   onChange,
//   sectionEnabled,
// }) => {
//   const [tableData, setTableData] = useState(data);
//   useEffect(() => {
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
//     if (!sectionEnabled) return;
//     const newData = tableData.map((row, rowIndex) =>
//       rowIndex === rIndex
//         ? row.map((cell, colIndex) => (colIndex === cIndex ? value : cell))
//         : row
//     );
//     setTableData(newData);
//     onChange(newData);
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
//                         className={`w-full p-0.5 text-xs bg-white ${
//                           !sectionEnabled
//                             ? "cursor-not-allowed bg-gray-100"
//                             : "focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
//                         }`}
//                         disabled={!sectionEnabled}
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

// const QMSAudit = () => {
//   const { t, i18n } = useTranslation(); // Get i18n for language
//   const [auditItems, setAuditItems] = useState([]); // Holds interactive data + staticData ref
//   const [staticSectionDataFromDB, setStaticSectionDataFromDB] = useState(null); // Raw fetched section data
//   const [sectionTitleForDisplay, setSectionTitleForDisplay] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [sectionEnabled, setSectionEnabled] = useState(true);
//   const [additionalCommentsText, setAdditionalCommentsText] = useState("");
//   const [showAdditionalCommentsTable, setShowAdditionalCommentsTable] =
//     useState(false);
//   const [additionalCommentsTableRows, setAdditionalCommentsTableRows] =
//     useState(2);
//   const [additionalCommentsTableCols, setAdditionalCommentsTableCols] =
//     useState(2);
//   const [additionalCommentsTableData, setAdditionalCommentsTableData] =
//     useState([]);

//   const mainTitleForThisTab = "QMS"; // IMPORTANT: Change this for each audit tab component

//   // Fetch static data once on component mount
//   useEffect(() => {
//     const fetchStaticData = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/api/audit-checkpoints`
//         );
//         const allCheckpoints = response.data;
//         const currentTabDataFromDB = allCheckpoints.find(
//           (cp) => cp.mainTitle === mainTitleForThisTab
//         );

//         if (currentTabDataFromDB) {
//           setStaticSectionDataFromDB(currentTabDataFromDB); // Store raw static data
//           // Initialize auditItems with interactive shells around static data
//           const initializedItems = currentTabDataFromDB.requirements.map(
//             (req) => initializeInteractiveAuditItem(req)
//           );
//           setAuditItems(initializedItems);
//         } else {
//           setError(
//             t("common.dataNotFoundFor", { title: mainTitleForThisTab }) ||
//               `Audit data for "${mainTitleForThisTab}" not found.`
//           );
//         }
//       } catch (err) {
//         setError(
//           err.response?.data?.message ||
//             err.message ||
//             t("common.fetchError", "Failed to fetch audit data")
//         );
//         console.error("Fetch error:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchStaticData();
//   }, [mainTitleForThisTab, t]); // `t` added in case error messages use it

//   // Update section title for display when language or static data changes
//   useEffect(() => {
//     if (staticSectionDataFromDB) {
//       switch (i18n.language) {
//         case "km":
//           setSectionTitleForDisplay(
//             staticSectionDataFromDB.sectionTitleKhmer ||
//               staticSectionDataFromDB.sectionTitleEng
//           );
//           break;
//         case "zh":
//           setSectionTitleForDisplay(
//             staticSectionDataFromDB.sectionTitleChinese ||
//               staticSectionDataFromDB.sectionTitleEng
//           );
//           break;
//         default:
//           setSectionTitleForDisplay(staticSectionDataFromDB.sectionTitleEng);
//       }
//     }
//   }, [staticSectionDataFromDB, i18n.language]);

//   // The auditItems array itself doesn't need to be rebuilt on language change if AuditTableRow handles display.
//   // However, if you were to add new items or something that requires re-initialization of parts of auditItems
//   // based on language, you'd handle it here, carefully merging with existing interactive state.

//   const handleAuditDataChange = (updatedData) => {
//     setAuditItems(updatedData);
//   };

//   // Score calculations (use item.staticData.levelValue for the base level)
//   const maxScore = useMemo(
//     () =>
//       auditItems.reduce(
//         (sum, item) => sum + (parseInt(item.staticData?.levelValue, 10) || 0),
//         0
//       ),
//     [auditItems]
//   );

//   const maxPossibleScore = useMemo(() => {
//     const totalLevelScore = auditItems.reduce(
//       (sum, item) => sum + (parseInt(item.staticData?.levelValue, 10) || 0),
//       0
//     );
//     const totalNaDeduction = auditItems.reduce(
//       (sum, item) => sum + (parseInt(item.naScore, 10) || 0),
//       0
//     );
//     return totalLevelScore - totalNaDeduction;
//   }, [auditItems]);

//   const totalScoreAchieved = useMemo(
//     () =>
//       auditItems.reduce(
//         (sum, item) => sum + (parseInt(item.score, 10) || 0),
//         0
//       ),
//     [auditItems]
//   );

//   // Additional comments handlers (remain the same)
//   const handleAdditionalCommentsTextChange = (e) => {
//     if (!sectionEnabled) return;
//     const text = e.target.value;
//     if (text.length <= 1000) {
//       setAdditionalCommentsText(text);
//       if (showAdditionalCommentsTable) setShowAdditionalCommentsTable(false);
//     }
//   };

//   const toggleAdditionalCommentsTable = () => {
//     if (!sectionEnabled) return;
//     const newIsTable = !showAdditionalCommentsTable;
//     setShowAdditionalCommentsTable(newIsTable);
//     if (newIsTable && !additionalCommentsText) {
//       if (additionalCommentsTableData.length === 0) {
//         setAdditionalCommentsTableData(
//           Array(additionalCommentsTableRows).fill(
//             Array(additionalCommentsTableCols).fill("")
//           )
//         );
//       }
//     }
//   };
//   const handleAdditionalCommentsTableDimensionChange = (dim, value) => {
//     if (!sectionEnabled) return;
//     const numValue = Math.max(1, Math.min(10, parseInt(value, 10) || 1));
//     if (dim === "rows") setAdditionalCommentsTableRows(numValue);
//     if (dim === "cols") setAdditionalCommentsTableCols(numValue);
//     setAdditionalCommentsTableData(
//       Array(dim === "rows" ? numValue : additionalCommentsTableRows).fill(
//         Array(dim === "cols" ? numValue : additionalCommentsTableCols).fill("")
//       )
//     );
//   };

//   if (isLoading)
//     return (
//       <div className="p-6 text-center">
//         {t("common.loading", "Loading audit data...")}
//       </div>
//     );
//   if (error)
//     return (
//       <div className="p-6 text-center text-red-500">
//         {t("common.error", "Error")}: {error}
//       </div>
//     );
//   if (
//     !staticSectionDataFromDB ||
//     (auditItems.length === 0 && staticSectionDataFromDB.requirements.length > 0)
//   ) {
//     // This condition handles if static data is fetched but auditItems init failed or is empty when it shouldn't be.
//     if (
//       staticSectionDataFromDB &&
//       staticSectionDataFromDB.requirements.length > 0 &&
//       auditItems.length === 0 &&
//       !isLoading
//     ) {
//       return (
//         <div className="p-6 text-center">
//           {t("common.error", "Error initializing audit items. Please refresh.")}
//         </div>
//       );
//     }
//     return (
//       <div className="p-6 text-center">
//         {t("common.noDataFoundFor", { title: mainTitleForThisTab }) ||
//           `Audit section data for "${mainTitleForThisTab}" not found.`}
//       </div>
//     );
//   }

//   return (
//     <div className="p-1">
//       <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 my-4 px-4 sm:px-6 text-center sm:text-left">
//         {sectionTitleForDisplay}
//       </h2>
//       <AuditHeader />
//       <AuditLegend />
//       <div className="mx-4 sm:mx-6 my-3 flex items-center gap-2">
//         <label
//           htmlFor={`enableSectionToggle-${mainTitleForThisTab}`}
//           className="text-sm font-medium text-gray-700"
//         >
//           {t("auditTable.enableTable")}:
//         </label>
//         <div className="flex items-center">
//           <button
//             onClick={() => setSectionEnabled(true)}
//             className={`px-3 py-1 text-xs rounded-l-md border ${
//               sectionEnabled
//                 ? "bg-indigo-600 text-white border-indigo-600"
//                 : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//             }`}
//           >
//             {t("auditTable.yes")}
//           </button>
//           <button
//             onClick={() => setSectionEnabled(false)}
//             className={`px-3 py-1 text-xs rounded-r-md border ${
//               !sectionEnabled
//                 ? "bg-indigo-600 text-white border-indigo-600"
//                 : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//             }`}
//           >
//             {t("auditTable.no")}
//           </button>
//         </div>
//       </div>
//       <AuditTable
//         auditData={auditItems}
//         onAuditDataChange={handleAuditDataChange}
//         sectionEnabled={sectionEnabled}
//         currentLang={i18n.language} // Pass current language
//       />
//       <div
//         className={`mx-4 sm:mx-6 my-4 p-3 border rounded-lg shadow ${
//           !sectionEnabled ? "opacity-60 bg-gray-50" : "bg-white"
//         }`}
//       >
//         <div className="flex justify-between items-center mb-1">
//           <label
//             htmlFor={`additionalComments-${mainTitleForThisTab}`}
//             className="text-sm font-semibold text-gray-700"
//           >
//             {t("auditTable.additionalComments")}
//           </label>
//           <button
//             onClick={toggleAdditionalCommentsTable}
//             title={t("auditTable.insertTable")}
//             className={`p-1 rounded ${
//               showAdditionalCommentsTable
//                 ? "bg-indigo-100 text-indigo-600"
//                 : "hover:bg-gray-100"
//             } ${!sectionEnabled ? "cursor-not-allowed" : ""}`}
//             disabled={!sectionEnabled}
//           >
//             <TableIcon size={16} />
//           </button>
//         </div>
//         {showAdditionalCommentsTable && sectionEnabled && (
//           <div className="flex items-center gap-2 mb-2">
//             <input
//               type="number"
//               value={additionalCommentsTableRows}
//               onChange={(e) =>
//                 handleAdditionalCommentsTableDimensionChange(
//                   "rows",
//                   e.target.value
//                 )
//               }
//               min="1"
//               max="10"
//               className="w-12 text-xs p-1 border rounded"
//               title={t("auditTable.rows")}
//               disabled={!sectionEnabled}
//             />
//             <span className="text-xs">x</span>
//             <input
//               type="number"
//               value={additionalCommentsTableCols}
//               onChange={(e) =>
//                 handleAdditionalCommentsTableDimensionChange(
//                   "cols",
//                   e.target.value
//                 )
//               }
//               min="1"
//               max="10"
//               className="w-12 text-xs p-1 border rounded"
//               title={t("auditTable.cols")}
//               disabled={!sectionEnabled}
//             />
//           </div>
//         )}
//         {showAdditionalCommentsTable && sectionEnabled ? (
//           <AdditionalCommentsTableInput
//             rows={additionalCommentsTableRows}
//             cols={additionalCommentsTableCols}
//             data={additionalCommentsTableData}
//             onChange={setAdditionalCommentsTableData}
//             sectionEnabled={sectionEnabled}
//           />
//         ) : (
//           <textarea
//             id={`additionalComments-${mainTitleForThisTab}`}
//             value={additionalCommentsText}
//             onChange={handleAdditionalCommentsTextChange}
//             rows="4"
//             maxLength={1000}
//             className={`w-full p-2 text-sm border rounded ${
//               !sectionEnabled
//                 ? "bg-gray-100 cursor-not-allowed"
//                 : "focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
//             }`}
//             disabled={!sectionEnabled}
//           />
//         )}
//         {!showAdditionalCommentsTable && (
//           <div className="text-right text-xs text-gray-400 mt-0.5">
//             {additionalCommentsText.length}/1000
//           </div>
//         )}
//       </div>
//       <div
//         className={`grid md:grid-cols-3 gap-4 mx-4 sm:mx-6 my-6 ${
//           !sectionEnabled ? "opacity-60" : ""
//         }`}
//       >
//         <ScoreCard
//           title={t("auditTable.maxScoreCardTitle")}
//           value={maxScore}
//           icon={<Award />}
//           colorClass="bg-blue-500"
//         />
//         <ScoreCard
//           title={t("auditTable.maxPossibleScoreCardTitle")}
//           value={maxPossibleScore}
//           icon={<TrendingUp />}
//           colorClass="bg-yellow-500"
//         />
//         <ScoreCard
//           title={t("auditTable.totalScoreCardTitle")}
//           value={totalScoreAchieved}
//           icon={<TrendingUp />}
//           colorClass="bg-green-500"
//         />
//       </div>
//     </div>
//   );
// };

// export default QMSAudit;

// import axios from "axios";
// import { Award, Table as TableIcon, TrendingUp } from "lucide-react";
// import React, { useEffect, useMemo, useState } from "react";
// import { useTranslation } from "react-i18next";
// import { API_BASE_URL } from "../../../../config"; // Adjust path
// import AuditHeader from "./AuditHeader";
// import AuditLegend from "./AuditLegend";
// import AuditTable from "./AuditTable";

// // Helper: Initialize dynamic fields for an audit item and store static multilingual data
// const initializeInteractiveAuditItem = (staticRequirementFromDB) => {
//   const level = parseInt(staticRequirementFromDB.levelValue, 10) || 0;
//   const initialOk = true;
//   const initialScore = initialOk ? level : 0;

//   return {
//     staticData: staticRequirementFromDB,
//     ok: initialOk,
//     toImprove: false,
//     na: false,
//     observationData: {
//       text: "",
//       isTable: false,
//       table: { rows: 2, cols: 2, data: [] },
//     },
//     images: [],
//     mustHave: staticRequirementFromDB.mustHave,
//     score: initialScore,
//     naScore: 0,
//     uniqueId: staticRequirementFromDB._id || staticRequirementFromDB.no,
//   };
// };

// const ScoreCard = ({ title, value, icon, colorClass = "bg-blue-500" }) => (
//   <div className={`p-4 rounded-lg shadow-md text-white ${colorClass}`}>
//     <div className="flex items-center mb-2">
//       {icon && React.cloneElement(icon, { size: 20, className: "mr-2" })}
//       <h4 className="text-sm font-semibold">{title}</h4>
//     </div>
//     <p className="text-2xl font-bold text-center">{value}</p>
//   </div>
// );

// const AdditionalCommentsTableInput = ({
//   rows,
//   cols,
//   data = [],
//   onChange,
//   sectionEnabled,
// }) => {
//   const [tableData, setTableData] = useState(data);
//   useEffect(() => {
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
//     if (!sectionEnabled) return;
//     const newData = tableData.map((row, rowIndex) =>
//       rowIndex === rIndex
//         ? row.map((cell, colIndex) => (colIndex === cIndex ? value : cell))
//         : row
//     );
//     setTableData(newData);
//     onChange(newData);
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
//                         className={`w-full p-0.5 text-xs bg-white ${
//                           !sectionEnabled
//                             ? "cursor-not-allowed bg-gray-100"
//                             : "focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
//                         }`}
//                         disabled={!sectionEnabled}
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

// const QMSAudit = () => {
//   const { t, i18n } = useTranslation();
//   const [auditItems, setAuditItems] = useState([]);
//   const [staticSectionDataFromDB, setStaticSectionDataFromDB] = useState(null);
//   const [sectionTitleForDisplay, setSectionTitleForDisplay] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [sectionEnabled, setSectionEnabled] = useState(true);
//   const [additionalCommentsText, setAdditionalCommentsText] = useState("");
//   const [showAdditionalCommentsTable, setShowAdditionalCommentsTable] =
//     useState(false);
//   const [additionalCommentsTableRows, setAdditionalCommentsTableRows] =
//     useState(2);
//   const [additionalCommentsTableCols, setAdditionalCommentsTableCols] =
//     useState(2);
//   const [additionalCommentsTableData, setAdditionalCommentsTableData] =
//     useState([]);

//   const mainTitleForThisTab = "QMS";

//   useEffect(() => {
//     const fetchStaticData = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/api/audit-checkpoints`
//         );
//         const allCheckpoints = response.data;
//         const currentTabDataFromDB = allCheckpoints.find(
//           (cp) => cp.mainTitle === mainTitleForThisTab
//         );

//         if (currentTabDataFromDB) {
//           setStaticSectionDataFromDB(currentTabDataFromDB);
//           const initializedItems = currentTabDataFromDB.requirements.map(
//             (req) => initializeInteractiveAuditItem(req)
//           );
//           setAuditItems(initializedItems);
//         } else {
//           setError(
//             t("common.dataNotFoundFor", { title: mainTitleForThisTab }) ||
//               `Audit data for "${mainTitleForThisTab}" not found.`
//           );
//         }
//       } catch (err) {
//         setError(
//           err.response?.data?.message ||
//             err.message ||
//             t("common.fetchError", "Failed to fetch audit data")
//         );
//         console.error("Fetch error:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchStaticData();
//   }, [mainTitleForThisTab, t]);

//   useEffect(() => {
//     if (staticSectionDataFromDB) {
//       switch (i18n.language) {
//         case "km":
//           setSectionTitleForDisplay(
//             staticSectionDataFromDB.sectionTitleKhmer ||
//               staticSectionDataFromDB.sectionTitleEng
//           );
//           break;
//         case "zh":
//           setSectionTitleForDisplay(
//             staticSectionDataFromDB.sectionTitleChinese ||
//               staticSectionDataFromDB.sectionTitleEng
//           );
//           break;
//         default:
//           setSectionTitleForDisplay(staticSectionDataFromDB.sectionTitleEng);
//       }
//       // IMPORTANT: If auditItems are already populated, we need to ensure their display texts
//       // are also updated if the language changes AFTER initial load.
//       // However, AuditTableRow will handle this if `currentLang` prop changes.
//       // So, no need to rebuild auditItems here for language change IF AuditTableRow handles it.
//     }
//   }, [staticSectionDataFromDB, i18n.language]); // This updates the section title

//   const handleAuditDataChange = (updatedData) => {
//     setAuditItems(updatedData);
//   };

//   const maxScore = useMemo(
//     () =>
//       auditItems.reduce(
//         (sum, item) => sum + (parseInt(item.staticData?.levelValue, 10) || 0),
//         0
//       ),
//     [auditItems]
//   );

//   const maxPossibleScore = useMemo(() => {
//     const totalLevelScore = auditItems.reduce(
//       (sum, item) => sum + (parseInt(item.staticData?.levelValue, 10) || 0),
//       0
//     );
//     const totalNaDeduction = auditItems.reduce(
//       (sum, item) => sum + (parseInt(item.naScore, 10) || 0),
//       0
//     );
//     return totalLevelScore - totalNaDeduction;
//   }, [auditItems]);

//   const totalScoreAchieved = useMemo(
//     () =>
//       auditItems.reduce(
//         (sum, item) => sum + (parseInt(item.score, 10) || 0),
//         0
//       ),
//     [auditItems]
//   );

//   const handleAdditionalCommentsTextChange = (e) => {
//     if (!sectionEnabled) return;
//     const text = e.target.value;
//     if (text.length <= 1000) {
//       setAdditionalCommentsText(text);
//       if (showAdditionalCommentsTable) setShowAdditionalCommentsTable(false);
//     }
//   };

//   const toggleAdditionalCommentsTable = () => {
//     if (!sectionEnabled) return;
//     const newIsTable = !showAdditionalCommentsTable;
//     setShowAdditionalCommentsTable(newIsTable);
//     if (newIsTable && !additionalCommentsText) {
//       if (additionalCommentsTableData.length === 0) {
//         setAdditionalCommentsTableData(
//           Array(additionalCommentsTableRows).fill(
//             Array(additionalCommentsTableCols).fill("")
//           )
//         );
//       }
//     }
//   };
//   const handleAdditionalCommentsTableDimensionChange = (dim, value) => {
//     if (!sectionEnabled) return;
//     const numValue = Math.max(1, Math.min(10, parseInt(value, 10) || 1));
//     if (dim === "rows") setAdditionalCommentsTableRows(numValue);
//     if (dim === "cols") setAdditionalCommentsTableCols(numValue);
//     setAdditionalCommentsTableData(
//       Array(dim === "rows" ? numValue : additionalCommentsTableRows).fill(
//         Array(dim === "cols" ? numValue : additionalCommentsTableCols).fill("")
//       )
//     );
//   };

//   if (isLoading)
//     return (
//       <div className="p-6 text-center">
//         {t("common.loading", "Loading audit data...")}
//       </div>
//     );
//   if (error)
//     return (
//       <div className="p-6 text-center text-red-500">
//         {t("common.error", "Error")}: {error}
//       </div>
//     );
//   if (
//     !staticSectionDataFromDB ||
//     (staticSectionDataFromDB.requirements.length > 0 &&
//       auditItems.length === 0 &&
//       !isLoading)
//   ) {
//     return (
//       <div className="p-6 text-center">
//         {t("common.noDataFoundFor", { title: mainTitleForThisTab }) ||
//           `Audit data for "${mainTitleForThisTab}" not found or failed to initialize.`}
//       </div>
//     );
//   }

//   return (
//     <div className="p-1">
//       <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 my-4 px-4 sm:px-6 text-center sm:text-left">
//         {sectionTitleForDisplay}
//       </h2>
//       <AuditHeader />
//       <AuditLegend />
//       <div className="mx-4 sm:mx-6 my-3 flex items-center gap-2">
//         <label
//           htmlFor={`enableSectionToggle-${mainTitleForThisTab}`}
//           className="text-sm font-medium text-gray-700"
//         >
//           {t("auditTable.enableTable")}:
//         </label>
//         <div className="flex items-center">
//           <button
//             onClick={() => setSectionEnabled(true)}
//             className={`px-3 py-1 text-xs rounded-l-md border ${
//               sectionEnabled
//                 ? "bg-indigo-600 text-white border-indigo-600"
//                 : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//             }`}
//           >
//             {t("auditTable.yes")}
//           </button>
//           <button
//             onClick={() => setSectionEnabled(false)}
//             className={`px-3 py-1 text-xs rounded-r-md border ${
//               !sectionEnabled
//                 ? "bg-indigo-600 text-white border-indigo-600"
//                 : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//             }`}
//           >
//             {t("auditTable.no")}
//           </button>
//         </div>
//       </div>
//       <AuditTable
//         auditData={auditItems}
//         onAuditDataChange={handleAuditDataChange}
//         sectionEnabled={sectionEnabled}
//         currentLang={i18n.language}
//       />
//       <div
//         className={`mx-4 sm:mx-6 my-4 p-3 border rounded-lg shadow ${
//           !sectionEnabled ? "opacity-60 bg-gray-50" : "bg-white"
//         }`}
//       >
//         <div className="flex justify-between items-center mb-1">
//           <label
//             htmlFor={`additionalComments-${mainTitleForThisTab}`}
//             className="text-sm font-semibold text-gray-700"
//           >
//             {t("auditTable.additionalComments")}
//           </label>
//           <button
//             onClick={toggleAdditionalCommentsTable}
//             title={t("auditTable.insertTable")}
//             className={`p-1 rounded ${
//               showAdditionalCommentsTable
//                 ? "bg-indigo-100 text-indigo-600"
//                 : "hover:bg-gray-100"
//             } ${!sectionEnabled ? "cursor-not-allowed" : ""}`}
//             disabled={!sectionEnabled}
//           >
//             <TableIcon size={16} />
//           </button>
//         </div>
//         {showAdditionalCommentsTable && sectionEnabled && (
//           <div className="flex items-center gap-2 mb-2">
//             <input
//               type="number"
//               value={additionalCommentsTableRows}
//               onChange={(e) =>
//                 handleAdditionalCommentsTableDimensionChange(
//                   "rows",
//                   e.target.value
//                 )
//               }
//               min="1"
//               max="10"
//               className="w-12 text-xs p-1 border rounded"
//               title={t("auditTable.rows")}
//               disabled={!sectionEnabled}
//             />
//             <span className="text-xs">x</span>
//             <input
//               type="number"
//               value={additionalCommentsTableCols}
//               onChange={(e) =>
//                 handleAdditionalCommentsTableDimensionChange(
//                   "cols",
//                   e.target.value
//                 )
//               }
//               min="1"
//               max="10"
//               className="w-12 text-xs p-1 border rounded"
//               title={t("auditTable.cols")}
//               disabled={!sectionEnabled}
//             />
//           </div>
//         )}
//         {showAdditionalCommentsTable && sectionEnabled ? (
//           <AdditionalCommentsTableInput
//             rows={additionalCommentsTableRows}
//             cols={additionalCommentsTableCols}
//             data={additionalCommentsTableData}
//             onChange={setAdditionalCommentsTableData}
//             sectionEnabled={sectionEnabled}
//           />
//         ) : (
//           <textarea
//             id={`additionalComments-${mainTitleForThisTab}`}
//             value={additionalCommentsText}
//             onChange={handleAdditionalCommentsTextChange}
//             rows="4"
//             maxLength={1000}
//             className={`w-full p-2 text-sm border rounded ${
//               !sectionEnabled
//                 ? "bg-gray-100 cursor-not-allowed"
//                 : "focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
//             }`}
//             disabled={!sectionEnabled}
//           />
//         )}
//         {!showAdditionalCommentsTable && (
//           <div className="text-right text-xs text-gray-400 mt-0.5">
//             {additionalCommentsText.length}/1000
//           </div>
//         )}
//       </div>
//       <div
//         className={`grid md:grid-cols-3 gap-4 mx-4 sm:mx-6 my-6 ${
//           !sectionEnabled ? "opacity-60" : ""
//         }`}
//       >
//         <ScoreCard
//           title={t("auditTable.maxScoreCardTitle")}
//           value={maxScore}
//           icon={<Award />}
//           colorClass="bg-blue-500"
//         />
//         <ScoreCard
//           title={t("auditTable.maxPossibleScoreCardTitle")}
//           value={maxPossibleScore}
//           icon={<TrendingUp />}
//           colorClass="bg-yellow-500"
//         />
//         <ScoreCard
//           title={t("auditTable.totalScoreCardTitle")}
//           value={totalScoreAchieved}
//           icon={<TrendingUp />}
//           colorClass="bg-green-500"
//         />
//       </div>
//     </div>
//   );
// };

// export default QMSAudit;

// import axios from "axios";
// import { Award, Table as TableIcon, TrendingUp } from "lucide-react";
// import React, { useEffect, useMemo, useState } from "react";
// import { useTranslation } from "react-i18next";
// import { API_BASE_URL } from "../../../../config"; // Adjust path if your config is elsewhere
// import AuditHeader from "./AuditHeader"; // Assumes AuditHeader is in ../
// import AuditLegend from "./AuditLegend"; // Assumes AuditLegend is in ../
// import AuditTable from "./AuditTable"; // Assumes AuditTable is in ../

// // Helper: Initialize ONLY the INTERACTIVE SHELL.
// // The static multilingual data will be kept separate.
// const initializeInteractiveAuditItemShell = (staticRequirementFromDB) => {
//   const level = parseInt(staticRequirementFromDB.levelValue, 10) || 0;
//   const initialOk = true; // Default to OK
//   const initialScore = initialOk ? level : 0;

//   return {
//     staticData: staticRequirementFromDB, // Contains all Eng, Khmer, Chinese texts, levelValue, mustHave (from DB)
//     ok: initialOk,
//     toImprove: false,
//     na: false,
//     observationData: {
//       text: "",
//       isTable: false,
//       table: { rows: 2, cols: 2, data: [] },
//     },
//     images: [],
//     mustHave: staticRequirementFromDB.mustHave, // User toggleable, initialized from DB default
//     score: initialScore,
//     naScore: 0,
//     uniqueId: staticRequirementFromDB._id || staticRequirementFromDB.no, // For React key
//   };
// };

// const ScoreCard = ({ title, value, icon, colorClass = "bg-blue-500" }) => (
//   <div className={`p-4 rounded-lg shadow-md text-white ${colorClass}`}>
//     <div className="flex items-center mb-2">
//       {icon && React.cloneElement(icon, { size: 20, className: "mr-2" })}
//       <h4 className="text-sm font-semibold">{title}</h4>
//     </div>
//     <p className="text-2xl font-bold text-center">{value}</p>
//   </div>
// );

// const AdditionalCommentsTableInput = ({
//   rows,
//   cols,
//   data = [],
//   onChange,
//   sectionEnabled,
// }) => {
//   const [tableData, setTableData] = useState(data);
//   useEffect(() => {
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
//     if (!sectionEnabled) return;
//     const newData = tableData.map((row, rowIndex) =>
//       rowIndex === rIndex
//         ? row.map((cell, colIndex) => (colIndex === cIndex ? value : cell))
//         : row
//     );
//     setTableData(newData);
//     onChange(newData);
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
//                         className={`w-full p-0.5 text-xs bg-white ${
//                           !sectionEnabled
//                             ? "cursor-not-allowed bg-gray-100"
//                             : "focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
//                         }`}
//                         disabled={!sectionEnabled}
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

// const QMSAudit = () => {
//   const { t, i18n } = useTranslation();
//   const [auditItems, setAuditItems] = useState([]);
//   const [rawStaticSectionData, setRawStaticSectionData] = useState(null);
//   const [sectionTitleForDisplay, setSectionTitleForDisplay] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [sectionEnabled, setSectionEnabled] = useState(true);
//   const [additionalCommentsText, setAdditionalCommentsText] = useState("");
//   const [showAdditionalCommentsTable, setShowAdditionalCommentsTable] =
//     useState(false);
//   const [additionalCommentsTableRows, setAdditionalCommentsTableRows] =
//     useState(2);
//   const [additionalCommentsTableCols, setAdditionalCommentsTableCols] =
//     useState(2);
//   const [additionalCommentsTableData, setAdditionalCommentsTableData] =
//     useState([]);

//   const mainTitleForThisTab = "QMS"; // Unique identifier for this tab's data

//   useEffect(() => {
//     const fetchStaticData = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/api/audit-checkpoints`
//         );
//         const allCheckpoints = response.data;
//         const currentTabDataFromDB = allCheckpoints.find(
//           (cp) => cp.mainTitle === mainTitleForThisTab
//         );

//         if (currentTabDataFromDB) {
//           setRawStaticSectionData(currentTabDataFromDB);
//           const initializedItems = currentTabDataFromDB.requirements.map(
//             (req) => initializeInteractiveAuditItemShell(req)
//           );
//           setAuditItems(initializedItems);
//         } else {
//           setError(
//             t("common.dataNotFoundFor", { title: mainTitleForThisTab }) ||
//               `Audit data for "${mainTitleForThisTab}" not found.`
//           );
//         }
//       } catch (err) {
//         setError(
//           err.response?.data?.message ||
//             err.message ||
//             t("common.fetchError", "Failed to fetch audit data")
//         );
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchStaticData();
//   }, [mainTitleForThisTab, t]);

//   useEffect(() => {
//     if (rawStaticSectionData) {
//       const lang = i18n.language;
//       let title =
//         rawStaticSectionData.sectionTitleEng ||
//         t("audit.defaultSectionTitle", "Audit Section");

//       if (lang.startsWith("km")) {
//         title =
//           rawStaticSectionData.sectionTitleKhmer ||
//           rawStaticSectionData.sectionTitleEng ||
//           t("audit.defaultSectionTitle", "Audit Section");
//       } else if (lang.startsWith("zh")) {
//         title =
//           rawStaticSectionData.sectionTitleChinese ||
//           rawStaticSectionData.sectionTitleEng ||
//           t("audit.defaultSectionTitle", "Audit Section");
//       }
//       // If lang is 'en' or any other default, it's already using sectionTitleEng or the ultimate fallback.
//       // For explicit 'en' handling (though typically covered by default):
//       else if (lang.startsWith("en")) {
//         title =
//           rawStaticSectionData.sectionTitleEng ||
//           t("audit.defaultSectionTitle", "Audit Section");
//       }
//       setSectionTitleForDisplay(title);
//     } else {
//       setSectionTitleForDisplay(
//         t("audit.defaultSectionTitle", "Audit Section")
//       );
//     }
//   }, [rawStaticSectionData, i18n.language, t]);

//   const handleAuditDataChange = (updatedData) => {
//     setAuditItems(updatedData);
//   };

//   const maxScore = useMemo(
//     () =>
//       auditItems.reduce(
//         (sum, item) => sum + (parseInt(item.staticData?.levelValue, 10) || 0),
//         0
//       ),
//     [auditItems]
//   );
//   const maxPossibleScore = useMemo(() => {
//     const totalLevelScore = auditItems.reduce(
//       (sum, item) => sum + (parseInt(item.staticData?.levelValue, 10) || 0),
//       0
//     );
//     const totalNaDeduction = auditItems.reduce(
//       (sum, item) => sum + (parseInt(item.naScore, 10) || 0),
//       0
//     );
//     return totalLevelScore - totalNaDeduction;
//   }, [auditItems]);
//   const totalScoreAchieved = useMemo(
//     () =>
//       auditItems.reduce(
//         (sum, item) => sum + (parseInt(item.score, 10) || 0),
//         0
//       ),
//     [auditItems]
//   );

//   const handleAdditionalCommentsTextChange = (e) => {
//     if (!sectionEnabled) return;
//     const text = e.target.value;
//     if (text.length <= 1000) {
//       setAdditionalCommentsText(text);
//       if (showAdditionalCommentsTable) setShowAdditionalCommentsTable(false);
//     }
//   };
//   const toggleAdditionalCommentsTable = () => {
//     if (!sectionEnabled) return;
//     const newIsTable = !showAdditionalCommentsTable;
//     setShowAdditionalCommentsTable(newIsTable);
//     if (newIsTable && !additionalCommentsText) {
//       if (additionalCommentsTableData.length === 0) {
//         setAdditionalCommentsTableData(
//           Array(additionalCommentsTableRows).fill(
//             Array(additionalCommentsTableCols).fill("")
//           )
//         );
//       }
//     }
//   };
//   const handleAdditionalCommentsTableDimensionChange = (dim, value) => {
//     if (!sectionEnabled) return;
//     const numValue = Math.max(1, Math.min(10, parseInt(value, 10) || 1));
//     if (dim === "rows") setAdditionalCommentsTableRows(numValue);
//     if (dim === "cols") setAdditionalCommentsTableCols(numValue);
//     setAdditionalCommentsTableData(
//       Array(dim === "rows" ? numValue : additionalCommentsTableRows).fill(
//         Array(dim === "cols" ? numValue : additionalCommentsTableCols).fill("")
//       )
//     );
//   };

//   if (isLoading)
//     return (
//       <div className="p-6 text-center">
//         {t("common.loading", "Loading audit data...")}
//       </div>
//     );
//   if (error)
//     return (
//       <div className="p-6 text-center text-red-500">
//         {t("common.error", "Error")}: {error}
//       </div>
//     );
//   if (
//     !rawStaticSectionData ||
//     (rawStaticSectionData.requirements.length > 0 &&
//       auditItems.length === 0 &&
//       !isLoading)
//   ) {
//     return (
//       <div className="p-6 text-center">
//         {t("common.noDataFoundFor", { title: mainTitleForThisTab }) ||
//           `Audit data for "${mainTitleForThisTab}" not found or failed to initialize.`}
//       </div>
//     );
//   }

//   return (
//     <div className="p-1">
//       <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 my-4 px-4 sm:px-6 text-center sm:text-left">
//         {sectionTitleForDisplay}
//       </h2>
//       <AuditHeader />
//       <AuditLegend />
//       <div className="mx-4 sm:mx-6 my-3 flex items-center gap-2">
//         <label
//           htmlFor={`enableSectionToggle-${mainTitleForThisTab}`}
//           className="text-sm font-medium text-gray-700"
//         >
//           {t("auditTable.enableTable")}:
//         </label>
//         <div className="flex items-center">
//           <button
//             onClick={() => setSectionEnabled(true)}
//             className={`px-3 py-1 text-xs rounded-l-md border ${
//               sectionEnabled
//                 ? "bg-indigo-600 text-white border-indigo-600"
//                 : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//             }`}
//           >
//             {t("auditTable.yes")}
//           </button>
//           <button
//             onClick={() => setSectionEnabled(false)}
//             className={`px-3 py-1 text-xs rounded-r-md border ${
//               !sectionEnabled
//                 ? "bg-indigo-600 text-white border-indigo-600"
//                 : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//             }`}
//           >
//             {t("auditTable.no")}
//           </button>
//         </div>
//       </div>
//       <AuditTable
//         auditData={auditItems}
//         onAuditDataChange={handleAuditDataChange}
//         sectionEnabled={sectionEnabled}
//         currentLang={i18n.language}
//       />
//       <div
//         className={`mx-4 sm:mx-6 my-4 p-3 border rounded-lg shadow ${
//           !sectionEnabled ? "opacity-60 bg-gray-50" : "bg-white"
//         }`}
//       >
//         <div className="flex justify-between items-center mb-1">
//           <label
//             htmlFor={`additionalComments-${mainTitleForThisTab}`}
//             className="text-sm font-semibold text-gray-700"
//           >
//             {t("auditTable.additionalComments")}
//           </label>
//           <button
//             onClick={toggleAdditionalCommentsTable}
//             title={t("auditTable.insertTable")}
//             className={`p-1 rounded ${
//               showAdditionalCommentsTable
//                 ? "bg-indigo-100 text-indigo-600"
//                 : "hover:bg-gray-100"
//             } ${!sectionEnabled ? "cursor-not-allowed" : ""}`}
//             disabled={!sectionEnabled}
//           >
//             <TableIcon size={16} />
//           </button>
//         </div>
//         {showAdditionalCommentsTable && sectionEnabled && (
//           <div className="flex items-center gap-2 mb-2">
//             <input
//               type="number"
//               value={additionalCommentsTableRows}
//               onChange={(e) =>
//                 handleAdditionalCommentsTableDimensionChange(
//                   "rows",
//                   e.target.value
//                 )
//               }
//               min="1"
//               max="10"
//               className="w-12 text-xs p-1 border rounded"
//               title={t("auditTable.rows")}
//               disabled={!sectionEnabled}
//             />
//             <span className="text-xs">x</span>
//             <input
//               type="number"
//               value={additionalCommentsTableCols}
//               onChange={(e) =>
//                 handleAdditionalCommentsTableDimensionChange(
//                   "cols",
//                   e.target.value
//                 )
//               }
//               min="1"
//               max="10"
//               className="w-12 text-xs p-1 border rounded"
//               title={t("auditTable.cols")}
//               disabled={!sectionEnabled}
//             />
//           </div>
//         )}
//         {showAdditionalCommentsTable && sectionEnabled ? (
//           <AdditionalCommentsTableInput
//             rows={additionalCommentsTableRows}
//             cols={additionalCommentsTableCols}
//             data={additionalCommentsTableData}
//             onChange={setAdditionalCommentsTableData}
//             sectionEnabled={sectionEnabled}
//           />
//         ) : (
//           <textarea
//             id={`additionalComments-${mainTitleForThisTab}`}
//             value={additionalCommentsText}
//             onChange={handleAdditionalCommentsTextChange}
//             rows="4"
//             maxLength={1000}
//             className={`w-full p-2 text-sm border rounded ${
//               !sectionEnabled
//                 ? "bg-gray-100 cursor-not-allowed"
//                 : "focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
//             }`}
//             disabled={!sectionEnabled}
//           />
//         )}
//         {!showAdditionalCommentsTable && (
//           <div className="text-right text-xs text-gray-400 mt-0.5">
//             {additionalCommentsText.length}/1000
//           </div>
//         )}
//       </div>
//       <div
//         className={`grid md:grid-cols-3 gap-4 mx-4 sm:mx-6 my-6 ${
//           !sectionEnabled ? "opacity-60" : ""
//         }`}
//       >
//         <ScoreCard
//           title={t("auditTable.maxScoreCardTitle")}
//           value={maxScore}
//           icon={<Award />}
//           colorClass="bg-blue-500"
//         />
//         <ScoreCard
//           title={t("auditTable.maxPossibleScoreCardTitle")}
//           value={maxPossibleScore}
//           icon={<TrendingUp />}
//           colorClass="bg-yellow-500"
//         />
//         <ScoreCard
//           title={t("auditTable.totalScoreCardTitle")}
//           value={totalScoreAchieved}
//           icon={<TrendingUp />}
//           colorClass="bg-green-500"
//         />
//       </div>
//     </div>
//   );
// };

// export default QMSAudit;

import axios from "axios";
import { Award, Table as TableIcon, TrendingUp } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../../../config"; // Ensure this path is correct
import AuditHeader from "./AuditHeader"; // Ensure this path is correct
import AuditLegend from "./AuditLegend"; // Ensure this path is correct
import AuditTable from "./AuditTable"; // Ensure this path is correct

// Helper: Initialize ONLY the INTERACTIVE SHELL.
const initializeInteractiveAuditItemShell = (staticRequirementFromDB) => {
  const level = parseInt(staticRequirementFromDB.levelValue, 10) || 0;
  const initialOk = true; // Default to OK
  const initialScore = initialOk ? level : 0;

  return {
    staticData: staticRequirementFromDB,
    ok: initialOk,
    toImprove: false,
    na: false,
    observationData: {
      text: "",
      isTable: false,
      table: { rows: 2, cols: 2, data: [] },
    },
    images: [],
    mustHave: staticRequirementFromDB.mustHave,
    score: initialScore,
    naScore: 0,
    uniqueId: staticRequirementFromDB._id || staticRequirementFromDB.no,
  };
};

const ScoreCard = ({ title, value, icon, colorClass = "bg-blue-500" }) => (
  <div className={`p-4 rounded-lg shadow-md text-white ${colorClass}`}>
    <div className="flex items-center mb-2">
      {icon && React.cloneElement(icon, { size: 20, className: "mr-2" })}
      <h4 className="text-sm font-semibold">{title}</h4>
    </div>
    <p className="text-2xl font-bold text-center">{value}</p>
  </div>
);

const AdditionalCommentsTableInput = ({
  rows,
  cols,
  data = [],
  onChange,
  sectionEnabled,
}) => {
  const [tableData, setTableData] = useState(data);
  useEffect(() => {
    const initialData = Array(rows)
      .fill(null)
      .map((_, rIndex) =>
        Array(cols)
          .fill(null)
          .map((__, cIndex) => (data[rIndex] && data[rIndex][cIndex]) || "")
      );
    setTableData(initialData);
  }, [rows, cols, data]);

  const handleCellChange = (rIndex, cIndex, value) => {
    if (!sectionEnabled) return;
    const newData = tableData.map((row, rowIndex) =>
      rowIndex === rIndex
        ? row.map((cell, colIndex) => (colIndex === cIndex ? value : cell))
        : row
    );
    setTableData(newData);
    onChange(newData);
  };
  if (rows < 1 || cols < 1) return null;
  return (
    <div className="overflow-x-auto my-1">
      <table className="min-w-full border-collapse text-xs">
        <tbody>
          {Array(rows)
            .fill(null)
            .map((_, rIndex) => (
              <tr key={rIndex}>
                {Array(cols)
                  .fill(null)
                  .map((_, cIndex) => (
                    <td key={cIndex} className="border border-gray-300 p-0.5">
                      <input
                        type="text"
                        value={tableData[rIndex]?.[cIndex] || ""}
                        onChange={(e) =>
                          handleCellChange(rIndex, cIndex, e.target.value)
                        }
                        className={`w-full p-0.5 text-xs bg-white ${
                          !sectionEnabled
                            ? "cursor-not-allowed bg-gray-100"
                            : "focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
                        }`}
                        disabled={!sectionEnabled}
                      />
                    </td>
                  ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

const QMSAudit = () => {
  const { t, i18n } = useTranslation();
  const [auditItems, setAuditItems] = useState([]);
  const [rawStaticSectionData, setRawStaticSectionData] = useState(null);
  const [sectionTitleForDisplay, setSectionTitleForDisplay] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [additionalCommentsText, setAdditionalCommentsText] = useState("");
  const [showAdditionalCommentsTable, setShowAdditionalCommentsTable] =
    useState(false);
  const [additionalCommentsTableRows, setAdditionalCommentsTableRows] =
    useState(2);
  const [additionalCommentsTableCols, setAdditionalCommentsTableCols] =
    useState(2);
  const [additionalCommentsTableData, setAdditionalCommentsTableData] =
    useState([]);

  const mainTitleForThisTab = "QMS";

  console.log(
    "QMSAudit rendering, current language:",
    i18n.language,
    "auditItems count:",
    auditItems.length
  ); // DEBUG LOG 4 (Modified)

  useEffect(() => {
    const fetchStaticData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/audit-checkpoints`
        );
        const allCheckpoints = response.data;
        const currentTabDataFromDB = allCheckpoints.find(
          (cp) => cp.mainTitle === mainTitleForThisTab
        );

        if (currentTabDataFromDB) {
          setRawStaticSectionData(currentTabDataFromDB);
          const initializedItems = currentTabDataFromDB.requirements.map(
            (req) => initializeInteractiveAuditItemShell(req)
          );
          setAuditItems(initializedItems);
        } else {
          setError(
            t("common.dataNotFoundFor", { title: mainTitleForThisTab }) ||
              `Audit data for "${mainTitleForThisTab}" not found.`
          );
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            t("common.fetchError", "Failed to fetch audit data")
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaticData();
  }, [mainTitleForThisTab, t]);

  useEffect(() => {
    if (rawStaticSectionData) {
      const lang = i18n.language;
      switch (lang) {
        case "km":
          setSectionTitleForDisplay(rawStaticSectionData.sectionTitleKhmer);
          break;
        case "zh":
          setSectionTitleForDisplay(rawStaticSectionData.sectionTitleChinese);
          break;
        default:
          setSectionTitleForDisplay(rawStaticSectionData.sectionTitleEng);
      }
    }
  }, [rawStaticSectionData, i18n.language]);

  const handleAuditDataChange = (updatedData) => {
    setAuditItems(updatedData);
  };

  const maxScore = useMemo(
    () =>
      auditItems.reduce(
        (sum, item) => sum + (parseInt(item.staticData?.levelValue, 10) || 0),
        0
      ),
    [auditItems]
  );
  const maxPossibleScore = useMemo(() => {
    const totalLevelScore = auditItems.reduce(
      (sum, item) => sum + (parseInt(item.staticData?.levelValue, 10) || 0),
      0
    );
    const totalNaDeduction = auditItems.reduce(
      (sum, item) => sum + (parseInt(item.naScore, 10) || 0),
      0
    );
    return totalLevelScore - totalNaDeduction;
  }, [auditItems]);
  const totalScoreAchieved = useMemo(
    () =>
      auditItems.reduce(
        (sum, item) => sum + (parseInt(item.score, 10) || 0),
        0
      ),
    [auditItems]
  );

  const handleAdditionalCommentsTextChange = (e) => {
    if (!sectionEnabled) return;
    const text = e.target.value;
    if (text.length <= 1000) {
      setAdditionalCommentsText(text);
      if (showAdditionalCommentsTable) setShowAdditionalCommentsTable(false);
    }
  };
  const toggleAdditionalCommentsTable = () => {
    if (!sectionEnabled) return;
    const newIsTable = !showAdditionalCommentsTable;
    setShowAdditionalCommentsTable(newIsTable);
    if (newIsTable && !additionalCommentsText) {
      if (additionalCommentsTableData.length === 0) {
        setAdditionalCommentsTableData(
          Array(additionalCommentsTableRows).fill(
            Array(additionalCommentsTableCols).fill("")
          )
        );
      }
    }
  };
  const handleAdditionalCommentsTableDimensionChange = (dim, value) => {
    if (!sectionEnabled) return;
    const numValue = Math.max(1, Math.min(10, parseInt(value, 10) || 1));
    if (dim === "rows") setAdditionalCommentsTableRows(numValue);
    if (dim === "cols") setAdditionalCommentsTableCols(numValue);
    setAdditionalCommentsTableData(
      Array(dim === "rows" ? numValue : additionalCommentsTableRows).fill(
        Array(dim === "cols" ? numValue : additionalCommentsTableCols).fill("")
      )
    );
  };

  if (isLoading)
    return (
      <div className="p-6 text-center">
        {t("common.loading", "Loading audit data...")}
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        {t("common.error", "Error")}: {error}
      </div>
    );
  if (
    !rawStaticSectionData ||
    (rawStaticSectionData.requirements.length > 0 &&
      auditItems.length === 0 &&
      !isLoading)
  ) {
    return (
      <div className="p-6 text-center">
        {t("common.noDataFoundFor", { title: mainTitleForThisTab }) ||
          `Audit data for "${mainTitleForThisTab}" not found or failed to initialize.`}
      </div>
    );
  }

  return (
    <div className="p-1">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 my-4 px-4 sm:px-6 text-center sm:text-left">
        {sectionTitleForDisplay}
      </h2>
      <AuditHeader />
      <AuditLegend />
      <div className="mx-4 sm:mx-6 my-3 flex items-center gap-2">
        <label
          htmlFor={`enableSectionToggle-${mainTitleForThisTab}`}
          className="text-sm font-medium text-gray-700"
        >
          {t("auditTable.enableTable")}:
        </label>
        <div className="flex items-center">
          <button
            onClick={() => setSectionEnabled(true)}
            className={`px-3 py-1 text-xs rounded-l-md border ${
              sectionEnabled
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {t("auditTable.yes")}
          </button>
          <button
            onClick={() => setSectionEnabled(false)}
            className={`px-3 py-1 text-xs rounded-r-md border ${
              !sectionEnabled
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {t("auditTable.no")}
          </button>
        </div>
      </div>
      <AuditTable
        auditData={auditItems}
        onAuditDataChange={handleAuditDataChange}
        sectionEnabled={sectionEnabled}
        currentLang={i18n.language}
      />
      <div
        className={`mx-4 sm:mx-6 my-4 p-3 border rounded-lg shadow ${
          !sectionEnabled ? "opacity-60 bg-gray-50" : "bg-white"
        }`}
      >
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor={`additionalComments-${mainTitleForThisTab}`}
            className="text-sm font-semibold text-gray-700"
          >
            {t("auditTable.additionalComments")}
          </label>
          <button
            onClick={toggleAdditionalCommentsTable}
            title={t("auditTable.insertTable")}
            className={`p-1 rounded ${
              showAdditionalCommentsTable
                ? "bg-indigo-100 text-indigo-600"
                : "hover:bg-gray-100"
            } ${!sectionEnabled ? "cursor-not-allowed" : ""}`}
            disabled={!sectionEnabled}
          >
            <TableIcon size={16} />
          </button>
        </div>
        {showAdditionalCommentsTable && sectionEnabled && (
          <div className="flex items-center gap-2 mb-2">
            <input
              type="number"
              value={additionalCommentsTableRows}
              onChange={(e) =>
                handleAdditionalCommentsTableDimensionChange(
                  "rows",
                  e.target.value
                )
              }
              min="1"
              max="10"
              className="w-12 text-xs p-1 border rounded"
              title={t("auditTable.rows")}
              disabled={!sectionEnabled}
            />
            <span className="text-xs">x</span>
            <input
              type="number"
              value={additionalCommentsTableCols}
              onChange={(e) =>
                handleAdditionalCommentsTableDimensionChange(
                  "cols",
                  e.target.value
                )
              }
              min="1"
              max="10"
              className="w-12 text-xs p-1 border rounded"
              title={t("auditTable.cols")}
              disabled={!sectionEnabled}
            />
          </div>
        )}
        {showAdditionalCommentsTable && sectionEnabled ? (
          <AdditionalCommentsTableInput
            rows={additionalCommentsTableRows}
            cols={additionalCommentsTableCols}
            data={additionalCommentsTableData}
            onChange={setAdditionalCommentsTableData}
            sectionEnabled={sectionEnabled}
          />
        ) : (
          <textarea
            id={`additionalComments-${mainTitleForThisTab}`}
            value={additionalCommentsText}
            onChange={handleAdditionalCommentsTextChange}
            rows="4"
            maxLength={1000}
            className={`w-full p-2 text-sm border rounded ${
              !sectionEnabled
                ? "bg-gray-100 cursor-not-allowed"
                : "focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
            disabled={!sectionEnabled}
          />
        )}
        {!showAdditionalCommentsTable && (
          <div className="text-right text-xs text-gray-400 mt-0.5">
            {additionalCommentsText.length}/1000
          </div>
        )}
      </div>
      <div
        className={`grid md:grid-cols-3 gap-4 mx-4 sm:mx-6 my-6 ${
          !sectionEnabled ? "opacity-60" : ""
        }`}
      >
        <ScoreCard
          title={t("auditTable.maxScoreCardTitle")}
          value={maxScore}
          icon={<Award />}
          colorClass="bg-blue-500"
        />
        <ScoreCard
          title={t("auditTable.maxPossibleScoreCardTitle")}
          value={maxPossibleScore}
          icon={<TrendingUp />}
          colorClass="bg-yellow-500"
        />
        <ScoreCard
          title={t("auditTable.totalScoreCardTitle")}
          value={totalScoreAchieved}
          icon={<TrendingUp />}
          colorClass="bg-green-500"
        />
      </div>
    </div>
  );
};

export default QMSAudit;
