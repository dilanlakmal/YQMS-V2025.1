// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { API_BASE_URL } from "../../../../config";
// import DataTableWOI from "./DataTableWOI";
// import FilterPaneWOI from "./FilterPaneWOI";

// const IroningLive = () => {
//   const [tableData, setTableData] = useState([]);
//   const [totalRecords, setTotalRecords] = useState(0);
//   const [page, setPage] = useState(1);
//   const limit = 50;

//   const [filters, setFilters] = useState({
//     moNo: "",
//     custStyle: "",
//     buyer: "",
//     color: "",
//     size: "",
//     empId: ""
//   });

//   // Fetch ironing data
//   const fetchIroningData = async (filters = {}, currentPage = page) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/api/ironing-summary`, {
//         params: { ...filters, page: currentPage, limit }
//       });
//       setTableData(response.data.tableData);
//       setTotalRecords(response.data.total);
//     } catch (error) {
//       console.error("Error fetching ironing data:", error);
//     }
//   };

//   // Handle pagination
//   const handlePageChange = async (newPage) => {
//     setPage(newPage);
//     await fetchIroningData(filters, newPage);
//   };

//   // Initial fetch and auto-refresh
//   useEffect(() => {
//     fetchIroningData();

//     const intervalId = setInterval(() => fetchIroningData(filters), 5000);
//     return () => clearInterval(intervalId);
//   }, [filters]);

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <FilterPaneWOI
//         module="ironing"
//         empIdField="emp_id_ironing"
//         filters={filters}
//         setFilters={setFilters}
//         fetchData={fetchIroningData}
//         setPage={setPage}
//       />
//       <DataTableWOI
//         tableData={tableData}
//         totalRecords={totalRecords}
//         page={page}
//         limit={limit}
//         handlePageChange={handlePageChange}
//       />
//     </div>
//   );
// };

// export default IroningLive;

import axios from "axios";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { format as formatDateFn, parse } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter as FilterIcon,
  RotateCcw,
  Search as SearchIcon,
  Shirt,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react"; // Added Shirt for Ironing
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Bar } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { API_BASE_URL } from "../../../../config";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
  ChartDataLabels
);

const normalizeDateStringForAPI_Ironing = (date) => {
  if (!date) return null;
  try {
    return formatDateFn(new Date(date), "MM/dd/yyyy");
  } catch (e) {
    console.error("Error normalizing date for API (Ironing):", date, e);
    return String(date);
  }
};
const formatDisplayDate_Ironing = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return formatDateFn(new Date(dateString), "MM/dd/yyyy");
  } catch (error) {
    return String(dateString);
  }
};
const LoadingSpinner_Ironing = () => (
  <div className="flex justify-center items-center h-32">
    {" "}
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>{" "}
  </div>
);

const SummaryStatCard_Ironing = ({
  title,
  currentValue,
  previousDayValue,
  icon,
}) => {
  const IconComponent = icon || Shirt; // Default to Shirt icon for Ironing
  const prevValue = previousDayValue || 0;
  const currValue = currentValue || 0;
  let percentageChange = 0;
  if (prevValue > 0)
    percentageChange = ((currValue - prevValue) / prevValue) * 100;
  else if (currValue > 0 && prevValue === 0) percentageChange = 100;
  else if (currValue === 0 && prevValue === 0) percentageChange = 0;

  const isPositive = percentageChange > 0;
  const isNegative = percentageChange < 0;
  const noChange = percentageChange === 0;
  const changeColor = isPositive
    ? "text-green-500"
    : isNegative
    ? "text-red-500"
    : "text-gray-500";
  const ChangeIcon = isPositive ? ArrowUp : isNegative ? ArrowDown : null;

  return (
    <div className="bg-white p-5 shadow-xl rounded-xl border border-gray-200 flex flex-col justify-between min-h-[160px] hover:shadow-2xl transition-shadow duration-300">
      <div>
        <div className="flex items-center justify-between mb-1">
          {" "}
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </h3>{" "}
          <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
            {" "}
            <IconComponent size={20} />{" "}
          </div>{" "}
        </div>
        <p className="text-3xl font-bold text-gray-800">
          {currValue.toLocaleString()}
        </p>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            Prev. Day: {prevValue.toLocaleString()}
          </span>
          {!noChange && ChangeIcon && (
            <span className={`flex items-center font-semibold ${changeColor}`}>
              {" "}
              <ChangeIcon size={14} className="mr-0.5" />{" "}
              {percentageChange.toFixed(1)}%{" "}
            </span>
          )}
          {noChange && (
            <span className={`font-semibold ${changeColor}`}>0.0%</span>
          )}
        </div>
      </div>
    </div>
  );
};

const InspectorColumnToggleButton_Ironing = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs text-white rounded-md shadow-sm transition-colors duration-150
                    ${
                      isActive
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gray-400 hover:bg-gray-500"
                    }`}
  >
    {isActive ? (
      <Check size={12} className="mr-1" />
    ) : (
      <X size={12} className="mr-1" />
    )}
    {label}
  </button>
);

const IroningLive = () => {
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [isLoadingHourlyChart, setIsLoadingHourlyChart] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [moNo, setMoNo] = useState(null);
  const [packageNo, setPackageNo] = useState(null);
  const [custStyle, setCustStyle] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [qcId, setQcId] = useState(null);
  const [appliedFiltersForDisplay, setAppliedFiltersForDisplay] = useState({});

  const [filterOptions, setFilterOptions] = useState({
    moNos: [],
    packageNos: [],
    custStyles: [],
    buyers: [],
    colors: [],
    sizes: [],
    qcIds: [],
  });
  const [summaryData, setSummaryData] = useState({
    totalIroningQty: 0,
    totalBundles: 0,
    totalRecheckIroningQty: 0,
  });
  const [previousDaySummary, setPreviousDaySummary] = useState({
    totalIroningQty: 0,
    totalBundles: 0,
    totalRecheckIroningQty: 0,
  });
  const [inspectorSummary, setInspectorSummary] = useState([]);
  const [detailedRecords, setDetailedRecords] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20,
  });

  const [hourlyChartData, setHourlyChartData] = useState([]);
  const [chartDataType, setChartDataType] = useState("ironing");

  const [visibleCols, setVisibleCols] = useState({
    totalIroningQty: true,
    totalBundles: true,
    totalRecheckIroningQty: true,
  });

  const currentFiltersRef = useRef({});

  useEffect(() => {
    currentFiltersRef.current = {
      startDate,
      endDate,
      moNo,
      packageNo,
      custStyle,
      buyer,
      color,
      size,
      qcId,
    };
  }, [
    startDate,
    endDate,
    moNo,
    packageNo,
    custStyle,
    buyer,
    color,
    size,
    qcId,
  ]);

  const buildFilterQueryParams = useCallback((filtersToBuild) => {
    const queryParams = {};
    if (filtersToBuild.startDate)
      queryParams.startDate = normalizeDateStringForAPI_Ironing(
        filtersToBuild.startDate
      );
    if (filtersToBuild.endDate)
      queryParams.endDate = normalizeDateStringForAPI_Ironing(
        filtersToBuild.endDate
      );
    if (filtersToBuild.moNo) queryParams.moNo = filtersToBuild.moNo.value;
    if (filtersToBuild.packageNo)
      queryParams.packageNo = filtersToBuild.packageNo.value;
    if (filtersToBuild.custStyle)
      queryParams.custStyle = filtersToBuild.custStyle.value;
    if (filtersToBuild.buyer) queryParams.buyer = filtersToBuild.buyer.value;
    if (filtersToBuild.color) queryParams.color = filtersToBuild.color.value;
    if (filtersToBuild.size) queryParams.size = filtersToBuild.size.value;
    if (filtersToBuild.qcId) queryParams.qcId = filtersToBuild.qcId.value;
    return queryParams;
  }, []);

  const fetchFilterOptions = useCallback(
    async (currentFilters = {}) => {
      setIsLoadingFilters(true);
      try {
        const queryParamsForFilters = buildFilterQueryParams(currentFilters);
        const response = await axios.get(
          `${API_BASE_URL}/api/ironing/filters`,
          { params: queryParamsForFilters }
        );
        setFilterOptions(response.data);
      } catch (error) {
        console.error("Error fetching Ironing filter options:", error);
        setFilterOptions({
          moNos: [],
          packageNos: [],
          custStyles: [],
          buyers: [],
          colors: [],
          sizes: [],
          qcIds: [],
        });
      } finally {
        setIsLoadingFilters(false);
      }
    },
    [buildFilterQueryParams]
  );

  const fetchHourlyChartData = useCallback(
    async (filters = {}) => {
      setIsLoadingHourlyChart(true);
      try {
        const queryParams = buildFilterQueryParams(filters);
        const response = await axios.get(
          `${API_BASE_URL}/api/ironing/hourly-summary`,
          { params: queryParams }
        );
        setHourlyChartData(response.data || []);
      } catch (error) {
        console.error("Error fetching hourly Ironing chart data:", error);
        setHourlyChartData([]);
      } finally {
        setIsLoadingHourlyChart(false);
      }
    },
    [buildFilterQueryParams]
  );

  const fetchData = useCallback(
    async (filters = {}, page = 1, isInitialLoad = false) => {
      if (isInitialLoad) setIsLoading(true);

      const chartPromise = fetchHourlyChartData(filters);
      const filterOptionsPromise =
        isInitialLoad || Object.keys(filters).length === 0
          ? fetchFilterOptions(filters)
          : Promise.resolve();

      try {
        const queryParams = {
          ...buildFilterQueryParams(filters),
          page,
          limit: pagination.limit,
        };
        const mainDataPromise = axios.get(
          `${API_BASE_URL}/api/ironing/dashboard-data`,
          { params: queryParams }
        );

        const [mainDataResponse] = await Promise.all([
          mainDataPromise,
          chartPromise,
          filterOptionsPromise,
        ]);

        const data = mainDataResponse.data;
        setSummaryData(
          data.overallSummary || {
            totalIroningQty: 0,
            totalBundles: 0,
            totalRecheckIroningQty: 0,
          }
        );
        setPreviousDaySummary(
          data.previousDaySummary || {
            totalIroningQty: 0,
            totalBundles: 0,
            totalRecheckIroningQty: 0,
          }
        );
        setInspectorSummary(data.inspectorSummaryData || []);
        setDetailedRecords(data.detailedRecords || []);
        setPagination(
          data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalRecords: 0,
            limit: 20,
          }
        );

        const displayableFilters = {};
        if (filters.startDate)
          displayableFilters["Start Date"] = normalizeDateStringForAPI_Ironing(
            filters.startDate
          );
        if (filters.endDate)
          displayableFilters["End Date"] = normalizeDateStringForAPI_Ironing(
            filters.endDate
          );
        if (filters.moNo) displayableFilters["MO No"] = filters.moNo.label;
        if (filters.packageNo)
          displayableFilters["Package No"] = filters.packageNo.label;
        if (filters.custStyle)
          displayableFilters["Cust. Style"] = filters.custStyle.label;
        if (filters.buyer) displayableFilters["Buyer"] = filters.buyer.label;
        if (filters.color) displayableFilters["Color"] = filters.color.label;
        if (filters.size) displayableFilters["Size"] = filters.size.label;
        if (filters.qcId)
          displayableFilters["QC ID (Ironing)"] = filters.qcId.label;
        setAppliedFiltersForDisplay(displayableFilters);
      } catch (error) {
        console.error("Error fetching Ironing dashboard data:", error);
        setSummaryData({
          totalIroningQty: 0,
          totalBundles: 0,
          totalRecheckIroningQty: 0,
        });
        setPreviousDaySummary({
          totalIroningQty: 0,
          totalBundles: 0,
          totalRecheckIroningQty: 0,
        });
        setInspectorSummary([]);
        setDetailedRecords([]);
      } finally {
        if (isInitialLoad) setIsLoading(false);
      }
    },
    [
      pagination.limit,
      buildFilterQueryParams,
      fetchHourlyChartData,
      fetchFilterOptions,
    ]
  );

  useEffect(() => {
    fetchData(currentFiltersRef.current, 1, true);
    const intervalId = setInterval(() => {
      fetchData(currentFiltersRef.current, pagination.currentPage, false);
    }, 30000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => {
    fetchData(currentFiltersRef.current, 1, false);
    fetchFilterOptions(currentFiltersRef.current);
  };

  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setMoNo(null);
    setPackageNo(null);
    setCustStyle(null);
    setBuyer(null);
    setColor(null);
    setSize(null);
    setQcId(null);
    const emptyFilters = {};
    currentFiltersRef.current = emptyFilters;
    setAppliedFiltersForDisplay({});
    fetchData(emptyFilters, 1, false);
    fetchFilterOptions(emptyFilters);
  };

  const handlePageChange = (newPage) => {
    fetchData(currentFiltersRef.current, newPage, false);
  };

  const handleColToggle = (colName) =>
    setVisibleCols((prev) => ({ ...prev, [colName]: !prev[colName] }));
  const handleAddAllCols = () =>
    setVisibleCols({
      totalIroningQty: true,
      totalBundles: true,
      totalRecheckIroningQty: true,
    });
  const handleClearSomeCols = () =>
    setVisibleCols((prev) => ({
      ...prev,
      totalBundles: false,
      totalRecheckIroningQty: false,
    }));

  const inspectorTableData = useMemo(() => {
    const dataByInspector = {};
    const allDatesSet = new Set();
    inspectorSummary.forEach((item) => {
      if (!dataByInspector[item.emp_id]) {
        dataByInspector[item.emp_id] = {
          emp_id: item.emp_id,
          eng_name: item.eng_name || "N/A",
          dates: {},
        };
      }
      const displayDate = formatDisplayDate_Ironing(item.date);
      allDatesSet.add(displayDate);
      dataByInspector[item.emp_id].dates[displayDate] = {
        totalIroningQty: item.dailyIroningQty,
        totalBundles: item.dailyBundles,
        totalRecheckIroningQty: item.dailyRecheckIroningQty,
      };
    });
    const sortedDates = Array.from(allDatesSet).sort(
      (a, b) => new Date(a) - new Date(b)
    );
    return { data: Object.values(dataByInspector), sortedDates };
  }, [inspectorSummary]);

  const selectStyles = {
    control: (p) => ({
      ...p,
      minHeight: "38px",
      height: "38px",
      borderColor: "#D1D5DB",
      borderRadius: "0.375rem",
      boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    }),
    valueContainer: (p) => ({ ...p, height: "38px", padding: "0 8px" }),
    input: (p) => ({ ...p, margin: "0px" }),
    indicatorSeparator: () => ({ display: "none" }),
    indicatorsContainer: (p) => ({ ...p, height: "38px" }),
    menu: (p) => ({ ...p, zIndex: 9999 }),
  };
  const datePickerClass =
    "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm h-[38px]";

  const filterFields = [
    {
      label: "Start Date",
      state: startDate,
      setState: setStartDate,
      type: "date",
    },
    {
      label: "End Date",
      state: endDate,
      setState: setEndDate,
      type: "date",
      minDate: startDate,
    },
    {
      label: "MO No",
      state: moNo,
      setState: setMoNo,
      options: filterOptions.moNos,
      type: "select",
      placeholder: "Select MO...",
    },
    {
      label: "Package No",
      state: packageNo,
      setState: setPackageNo,
      options: filterOptions.packageNos,
      type: "select",
      placeholder: "Select Pkg...",
    },
    {
      label: "Cust. Style",
      state: custStyle,
      setState: setCustStyle,
      options: filterOptions.custStyles,
      type: "select",
      placeholder: "Select Style...",
    },
    {
      label: "Buyer",
      state: buyer,
      setState: setBuyer,
      options: filterOptions.buyers,
      type: "select",
      placeholder: "Select Buyer...",
    },
    {
      label: "Color",
      state: color,
      setState: setColor,
      options: filterOptions.colors,
      type: "select",
      placeholder: "Select Color...",
    },
    {
      label: "Size",
      state: size,
      setState: setSize,
      options: filterOptions.sizes,
      type: "select",
      placeholder: "Select Size...",
    },
    {
      label: "QC ID (Ironing)",
      state: qcId,
      setState: setQcId,
      options: filterOptions.qcIds,
      type: "select",
      placeholder: "Select QC...",
    },
  ];

  const formatHourLabel_Ironing = (hourStr) => {
    if (!hourStr) return "";
    try {
      const date = parse(hourStr, "HH", new Date());
      return formatDateFn(date, "h aa");
    } catch {
      return hourStr;
    }
  };

  const hourlyBarChartOptions_Ironing = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Hourly ${
          chartDataType === "ironing" ? "Ironing Qty" : "Bundle Count"
        }`,
      },
      datalabels: {
        anchor: "end",
        align: "end",
        formatter: (value, context) => {
          const item = hourlyChartData[context.dataIndex];
          const change =
            chartDataType === "ironing"
              ? parseFloat(item.ironingQtyChange)
              : parseFloat(item.bundleQtyChange);
          let changeStr = "";
          if (change > 0) changeStr = ` ▲${change.toFixed(1)}%`;
          else if (change < 0) changeStr = ` ▼${Math.abs(change).toFixed(1)}%`;
          return `${value.toLocaleString()}${changeStr}`;
        },
        color: (context) => {
          const item = hourlyChartData[context.dataIndex];
          const change =
            chartDataType === "ironing"
              ? parseFloat(item.ironingQtyChange)
              : parseFloat(item.bundleQtyChange);
          return change < 0 ? "#EF4444" : change > 0 ? "#22C55E" : "#6B7280";
        },
        font: { size: 10 },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Hour of Day" },
        grid: { display: false },
      },
      y: {
        title: { display: true, text: "Total Quantity" },
        beginAtZero: true,
      },
    },
  };

  const preparedHourlyChartData_Ironing = {
    labels: hourlyChartData.map((d) => formatHourLabel_Ironing(d.hour)),
    datasets: [
      {
        label:
          chartDataType === "ironing" ? "Total Ironing Qty" : "Total Bundles",
        data: hourlyChartData.map((d) =>
          chartDataType === "ironing" ? d.totalIroningQty : d.totalBundles
        ),
        backgroundColor:
          chartDataType === "ironing"
            ? "rgba(236, 72, 153, 0.6)"
            : "rgba(168, 85, 247, 0.6)",
        borderColor:
          chartDataType === "ironing"
            ? "rgba(236, 72, 153, 1)"
            : "rgba(168, 85, 247, 1)",
        borderWidth: 1,
      },
    ],
  };

  if (isLoading && !detailedRecords.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner_Ironing />
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4 bg-gray-50 min-h-screen">
      <header className="mb-4 md:mb-6">
        {" "}
        <h1 className="text-lg md:text-2xl font-semibold text-gray-800 text-center">
          {" "}
          Yorkmars (Cambodia) Garment MFG Co., LTD | Ironing Live Dashboard{" "}
        </h1>{" "}
      </header>

      <button
        onClick={() => setIsFilterVisible(!isFilterVisible)}
        className="mb-4 px-3 py-1.5 md:px-4 md:py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 flex items-center text-xs md:text-sm shadow-md"
      >
        {" "}
        <FilterIcon size={16} className="mr-1 md:mr-2" />{" "}
        {isFilterVisible ? "Hide Filters" : "Show Filters"}{" "}
        {isFilterVisible ? (
          <ChevronDown size={16} className="ml-1" />
        ) : (
          <ChevronRight size={16} className="ml-1" />
        )}{" "}
      </button>

      {isFilterVisible && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="flex flex-nowrap gap-x-3 md:gap-x-4 overflow-x-auto pb-2 custom-scrollbar">
            {" "}
            {filterFields.map((f) => (
              <div key={f.label} className="flex-shrink-0 w-36 md:w-48 lg:w-56">
                {" "}
                <label
                  className="block text-xs font-medium text-gray-700 mb-1 truncate"
                  title={f.label}
                >
                  {f.label}
                </label>{" "}
                {f.type === "date" ? (
                  <DatePicker
                    selected={f.state}
                    onChange={f.setState}
                    dateFormat="MM/dd/yyyy"
                    className={datePickerClass}
                    placeholderText="MM/DD/YYYY"
                    minDate={f.minDate}
                    isClearable
                    wrapperClassName="w-full"
                  />
                ) : (
                  <Select
                    options={f.options}
                    value={f.state}
                    onChange={f.setState}
                    placeholder={f.placeholder || `Select...`}
                    isClearable
                    isLoading={isLoadingFilters}
                    styles={selectStyles}
                    menuPosition="fixed"
                    classNamePrefix="react-select"
                  />
                )}{" "}
              </div>
            ))}{" "}
          </div>{" "}
          <div className="mt-3 md:mt-4 flex flex-col sm:flex-row justify-end items-center space-y-2 sm:space-y-0 sm:space-x-2 md:space-x-3">
            {" "}
            <button
              onClick={handleApplyFilters}
              disabled={isLoadingFilters}
              className="w-full sm:w-auto px-4 py-1.5 md:px-6 md:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center text-xs md:text-sm shadow-md disabled:opacity-60"
            >
              {" "}
              <SearchIcon size={16} className="mr-1 md:mr-2" /> Apply{" "}
            </button>{" "}
            <button
              onClick={handleResetFilters}
              disabled={isLoadingFilters}
              className="w-full sm:w-auto p-2 md:p-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 shadow-md disabled:opacity-60"
              title="Clear Filters"
            >
              {" "}
              <RotateCcw size={16} />{" "}
            </button>{" "}
          </div>
        </div>
      )}

      {isLoading && detailedRecords.length > 0 && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <LoadingSpinner_Ironing />
        </div>
      )}

      {(!isLoading || detailedRecords.length > 0) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 mb-4 md:mb-8">
            <SummaryStatCard_Ironing
              title="Total Ironing Qty"
              currentValue={summaryData.totalIroningQty}
              previousDayValue={previousDaySummary.totalIroningQty}
              icon={TrendingUp}
            />
            <SummaryStatCard_Ironing
              title="Total Bundles"
              currentValue={summaryData.totalBundles}
              previousDayValue={previousDaySummary.totalBundles}
              icon={TrendingUp}
            />
            <SummaryStatCard_Ironing
              title="Total Re-Check Ironing Qty"
              currentValue={summaryData.totalRecheckIroningQty}
              previousDayValue={previousDaySummary.totalRecheckIroningQty}
              icon={TrendingDown}
            />
          </div>

          <div className="mb-4 md:mb-8 p-3 md:p-4 bg-white shadow-xl rounded-xl border border-gray-200">
            <h2 className="text-base md:text-xl font-semibold text-gray-700 mb-2">
              Ironing Qty Summary by Inspector
            </h2>
            {Object.keys(appliedFiltersForDisplay).length > 0 && (
              <div className="mb-2 md:mb-3 text-[10px] md:text-xs text-gray-500 italic">
                {" "}
                Filters:{" "}
                {Object.entries(appliedFiltersForDisplay)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ")}{" "}
              </div>
            )}
            <div className="mb-3 md:mb-4 flex flex-wrap gap-1 md:gap-2 items-center">
              <button
                onClick={handleAddAllCols}
                className="px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs text-white rounded-md shadow-sm bg-blue-500 hover:bg-blue-600"
              >
                Add All
              </button>
              <button
                onClick={handleClearSomeCols}
                className="px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs text-white rounded-md shadow-sm bg-orange-500 hover:bg-orange-600"
              >
                Clear Some
              </button>
              <div className="flex gap-1 md:gap-2 ml-auto">
                <InspectorColumnToggleButton_Ironing
                  label="Ironing Qty"
                  isActive={visibleCols.totalIroningQty}
                  onClick={() => handleColToggle("totalIroningQty")}
                />
                <InspectorColumnToggleButton_Ironing
                  label="Bundles"
                  isActive={visibleCols.totalBundles}
                  onClick={() => handleColToggle("totalBundles")}
                />
                <InspectorColumnToggleButton_Ironing
                  label="Re-Check"
                  isActive={visibleCols.totalRecheckIroningQty}
                  onClick={() => handleColToggle("totalRecheckIroningQty")}
                />
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar text-[11px] md:text-sm">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-md overflow-hidden">
                <thead className="bg-gray-100">
                  <tr className="text-gray-600 uppercase text-xs tracking-wider">
                    <th className="px-2 py-2 md:px-3 md:py-3 text-left font-semibold border-r sticky left-0 bg-gray-100 z-20 min-w-[80px] md:min-w-[100px]">
                      Emp ID
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-3 text-left font-semibold border-r sticky left-[calc(var(--emp-id-width,80px)+1px)] md:left-[calc(var(--emp-id-width-md,100px)+1px)] bg-gray-100 z-20 min-w-[120px] md:min-w-[150px]">
                      Emp Name
                    </th>
                    {inspectorTableData.sortedDates.map((date) => (
                      <th
                        key={date}
                        colSpan={
                          Object.values(visibleCols).filter((v) => v).length ||
                          1
                        }
                        className="px-1 py-2 md:px-1 md:py-3 text-center font-semibold border-r min-w-[120px] md:min-w-[150px]"
                      >
                        {date}
                        {Object.values(visibleCols).filter((v) => v).length >
                          0 && (
                          <div className="flex justify-around mt-0.5 md:mt-1 text-[9px] md:text-[10px] font-normal normal-case text-gray-500">
                            {visibleCols.totalIroningQty && (
                              <span className="w-1/3 text-center px-0.5">
                                Iron
                              </span>
                            )}
                            {visibleCols.totalBundles && (
                              <span className="w-1/3 text-center px-0.5">
                                Bundle
                              </span>
                            )}
                            {visibleCols.totalRecheckIroningQty && (
                              <span className="w-1/3 text-center px-0.5">
                                Re-Chk
                              </span>
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inspectorTableData.data.length > 0 ? (
                    inspectorTableData.data.map((inspector) => (
                      <tr
                        key={inspector.emp_id}
                        className="hover:bg-pink-50 transition-colors duration-150"
                      >
                        <td
                          className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r sticky left-0 bg-white hover:bg-pink-50 z-10"
                          style={{
                            width: "var(--emp-id-width, 80px)",
                            minWidth: "var(--emp-id-width, 80px)",
                          }}
                        >
                          {inspector.emp_id}
                        </td>
                        <td
                          className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r sticky left-[calc(var(--emp-id-width,80px)+1px)] md:left-[calc(var(--emp-id-width-md,100px)+1px)] bg-white hover:bg-pink-50 z-10"
                          style={{
                            width: "var(--emp-name-width, 120px)",
                            minWidth: "var(--emp-name-width, 120px)",
                          }}
                        >
                          {inspector.eng_name}
                        </td>
                        {inspectorTableData.sortedDates.map((date) => {
                          const dayData = inspector.dates[date] || {};
                          const hasVisibleCols = Object.values(
                            visibleCols
                          ).some((v) => v);
                          return hasVisibleCols ? (
                            <React.Fragment key={`${inspector.emp_id}-${date}`}>
                              {visibleCols.totalIroningQty && (
                                <td className="px-1 py-1.5 md:px-1 md:py-2 text-center border-r">
                                  {dayData.totalIroningQty || 0}
                                </td>
                              )}
                              {visibleCols.totalBundles && (
                                <td className="px-1 py-1.5 md:px-1 md:py-2 text-center border-r">
                                  {dayData.totalBundles || 0}
                                </td>
                              )}
                              {visibleCols.totalRecheckIroningQty && (
                                <td className="px-1 py-1.5 md:px-1 md:py-2 text-center border-r">
                                  {dayData.totalRecheckIroningQty || 0}
                                </td>
                              )}
                            </React.Fragment>
                          ) : (
                            <td
                              key={`${inspector.emp_id}-${date}-empty`}
                              className="px-1 py-1.5 md:px-1 md:py-2 text-center text-gray-400 border-r"
                            >
                              -
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={
                          2 +
                          inspectorTableData.sortedDates.length *
                            (Object.values(visibleCols).filter((v) => v)
                              .length || 1)
                        }
                        className="text-center py-4 text-gray-500"
                      >
                        No summary data available for selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4 md:mb-8 p-3 md:p-4 bg-white shadow-xl rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base md:text-xl font-semibold text-gray-700">
                Hourly Performance (Ironing)
              </h2>
              <div className="flex space-x-1">
                <button
                  onClick={() => setChartDataType("ironing")}
                  className={`px-2 py-1 text-xs rounded-md ${
                    chartDataType === "ironing"
                      ? "bg-pink-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Ironing Qty
                </button>
                <button
                  onClick={() => setChartDataType("bundle")}
                  className={`px-2 py-1 text-xs rounded-md ${
                    chartDataType === "bundle"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Bundle Count
                </button>
              </div>
            </div>
            {isLoadingHourlyChart ? (
              <LoadingSpinner_Ironing />
            ) : hourlyChartData.length > 0 ? (
              <div className="h-[300px] md:h-[400px]">
                <Bar
                  options={hourlyBarChartOptions_Ironing}
                  data={preparedHourlyChartData_Ironing}
                />
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No hourly Ironing data available for selected filters.
              </p>
            )}
          </div>

          <div className="p-3 md:p-4 bg-white shadow-xl rounded-xl border border-gray-200">
            <h2 className="text-base md:text-xl font-semibold text-gray-700 mb-3 md:mb-4">
              Detailed Ironing Records
            </h2>
            <div className="overflow-x-auto max-h-[500px] md:max-h-[600px] custom-scrollbar text-[11px] md:text-sm">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-md overflow-hidden">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr className="text-gray-600 uppercase text-xs tracking-wider">
                    {[
                      "Insp. Date",
                      "Emp ID",
                      "Emp Name",
                      "Dept.",
                      "MO No",
                      "Pkg No",
                      "Cust. Style",
                      "Buyer",
                      "Color",
                      "Size",
                      "Insp. Time",
                      "Iron Qty",
                      "Bundles",
                      "Re-Chk Qty",
                    ].map((h, idx) => (
                      <th
                        key={h}
                        className={`px-2 py-2 md:px-3 md:py-3 text-left font-semibold border-r whitespace-nowrap ${
                          idx === 0
                            ? "sticky left-0 bg-gray-100 z-20 min-w-[90px] md:min-w-[100px]"
                            : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {detailedRecords.length > 0 ? (
                    detailedRecords.map((record, index) => (
                      <tr
                        key={index}
                        className="hover:bg-pink-50 transition-colors duration-150"
                      >
                        <td className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r sticky left-0 bg-white hover:bg-pink-50 z-0">
                          {formatDisplayDate_Ironing(
                            record.ironing_updated_date
                          )}
                        </td>
                        <td className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r">
                          {record.emp_id_ironing}
                        </td>
                        <td className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r">
                          {record.eng_name_ironing || "N/A"}
                        </td>
                        <td className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r">
                          {record.dept_name_ironing || "N/A"}
                        </td>
                        <td className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r">
                          {record.selectedMono || "N/A"}
                        </td>
                        <td className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r">
                          {record.package_no}
                        </td>
                        <td className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r">
                          {record.custStyle || "N/A"}
                        </td>
                        <td className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r">
                          {record.buyer || "N/A"}
                        </td>
                        <td className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r">
                          {record.color || "N/A"}
                        </td>
                        <td className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r">
                          {record.size || "N/A"}
                        </td>
                        <td className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r">
                          {record.ironing_update_time || "N/A"}
                        </td>
                        <td className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r text-center">
                          {record.ironingQty || 0}
                        </td>
                        <td className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r text-center">
                          {1}
                        </td>
                        <td className="px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap border-r text-center">
                          {record.recheckIroningQty || 0}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={14}
                        className="text-center py-4 text-gray-500"
                      >
                        No detailed Ironing records available for selected
                        filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="mt-3 md:mt-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                {" "}
                <span className="text-[10px] sm:text-xs text-gray-700">
                  {" "}
                  Page {pagination.currentPage} of {pagination.totalPages}{" "}
                  (Total: {pagination.totalRecords} records){" "}
                </span>{" "}
                <div className="flex space-x-1">
                  {" "}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.currentPage === 1}
                    className="px-2 py-1 md:px-2.5 md:py-1.5 border border-gray-300 text-[10px] md:text-xs rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>{" "}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-2 py-1 md:px-2.5 md:py-1.5 border border-gray-300 text-[10px] md:text-xs rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>{" "}
                  <span className="px-2 py-1 md:px-2.5 md:py-1.5 text-[10px] md:text-xs">
                    Page {pagination.currentPage}
                  </span>{" "}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-2 py-1 md:px-2.5 md:py-1.5 border border-gray-300 text-[10px] md:text-xs rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>{" "}
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-2 py-1 md:px-2.5 md:py-1.5 border border-gray-300 text-[10px] md:text-xs rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>{" "}
                </div>{" "}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default IroningLive;
