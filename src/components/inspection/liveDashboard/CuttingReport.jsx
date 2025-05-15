// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { API_BASE_URL } from "../../../../config";
// import { useTranslation } from "react-i18next";
// import ReactPaginate from "react-paginate";
// import CuttingReportFilterPane from "../cutting/CuttingReportFilterPane";
// import CuttingReportOrderDetails from "../cutting/CuttingReportOrderDetails";
// import CuttingReportSummaryCard from "../cutting/CuttingReportSummaryCard";
// import CuttingReportMeasurementTable from "../cutting/CuttingReportMeasurementTable";
// import CuttingReportDefects from "../cutting/CuttingReportDefects";
// import { measurementPoints } from "../../../constants/cuttingmeasurement";
// import { pdf } from "@react-pdf/renderer";
// import CuttingReportDownloadPDF from "../cutting/CuttingReportDownloadPDF";

// const CuttingReport = () => {
//   const { t } = useTranslation();
//   const [filters, setFilters] = useState({
//     startDate: new Date(),
//     endDate: null,
//     moNo: "",
//     lotNo: "",
//     buyer: "",
//     color: "",
//     tableNo: ""
//   });
//   const [reportData, setReportData] = useState([]);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [totalPages, setTotalPages] = useState(0);
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

//   useEffect(() => {
//     fetchReportData();
//   }, [filters, currentPage]);

//   const fetchReportData = async () => {
//     try {
//       const params = {
//         startDate: filters.startDate ? formatDate(filters.startDate) : "",
//         endDate: filters.endDate ? formatDate(filters.endDate) : "",
//         moNo: filters.moNo,
//         lotNo: filters.lotNo,
//         buyer: filters.buyer,
//         color: filters.color,
//         tableNo: filters.tableNo,
//         page: currentPage,
//         limit: 1
//       };
//       const response = await axios.get(
//         `${API_BASE_URL}/api/cutting-inspection-detailed-report`,
//         { params }
//       );
//       setReportData(response.data.data);
//       setTotalPages(response.data.totalPages);
//       setLastUpdated(new Date());
//     } catch (error) {
//       console.error("Error fetching cutting report data:", error);
//       setReportData([]);
//       setTotalPages(0);
//     }
//   };

//   const fetchAllReportData = async () => {
//     try {
//       const params = {
//         startDate: filters.startDate ? formatDate(filters.startDate) : "",
//         endDate: filters.endDate ? formatDate(filters.endDate) : "",
//         moNo: filters.moNo,
//         lotNo: filters.lotNo,
//         buyer: filters.buyer,
//         color: filters.color,
//         tableNo: filters.tableNo,
//         page: 0,
//         limit: 1000
//       };
//       const response = await axios.get(
//         `${API_BASE_URL}/api/cutting-inspection-detailed-report`,
//         { params }
//       );
//       return response.data.data;
//     } catch (error) {
//       console.error("Error fetching all cutting report data:", error);
//       return [];
//     }
//   };

//   const formatDate = (date) => {
//     if (!date) return "";
//     const month = ("0" + (date.getMonth() + 1)).slice(-2);
//     const day = ("0" + date.getDate()).slice(-2);
//     const year = date.getFullYear();
//     return `${month}/${day}/${year}`;
//   };

//   const handlePageClick = (data) => {
//     setCurrentPage(data.selected);
//   };

//   const getPanelIndexName = (garmentType, panelIndex) => {
//     if (!garmentType || !panelIndex) return `Panel Index: ${panelIndex}`;
//     const matchingPoints = measurementPoints.find(
//       (point) => point.panel.toLowerCase() === garmentType.toLowerCase()
//     );
//     if (!matchingPoints) return `Panel Index: ${panelIndex}`;
//     const matchingPoint = measurementPoints.find(
//       (point) =>
//         point.panel.toLowerCase() === garmentType.toLowerCase() &&
//         point.panelIndex === panelIndex
//     );
//     return matchingPoint
//       ? matchingPoint.panelIndexName
//       : `Panel Index: ${panelIndex}`;
//   };

//   const handleDownloadPDF = async () => {
//     setIsGeneratingPDF(true);
//     try {
//       const allData = await fetchAllReportData();
//       const blob = await pdf(
//         <CuttingReportDownloadPDF
//           allReportData={allData}
//           measurementPoints={measurementPoints}
//         />
//       ).toBlob();
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = "cutting_report.pdf";
//       link.click();
//       URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//     } finally {
//       setIsGeneratingPDF(false);
//     }
//   };

//   return (
//     <div className="p-4 bg-gray-100 min-h-screen">
//       <div className="max-w-8xl mx-auto">
//         <h1 className="text-3xl font-bold text-center text-gray-800 mb-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-4 rounded-t-lg">
//           {t("cuttingReport.title")}
//         </h1>
//         <CuttingReportFilterPane
//           filters={filters}
//           setFilters={setFilters}
//           setCurrentPage={setCurrentPage}
//           lastUpdated={lastUpdated}
//           onDownloadPDF={handleDownloadPDF}
//           isGeneratingPDF={isGeneratingPDF}
//         />
//         {reportData.length > 0 ? (
//           reportData.map((data, index) => (
//             <div key={index} className="mb-8">
//               <div className="mb-4">
//                 <CuttingReportOrderDetails data={data} />
//               </div>
//               <div className="bg-white p-4 rounded-lg shadow-md">
//                 <CuttingReportSummaryCard summary={data.summary} />
//                 {data.inspectionData.map((sizeData, idx) => (
//                   <div key={idx} className="mt-6">
//                     <div className="mb-4">
//                       <h3 className="text-sm font-semibold mb-2">
//                         Inspected Sample Details - Size: {sizeData.size}
//                       </h3>
//                       <table className="w-full border border-gray-900 rounded-lg shadow-md">
//                         <thead className="bg-gray-200">
//                           <tr>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border border-gray-900">
//                               Serial Letter
//                             </th>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border border-gray-900">
//                               Total Pcs
//                             </th>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border border-gray-900">
//                               Total Pass
//                             </th>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border border-gray-900">
//                               Total Reject
//                             </th>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border border-gray-900">
//                               Measurement Issues
//                             </th>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border border-gray-900">
//                               Physical Defects
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           <tr>
//                             <td className="px-4 py-2 text-sm text-gray-900 border border-gray-900">
//                               {sizeData.serialLetter}
//                             </td>
//                             <td className="px-4 py-2 text-sm text-gray-900 border border-gray-900">
//                               {sizeData.totalPcs}
//                             </td>
//                             <td className="px-4 py-2 text-sm text-gray-900 border border-gray-900">
//                               {sizeData.totalPass}
//                             </td>
//                             <td className="px-4 py-2 text-sm text-gray-900 border border-gray-900">
//                               {sizeData.totalReject}
//                             </td>
//                             <td className="px-4 py-2 text-sm text-gray-900 border border-gray-900">
//                               {sizeData.totalRejectMeasurement}
//                             </td>
//                             <td className="px-4 py-2 text-sm text-gray-900 border border-gray-900">
//                               {sizeData.totalRejectDefects}
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
//                     {sizeData.pcsLocation
//                       .reduce((acc, loc) => {
//                         loc.measurementData.forEach((panel) => {
//                           const existing = acc.find(
//                             (p) => p.panelIndex === panel.panelIndex
//                           );
//                           if (!existing) {
//                             acc.push({
//                               panelIndex: panel.panelIndex,
//                               measurementData: [],
//                               defectData: []
//                             });
//                           }
//                           const panelEntry = acc.find(
//                             (p) => p.panelIndex === panel.panelIndex
//                           );
//                           panelEntry.measurementData.push({
//                             location: loc.location,
//                             ...panel
//                           });
//                           if (panel.defectData.length > 0) {
//                             panelEntry.defectData.push(...panel.defectData);
//                           }
//                         });
//                         return acc;
//                       }, [])
//                       .map((panel, panelIdx) => (
//                         <div key={panelIdx} className="mb-4">
//                           <h4 className="text-md font-medium mb-2">
//                             {getPanelIndexName(
//                               data.garmentType,
//                               panel.panelIndex
//                             )}
//                           </h4>
//                           <CuttingReportMeasurementTable panel={panel} />
//                           <CuttingReportDefects defectData={panel.defectData} />
//                         </div>
//                       ))}
//                     {idx < data.inspectionData.length - 1 && (
//                       <hr className="my-4" />
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="text-center text-gray-600">
//             No data available for the selected filters.
//           </p>
//         )}
//         {totalPages > 1 && (
//           <ReactPaginate
//             previousLabel={"Previous"}
//             nextLabel={"Next"}
//             breakLabel={"..."}
//             pageCount={totalPages}
//             marginPagesDisplayed={2}
//             pageRangeDisplayed={5}
//             onPageChange={handlePageClick}
//             containerClassName={"flex justify-center space-x-2 mt-4"}
//             pageClassName={
//               "px-3 py-1 bg-white border border-gray-300 rounded-md cursor-pointer"
//             }
//             activeClassName={"bg-blue-900 text-white"}
//             previousClassName={
//               "px-3 py-1 bg-white border border-gray-300 rounded-md cursor-pointer"
//             }
//             nextClassName={
//               "px-3 py-1 bg-white border border-gray-300 rounded-md cursor-pointer"
//             }
//             breakClassName={"px-3 py-1"}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default CuttingReport;

// src/components/inspection/liveDashboard/CuttingReport.jsx
import axios from "axios";
import { ChevronLeft, ChevronRight, Eye, Loader2, Search } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../../../../config"; // Adjust path
import CuttingReportDetailView from "../cutting/report/CuttingReportDetailView"; // Adjust path

const CuttingReport = () => {
  const { t, i18n } = useTranslation();
  const [filters, setFilters] = useState({
    startDate: new Date(),
    endDate: null,
    moNo: "",
    tableNo: "",
    qcId: "",
  });
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);

  const [moNoSearch, setMoNoSearch] = useState("");
  const [moNoOptions, setMoNoOptions] = useState([]);
  const [showMoNoDropdown, setShowMoNoDropdown] = useState(false);
  const moNoDropdownRef = useRef(null);

  const [tableNoSearch, setTableNoSearch] = useState("");
  const [tableNoOptions, setTableNoOptions] = useState([]);
  const [showTableNoDropdown, setShowTableNoDropdown] = useState(false);
  const tableNoDropdownRef = useRef(null);

  const [qcInspectorOptions, setQcInspectorOptions] = useState([]);

  // Fetch MO Numbers for dropdown
  useEffect(() => {
    const fetchMoNumbers = async () => {
      if (moNoSearch.trim() === "" && !filters.moNo) {
        // fetch all if search is empty and no filter moNo
        // setShowMoNoDropdown(false); // Keep it open if focused and search is empty for initial load
        // return;
      }
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/cutting-inspections/mo-numbers`,
          {
            params: { search: moNoSearch },
            withCredentials: true,
          }
        );
        setMoNoOptions(response.data);
        if (response.data.length > 0 && moNoSearch.trim() !== "")
          setShowMoNoDropdown(true);
        else if (moNoSearch.trim() === "") setShowMoNoDropdown(false); // Close if search is cleared
      } catch (error) {
        console.error("Error fetching MO numbers:", error);
      }
    };
    const debounce = setTimeout(fetchMoNumbers, 300);
    return () => clearTimeout(debounce);
  }, [moNoSearch, filters.moNo]);

  // Fetch Table Numbers for dropdown (dependent on selected MO)
  useEffect(() => {
    if (!filters.moNo) {
      setTableNoOptions([]);
      setShowTableNoDropdown(false);
      return;
    }
    const fetchTableNumbers = async () => {
      if (tableNoSearch.trim() === "" && !filters.tableNo) {
        //setShowTableNoDropdown(false);
        // return;
      }
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/cutting-inspections/table-numbers`,
          {
            params: { moNo: filters.moNo, search: tableNoSearch },
            withCredentials: true,
          }
        );
        setTableNoOptions(response.data);
        if (response.data.length > 0 && tableNoSearch.trim() !== "")
          setShowTableNoDropdown(true);
        else if (tableNoSearch.trim() === "") setShowTableNoDropdown(false);
      } catch (error) {
        console.error("Error fetching table numbers:", error);
      }
    };
    const debounce = setTimeout(fetchTableNumbers, 300);
    return () => clearTimeout(debounce);
  }, [filters.moNo, tableNoSearch, filters.tableNo]);

  // Fetch QC Inspectors
  useEffect(() => {
    const fetchQcInspectors = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/cutting-inspections/qc-inspectors`,
          {
            withCredentials: true,
          }
        );
        setQcInspectorOptions(response.data);
      } catch (error) {
        console.error("Error fetching QC inspectors:", error);
      }
    };
    fetchQcInspectors();
  }, []);

  // Click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        moNoDropdownRef.current &&
        !moNoDropdownRef.current.contains(event.target)
      ) {
        setShowMoNoDropdown(false);
      }
      if (
        tableNoDropdownRef.current &&
        !tableNoDropdownRef.current.contains(event.target)
      ) {
        setShowTableNoDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchReports = useCallback(
    async (pageToFetch = 1) => {
      setLoading(true);
      try {
        // Format dates to MM/DD/YYYY string before sending
        const params = {
          ...filters,
          startDate: filters.startDate
            ? filters.startDate.toLocaleDateString("en-US")
            : null,
          endDate: filters.endDate
            ? filters.endDate.toLocaleDateString("en-US")
            : null,
          page: pageToFetch,
          limit: 15,
        };
        const response = await axios.get(
          `${API_BASE_URL}/api/cutting-inspections-report`,
          {
            params,
            withCredentials: true,
          }
        );
        setReports(response.data.reports);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        setTotalReports(response.data.totalReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
        Swal.fire({
          icon: "error",
          title: t("cutting.error"),
          text:
            error.response?.data?.message || t("cutting.failedToFetchReports"),
        });
        setReports([]);
        setTotalPages(0);
        setTotalReports(0);
      } finally {
        setLoading(false);
      }
    },
    [filters, t]
  );

  useEffect(() => {
    fetchReports(1); // Fetch on initial load or when filters change (debounced by user action)
  }, [fetchReports]); // fetchReports is memoized by useCallback

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (name === "moNo") setMoNoSearch(value); // Sync search input
    if (name === "tableNo") setTableNoSearch(value); // Sync search input
  };

  const handleDateChange = (name, date) => {
    if (name === "endDate" && filters.startDate && date < filters.startDate) {
      Swal.fire({
        icon: "warning",
        title: t("common.invalidDateRange"),
        text: t("common.endDateCannotBeBeforeStartDate"),
      });
      return;
    }
    setFilters((prev) => ({ ...prev, [name]: date }));
  };

  const handleSearch = () => {
    fetchReports(1); // Reset to first page on new search
  };

  const handleViewReport = (reportId) => {
    setSelectedReportId(reportId);
  };

  const handleBackFromDetail = () => {
    setSelectedReportId(null);
    // Optionally re-fetch reports if data might have changed, though likely not needed here
    // fetchReports(currentPage);
  };

  if (selectedReportId) {
    return (
      <CuttingReportDetailView
        reportId={selectedReportId}
        onBack={handleBackFromDetail}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          {t("cutting.cuttingReportTitle")}
        </h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6 p-4 border border-gray-200 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("common.startDate")}
            </label>
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => handleDateChange("startDate", date)}
              dateFormat="MM/dd/yyyy"
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("common.endDate")}
            </label>
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => handleDateChange("endDate", date)}
              dateFormat="MM/dd/yyyy"
              minDate={filters.startDate}
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg shadow-sm"
              isClearable
            />
          </div>
          <div ref={moNoDropdownRef}>
            <label className="block text-sm font-medium text-gray-700">
              {t("cutting.moNo")}
            </label>
            <input
              type="text"
              name="moNo"
              value={moNoSearch}
              onChange={(e) => {
                setMoNoSearch(e.target.value);
                //setFilters(prev => ({...prev, moNo: ''})); // Clear actual filter while searching
                setShowMoNoDropdown(true);
              }}
              onFocus={() =>
                moNoOptions.length > 0 && setShowMoNoDropdown(true)
              }
              placeholder={t("cutting.search_mono")}
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg shadow-sm"
            />
            {showMoNoDropdown && moNoOptions.length > 0 && (
              <ul className="absolute z-10 w-auto bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                {moNoOptions.map((option) => (
                  <li
                    key={option}
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, moNo: option }));
                      setMoNoSearch(option);
                      setShowMoNoDropdown(false);
                      setTableNoSearch(""); // Clear table no search when MO changes
                      setFilters((prev) => ({ ...prev, tableNo: "" }));
                    }}
                    className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div ref={tableNoDropdownRef}>
            <label className="block text-sm font-medium text-gray-700">
              {t("cutting.tableNo")}
            </label>
            <input
              type="text"
              name="tableNo"
              value={tableNoSearch}
              onChange={(e) => {
                setTableNoSearch(e.target.value);
                //setFilters(prev => ({...prev, tableNo: ''}));
                setShowTableNoDropdown(true);
              }}
              onFocus={() =>
                tableNoOptions.length > 0 && setShowTableNoDropdown(true)
              }
              placeholder={t("cutting.search_table_no")}
              className={`mt-1 w-full p-2 border border-gray-300 rounded-lg shadow-sm ${
                !filters.moNo ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              disabled={!filters.moNo}
            />
            {showTableNoDropdown && tableNoOptions.length > 0 && (
              <ul className="absolute z-10 w-auto bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                {tableNoOptions.map((option) => (
                  <li
                    key={option}
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, tableNo: option }));
                      setTableNoSearch(option);
                      setShowTableNoDropdown(false);
                    }}
                    className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("cutting.qcId")}
            </label>
            <select
              name="qcId"
              value={filters.qcId}
              onChange={handleFilterChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg shadow-sm text-sm"
            >
              <option value="">{t("common.all")}</option>
              {qcInspectorOptions.map((qc) => (
                <option key={qc.emp_id} value={qc.emp_id}>
                  {qc.emp_id} -{" "}
                  {i18n.language === "km" && qc.kh_name
                    ? qc.kh_name
                    : qc.eng_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search size={20} />
              )}
              <span className="ml-2">{t("common.search")}</span>
            </button>
          </div>
        </div>

        {/* Summary Info */}
        {totalReports > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            {t("common.showing")} {reports.length} {t("common.of")}{" "}
            {totalReports} {t("common.reports")}.
          </div>
        )}

        {/* Reports Table */}
        {loading && reports.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="ml-2">{t("common.loadingData")}</p>
          </div>
        ) : !loading && reports.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            {t("cutting.noReportsFound")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300 text-xs sm:text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 border-r">
                    {t("cutting.inspectionDate")}
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 border-r">
                    {t("cutting.moNo")}
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 border-r">
                    {t("cutting.tableNo")}
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 border-r">
                    {t("cutting.color")}
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 border-r">
                    {t("cutting.panel")}
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-600 border-r">
                    {t("cutting.totalBundleQty")}
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-600 border-r">
                    {t("cutting.bundleQtyCheck")}
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-600 border-r">
                    {t("cutting.inspectedSizesCount")}
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-600 border-r">
                    {t("cutting.totalPcs")}
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-600 border-r">
                    {t("cutting.pass")}
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-600 border-r">
                    {t("cutting.reject")}
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-600 border-r">
                    {t("cutting.rejectMeasurements")}
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-600 border-r">
                    {t("cutting.rejectDefects")}
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-600 border-r">
                    {t("cutting.passRate")} (%)
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 border-r">
                    {t("cutting.results")}
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600">
                    {t("cutting.report")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap border-r">
                      {report.inspectionDate}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap border-r">
                      {report.moNo}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap border-r">
                      {report.tableNo}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap border-r">
                      {report.color}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap border-r">
                      {report.garmentType}
                    </td>
                    <td className="px-3 py-2 text-right border-r">
                      {report.totalBundleQty}
                    </td>
                    <td className="px-3 py-2 text-right border-r">
                      {report.bundleQtyCheck}
                    </td>
                    <td className="px-3 py-2 text-right border-r">
                      {report.numberOfInspectedSizes}
                    </td>
                    <td className="px-3 py-2 text-right border-r">
                      {report.sumTotalPcs}
                    </td>
                    <td className="px-3 py-2 text-right border-r">
                      {report.sumTotalPass}
                    </td>
                    <td className="px-3 py-2 text-right border-r">
                      {report.sumTotalReject}
                    </td>
                    <td className="px-3 py-2 text-right border-r">
                      {report.sumTotalRejectMeasurement}
                    </td>
                    <td className="px-3 py-2 text-right border-r">
                      {report.sumTotalRejectDefects}
                    </td>
                    <td className="px-3 py-2 text-right border-r">
                      {report.overallPassRate?.toFixed(2)}
                    </td>
                    <td
                      className={`px-3 py-2 text-center border-r font-semibold ${
                        report.overallPassRate >= 90
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {report.overallPassRate >= 90
                        ? t("common.pass")
                        : t("common.fail")}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleViewReport(report._id)}
                        className="text-blue-600 hover:text-blue-800"
                        title={t("cutting.viewReport")}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center text-sm">
            <button
              onClick={() => fetchReports(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft size={16} className="mr-1" /> {t("common.previous")}
            </button>
            <span>
              {t("common.page")} {currentPage} {t("common.of")} {totalPages}
            </span>
            <button
              onClick={() => fetchReports(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 flex items-center"
            >
              {t("common.next")} <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CuttingReport;
