import React, { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
  FaBarcode,
  FaCalendarAlt,
  FaFilter,
  FaHashtag,
  FaListOl,
  FaPrint,
  FaQrcode,
  FaTimes,
  FaUserCheck,
  FaUserTie,
} from "react-icons/fa";
import Select from "react-select";
import { API_BASE_URL } from "../../../config"; // Adjust path as necessary
import { useAuth } from "../authentication/AuthContext"; // Adjust path as necessary
import BluetoothComponent from "./Bluetooth"; // Assuming path
import QRCodePreview from "./QRCodePreview"; // Assuming path

// Helper function (ensure it's available client-side or reimplement)
const normalizeDateString = (dateStr) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      const partsMMDDYYYY = dateStr.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
      if (partsMMDDYYYY) {
        let month = parseInt(partsMMDDYYYY[1], 10);
        let day = parseInt(partsMMDDYYYY[2], 10);
        const year = parseInt(partsMMDDYYYY[3], 10);
        if (month > 12 && day <= 12) {
          [month, day] = [day, month];
        }
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return `${String(month).padStart(2, "0")}/${String(day).padStart(
            2,
            "0"
          )}/${year}`;
        }
      }
      const partsYYYYMMDD = dateStr.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
      if (partsYYYYMMDD) {
        const year = parseInt(partsYYYYMMDD[1], 10);
        const month = parseInt(partsYYYYMMDD[2], 10);
        const day = parseInt(partsYYYYMMDD[3], 10);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return `${String(month).padStart(2, "0")}/${String(day).padStart(
            2,
            "0"
          )}/${year}`;
        }
      }
      return dateStr;
    }
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch (e) {
    return dateStr;
  }
};

export default function ReprintTab() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false); // Initially false, true during fetch
  const [showFilters, setShowFilters] = useState(true);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLineNo, setSelectedLineNo] = useState(null);
  const [selectedMono, setSelectedMono] = useState(null);
  const [packageNoInput, setPackageNoInput] = useState(""); // For direct input
  const [selectedBuyer, setSelectedBuyer] = useState(null); // For dropdown from distinct values
  const [selectedEmpId, setSelectedEmpId] = useState(null); // For Emp ID / QC ID filter

  // Options for dropdowns
  const [lineNoOptions, setLineNoOptions] = useState([]);
  const [monoOptions, setMonoOptions] = useState([]);
  const [buyerOptions, setBuyerOptions] = useState([]);
  const [empIdOptions, setEmpIdOptions] = useState([]);
  // No packageNoOptions as it's a direct text input for potentially many values

  // For QR Preview
  const [qrRecordsForPreview, setQrRecordsForPreview] = useState([]);
  const [showQRPreview, setShowQRPreview] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 15;

  const bluetoothComponentRef = useRef();

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/reprint-distinct-filters`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setLineNoOptions(data.lineNos.map((ln) => ({ value: ln, label: ln })));
        setMonoOptions(data.monos.map((mo) => ({ value: mo, label: mo })));
        setBuyerOptions(data.buyers.map((b) => ({ value: b, label: b })));
        setEmpIdOptions(data.empIds.map((id) => ({ value: id, label: id })));

        if (user && user.emp_id && data.empIds.includes(user.emp_id)) {
          setSelectedEmpId({ value: user.emp_id, label: user.emp_id });
        }
      } catch (error) {
        console.error("Error fetching filter options for reprint:", error);
      }
    };
    fetchFilterOptions();
  }, [user]);

  const [debouncedPackageNo, setDebouncedPackageNo] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPackageNo(packageNoInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [packageNoInput]);

  const fetchReprintRecords = useCallback(
    async (pageToFetch = 1) => {
      setLoading(true);
      setCurrentPage(pageToFetch);
      const params = new URLSearchParams();

      if (selectedDate)
        params.append("date", selectedDate.toISOString().split("T")[0]);
      if (selectedLineNo) params.append("lineNo", selectedLineNo.value);
      if (selectedMono) params.append("selectedMono", selectedMono.value);
      if (debouncedPackageNo) params.append("packageNo", debouncedPackageNo);
      if (selectedBuyer) params.append("buyer", selectedBuyer.value);
      if (selectedEmpId) params.append("empId", selectedEmpId.value); // Note: server expects 'empId'

      params.append("page", pageToFetch.toString());
      params.append("limit", recordsPerPage.toString());

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/reprint-search?${params.toString()}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setRecords(data.records || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalRecords(data.pagination.totalRecords);
        } else {
          setTotalPages(0);
          setTotalRecords(0);
        }
      } catch (error) {
        console.error("Error fetching reprint records:", error);
        setRecords([]);
        setTotalPages(0);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    },
    [
      selectedDate,
      selectedLineNo,
      selectedMono,
      debouncedPackageNo,
      selectedBuyer,
      selectedEmpId,
      recordsPerPage,
    ]
  );

  useEffect(() => {
    fetchReprintRecords(1); // Fetch first page when filters change
  }, [
    selectedDate,
    selectedLineNo,
    selectedMono,
    debouncedPackageNo,
    selectedBuyer,
    selectedEmpId,
    fetchReprintRecords,
  ]); // Added fetchReprintRecords

  const handleClearFilters = () => {
    setSelectedDate(new Date());
    setSelectedLineNo(null);
    setSelectedMono(null);
    setPackageNoInput("");
    setSelectedBuyer(null);
    if (
      user &&
      user.emp_id &&
      empIdOptions.find((opt) => opt.value === user.emp_id)
    ) {
      setSelectedEmpId({ value: user.emp_id, label: user.emp_id });
    } else {
      setSelectedEmpId(null);
    }
    setCurrentPage(1);
    // Data will refetch due to state changes triggering the useEffect
  };

  const handlePrint = async (record) => {
    try {
      if (bluetoothComponentRef.current) {
        await bluetoothComponentRef.current.printData({
          ...record,
          bundle_id: record.bundle_random_id, // Ensure this ID is what printer expects
        });
      } else {
        alert("Bluetooth component not available.");
      }
    } catch (error) {
      alert(`Print failed: ${error.message}`);
    }
  };

  const handlePreviewQR = (record) => {
    setQrRecordsForPreview([record]); // QRCodePreview expects an array
    setShowQRPreview(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      fetchReprintRecords(newPage);
    }
  };

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "38px",
      height: "38px",
      boxShadow: "none",
      "&:hover": { borderColor: "#a0aec0" },
      fontSize: "0.875rem",
      borderRadius: "0.375rem",
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "38px",
      padding: "0 8px",
    }),
    input: (provided) => ({ ...provided, margin: "0px", padding: "0px" }),
    indicatorSeparator: () => ({ display: "none" }),
    indicatorsContainer: (provided) => ({ ...provided, height: "38px" }),
    menu: (provided) => ({ ...provided, zIndex: 100 }),
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const maxPagesToShow = isMobile ? 3 : 5;

    let startPage, endPage;
    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - Math.floor(maxPagesToShow / 2);
        endPage = currentPage + Math.floor(maxPagesToShow / 2);
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav className="mt-6 flex items-center justify-between border-t border-gray-200 px-2 sm:px-0">
        <div className="flex flex-1 justify-between sm:justify-start space-x-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaAngleDoubleLeft
              className="h-4 w-4 sm:h-5 sm:w-5"
              aria-hidden="true"
            />{" "}
            <span className="hidden sm:inline ml-1">
              {t("pagination.first", "First")}
            </span>
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaAngleLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />{" "}
            <span className="hidden sm:inline ml-1">
              {t("pagination.previous", "Prev")}
            </span>
          </button>
        </div>
        <div className="hidden sm:flex sm:items-center sm:justify-center">
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="relative inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="relative inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-gray-700">
                  ...
                </span>
              )}
            </>
          )}
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`relative inline-flex items-center px-3 py-2 mx-0.5 text-xs sm:text-sm font-medium border rounded-md ${
                currentPage === number
                  ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {number}
            </button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="relative inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-gray-700">
                  ...
                </span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="relative inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
        <div className="flex flex-1 justify-between sm:justify-end space-x-1">
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline mr-1">
              {t("pagination.next", "Next")}
            </span>
            <FaAngleRight
              className="h-4 w-4 sm:h-5 sm:w-5"
              aria-hidden="true"
            />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline mr-1">
              {t("pagination.last", "Last")}
            </span>{" "}
            <FaAngleDoubleRight
              className="h-4 w-4 sm:h-5 sm:w-5"
              aria-hidden="true"
            />
          </button>
        </div>
      </nav>
    );
  };

  const tableHeaders = [
    "package_no",
    "actions",
    "mono",
    "color",
    "size",
    "customer_style",
    "line_no",
    "date",
    "time",
    "emp_id",
  ];

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 md:mb-0">
          {t("reprinttab.title", "Reprint Bundle QR Codes")}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-xs md:text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md shadow-sm"
          >
            <FaFilter className="mr-1.5" size={12} />
            {showFilters ? t("bundle.hide_filters") : t("bundle.show_filters")}
          </button>
          {showFilters && (
            <button
              onClick={handleClearFilters}
              className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-100 transition-colors"
              title={t("bundle.clear_filters")}
            >
              <FaTimes size={14} />
            </button>
          )}
          <BluetoothComponent ref={bluetoothComponentRef} />
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6 p-4 bg-slate-50 rounded-xl border transition-all duration-300 ease-in-out">
          <div className="flex flex-col relative z-[70]">
            {" "}
            {/* DatePicker wrapper with higher z-index */}
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
              <FaCalendarAlt className="mr-1.5 text-gray-400" />
              {t("bundle.date")}
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className="w-full px-3 py-1.5 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              dateFormat="MM/dd/yyyy"
              popperPlacement="bottom-start" // Helps with positioning if needed
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
              <FaListOl className="mr-1.5 text-gray-400" />
              {t("bundle.line_no")}
            </label>
            <Select
              options={lineNoOptions}
              value={selectedLineNo}
              onChange={setSelectedLineNo}
              isClearable
              placeholder={t("reprinttab.select_line", "Line...")}
              styles={selectStyles}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
              <FaHashtag className="mr-1.5 text-gray-400" />
              {t("bundle.mono")}
            </label>
            <Select
              options={monoOptions}
              value={selectedMono}
              onChange={setSelectedMono}
              isClearable
              placeholder={t("reprinttab.select_mono", "MONo...")}
              styles={selectStyles}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
              <FaBarcode className="mr-1.5 text-gray-400" />
              {t("bundle.package_no")}
            </label>
            <input
              type="text"
              value={packageNoInput}
              onChange={(e) => setPackageNoInput(e.target.value)}
              placeholder={t("reprinttab.enter_package_no", "Package No...")}
              className="w-full px-3 py-1.5 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
              <FaUserTie className="mr-1.5 text-gray-400" />
              {t("bundle.buyer")}
            </label>
            <Select
              options={buyerOptions}
              value={selectedBuyer}
              onChange={setSelectedBuyer}
              isClearable
              placeholder={t("reprinttab.select_buyer", "Buyer...")}
              styles={selectStyles}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
              <FaUserCheck className="mr-1.5 text-gray-400" />
              {t("reprinttab.qc_id", "QC ID")}
            </label>
            <Select
              options={empIdOptions}
              value={selectedEmpId}
              onChange={setSelectedEmpId}
              isClearable
              placeholder={t("reprinttab.select_qc_id", "QC ID...")}
              styles={selectStyles}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm relative">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-200 sticky top-0 z-10">
            <tr>
              {tableHeaders.map((headerKey) => (
                <th
                  key={headerKey}
                  scope="col"
                  className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                >
                  {t(`reprinttab.table.${headerKey}`, t(`bundle.${headerKey}`))}{" "}
                  {/* Fallback to bundle translation */}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={tableHeaders.length}
                  className="text-center py-10 text-gray-500"
                >
                  {t("bundle.loading_data", "Loading data...")}
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td
                  colSpan={tableHeaders.length}
                  className="text-center py-10 text-gray-500"
                >
                  {t(
                    "bundle.no_records_found",
                    "No records found for the selected filters."
                  )}
                </td>
              </tr>
            ) : (
              records.map((record, index) => (
                <tr
                  key={record._id || index}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 whitespace-nowrap">
                    {(currentPage - 1) * recordsPerPage + index + 1}
                  </td>
                  {/* <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 whitespace-nowrap">{record.package_no || "N/A"}</td> */}
                  <td className="p-2 border-b border-gray-200 text-center text-xs md:text-sm">
                    <button
                      onClick={() => handlePreviewQR(record)}
                      className="text-blue-500 hover:text-blue-700 p-1 rounded-md hover:bg-blue-100 transition-colors mx-0.5"
                    >
                      <FaQrcode className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => handlePrint(record)}
                      className="text-green-500 hover:text-green-700 p-1 rounded-md hover:bg-green-100 transition-colors mx-0.5"
                    >
                      <FaPrint className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 whitespace-nowrap">
                    {record.selectedMono}
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 whitespace-nowrap">
                    {record.color}
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 whitespace-nowrap">
                    {record.size}
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 whitespace-nowrap">
                    {record.custStyle}
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 whitespace-nowrap">
                    {record.lineNo}
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 whitespace-nowrap">
                    {record.updated_date_seperator}
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 whitespace-nowrap">
                    {record.updated_time_seperator}
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700 whitespace-nowrap">
                    {record.emp_id || "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination />
      <div className="mt-4 md:mt-6 text-xs md:text-sm text-gray-500">
        {t("bundle.showing_records_paginated", {
          start:
            records.length > 0 ? (currentPage - 1) * recordsPerPage + 1 : 0,
          end:
            records.length > 0
              ? Math.min(currentPage * recordsPerPage, totalRecords)
              : 0,
          total: totalRecords,
        })}
      </div>

      <QRCodePreview
        isOpen={showQRPreview}
        onClose={() => setShowQRPreview(false)}
        qrData={qrRecordsForPreview} // Use qrRecordsForPreview
        onPrint={(recordToPrint) => {
          // QRCodePreview might pass the specific record if it supports single print from list
          if (recordToPrint && recordToPrint._id) {
            handlePrint(recordToPrint);
          } else if (qrRecordsForPreview.length === 1) {
            // Fallback if no specific record passed
            handlePrint(qrRecordsForPreview[0]);
          }
        }}
        mode="reprint" // Could be a new mode if styling/logic differs
      />
    </div>
  );
}
