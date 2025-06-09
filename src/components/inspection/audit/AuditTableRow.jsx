// import { Check, Table as TableIcon, X as XIcon } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next"; // Still needed for UI elements like button titles
// import AuditImageUpload from "./AuditImageUpload";

// const ObservationTableInput = ({
//   rows,
//   cols,
//   data = [],
//   onChange,
//   sectionEnabled,
// }) => {
//   // Added sectionEnabled
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

// const AuditTableRow = ({
//   item,
//   index,
//   onUpdate,
//   sectionEnabled,
//   currentLang,
// }) => {
//   const { t } = useTranslation();
//   // State for user-interactive fields, initialized from item but can be changed
//   const [status, setStatus] = useState({
//     ok: item.ok,
//     toImprove: item.toImprove,
//     na: item.na,
//   });
//   const [observationData, setObservationData] = useState(
//     item.observationData || {
//       text: "",
//       isTable: false,
//       table: { rows: 2, cols: 2, data: [] },
//     }
//   );
//   const [images, setImages] = useState(item.images || []);
//   const [mustHaveToggle, setMustHaveToggle] = useState(item.mustHave); // User-toggled mustHave

//   // Effect to update local state if item prop changes (e.g., parent re-fetches or re-initializes)
//   useEffect(() => {
//     setStatus({ ok: item.ok, toImprove: item.toImprove, na: item.na });
//     setObservationData(
//       item.observationData || {
//         text: "",
//         isTable: false,
//         table: { rows: 2, cols: 2, data: [] },
//       }
//     );
//     setImages(item.images || []);
//     setMustHaveToggle(item.mustHave); // This will reflect user's override or db default
//   }, [item]);

//   const handleStatusClick = (statusField) => {
//     if (!sectionEnabled) return;
//     let newStatusLocal = { ok: false, toImprove: false, na: false };
//     newStatusLocal[statusField] = true;
//     setStatus(newStatusLocal);

//     let newScore = 0;
//     let newNaScore = 0;
//     const levelScore = parseInt(item.levelDisplay, 10) || 0; // Use levelDisplay for calculation

//     if (statusField === "ok") {
//       newScore = levelScore;
//     } else if (statusField === "na") {
//       newNaScore = levelScore;
//     }
//     onUpdate(index, {
//       ...newStatusLocal,
//       score: newScore,
//       naScore: newNaScore,
//     });
//   };

//   const handleMustHaveClick = () => {
//     // Allow toggling only if the default from DB is not 'mustHave: true'
//     // OR if section is enabled (standard check)
//     if (!sectionEnabled || item.mustHaveDefault === true) return;

//     const newMustHaveState = !mustHaveToggle;
//     setMustHaveToggle(newMustHaveState);
//     onUpdate(index, { mustHave: newMustHaveState });
//   };

//   const handleObservationChange = (e) => {
//     if (!sectionEnabled) return;
//     const text = e.target.value;
//     if (text.length <= 500) {
//       const newObservationData = {
//         ...observationData,
//         text: text,
//         isTable: false,
//       };
//       setObservationData(newObservationData);
//       onUpdate(index, { observationData: newObservationData });
//     }
//   };

//   const toggleObsTable = () => {
//     if (!sectionEnabled) return;
//     const newIsTable = !observationData.isTable;
//     const newObservationData = {
//       ...observationData,
//       isTable: newIsTable,
//       text: newIsTable && !observationData.text ? "" : observationData.text, // Keep text if switching back
//       table: newIsTable
//         ? observationData.table || { rows: 2, cols: 2, data: [] }
//         : null,
//     };
//     setObservationData(newObservationData);
//     onUpdate(index, { observationData: newObservationData });
//   };

//   const handleObsTableDimensionChange = (dim, value) => {
//     if (!sectionEnabled) return;
//     const numValue = Math.max(1, Math.min(10, parseInt(value, 10) || 1));
//     const newTableConfig = {
//       ...(observationData.table || { data: [] }), // preserve data if possible
//       rows: dim === "rows" ? numValue : observationData.table?.rows || 2,
//       cols: dim === "cols" ? numValue : observationData.table?.cols || 2,
//     };
//     // Adjust data array to new dimensions
//     const adjustedData = Array(newTableConfig.rows)
//       .fill(null)
//       .map((_, rIndex) =>
//         Array(newTableConfig.cols)
//           .fill(null)
//           .map(
//             (__, cIndex) =>
//               (newTableConfig.data[rIndex] &&
//                 newTableConfig.data[rIndex][cIndex]) ||
//               ""
//           )
//       );
//     newTableConfig.data = adjustedData;

//     const newObservationData = {
//       ...observationData,
//       isTable: true,
//       table: newTableConfig,
//     };
//     setObservationData(newObservationData);
//     onUpdate(index, { observationData: newObservationData });
//   };

//   const handleObsTableDataChange = (tableCellData) => {
//     if (!sectionEnabled) return;
//     const newObservationData = {
//       ...observationData,
//       table: { ...observationData.table, data: tableCellData },
//     };
//     setObservationData(newObservationData);
//     onUpdate(index, { observationData: newObservationData });
//   };

//   const handleImagesChange = (newImages) => {
//     if (!sectionEnabled) return;
//     setImages(newImages);
//     onUpdate(index, { images: newImages });
//   };

//   const getStatusCellStyle = (statusField) => {
//     if (!sectionEnabled) return "bg-gray-100 cursor-not-allowed";
//     if (status[statusField]) {
//       // Use local status state
//       if (statusField === "ok") return "bg-green-100 hover:bg-green-200";
//       if (statusField === "toImprove") return "bg-red-100 hover:bg-red-200";
//       if (statusField === "na") return "bg-gray-200 hover:bg-gray-300";
//     }
//     return "hover:bg-gray-50";
//   };

//   // Determine which text to display based on currentLang
//   const mainTopicDisplay =
//     item.mainTopicDisplay ||
//     (currentLang === "km"
//       ? item.mainTopicKhmer
//       : currentLang === "zh"
//       ? item.mainTopicChinese
//       : item.mainTopicEng);
//   const pointTitleDisplay =
//     item.pointTitleDisplay ||
//     (currentLang === "km"
//       ? item.pointTitleKhmer
//       : currentLang === "zh"
//       ? item.pointTitleChinese
//       : item.pointTitleEng);
//   const pointDescriptionDisplay =
//     item.pointDescriptionDisplay ||
//     (currentLang === "km"
//       ? item.pointDescriptionKhmer
//       : currentLang === "zh"
//       ? item.pointDescriptionChinese
//       : item.pointDescriptionEng);

//   return (
//     <tr className={`${!sectionEnabled ? "opacity-70" : ""}`}>
//       <td className="border p-1.5 align-top text-xs w-[15%]">
//         {mainTopicDisplay}
//       </td>
//       <td className="border p-1.5 align-top text-xs text-center w-[5%]">
//         {item.no}
//       </td>
//       <td className="border p-1.5 align-top text-xs w-[30%]">
//         <strong className="font-medium">{pointTitleDisplay}:</strong>{" "}
//         {pointDescriptionDisplay}
//       </td>

//       {["ok", "toImprove", "na"].map((statusKey) => (
//         <td
//           key={statusKey}
//           className={`border p-1.5 align-middle text-center cursor-pointer w-[5%] ${getStatusCellStyle(
//             statusKey
//           )}`}
//           onClick={() => handleStatusClick(statusKey)}
//         >
//           {status[statusKey] && (
//             <Check size={16} className="mx-auto text-gray-700" />
//           )}
//         </td>
//       ))}

//       <td className="border p-1.5 align-top text-xs w-[20%]">
//         <div className="flex items-center justify-end mb-1 gap-1">
//           <button
//             onClick={toggleObsTable}
//             title={t("auditTable.insertTable")}
//             className={`p-0.5 rounded ${
//               observationData.isTable
//                 ? "bg-indigo-100 text-indigo-600"
//                 : "hover:bg-gray-100"
//             } ${!sectionEnabled ? "cursor-not-allowed" : ""}`}
//             disabled={!sectionEnabled}
//           >
//             <TableIcon size={14} />
//           </button>
//           {observationData.isTable && (
//             <>
//               <input
//                 type="number"
//                 value={observationData.table?.rows || 2}
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
//                 value={observationData.table?.cols || 2}
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
//         {observationData.isTable ? (
//           <ObservationTableInput
//             rows={observationData.table?.rows || 2}
//             cols={observationData.table?.cols || 2}
//             data={observationData.table?.data || []}
//             onChange={handleObsTableDataChange}
//             sectionEnabled={sectionEnabled}
//           />
//         ) : (
//           <textarea
//             value={observationData.text}
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
//         {!observationData.isTable && (
//           <div className="text-right text-xs text-gray-400 mt-0.5">
//             {observationData.text?.length || 0}/500
//           </div>
//         )}
//       </td>

//       <td className="border p-1.5 align-top text-xs w-[10%]">
//         <AuditImageUpload
//           images={images}
//           onImagesChange={handleImagesChange}
//           requirementId={`${item.mainTitle}_${item.no}`}
//           maxImages={5}
//         />
//       </td>

//       <td className="border p-1.5 align-middle text-center text-xs w-[5%]">
//         {item.levelDisplay}
//       </td>
//       <td
//         className={`border p-1.5 align-middle text-center w-[5%]
//                     ${
//                       item.mustHaveDefault
//                         ? "bg-blue-100 cursor-not-allowed"
//                         : sectionEnabled
//                         ? "cursor-pointer hover:bg-blue-50"
//                         : "cursor-not-allowed"
//                     }
//                     ${
//                       mustHaveToggle && !item.mustHaveDefault
//                         ? "bg-blue-200"
//                         : ""
//                     }
//                   `}
//         onClick={handleMustHaveClick}
//       >
//         {(item.mustHaveDefault || mustHaveToggle) && (
//           <XIcon size={16} className="mx-auto text-gray-700" />
//         )}
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
// export default AuditTableRow; // Ensure ObservationTableInput is either in this file or imported if separate

// src/components/inspection/audit/AuditTableRow.jsx
import { Check, Table as TableIcon, X as XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // For UI elements only
import AuditImageUpload from "./AuditImageUpload";

const ObservationTableInput = ({
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

const AuditTableRow = ({
  item,
  index,
  onUpdate,
  sectionEnabled,
  currentLang,
}) => {
  const { t, i18n } = useTranslation(); // For UI button titles etc.

  console.log(
    `AuditTableRow [${index}] - PROPS RECEIVED: currentLang='${currentLang}'`
  ); // DEBUG LOG 1 (Modified)

  // Local state for user interactions, initialized from the item prop
  // These will persist unless the parent component forces a re-initialization of the whole 'item'
  const [status, setStatus] = useState({
    ok: item.ok,
    toImprove: item.toImprove,
    na: item.na,
  });
  const [observationData, setObservationData] = useState(item.observationData);
  const [images, setImages] = useState(item.images);
  const [mustHaveToggle, setMustHaveToggle] = useState(item.mustHave); // This is the user-interactive version

  // This effect synchronizes local state with the item prop WHEN THE ITEM PROP ITSELF CHANGES.
  // This is important if the parent `auditItems` array is entirely replaced (e.g., after saving to DB and re-fetching).
  // It ensures the row reflects the latest "source of truth" for its interactive state.
  useEffect(() => {
    setStatus({ ok: item.ok, toImprove: item.toImprove, na: item.na });
    setObservationData(item.observationData);
    setImages(item.images);
    setMustHaveToggle(item.mustHave); // User's toggle state, initialized from item.mustHave
  }, [
    item.ok,
    item.toImprove,
    item.na,
    item.observationData,
    item.images,
    item.mustHave,
  ]);

  const handleStatusClick = (statusField) => {
    if (!sectionEnabled) return;
    let newStatusLocal = { ok: false, toImprove: false, na: false };
    newStatusLocal[statusField] = true;
    setStatus(newStatusLocal);

    let newScore = 0;
    let newNaScore = 0;
    const levelScore = parseInt(item.staticData.levelValue, 10) || 0;

    if (statusField === "ok") newScore = levelScore;
    else if (statusField === "na") newNaScore = levelScore;

    onUpdate(index, {
      ...newStatusLocal,
      score: newScore,
      naScore: newNaScore,
    });
  };

  const handleMustHaveClick = () => {
    // User can only toggle if it's not a DB-defined "mustHave"
    if (!sectionEnabled || item.staticData.mustHave === true) return;
    const newMustHaveState = !mustHaveToggle;
    setMustHaveToggle(newMustHaveState);
    onUpdate(index, { mustHave: newMustHaveState }); // Update parent with the toggled state
  };

  const handleObservationChange = (e) => {
    if (!sectionEnabled) return;
    const text = e.target.value;
    if (text.length <= 500) {
      const newObservationData = {
        ...observationData,
        text: text,
        isTable: false,
      };
      setObservationData(newObservationData); // Update local state
      onUpdate(index, { observationData: newObservationData }); // Propagate up
    }
  };

  const toggleObsTable = () => {
    if (!sectionEnabled) return;
    const newIsTable = !observationData.isTable;
    const newObservationData = {
      ...observationData,
      isTable: newIsTable,
      text: newIsTable && !observationData.text ? "" : observationData.text,
      table: newIsTable
        ? observationData.table || { rows: 2, cols: 2, data: [] }
        : null,
    };
    setObservationData(newObservationData);
    onUpdate(index, { observationData: newObservationData });
  };

  const handleObsTableDimensionChange = (dim, value) => {
    if (!sectionEnabled) return;
    const numValue = Math.max(1, Math.min(10, parseInt(value, 10) || 1));
    const currentTableData = observationData.table?.data || [];
    const newTableConfig = {
      rows: dim === "rows" ? numValue : observationData.table?.rows || 2,
      cols: dim === "cols" ? numValue : observationData.table?.cols || 2,
      data: Array(dim === "rows" ? numValue : observationData.table?.rows || 2)
        .fill(null)
        .map((_, rIndex) =>
          Array(dim === "cols" ? numValue : observationData.table?.cols || 2)
            .fill(null)
            .map(
              (__, cIndex) =>
                (currentTableData[rIndex] &&
                  currentTableData[rIndex][cIndex]) ||
                ""
            )
        ),
    };
    const newObservationData = {
      ...observationData,
      isTable: true,
      table: newTableConfig,
    };
    setObservationData(newObservationData);
    onUpdate(index, { observationData: newObservationData });
  };

  const handleObsTableDataChange = (tableCellData) => {
    if (!sectionEnabled) return;
    const newObservationData = {
      ...observationData,
      table: { ...observationData.table, data: tableCellData },
    };
    setObservationData(newObservationData);
    onUpdate(index, { observationData: newObservationData });
  };

  const handleImagesChange = (newImages) => {
    if (!sectionEnabled) return;
    setImages(newImages); // Update local state
    onUpdate(index, { images: newImages }); // Propagate up
  };

  const getStatusCellStyle = (statusField) => {
    if (!sectionEnabled) return "bg-gray-100 cursor-not-allowed";
    if (status[statusField]) {
      if (statusField === "ok") return "bg-green-100 hover:bg-green-200";
      if (statusField === "toImprove") return "bg-red-100 hover:bg-red-200";
      if (statusField === "na") return "bg-gray-200 hover:bg-gray-300";
    }
    return "hover:bg-gray-50";
  };

  const staticItemData = item.staticData || {}; // Ensure staticItemData is an object
  const { no: itemNo, levelValue, mustHave: mustHaveFromDB } = staticItemData;

  const getDisplayText = (dataObject, fieldPrefix, lang) => {
    // Removed unused fallbackLangText param
    const effectiveLang =
      typeof lang === "string" && lang.trim() !== ""
        ? lang.toLowerCase()
        : "en";

    const khmerField = `${fieldPrefix}Khmer`;
    const chineseField = `${fieldPrefix}Chinese`;
    const engField = `${fieldPrefix}Eng`;

    console.log(
      // KEEP THIS LOG FOR NOW
      `AuditTableRow [${index}] - getDisplayText: lang='${lang}', effectiveLang='${effectiveLang}', prefix='${fieldPrefix}'\n` +
        `  Trying Khmer field: '${khmerField}', Value: '${dataObject[khmerField]}'\n` +
        `  Trying Chinese field: '${chineseField}', Value: '${dataObject[chineseField]}'\n` +
        `  Trying English field: '${engField}', Value: '${dataObject[engField]}'`
    );

    if (!dataObject) {
      return t("common.notAvailableShort", "N/A");
    }

    let textToDisplay;

    if (effectiveLang === "km") {
      textToDisplay = dataObject[khmerField];
    } else if (effectiveLang === "zh") {
      textToDisplay = dataObject[chineseField];
    } else {
      // 'en' or any other fallback
      textToDisplay = dataObject[engField];
    }

    // Explicit check: if the preferred language text is a non-empty string, use it.
    // Otherwise, fall back to English. If English is also missing, use the generic N/A.
    if (typeof textToDisplay === "string" && textToDisplay.trim() !== "") {
      console.log(
        `AuditTableRow [${index}] - Using PREFERRED text for ${fieldPrefix} (${effectiveLang}): '${textToDisplay}'`
      );
      return textToDisplay;
    } else {
      const fallbackToEng = dataObject[engField];
      if (typeof fallbackToEng === "string" && fallbackToEng.trim() !== "") {
        console.log(
          `AuditTableRow [${index}] - Using ENGLISH FALLBACK for ${fieldPrefix}: '${fallbackToEng}' (Preferred was '${textToDisplay}')`
        );
        return fallbackToEng;
      } else {
        console.log(
          `AuditTableRow [${index}] - Using N/A for ${fieldPrefix} (Both preferred and English missing)`
        );
        return t("common.notAvailableShort", "N/A");
      }
    }
  };

  // Calls to getDisplayText remain the same:
  const mainTopicDisplay = getDisplayText(
    staticItemData,
    "mainTopic",
    currentLang
  );
  const pointTitleDisplay = getDisplayText(
    staticItemData,
    "pointTitle",
    currentLang
  );
  const pointDescriptionDisplay = getDisplayText(
    staticItemData,
    "pointDescription",
    currentLang
  );

  //   // Destructure static data once for use in helper functions
  //   const staticItemData = item.staticData || {};
  //   const { no: itemNo, levelValue, mustHave: mustHaveFromDB } = staticItemData;

  //   // Helper function to get the display text for Main Topic
  //   const getMainTopicDisplay = () => {
  //     if (!staticItemData) return "N/A";
  //     switch (currentLang) {
  //       case "km":
  //         return staticItemData.mainTopicKhmer || staticItemData.mainTopicEng;
  //       case "zh":
  //         return staticItemData.mainTopicChinese || staticItemData.mainTopicEng;
  //       default:
  //         return staticItemData.mainTopicEng;
  //     }
  //   };

  //   // Helper function to get the display text for Point Title
  //   const getPointTitleDisplay = () => {
  //     if (!staticItemData) return "N/A";
  //     switch (i18n.language) {
  //       case "km":
  //         return staticItemData.pointTitleKhmer || staticItemData.pointTitleEng;
  //       case "zh":
  //         return staticItemData.pointTitleChinese || staticItemData.pointTitleEng;
  //       default:
  //         return staticItemData.pointTitleEng;
  //     }
  //   };

  //   // Helper function to get the display text for Point Description
  //   const getPointDescriptionDisplay = () => {
  //     if (!staticItemData) return "N/A";
  //     switch (i18n.language) {
  //       case "km":
  //         return (
  //           staticItemData.pointDescriptionKhmer ||
  //           staticItemData.pointDescriptionEng
  //         );
  //       case "zh":
  //         return (
  //           staticItemData.pointDescriptionChinese ||
  //           staticItemData.pointDescriptionEng
  //         );
  //       default:
  //         return staticItemData.pointDescriptionEng;
  //     }
  //   };

  // Select display text based on currentLang from item.staticData
  // This part re-evaluates on every render if currentLang changes, updating display text
  //   const {
  //     mainTopicEng,
  //     mainTopicKhmer,
  //     mainTopicChinese,
  //     pointTitleEng,
  //     pointTitleKhmer,
  //     pointTitleChinese,
  //     pointDescriptionEng,
  //     pointDescriptionKhmer,
  //     pointDescriptionChinese,
  //     no: itemNo, // from staticData
  //     levelValue, // from staticData
  //     mustHave: mustHaveFromDB, // from staticData, used to determine if toggle is allowed
  //   } = item.staticData || {}; // Destructure from staticData

  //   let mainTopicDisplay, pointTitleDisplay, pointDescriptionDisplay;

  //   switch (i18n.language) {
  //     case "km":
  //       mainTopicDisplay = mainTopicKhmer;
  //       pointTitleDisplay = pointTitleKhmer;
  //       pointDescriptionDisplay = pointDescriptionKhmer;
  //       break;
  //     case "zh":
  //       mainTopicDisplay = mainTopicChinese;
  //       pointTitleDisplay = pointTitleChinese;
  //       pointDescriptionDisplay = pointDescriptionChinese;
  //       break;
  //     default: // eng or fallback
  //       mainTopicDisplay = mainTopicEng;
  //       pointTitleDisplay = pointTitleEng;
  //       pointDescriptionDisplay = pointDescriptionEng;
  //   }

  //   const getIssueDisplayName = (issueItem) => {
  //     if (i18n.language === "kh") {
  //       return issueItem.defectKhmer || issueItem.defectEng;
  //     } else if (i18n.language === "zh") {
  //       return issueItem.defectChinese || issueItem.defectEng;
  //     } else {
  //       return issueItem.defectEng;
  //     }
  //   };

  return (
    <tr className={`${!sectionEnabled ? "opacity-70" : ""}`}>
      <td className="border p-1.5 align-top text-xs w-[15%]">
        {mainTopicDisplay}
      </td>
      <td className="border p-1.5 align-top text-xs text-center w-[5%]">
        {itemNo}
      </td>
      <td className="border p-1.5 align-top text-xs w-[30%]">
        <strong className="font-medium">{pointTitleDisplay}:</strong>{" "}
        {pointDescriptionDisplay}
      </td>

      {["ok", "toImprove", "na"].map((statusKey) => (
        <td
          key={statusKey}
          className={`border p-1.5 align-middle text-center cursor-pointer w-[5%] ${getStatusCellStyle(
            statusKey
          )}`}
          onClick={() => handleStatusClick(statusKey)}
        >
          {status[statusKey] && (
            <Check size={16} className="mx-auto text-gray-700" />
          )}
        </td>
      ))}

      <td className="border p-1.5 align-top text-xs w-[20%]">
        <div className="flex items-center justify-end mb-1 gap-1">
          <button
            onClick={toggleObsTable}
            title={t("auditTable.insertTable")}
            className={`p-0.5 rounded ${
              observationData.isTable
                ? "bg-indigo-100 text-indigo-600"
                : "hover:bg-gray-100"
            } ${!sectionEnabled ? "cursor-not-allowed" : ""}`}
            disabled={!sectionEnabled}
          >
            <TableIcon size={14} />
          </button>
          {observationData.isTable && (
            <>
              <input
                type="number"
                value={observationData.table?.rows || 2}
                onChange={(e) =>
                  handleObsTableDimensionChange("rows", e.target.value)
                }
                min="1"
                max="10"
                className={`w-10 text-xs p-0.5 border rounded ${
                  !sectionEnabled ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                disabled={!sectionEnabled}
                title={t("auditTable.rows")}
              />
              <span className="text-xs">x</span>
              <input
                type="number"
                value={observationData.table?.cols || 2}
                onChange={(e) =>
                  handleObsTableDimensionChange("cols", e.target.value)
                }
                min="1"
                max="10"
                className={`w-10 text-xs p-0.5 border rounded ${
                  !sectionEnabled ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                disabled={!sectionEnabled}
                title={t("auditTable.cols")}
              />
            </>
          )}
        </div>
        {observationData.isTable ? (
          <ObservationTableInput
            rows={observationData.table?.rows || 2}
            cols={observationData.table?.cols || 2}
            data={observationData.table?.data || []}
            onChange={handleObsTableDataChange}
            sectionEnabled={sectionEnabled}
          />
        ) : (
          <textarea
            value={observationData.text || ""}
            onChange={handleObservationChange}
            rows="3"
            maxLength={500}
            className={`w-full p-1 text-xs border rounded ${
              !sectionEnabled
                ? "bg-gray-100 cursor-not-allowed"
                : "focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
            }`}
            disabled={!sectionEnabled}
          />
        )}
        {!observationData.isTable && (
          <div className="text-right text-xs text-gray-400 mt-0.5">
            {observationData.text?.length || 0}/500
          </div>
        )}
      </td>

      <td className="border p-1.5 align-top text-xs w-[10%]">
        <AuditImageUpload
          images={images}
          onImagesChange={handleImagesChange}
          requirementId={`${item.staticData?.mainTopicEng}_${itemNo}`}
          maxImages={5}
        />
      </td>

      <td className="border p-1.5 align-middle text-center text-xs w-[5%]">
        {levelValue}
      </td>
      <td
        className={`border p-1.5 align-middle text-center w-[5%]
                    ${
                      mustHaveFromDB
                        ? "bg-blue-100 cursor-not-allowed"
                        : sectionEnabled
                        ? "cursor-pointer hover:bg-blue-50"
                        : "cursor-not-allowed"
                    }
                    ${mustHaveToggle && !mustHaveFromDB ? "bg-blue-200" : ""}
                  `}
        onClick={handleMustHaveClick}
      >
        {(mustHaveFromDB || mustHaveToggle) && (
          <XIcon size={16} className="mx-auto text-gray-700" />
        )}
      </td>
      <td className="border p-1.5 align-middle text-center text-xs w-[5%]">
        {item.score}
      </td>
      <td className="border p-1.5 align-middle text-center text-xs w-[5%]">
        {item.naScore}
      </td>
    </tr>
  );
};

export default AuditTableRow;

// // src/components/inspection/audit/AuditTableRow.jsx
// import { Check, Table as TableIcon, X as XIcon } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import AuditImageUpload from "./AuditImageUpload";

// const ObservationTableInput = ({
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

// const AuditTableRow = ({
//   item,
//   index,
//   onUpdate,
//   sectionEnabled,
//   currentLang,
// }) => {
//   const { t } = useTranslation();

//   const [status, setStatus] = useState({
//     ok: item.ok,
//     toImprove: item.toImprove,
//     na: item.na,
//   });
//   const [observationData, setObservationData] = useState(item.observationData);
//   const [images, setImages] = useState(item.images);
//   const [mustHaveToggle, setMustHaveToggle] = useState(item.mustHave);

//   useEffect(() => {
//     setStatus({ ok: item.ok, toImprove: item.toImprove, na: item.na });
//     setObservationData(item.observationData);
//     setImages(item.images);
//     setMustHaveToggle(item.mustHave);
//   }, [
//     item.ok,
//     item.toImprove,
//     item.na,
//     item.observationData,
//     item.images,
//     item.mustHave,
//   ]);

//   const handleStatusClick = (statusField) => {
//     if (!sectionEnabled) return;
//     let newStatusLocal = { ok: false, toImprove: false, na: false };
//     newStatusLocal[statusField] = true;
//     setStatus(newStatusLocal);

//     let newScore = 0;
//     let newNaScore = 0;
//     const levelScore = parseInt(item.staticData.levelValue, 10) || 0;

//     if (statusField === "ok") newScore = levelScore;
//     else if (statusField === "na") newNaScore = levelScore;

//     onUpdate(index, {
//       ...newStatusLocal,
//       score: newScore,
//       naScore: newNaScore,
//     });
//   };

//   const handleMustHaveClick = () => {
//     if (!sectionEnabled || item.staticData.mustHave === true) return;
//     const newMustHaveState = !mustHaveToggle;
//     setMustHaveToggle(newMustHaveState);
//     onUpdate(index, { mustHave: newMustHaveState });
//   };

//   const handleObservationChange = (e) => {
//     if (!sectionEnabled) return;
//     const text = e.target.value;
//     if (text.length <= 500) {
//       const newObservationData = {
//         ...observationData,
//         text: text,
//         isTable: false,
//       };
//       setObservationData(newObservationData);
//       onUpdate(index, { observationData: newObservationData });
//     }
//   };

//   const toggleObsTable = () => {
//     if (!sectionEnabled) return;
//     const newIsTable = !observationData.isTable;
//     const newObservationData = {
//       ...observationData,
//       isTable: newIsTable,
//       text: newIsTable && !observationData.text ? "" : observationData.text,
//       table: newIsTable
//         ? observationData.table || { rows: 2, cols: 2, data: [] }
//         : null,
//     };
//     setObservationData(newObservationData);
//     onUpdate(index, { observationData: newObservationData });
//   };

//   const handleObsTableDimensionChange = (dim, value) => {
//     if (!sectionEnabled) return;
//     const numValue = Math.max(1, Math.min(10, parseInt(value, 10) || 1));
//     const currentTableData = observationData.table?.data || [];
//     const newTableConfig = {
//       rows: dim === "rows" ? numValue : observationData.table?.rows || 2,
//       cols: dim === "cols" ? numValue : observationData.table?.cols || 2,
//       data: Array(dim === "rows" ? numValue : observationData.table?.rows || 2)
//         .fill(null)
//         .map((_, rIndex) =>
//           Array(dim === "cols" ? numValue : observationData.table?.cols || 2)
//             .fill(null)
//             .map(
//               (__, cIndex) =>
//                 (currentTableData[rIndex] &&
//                   currentTableData[rIndex][cIndex]) ||
//                 ""
//             )
//         ),
//     };
//     const newObservationData = {
//       ...observationData,
//       isTable: true,
//       table: newTableConfig,
//     };
//     setObservationData(newObservationData);
//     onUpdate(index, { observationData: newObservationData });
//   };

//   const handleObsTableDataChange = (tableCellData) => {
//     if (!sectionEnabled) return;
//     const newObservationData = {
//       ...observationData,
//       table: { ...observationData.table, data: tableCellData },
//     };
//     setObservationData(newObservationData);
//     onUpdate(index, { observationData: newObservationData });
//   };

//   const handleImagesChange = (newImages) => {
//     if (!sectionEnabled) return;
//     setImages(newImages);
//     onUpdate(index, { images: newImages });
//   };

//   const getStatusCellStyle = (statusField) => {
//     if (!sectionEnabled) return "bg-gray-100 cursor-not-allowed";
//     if (status[statusField]) {
//       if (statusField === "ok") return "bg-green-100 hover:bg-green-200";
//       if (statusField === "toImprove") return "bg-red-100 hover:bg-red-200";
//       if (statusField === "na") return "bg-gray-200 hover:bg-gray-300";
//     }
//     return "hover:bg-gray-50";
//   };

//   const {
//     mainTopicEng,
//     mainTopicKhmer,
//     mainTopicChinese,
//     pointTitleEng,
//     pointTitleKhmer,
//     pointTitleChinese,
//     pointDescriptionEng,
//     pointDescriptionKhmer,
//     pointDescriptionChinese,
//     no: itemNo,
//     levelValue,
//     mustHave: mustHaveFromDB,
//   } = item.staticData || {};

//   let mainTopicDisplay = mainTopicEng;
//   let pointTitleDisplay = pointTitleEng;
//   let pointDescriptionDisplay = pointDescriptionEng;

//   if (currentLang === "km") {
//     mainTopicDisplay = mainTopicKhmer || mainTopicEng;
//     pointTitleDisplay = pointTitleKhmer || pointTitleEng;
//     pointDescriptionDisplay = pointDescriptionKhmer || pointDescriptionEng;
//   } else if (currentLang === "zh") {
//     mainTopicDisplay = mainTopicChinese || mainTopicEng;
//     pointTitleDisplay = pointTitleChinese || pointTitleEng;
//     pointDescriptionDisplay = pointDescriptionChinese || pointDescriptionEng;
//   }

//   return (
//     <tr className={`${!sectionEnabled ? "opacity-70" : ""}`}>
//       <td className="border p-1.5 align-top text-xs w-[15%]">
//         {mainTopicDisplay}
//       </td>
//       <td className="border p-1.5 align-top text-xs text-center w-[5%]">
//         {itemNo}
//       </td>
//       <td className="border p-1.5 align-top text-xs w-[30%]">
//         <strong className="font-medium">{pointTitleDisplay}:</strong>{" "}
//         {pointDescriptionDisplay}
//       </td>

//       {["ok", "toImprove", "na"].map((statusKey) => (
//         <td
//           key={statusKey}
//           className={`border p-1.5 align-middle text-center cursor-pointer w-[5%] ${getStatusCellStyle(
//             statusKey
//           )}`}
//           onClick={() => handleStatusClick(statusKey)}
//         >
//           {status[statusKey] && (
//             <Check size={16} className="mx-auto text-gray-700" />
//           )}
//         </td>
//       ))}

//       <td className="border p-1.5 align-top text-xs w-[20%]">
//         <div className="flex items-center justify-end mb-1 gap-1">
//           <button
//             onClick={toggleObsTable}
//             title={t("auditTable.insertTable")}
//             className={`p-0.5 rounded ${
//               observationData.isTable
//                 ? "bg-indigo-100 text-indigo-600"
//                 : "hover:bg-gray-100"
//             } ${!sectionEnabled ? "cursor-not-allowed" : ""}`}
//             disabled={!sectionEnabled}
//           >
//             <TableIcon size={14} />
//           </button>
//           {observationData.isTable && (
//             <>
//               <input
//                 type="number"
//                 value={observationData.table?.rows || 2}
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
//                 value={observationData.table?.cols || 2}
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
//         {observationData.isTable ? (
//           <ObservationTableInput
//             rows={observationData.table?.rows || 2}
//             cols={observationData.table?.cols || 2}
//             data={observationData.table?.data || []}
//             onChange={handleObsTableDataChange}
//             sectionEnabled={sectionEnabled}
//           />
//         ) : (
//           <textarea
//             value={observationData.text || ""}
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
//         {!observationData.isTable && (
//           <div className="text-right text-xs text-gray-400 mt-0.5">
//             {observationData.text?.length || 0}/500
//           </div>
//         )}
//       </td>

//       <td className="border p-1.5 align-top text-xs w-[10%]">
//         <AuditImageUpload
//           images={images}
//           onImagesChange={handleImagesChange}
//           requirementId={`${item.staticData?.mainTopicEng}_${itemNo}`}
//           maxImages={5}
//         />
//       </td>

//       <td className="border p-1.5 align-middle text-center text-xs w-[5%]">
//         {levelValue}
//       </td>
//       <td
//         className={`border p-1.5 align-middle text-center w-[5%]
//                     ${
//                       mustHaveFromDB
//                         ? "bg-blue-100 cursor-not-allowed"
//                         : sectionEnabled
//                         ? "cursor-pointer hover:bg-blue-50"
//                         : "cursor-not-allowed"
//                     }
//                     ${mustHaveToggle && !mustHaveFromDB ? "bg-blue-200" : ""}
//                   `}
//         onClick={handleMustHaveClick}
//       >
//         {(mustHaveFromDB || mustHaveToggle) && (
//           <XIcon size={16} className="mx-auto text-gray-700" />
//         )}
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

// export default AuditTableRow;

// import { Check, Table as TableIcon, X as XIcon } from "lucide-react"; // Make sure XIcon is imported if used like this
// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import AuditImageUpload from "./AuditImageUpload";

// const ObservationTableInput = ({
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

// const AuditTableRow = ({
//   item,
//   index,
//   onUpdate,
//   sectionEnabled,
//   currentLang,
// }) => {
//   const { t } = useTranslation();

//   const [status, setStatus] = useState({
//     ok: item.ok,
//     toImprove: item.toImprove,
//     na: item.na,
//   });
//   const [observationData, setObservationData] = useState(item.observationData);
//   const [images, setImages] = useState(item.images);
//   const [mustHaveToggle, setMustHaveToggle] = useState(item.mustHave);

//   useEffect(() => {
//     setStatus({ ok: item.ok, toImprove: item.toImprove, na: item.na });
//     setObservationData(item.observationData);
//     setImages(item.images);
//     setMustHaveToggle(item.mustHave);
//   }, [
//     item.ok,
//     item.toImprove,
//     item.na,
//     item.observationData,
//     item.images,
//     item.mustHave,
//   ]);

//   const handleStatusClick = (statusField) => {
//     if (!sectionEnabled) return;
//     let newStatusLocal = { ok: false, toImprove: false, na: false };
//     newStatusLocal[statusField] = true;
//     setStatus(newStatusLocal);

//     let newScore = 0;
//     let newNaScore = 0;
//     const levelScore = parseInt(item.staticData?.levelValue, 10) || 0;

//     if (statusField === "ok") newScore = levelScore;
//     else if (statusField === "na") newNaScore = levelScore;

//     onUpdate(index, {
//       ...newStatusLocal,
//       score: newScore,
//       naScore: newNaScore,
//     });
//   };

//   const handleMustHaveClick = () => {
//     if (!sectionEnabled || item.staticData?.mustHave === true) return;
//     const newMustHaveState = !mustHaveToggle;
//     setMustHaveToggle(newMustHaveState);
//     onUpdate(index, { mustHave: newMustHaveState });
//   };

//   const handleObservationChange = (e) => {
//     if (!sectionEnabled) return;
//     const text = e.target.value;
//     if (text.length <= 500) {
//       const newObservationData = {
//         ...observationData,
//         text: text,
//         isTable: false,
//       };
//       setObservationData(newObservationData);
//       onUpdate(index, { observationData: newObservationData });
//     }
//   };

//   const toggleObsTable = () => {
//     if (!sectionEnabled) return;
//     const newIsTable = !observationData.isTable;
//     const newObservationData = {
//       ...observationData,
//       isTable: newIsTable,
//       text: newIsTable && !observationData.text ? "" : observationData.text,
//       table: newIsTable
//         ? observationData.table || { rows: 2, cols: 2, data: [] }
//         : { rows: 2, cols: 2, data: [] }, // Keep table structure but can be empty
//     };
//     if (!newIsTable) newObservationData.table = { rows: 2, cols: 2, data: [] }; // Clear table data if switching to text

//     setObservationData(newObservationData);
//     onUpdate(index, { observationData: newObservationData });
//   };

//   const handleObsTableDimensionChange = (dim, value) => {
//     if (!sectionEnabled) return;
//     const numValue = Math.max(1, Math.min(10, parseInt(value, 10) || 1));
//     const currentTableData = observationData.table?.data || [];
//     const newTableConfig = {
//       rows: dim === "rows" ? numValue : observationData.table?.rows || 2,
//       cols: dim === "cols" ? numValue : observationData.table?.cols || 2,
//       data: Array(dim === "rows" ? numValue : observationData.table?.rows || 2)
//         .fill(null)
//         .map((_, rIndex) =>
//           Array(dim === "cols" ? numValue : observationData.table?.cols || 2)
//             .fill(null)
//             .map(
//               (__, cIndex) =>
//                 (currentTableData[rIndex] &&
//                   currentTableData[rIndex][cIndex]) ||
//                 ""
//             )
//         ),
//     };
//     const newObservationData = {
//       ...observationData,
//       isTable: true,
//       table: newTableConfig,
//     };
//     setObservationData(newObservationData);
//     onUpdate(index, { observationData: newObservationData });
//   };

//   const handleObsTableDataChange = (tableCellData) => {
//     if (!sectionEnabled) return;
//     const newObservationData = {
//       ...observationData,
//       table: { ...observationData.table, data: tableCellData },
//     };
//     setObservationData(newObservationData);
//     onUpdate(index, { observationData: newObservationData });
//   };

//   const handleImagesChange = (newImages) => {
//     if (!sectionEnabled) return;
//     setImages(newImages);
//     onUpdate(index, { images: newImages });
//   };

//   const getStatusCellStyle = (statusField) => {
//     if (!sectionEnabled) return "bg-gray-100 cursor-not-allowed";
//     if (status[statusField]) {
//       if (statusField === "ok") return "bg-green-100 hover:bg-green-200";
//       if (statusField === "toImprove") return "bg-red-100 hover:bg-red-200";
//       if (statusField === "na") return "bg-gray-200 hover:bg-gray-300";
//     }
//     return "hover:bg-gray-50";
//   };

//   // Ensure item.staticData exists and provide fallbacks
//   const staticData = item.staticData || {};
//   const { no: itemNo, levelValue, mustHave: mustHaveFromDB } = staticData;

//   // Determine display text based on currentLang, with robust fallbacks
//   let mainTopicDisplay = staticData.mainTopicEng || "";
//   let pointTitleDisplay = staticData.pointTitleEng || "";
//   let pointDescriptionDisplay = staticData.pointDescriptionEng || "";

//   if (currentLang && currentLang.startsWith("km")) {
//     mainTopicDisplay =
//       staticData.mainTopicKhmer || staticData.mainTopicEng || "";
//     pointTitleDisplay =
//       staticData.pointTitleKhmer || staticData.pointTitleEng || "";
//     pointDescriptionDisplay =
//       staticData.pointDescriptionKhmer || staticData.pointDescriptionEng || "";
//   } else if (currentLang && currentLang.startsWith("zh")) {
//     mainTopicDisplay =
//       staticData.mainTopicChinese || staticData.mainTopicEng || "";
//     pointTitleDisplay =
//       staticData.pointTitleChinese || staticData.pointTitleEng || "";
//     pointDescriptionDisplay =
//       staticData.pointDescriptionChinese ||
//       staticData.pointDescriptionEng ||
//       "";
//   }

//   return (
//     <tr className={`${!sectionEnabled ? "opacity-70" : ""}`}>
//       <td className="border p-1.5 align-top text-xs w-[15%]">
//         {mainTopicDisplay}
//       </td>
//       <td className="border p-1.5 align-top text-xs text-center w-[5%]">
//         {itemNo}
//       </td>
//       <td className="border p-1.5 align-top text-xs w-[30%]">
//         <strong className="font-medium">{pointTitleDisplay}:</strong>{" "}
//         {pointDescriptionDisplay}
//       </td>
//       {["ok", "toImprove", "na"].map((statusKey) => (
//         <td
//           key={statusKey}
//           className={`border p-1.5 align-middle text-center cursor-pointer w-[5%] ${getStatusCellStyle(
//             statusKey
//           )}`}
//           onClick={() => handleStatusClick(statusKey)}
//         >
//           {status[statusKey] && (
//             <Check size={16} className="mx-auto text-gray-700" />
//           )}
//         </td>
//       ))}
//       <td className="border p-1.5 align-top text-xs w-[20%]">
//         <div className="flex items-center justify-end mb-1 gap-1">
//           <button
//             onClick={toggleObsTable}
//             title={t("auditTable.insertTable")}
//             className={`p-0.5 rounded ${
//               observationData.isTable
//                 ? "bg-indigo-100 text-indigo-600"
//                 : "hover:bg-gray-100"
//             } ${!sectionEnabled ? "cursor-not-allowed" : ""}`}
//             disabled={!sectionEnabled}
//           >
//             <TableIcon size={14} />
//           </button>
//           {observationData.isTable && (
//             <>
//               <input
//                 type="number"
//                 value={observationData.table?.rows || 2}
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
//                 value={observationData.table?.cols || 2}
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
//         {observationData.isTable ? (
//           <ObservationTableInput
//             rows={observationData.table?.rows || 2}
//             cols={observationData.table?.cols || 2}
//             data={observationData.table?.data || []}
//             onChange={handleObsTableDataChange}
//             sectionEnabled={sectionEnabled}
//           />
//         ) : (
//           <textarea
//             value={observationData.text || ""}
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
//         {!observationData.isTable && (
//           <div className="text-right text-xs text-gray-400 mt-0.5">
//             {observationData.text?.length || 0}/500
//           </div>
//         )}
//       </td>
//       <td className="border p-1.5 align-top text-xs w-[10%]">
//         <AuditImageUpload
//           images={images}
//           onImagesChange={handleImagesChange}
//           requirementId={`${staticData?.mainTopicEng}_${itemNo}`}
//           maxImages={5}
//         />
//       </td>
//       <td className="border p-1.5 align-middle text-center text-xs w-[5%]">
//         {levelValue}
//       </td>
//       <td
//         className={`border p-1.5 align-middle text-center w-[5%]
//                     ${
//                       mustHaveFromDB
//                         ? "bg-blue-100 cursor-not-allowed"
//                         : sectionEnabled
//                         ? "cursor-pointer hover:bg-blue-50"
//                         : "cursor-not-allowed"
//                     }
//                     ${mustHaveToggle && !mustHaveFromDB ? "bg-blue-200" : ""}
//                   `}
//         onClick={handleMustHaveClick}
//       >
//         {(mustHaveFromDB || mustHaveToggle) && (
//           <XIcon size={16} className="mx-auto text-gray-700" />
//         )}
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

// export default AuditTableRow;

// import { Check, Table as TableIcon, X as XIcon } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import AuditImageUpload from "./AuditImageUpload";

// const ObservationTableInput = ({
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

// const AuditTableRow = ({
//   item,
//   index,
//   onUpdate,
//   sectionEnabled,
//   currentLang,
// }) => {
//   const { t, i18n } = useTranslation();

//   const [status, setStatus] = useState({
//     ok: item.ok,
//     toImprove: item.toImprove,
//     na: item.na,
//   });
//   const [observationData, setObservationData] = useState(item.observationData);
//   const [images, setImages] = useState(item.images);
//   const [mustHaveToggle, setMustHaveToggle] = useState(item.mustHave);

//   useEffect(() => {
//     setStatus({ ok: item.ok, toImprove: item.toImprove, na: item.na });
//     setObservationData(item.observationData);
//     setImages(item.images);
//     setMustHaveToggle(item.mustHave);
//   }, [
//     item.ok,
//     item.toImprove,
//     item.na,
//     item.observationData,
//     item.images,
//     item.mustHave,
//   ]);

//   const handleStatusClick = (statusField) => {
//     if (!sectionEnabled) return;
//     let newStatusLocal = { ok: false, toImprove: false, na: false };
//     newStatusLocal[statusField] = true;
//     setStatus(newStatusLocal);

//     let newScore = 0;
//     let newNaScore = 0;
//     const levelScore = parseInt(item.staticData.levelValue, 10) || 0;

//     if (statusField === "ok") newScore = levelScore;
//     else if (statusField === "na") newNaScore = levelScore;

//     onUpdate(index, {
//       ...newStatusLocal,
//       score: newScore,
//       naScore: newNaScore,
//     });
//   };

//   const handleMustHaveClick = () => {
//     if (!sectionEnabled || item.staticData.mustHave === true) return;
//     const newMustHaveState = !mustHaveToggle;
//     setMustHaveToggle(newMustHaveState);
//     onUpdate(index, { mustHave: newMustHaveState });
//   };

//   const handleObservationChange = (e) => {
//     if (!sectionEnabled) return;
//     const text = e.target.value;
//     if (text.length <= 500) {
//       const newObservationData = {
//         ...observationData,
//         text: text,
//         isTable: false,
//       };
//       setObservationData(newObservationData);
//       onUpdate(index, { observationData: newObservationData });
//     }
//   };

//   const toggleObsTable = () => {
//     if (!sectionEnabled) return;
//     const newIsTable = !observationData.isTable;
//     const newObservationData = {
//       ...observationData,
//       isTable: newIsTable,
//       text: newIsTable && !observationData.text ? "" : observationData.text,
//       table: newIsTable
//         ? observationData.table || { rows: 2, cols: 2, data: [] }
//         : null,
//     };
//     setObservationData(newObservationData);
//     onUpdate(index, { observationData: newObservationData });
//   };

//   const handleObsTableDimensionChange = (dim, value) => {
//     if (!sectionEnabled) return;
//     const numValue = Math.max(1, Math.min(10, parseInt(value, 10) || 1));
//     const currentTableData = observationData.table?.data || [];
//     const newTableConfig = {
//       rows: dim === "rows" ? numValue : observationData.table?.rows || 2,
//       cols: dim === "cols" ? numValue : observationData.table?.cols || 2,
//       data: Array(dim === "rows" ? numValue : observationData.table?.rows || 2)
//         .fill(null)
//         .map((_, rIndex) =>
//           Array(dim === "cols" ? numValue : observationData.table?.cols || 2)
//             .fill(null)
//             .map(
//               (__, cIndex) =>
//                 (currentTableData[rIndex] &&
//                   currentTableData[rIndex][cIndex]) ||
//                 ""
//             )
//         ),
//     };
//     const newObservationData = {
//       ...observationData,
//       isTable: true,
//       table: newTableConfig,
//     };
//     setObservationData(newObservationData);
//     onUpdate(index, { observationData: newObservationData });
//   };

//   const handleObsTableDataChange = (tableCellData) => {
//     if (!sectionEnabled) return;
//     const newObservationData = {
//       ...observationData,
//       table: { ...observationData.table, data: tableCellData },
//     };
//     setObservationData(newObservationData);
//     onUpdate(index, { observationData: newObservationData });
//   };

//   const handleImagesChange = (newImages) => {
//     if (!sectionEnabled) return;
//     setImages(newImages);
//     onUpdate(index, { images: newImages });
//   };

//   const getStatusCellStyle = (statusField) => {
//     if (!sectionEnabled) return "bg-gray-100 cursor-not-allowed";
//     if (status[statusField]) {
//       if (statusField === "ok") return "bg-green-100 hover:bg-green-200";
//       if (statusField === "toImprove") return "bg-red-100 hover:bg-red-200";
//       if (statusField === "na") return "bg-gray-200 hover:bg-gray-300";
//     }
//     return "hover:bg-gray-50";
//   };

//   const {
//     mainTopicEng,
//     mainTopicKhmer,
//     mainTopicChinese,
//     pointTitleEng,
//     pointTitleKhmer,
//     pointTitleChinese,
//     pointDescriptionEng,
//     pointDescriptionKhmer,
//     pointDescriptionChinese,
//     no: itemNo,
//     levelValue,
//     mustHave: mustHaveFromDB,
//   } = item.staticData || {};

//   // FIX: Correct language switching logic
//   let mainTopicDisplay, pointTitleDisplay, pointDescriptionDisplay;

//   if (i18n.language === "km") {
//     // Khmer language
//     mainTopicDisplay =
//       mainTopicKhmer && mainTopicKhmer.trim() ? mainTopicKhmer : mainTopicEng;
//     pointTitleDisplay =
//       pointTitleKhmer && pointTitleKhmer.trim()
//         ? pointTitleKhmer
//         : pointTitleEng;
//     pointDescriptionDisplay =
//       pointDescriptionKhmer && pointDescriptionKhmer.trim()
//         ? pointDescriptionKhmer
//         : pointDescriptionEng;
//   } else if (i18n.language === "zh") {
//     // Chinese language
//     mainTopicDisplay =
//       mainTopicChinese && mainTopicChinese.trim()
//         ? mainTopicChinese
//         : mainTopicEng;
//     pointTitleDisplay =
//       pointTitleChinese && pointTitleChinese.trim()
//         ? pointTitleChinese
//         : pointTitleEng;
//     pointDescriptionDisplay =
//       pointDescriptionChinese && pointDescriptionChinese.trim()
//         ? pointDescriptionChinese
//         : pointDescriptionEng;
//   } else {
//     // Default to English
//     mainTopicDisplay = mainTopicEng;
//     pointTitleDisplay = pointTitleEng;
//     pointDescriptionDisplay = pointDescriptionEng;
//   }

//   return (
//     <tr className={`${!sectionEnabled ? "opacity-70" : ""}`}>
//       <td className="border p-1.5 align-top text-xs w-[15%]">
//         {mainTopicDisplay}
//       </td>
//       <td className="border p-1.5 align-top text-xs text-center w-[5%]">
//         {itemNo}
//       </td>
//       <td className="border p-1.5 align-top text-xs w-[30%]">
//         <strong className="font-medium">{pointTitleDisplay}:</strong>{" "}
//         {pointDescriptionDisplay}
//       </td>
//       {["ok", "toImprove", "na"].map((statusKey) => (
//         <td
//           key={statusKey}
//           className={`border p-1.5 align-middle text-center cursor-pointer w-[5%] ${getStatusCellStyle(
//             statusKey
//           )}`}
//           onClick={() => handleStatusClick(statusKey)}
//         >
//           {status[statusKey] && (
//             <Check size={16} className="mx-auto text-gray-700" />
//           )}
//         </td>
//       ))}
//       <td className="border p-1.5 align-top text-xs w-[20%]">
//         <div className="flex items-center justify-end mb-1 gap-1">
//           <button
//             onClick={toggleObsTable}
//             title={t("auditTable.insertTable")}
//             className={`p-0.5 rounded ${
//               observationData.isTable
//                 ? "bg-indigo-100 text-indigo-600"
//                 : "hover:bg-gray-100"
//             } ${!sectionEnabled ? "cursor-not-allowed" : ""}`}
//             disabled={!sectionEnabled}
//           >
//             <TableIcon size={14} />
//           </button>
//           {observationData.isTable && (
//             <>
//               <input
//                 type="number"
//                 value={observationData.table?.rows || 2}
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
//                 value={observationData.table?.cols || 2}
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
//         {observationData.isTable ? (
//           <ObservationTableInput
//             rows={observationData.table?.rows || 2}
//             cols={observationData.table?.cols || 2}
//             data={observationData.table?.data || []}
//             onChange={handleObsTableDataChange}
//             sectionEnabled={sectionEnabled}
//           />
//         ) : (
//           <textarea
//             value={observationData.text || ""}
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
//         {!observationData.isTable && (
//           <div className="text-right text-xs text-gray-400 mt-0.5">
//             {observationData.text?.length || 0}/500
//           </div>
//         )}
//       </td>
//       <td className="border p-1.5 align-top text-xs w-[10%]">
//         <AuditImageUpload
//           images={images}
//           onImagesChange={handleImagesChange}
//           requirementId={`${item.staticData?.mainTopicEng}_${itemNo}`}
//           maxImages={5}
//         />
//       </td>
//       <td className="border p-1.5 align-middle text-center text-xs w-[5%]">
//         {levelValue}
//       </td>
//       <td
//         className={`border p-1.5 align-middle text-center w-[5%] ${
//           mustHaveFromDB
//             ? "bg-blue-100 cursor-not-allowed"
//             : sectionEnabled
//             ? "cursor-pointer hover:bg-blue-50"
//             : "cursor-not-allowed"
//         } ${mustHaveToggle && !mustHaveFromDB ? "bg-blue-200" : ""}`}
//         onClick={handleMustHaveClick}
//       >
//         {(mustHaveFromDB || mustHaveToggle) && (
//           <XIcon size={16} className="mx-auto text-gray-700" />
//         )}
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

// export default AuditTableRow;
