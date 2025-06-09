import React, { useState } from "react";
import { XCircle } from "lucide-react";

// Placeholder for defect categorization logic - Customize this with your actual rules
const categorizeDefect = (defectName) => {
  if (!defectName) {
    return {
      category: "Unknown",
      color: "bg-gray-100 text-gray-800",
      statusTextColor: "text-gray-500",
      statusDisplayClasses:
        "bg-gray-400 text-white px-1.5 py-0.5 rounded-md text-xs font-medium",
      symbol: "❓"
    };
  }

  const lowerDefectName = defectName.toLowerCase();

  // Prioritize Critical
  if (
    lowerDefectName.includes("critical") ||
    lowerDefectName.includes("safety") ||
    lowerDefectName.includes("hole")
  ) {
    return {
      category: "Critical",
      color: "bg-red-200 text-red-800",
      statusTextColor: "text-red-700 font-semibold",
      statusDisplayClasses:
        "bg-red-700 text-white px-1.5 py-0.5 rounded-md text-xs font-medium",
      symbol: "❗"
    };
  }
  // Then Major
  if (
    lowerDefectName.includes("major") ||
    lowerDefectName.includes("broken") ||
    lowerDefectName.includes("open") ||
    lowerDefectName.includes("mismatched") ||
    lowerDefectName.includes("skip") ||
    lowerDefectName.includes("unravel")
  ) {
    return {
      category: "Major",
      color: "bg-red-200 text-red-800",
      statusTextColor: "text-red-500 font-semibold",
      statusDisplayClasses:
        "bg-red-500 text-white px-1.5 py-0.5 rounded-md text-xs font-medium",
      symbol: "⚠️"
    };
  }
  // Then Minor
  if (
    lowerDefectName.includes("minor") ||
    lowerDefectName.includes("dirty") ||
    lowerDefectName.includes("uneven") ||
    lowerDefectName.includes("puckering") ||
    lowerDefectName.includes("stain") ||
    lowerDefectName.includes("crease")
  ) {
    return {
      category: "Minor",
      color: "bg-yellow-200 text-yellow-800",
      statusTextColor: "text-yellow-600 font-semibold",
      statusDisplayClasses:
        "bg-yellow-500 text-black px-1.5 py-0.5 rounded-md text-xs font-medium",
      symbol: "🟡"
    };
  }
  // Default if no keywords match
  return {
    category: "Minor",
    color: "bg-yellow-200 text-yellow-800",
    statusTextColor: "text-yellow-600 font-semibold",
    statusDisplayClasses:
      "bg-yellow-500 text-black px-1.5 py-0.5 rounded-md text-xs font-medium",
    symbol: "🟡"
  };
};

const getOverallRovingStatusColor = (status) => {
  if (!status) return "bg-gray-100 text-gray-800";
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "pass") {
    return "bg-green-100 text-green-700";
  }
  if (
    lowerStatus === "reject-critical" ||
    lowerStatus === "reject-major-m" ||
    lowerStatus === "reject-minor-m"
  ) {
    return "bg-red-100 text-red-700";
  }
  if (
    lowerStatus === "reject" ||
    lowerStatus === "reject-minor-s" ||
    lowerStatus === "reject-major-s"
  ) {
    return "bg-yellow-100 text-yellow-700";
  }
  return "bg-gray-100 text-gray-800";
};

const REPETITION_KEYS_FOR_OPERATOR_TABLE = [
  "1st Inspection",
  "2nd Inspection",
  "3rd Inspection",
  "4th Inspection",
  "5th Inspection"
];

const RovingReportDetailView = ({
  reportDetail,
  onClose,
  calculateGroupMetrics,
  filters
}) => {
  const [showSpiColumn, setShowSpiColumn] = useState(false);
  const [showMeasurementColumn, setShowMeasurementColumn] = useState(false);
  const [showDefectStatusColumn, setShowDefectStatusColumn] = useState(false);

  if (!reportDetail) return null;

  // Extract unique inspectors from repetitions for the main title
  const uniqueInspectors = Array.from(
    new Set(
      (reportDetail.inspection_rep || [])
        .filter((rep) => rep && rep.emp_id && rep.eng_name)
        .map((rep) => `${rep.eng_name} (${rep.emp_id})`)
    )
  ).join(", ");

  const inspectorDisplay = uniqueInspectors
    ? ` (Inspector(s): ${uniqueInspectors})`
    : "";
  // Apply filters to inspection_rep entries
  const repetitionsToDisplay = (reportDetail.inspection_rep || []).filter(
    (repEntry) => {
      if (!repEntry) return false;
      return !(filters.qcId && repEntry.emp_id !== filters.qcId);
    }
  );

  // Helper to filter inlineData within a repetition
  const getFilteredInlineData = (inlineDataArray) => {
    if (!Array.isArray(inlineDataArray)) return [];
    return inlineDataArray.filter((item) => {
      if (!item) return false;
      return !(filters.operation && item.tg_no !== filters.operation);
    });
  };

  // Step 1: Prepare data for all repetitions
  const processedRepetitions = repetitionsToDisplay.map((repEntry, repIdx) => {
    const currentRepFilteredInlineData = getFilteredInlineData(
      repEntry.inlineData
    );
    const repEntryForMetrics = {
      ...repEntry,
      inlineData: currentRepFilteredInlineData
    };
    const repMetrics = calculateGroupMetrics(repEntryForMetrics);

    let criticalDefectsCount = 0;
    let majorDefectsCount = 0;
    let minorDefectsCount = 0;

    if (
      currentRepFilteredInlineData &&
      Array.isArray(currentRepFilteredInlineData)
    ) {
      currentRepFilteredInlineData.forEach((entry) => {
        if (entry.rejectGarments && Array.isArray(entry.rejectGarments)) {
          entry.rejectGarments.forEach((rg) => {
            if (rg.garments && Array.isArray(rg.garments)) {
              rg.garments.forEach((garment) => {
                if (garment.defects && Array.isArray(garment.defects)) {
                  garment.defects.forEach((defect) => {
                    if (
                      defect &&
                      defect.name &&
                      typeof defect.count === "number"
                    ) {
                      const { category } = categorizeDefect(defect.name);
                      if (category === "Critical")
                        criticalDefectsCount += defect.count;
                      else if (category === "Major")
                        majorDefectsCount += defect.count;
                      else if (category === "Minor")
                        minorDefectsCount += defect.count;
                    }
                  });
                }
              });
            }
          });
        }
      });
    }

    return {
      reactKey:
        repEntry._id?.$oid || repEntry.inspection_rep_name || `rep-${repIdx}`,
      inspection_rep_name: repEntry.inspection_rep_name,
      eng_name: repEntry.eng_name,
      emp_id: repEntry.emp_id,
      metrics: repMetrics,
      criticalDefects: criticalDefectsCount,
      majorDefects: majorDefectsCount,
      minorDefects: minorDefectsCount,
      filteredInlineData: currentRepFilteredInlineData
    };
  });

  // Data processing for the new operator-centric table
  const operatorCentricDataMap = new Map();
  processedRepetitions.forEach((repData) => {
    const repName = repData.inspection_rep_name;
    if (!REPETITION_KEYS_FOR_OPERATOR_TABLE.includes(repName)) return;

    repData.filteredInlineData.forEach((inlineItem) => {
      if (!inlineItem) return;

      // Apply operatorId filter if present in global filters
      if (
        filters.operatorId &&
        String(inlineItem.operator_emp_id) !== String(filters.operatorId)
      ) {
        return;
      }

      const operatorKey = `${inlineItem.operator_emp_id || "N/A"}-${
        inlineItem.operation_ch_name || inlineItem.operation_kh_name || "N/A"
      }-${inlineItem.ma_code || "N/A"}`;

      if (!operatorCentricDataMap.has(operatorKey)) {
        operatorCentricDataMap.set(operatorKey, {
          operatorId: inlineItem.operator_emp_id || "N/A",
          operationName:
            inlineItem.operation_ch_name ||
            inlineItem.operation_kh_name ||
            "N/A",
          machineCode: inlineItem.ma_code || "N/A",
          repetitions: REPETITION_KEYS_FOR_OPERATOR_TABLE.reduce((acc, key) => {
            acc[key] = null; // Initialize
            return acc;
          }, {})
        });
      }

      const currentOperatorEntry = operatorCentricDataMap.get(operatorKey);
      const rejectGarmentCount =
        inlineItem.rejectGarments?.[0]?.garments?.length || 0;

      currentOperatorEntry.repetitions[repName] = {
        overallStatus: inlineItem.overall_roving_status || "N/A",
        checkedQty: inlineItem.checked_quantity || 0,
        rejectCount: rejectGarmentCount
      };
    });
  });
  const newOperatorTableData = Array.from(operatorCentricDataMap.values());

  const handleSelectAllColumns = () => {
    setShowSpiColumn(true);
    setShowMeasurementColumn(true);
    setShowDefectStatusColumn(true);
  };

  const handleClearAllColumns = () => {
    setShowSpiColumn(false);
    setShowMeasurementColumn(false);
    setShowDefectStatusColumn(false);
  };

  const calculateDynamicColspan = () =>
    11 +
    (showSpiColumn ? 1 : 0) +
    (showMeasurementColumn ? 1 : 0) +
    (showDefectStatusColumn ? 1 : 0);

  return (
    <td colSpan="14" className="p-0">
      <div className="p-4 border-t-2 border-blue-600 bg-blue-50 shadow-inner">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-blue-700">
            Detailed Report (MO: {reportDetail.mo_no}, Line:{" "}
            {reportDetail.line_no}, Date: {reportDetail.inspection_date})
            {inspectorDisplay}
          </h3>
          <button onClick={onClose} className="text-red-600 hover:text-red-800">
            <XCircle size={28} />
          </button>
        </div>

        {/* Legend for Operator Summary Table Symbols */}
        <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-md text-xs text-gray-700">
          <h4 className="font-semibold text-sm mb-1">
            Operator Summary Legend:
          </h4>
          <ul className="list-none pl-0 flex flex-wrap gap-x-4 gap-y-1">
            <li>
              <span className="text-green-600 font-bold text-lg inline-block w-5 text-center align-middle">
                ✓
              </span>{" "}
              : Checked Quantity
            </li>
            <li>
              <span className="text-red-600 font-bold text-lg inline-block w-5 text-center align-middle">
                ✗
              </span>{" "}
              : Reject Garment Count
            </li>
            <li>
              <span className="font-bold text-lg inline-block w-5 text-center align-middle">
                {categorizeDefect("critical").symbol}
              </span>{" "}
              : Critical Defect
            </li>
            <li>
              <span className="font-bold text-lg inline-block w-5 text-center align-middle">
                {categorizeDefect("major").symbol}
              </span>{" "}
              : Major Defect
            </li>
            <li>
              <span className="font-bold text-lg inline-block w-5 text-center align-middle">
                {categorizeDefect("minor").symbol}
              </span>{" "}
              : Minor Defect
            </li>
          </ul>
        </div>

        {processedRepetitions.length > 0 ? (
          <>
            {/* Consolidated Summary Table */}
            <div className="mb-6 bg-white p-4 rounded shadow">
              <h5 className="text-md font-semibold text-gray-700 mb-2">
                Overall Inspection Summary by Repetition
              </h5>
              <table className="w-full text-sm border border-collapse border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 border border-gray-300">
                      Inspection No.
                    </th>
                    <th className="p-2 border border-gray-300">Check Qty</th>
                    <th className="p-2 border border-gray-300">Defect Parts</th>
                    <th className="p-2 border border-gray-300">
                      Defect Rate (%)
                    </th>
                    <th className="p-2 border border-gray-300">
                      Pass Rate (%)
                    </th>
                    <th className="p-2 border border-gray-300" colSpan="2">
                      SPI Count
                    </th>
                    <th className="p-2 border border-gray-300" colSpan="2">
                      Measurement
                    </th>
                    <th
                      className="p-2 border border-gray-300 text-center"
                      colSpan="3"
                    >
                      Defects Summary
                    </th>
                  </tr>
                  <tr>
                    <th className="p-2 border border-gray-300" colSpan="1"></th>
                    <th className="p-2 border border-gray-300" colSpan="4"></th>
                    <th className="p-2 border border-gray-300 text-xs">Pass</th>
                    <th className="p-2 border border-gray-300 text-xs">
                      Reject
                    </th>
                    <th className="p-2 border border-gray-300 text-xs">Pass</th>
                    <th className="p-2 border border-gray-300 text-xs">
                      Reject
                    </th>
                    <th className="p-2 border border-gray-300 text-xs text-red-700">
                      {categorizeDefect("critical").symbol} Critical
                    </th>
                    <th className="p-2 border border-gray-300 text-xs text-red-600">
                      {categorizeDefect("major").symbol} Major
                    </th>
                    <th className="p-2 border border-gray-300 text-xs text-yellow-700">
                      {categorizeDefect("minor").symbol} Minor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {processedRepetitions.map((data) => (
                    <tr key={`summary-${data.reactKey}`}>
                      <td className="p-2 border border-gray-300">
                        {data.inspection_rep_name}
                      </td>
                      <td className="p-2 border border-gray-300 text-center">
                        {data.metrics.totalCheckedQty}
                      </td>
                      <td className="p-2 border border-gray-300 text-center">
                        {data.metrics.totalRejectGarmentCount}
                      </td>
                      <td className="p-2 border border-gray-300 text-center">
                        {data.metrics.defectRate}
                      </td>
                      <td className="p-2 border border-gray-300 text-center">
                        {data.metrics.passRate}
                      </td>
                      <td
                        className={`p-2 border border-gray-300 text-center ${
                          data.metrics.totalSpiPass > 0
                            ? "bg-green-100 text-green-700"
                            : ""
                        }`}
                      >
                        {data.metrics.totalSpiPass}
                      </td>
                      <td
                        className={`p-2 border border-gray-300 text-center ${
                          data.metrics.totalSpiReject > 0
                            ? "bg-red-100 text-red-700"
                            : ""
                        }`}
                      >
                        {data.metrics.totalSpiReject}
                      </td>
                      <td
                        className={`p-2 border border-gray-300 text-center ${
                          data.metrics.totalMeasurementPass > 0
                            ? "bg-green-100 text-green-700"
                            : ""
                        }`}
                      >
                        {data.metrics.totalMeasurementPass}
                      </td>
                      <td
                        className={`p-2 border border-gray-300 text-center ${
                          data.metrics.totalMeasurementReject > 0
                            ? "bg-red-100 text-red-700"
                            : ""
                        }`}
                      >
                        {data.metrics.totalMeasurementReject}
                      </td>
                      <td
                        className={`p-2 border border-gray-300 text-center font-semibold ${
                          data.criticalDefects > 0
                            ? "bg-red-200 text-red-800"
                            : data.majorDefects === 0 && data.minorDefects === 0
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-50"
                        }`}
                      >
                        {data.criticalDefects > 0
                          ? `${data.criticalDefects}`
                          : data.majorDefects === 0 && data.minorDefects === 0
                          ? "0"
                          : "0"}
                      </td>
                      <td
                        className={`p-2 border border-gray-300 text-center font-semibold ${
                          data.majorDefects > 0
                            ? "bg-red-200 text-red-800"
                            : data.criticalDefects === 0 &&
                              data.minorDefects === 0
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-50"
                        }`}
                      >
                        {data.majorDefects > 0
                          ? `${data.majorDefects}`
                          : data.criticalDefects === 0 &&
                            data.minorDefects === 0
                          ? "0"
                          : "0"}
                      </td>
                      <td
                        className={`p-2 border border-gray-300 text-center font-semibold ${
                          data.minorDefects > 0
                            ? "bg-yellow-200 text-yellow-800"
                            : data.criticalDefects === 0 &&
                              data.majorDefects === 0
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-50"
                        }`}
                      >
                        {data.minorDefects > 0
                          ? `${data.minorDefects}`
                          : data.criticalDefects === 0 &&
                            data.majorDefects === 0
                          ? "0"
                          : "0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* New Operator Inspection Summary Table */}
            {newOperatorTableData.length > 0 ? (
              <div className="mb-6 bg-white p-4 rounded shadow">
                <h5 className="text-md font-semibold text-gray-700 mb-2">
                  Operator Inspection Summary by Repetition
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-collapse border-gray-300">
                    <thead className="bg-gray-200">
                      <tr>
                        <th
                          rowSpan="2"
                          className="p-2 border border-gray-300 align-middle"
                        >
                          Operator ID
                        </th>
                        <th
                          rowSpan="2"
                          className="p-2 border border-gray-300 align-middle"
                        >
                          Operation
                        </th>
                        <th
                          rowSpan="2"
                          className="p-2 border border-gray-300 align-middle"
                        >
                          Machine Code
                        </th>
                        <th
                          colSpan={REPETITION_KEYS_FOR_OPERATOR_TABLE.length}
                          className="p-2 border border-gray-300 text-center"
                        >
                          Inspection Data
                        </th>
                      </tr>
                      <tr>
                        {REPETITION_KEYS_FOR_OPERATOR_TABLE.map((repKey) => (
                          <th
                            key={`op-table-header-${repKey}`}
                            className="p-2 border border-gray-300 text-center text-xs whitespace-nowrap"
                          >
                            {repKey}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {newOperatorTableData.map((rowData, idx) => (
                        <tr key={`op-row-${rowData.operatorId}-${idx}`}>
                          <td className="p-2 border border-gray-300 text-xs align-top">
                            {rowData.operatorId}
                          </td>
                          <td className="p-2 border border-gray-300 text-xs align-top">
                            {rowData.operationName}
                          </td>
                          <td className="p-2 border border-gray-300 text-xs align-top">
                            {rowData.machineCode}
                          </td>
                          {REPETITION_KEYS_FOR_OPERATOR_TABLE.map((repKey) => {
                            const repDetail = rowData.repetitions[repKey];
                            if (repDetail) {
                              return [
                                <td
                                  key={`op-data-${repKey}-details`}
                                  className={`p-2 border border-gray-300 text-xs text-center ${getOverallRovingStatusColor(
                                    repDetail.overallStatus
                                  )}`}
                                >
                                  <div className="font-medium">
                                    {repDetail.overallStatus}
                                  </div>
                                  <span className="block text-xs mt-0.5">
                                    (
                                    <span className="text-green-600 font-bold">
                                      ✓
                                    </span>
                                    {repDetail.checkedQty}
                                    <span className="text-red-600 font-bold ml-2">
                                      ✗
                                    </span>
                                    {repDetail.rejectCount})
                                  </span>
                                </td>
                              ];
                            } else {
                              return [
                                <td
                                  key={`op-empty-${repKey}-details`}
                                  className="p-2 border border-gray-300 text-xs text-center"
                                >
                                  -
                                </td>
                              ];
                            }
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              filters.operatorId && (
                <div className="mb-6 p-4 text-sm text-gray-600">
                  No data found for the selected operator in this report.
                </div>
              )
            )}

            {/* Detailed Roving Data per Repetition */}
            {processedRepetitions.map((data) => (
              <div
                key={`detail-${data.reactKey}`}
                className="mb-8 border-b-2 border-gray-300 pb-6"
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-3 bg-gray-100 p-2 rounded">
                  Inspection No: {data.inspection_rep_name}
                </h4>

                {/* Part 2: Roving data Table for this repetition */}
                <div className="bg-white p-4 rounded shadow">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-md font-semibold text-gray-700">
                      Roving Data Details (Individual Checks for this
                      Repetition)
                    </h5>

                    {/* Column Visibility Toggles - Now inline with the h5 heading */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <label className="flex items-center space-x-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showSpiColumn}
                          onChange={() => setShowSpiColumn((prev) => !prev)}
                          className="form-checkbox h-3 w-3 text-blue-600"
                        />
                        <span>SPI</span>
                      </label>
                      <label className="flex items-center space-x-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showMeasurementColumn}
                          onChange={() =>
                            setShowMeasurementColumn((prev) => !prev)
                          }
                          className="form-checkbox h-3 w-3 text-blue-600"
                        />
                        <span>Measurement</span>
                      </label>
                      <label className="flex items-center space-x-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showDefectStatusColumn}
                          onChange={() =>
                            setShowDefectStatusColumn((prev) => !prev)
                          }
                          className="form-checkbox h-3 w-3 text-blue-600"
                        />
                        <span>Defect Status</span>
                      </label>
                      <div className="flex gap-1">
                        <button
                          onClick={handleSelectAllColumns}
                          className="px-1.5 py-0.5 text-xs bg-blue-500 text-gray rounded hover:bg-blue-600 font-semibold"
                        >
                          Add All
                        </button>
                        <button
                          onClick={handleClearAllColumns}
                          className="px-1.5 py-0.5 text-xs bg-red-500 text-gray rounded hover:bg-red-600 font-semibold"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-xs border border-collapse border-gray-300">
                      <thead className="bg-gray-200 sticky top-0">
                        <tr>
                          <th className="p-2 border border-gray-300">
                            Operator ID
                          </th>
                          <th className="p-2 border border-gray-300">
                            Operator Name
                          </th>
                          <th className="p-2 border border-gray-300">TG No.</th>
                          <th className="p-2 border border-gray-300">
                            Operation (CH)
                          </th>
                          <th className="p-2 border border-gray-300">Type</th>
                          <th className="p-2 border border-gray-300">
                            Checked Qty
                          </th>
                          <th className="p-2 border border-gray-300">
                            Defect Parts
                          </th>
                          {showSpiColumn && (
                            <th className="p-2 border border-gray-300">SPI</th>
                          )}
                          {showMeasurementColumn && (
                            <th className="p-2 border border-gray-300">
                              Measurement
                            </th>
                          )}
                          {showDefectStatusColumn && (
                            <th className="p-2 border border-gray-300">
                              Defect Status
                            </th>
                          )}
                          <th className="p-2 border border-gray-300">
                            Overall Roving Status
                          </th>
                          <th className="p-2 border border-gray-300">
                            Defects Found
                          </th>
                          <th className="p-2 border border-gray-300">
                            Insp. Time
                          </th>
                          <th className="p-2 border border-gray-300">Remark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.filteredInlineData &&
                        data.filteredInlineData.length > 0 ? (
                          data.filteredInlineData.map((item, itemIdx) => {
                            const itemKey = item._id?.$oid || `item-${itemIdx}`;
                            const rejectQtyForItem =
                              item.rejectGarments &&
                              Array.isArray(item.rejectGarments)
                                ? item.rejectGarments.length
                                : 0;
                            return (
                              <tr key={itemKey}>
                                <td className="p-2 border border-gray-300">
                                  {item.operator_emp_id}
                                </td>
                                <td className="p-2 border border-gray-300">
                                  {item.operator_eng_name}
                                </td>
                                <td className="p-2 border border-gray-300">
                                  {item.tg_no}
                                </td>
                                <td className="p-2 border border-gray-300">
                                  {item.operation_ch_name}
                                </td>
                                <td className="p-2 border border-gray-300">
                                  {item.type}
                                </td>
                                <td className="p-2 border border-gray-300 text-center">
                                  {item.checked_quantity}
                                </td>
                                <td className="p-2 border border-gray-300 text-center">
                                  {rejectQtyForItem}
                                </td>
                                {showSpiColumn && (
                                  <td
                                    className={`p-2 border border-gray-300 text-center ${
                                      item.spi === "Pass"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {item.spi}
                                  </td>
                                )}
                                {showMeasurementColumn && (
                                  <td
                                    className={`p-2 border border-gray-300 text-center ${
                                      item.measurement === "Pass"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {item.measurement}
                                  </td>
                                )}
                                {showDefectStatusColumn && (
                                  <td
                                    className={`p-2 border border-gray-300 text-center ${
                                      item.qualityStatus === "Pass"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {item.qualityStatus}
                                  </td>
                                )}
                                <td
                                  className={`p-2 border border-gray-300 text-center ${getOverallRovingStatusColor(
                                    item.overall_roving_status
                                  )}`}
                                >
                                  {item.overall_roving_status}
                                </td>
                                <td className="p-2 border border-gray-300">
                                  {item.rejectGarments &&
                                    item.rejectGarments.map(
                                      (rg) =>
                                        rg.garments &&
                                        rg.garments.map(
                                          (g) =>
                                            g.defects &&
                                            g.defects.map(
                                              (defect, defectIdx) => {
                                                const cat = categorizeDefect(
                                                  defect.name
                                                );
                                                const defectKey =
                                                  defect._id?.$oid ||
                                                  `${item._id?.$oid}-defect-${defectIdx}-${defect.name}`;
                                                return (
                                                  <div
                                                    key={defectKey}
                                                    className="mb-1 text-xs"
                                                  >
                                                    {cat.symbol} {defect.name} (
                                                    {defect.count}) -{" "}
                                                    <span
                                                      className={
                                                        cat.statusDisplayClasses
                                                      }
                                                    >
                                                      {cat.category}
                                                    </span>
                                                  </div>
                                                );
                                              }
                                            )
                                        )
                                    )}
                                </td>
                                <td className="p-2 border border-gray-300">
                                  {item.inspection_time}
                                </td>
                                <td className="p-2 border border-gray-300">
                                  {item.remark}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={calculateDynamicColspan()}
                              className="p-2 text-center border border-gray-300"
                            >
                              No individual roving data available for this
                              repetition.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-4 text-gray-600">
            No inspection repetitions match the current filters for this report.
          </div>
        )}
      </div>
    </td>
  );
};

export default RovingReportDetailView;
