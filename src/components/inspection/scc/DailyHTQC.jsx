import axios from "axios";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Minus,
  Plus,
  Search,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../../../../config";
import { useAuth } from "../../authentication/AuthContext";

// --- Constants and Helpers ---
const inputBaseClasses =
  "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm";
const inputFocusClasses = "focus:ring-indigo-500 focus:border-indigo-500";
const inputFieldClasses = `${inputBaseClasses} ${inputFocusClasses}`;
const inputFieldReadonlyClasses = `${inputBaseClasses} bg-gray-100 cursor-not-allowed`;
const labelClasses = "block text-sm font-medium text-gray-700 mb-0.5";

const TIME_SLOTS_CONFIG = [
  { key: "07:00", label: "07:00", inspectionNo: 1 },
  { key: "09:00", label: "09:00", inspectionNo: 2 },
  { key: "12:00", label: "12:00", inspectionNo: 3 },
  { key: "14:00", label: "02:00 PM", inspectionNo: 4 },
  { key: "16:00", label: "04:00 PM", inspectionNo: 5 },
  { key: "18:00", label: "06:00 PM", inspectionNo: 6 },
];

const TEMP_TOLERANCE = 5;

const initialSlotData = {
  temp_req: null,
  temp_actual: null,
  temp_status: "pending",
  temp_isUserModified: false,
  temp_isNA: false,
  time_req: null,
  time_actual: null,
  time_status: "pending",
  time_isUserModified: false,
  time_isNA: false,
  pressure_req: null,
  pressure_actual: null,
  pressure_status: "pending",
  pressure_isUserModified: false,
  pressure_isNA: false,
};

const DailyHTQC = ({
  formData,
  onFormDataChange,
  onFormSubmit,
  isSubmitting,
  formType,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [localFormData, setLocalFormData] = useState({
    // For detailed cell interactions
    ...formData,
    slotsDetailed: TIME_SLOTS_CONFIG.reduce((acc, slot) => {
      acc[slot.key] = {
        ...initialSlotData,
        inspectionNo: slot.inspectionNo,
        timeSlotKey: slot.key,
      };
      return acc;
    }, {}),
  });

  const [moNoSearch, setMoNoSearch] = useState(formData.moNo || "");
  const [moNoOptions, setMoNoOptions] = useState([]);
  const [showMoNoDropdown, setShowMoNoDropdown] = useState(false);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableMachineRecords, setAvailableMachineRecords] = useState([]); // For Date+MachineNo lookup

  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [firstOutputSpecsLoading, setFirstOutputSpecsLoading] = useState(false);
  const [existingQCRecordLoading, setExistingQCRecordLoading] = useState(false);
  const [recordStatusMessage, setRecordStatusMessage] = useState("");

  const [currentActiveSlotKey, setCurrentActiveSlotKey] = useState(null); // e.g. "07:00"

  const moNoInputRef = useRef(null);
  const moNoDropdownRef = useRef(null);

  // Update localFormData when formData prop changes (e.g., from parent reset)
  useEffect(() => {
    setMoNoSearch(formData.moNo || "");
    const newSlotsDetailed = { ...localFormData.slotsDetailed };
    if (formData.inspections && formData.inspections.length > 0) {
      formData.inspections.forEach((insp) => {
        if (newSlotsDetailed[insp.timeSlotKey]) {
          newSlotsDetailed[insp.timeSlotKey] = {
            ...newSlotsDetailed[insp.timeSlotKey],
            ...insp,
          };
        }
      });
    } else {
      // Reset if formData.inspections is empty
      TIME_SLOTS_CONFIG.forEach((slot) => {
        newSlotsDetailed[slot.key] = {
          ...initialSlotData,
          inspectionNo: slot.inspectionNo,
          timeSlotKey: slot.key,
        };
      });
    }

    setLocalFormData((prev) => ({
      ...prev,
      ...formData,
      slotsDetailed: newSlotsDetailed,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const updateParentFormData = useCallback(
    (updatedData) => {
      const inspectionsArray = Object.values(updatedData.slotsDetailed)
        .filter(
          (slot) =>
            slot.temp_isUserModified ||
            slot.time_isUserModified ||
            slot.pressure_isUserModified ||
            slot.temp_isNA ||
            slot.time_isNA ||
            slot.pressure_isNA ||
            slot.temp_actual !== null ||
            slot.time_actual !== null ||
            slot.pressure_actual !== null
        ) // Only include slots with some data or explicit N/A
        .map((slot) => ({
          inspectionNo: slot.inspectionNo,
          timeSlotKey: slot.timeSlotKey,
          temp_req: slot.temp_req,
          temp_actual: slot.temp_actual,
          temp_status: slot.temp_status,
          temp_isUserModified: slot.temp_isUserModified,
          temp_isNA: slot.temp_isNA,
          time_req: slot.time_req,
          time_actual: slot.time_actual,
          time_status: slot.time_status,
          time_isUserModified: slot.time_isUserModified,
          time_isNA: slot.time_isNA,
          pressure_req: slot.pressure_req,
          pressure_actual: slot.pressure_actual,
          pressure_status: slot.pressure_status,
          pressure_isUserModified: slot.pressure_isUserModified,
          pressure_isNA: slot.pressure_isNA,
          // inspectionTimestamp will be set by backend
        }));

      onFormDataChange({
        ...formData, // Preserve parent's other keys like _id
        ...updatedData, // Update common fields
        inspections: inspectionsArray, // Pass structured inspections
      });
    },
    [onFormDataChange, formData]
  );

  const handleLocalInputChange = (e) => {
    const { name, value } = e.target;
    const newLocalData = { ...localFormData, [name]: value };
    setLocalFormData(newLocalData);
    updateParentFormData(newLocalData); // Propagate to parent
  };

  const handleDateChange = (date) => {
    const newLocalData = {
      ...localFormData,
      inspectionDate: date,
      moNo: "",
      color: "",
      buyer: "",
      buyerStyle: "",
      _id: null,
      baseReqTemp: null,
      baseReqTime: null,
      baseReqPressure: null,
      stretchTestResult: "Pending",
      washingTestResult: "Pending",
      isStretchWashingTestDone: false,
      inspections: [],
    };
    TIME_SLOTS_CONFIG.forEach((slot) => {
      newLocalData.slotsDetailed[slot.key] = {
        ...initialSlotData,
        inspectionNo: slot.inspectionNo,
        timeSlotKey: slot.key,
      };
    });
    setLocalFormData(newLocalData);
    setMoNoSearch("");
    setAvailableColors([]);
    setAvailableMachineRecords([]);
    setCurrentActiveSlotKey(null);
    setRecordStatusMessage("");
    updateParentFormData(newLocalData);
  };

  const handleMachineNoChange = (e) => {
    const machineNo = e.target.value;
    const newLocalData = {
      ...localFormData,
      machineNo,
      moNo: "",
      color: "",
      buyer: "",
      buyerStyle: "",
      _id: null,
      baseReqTemp: null,
      baseReqTime: null,
      baseReqPressure: null,
      stretchTestResult: "Pending",
      washingTestResult: "Pending",
      isStretchWashingTestDone: false,
      inspections: [],
    };
    TIME_SLOTS_CONFIG.forEach((slot) => {
      newLocalData.slotsDetailed[slot.key] = {
        ...initialSlotData,
        inspectionNo: slot.inspectionNo,
        timeSlotKey: slot.key,
      };
    });
    setLocalFormData(newLocalData);
    setMoNoSearch("");
    setAvailableColors([]);
    setAvailableMachineRecords([]);
    setCurrentActiveSlotKey(null);
    setRecordStatusMessage("");
    updateParentFormData(newLocalData);
  };

  // Fetch MO Numbers
  const fetchMoNumbers = useCallback(async () => {
    if (moNoSearch.trim() === "") {
      setMoNoOptions([]);
      setShowMoNoDropdown(false);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/search-mono`, {
        params: { term: moNoSearch },
      });
      setMoNoOptions(response.data || []);
      setShowMoNoDropdown(response.data.length > 0);
    } catch (error) {
      console.error(
        t("scc.errorFetchingMoLog", "Error fetching MO numbers:"),
        error
      );
      setMoNoOptions([]);
      setShowMoNoDropdown(false);
    }
  }, [moNoSearch, t]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMoNumbers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [moNoSearch, fetchMoNumbers]);

  const handleMoSelect = (selectedMo) => {
    setMoNoSearch(selectedMo);
    setShowMoNoDropdown(false);
    const newLocalData = {
      ...localFormData,
      moNo: selectedMo,
      color: "",
      buyer: "",
      buyerStyle: "",
      _id: null,
      baseReqTemp: null,
      baseReqTime: null,
      baseReqPressure: null,
      stretchTestResult: "Pending",
      washingTestResult: "Pending",
      isStretchWashingTestDone: false,
      inspections: [],
    };
    TIME_SLOTS_CONFIG.forEach((slot) => {
      newLocalData.slotsDetailed[slot.key] = {
        ...initialSlotData,
        inspectionNo: slot.inspectionNo,
        timeSlotKey: slot.key,
      };
    });
    setLocalFormData(newLocalData);
    setRecordStatusMessage("");
    updateParentFormData(newLocalData);
  };

  // Fetch Order Details (Buyer, Style, Colors)
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!localFormData.moNo) {
        setAvailableColors([]);
        const newLocalData = { ...localFormData, buyer: "", buyerStyle: "" };
        setLocalFormData(newLocalData);
        updateParentFormData(newLocalData);
        return;
      }
      setOrderDetailsLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/order-details/${localFormData.moNo}`
        );
        const details = response.data;
        const newLocalData = {
          ...localFormData,
          buyer: details.engName || "N/A",
          buyerStyle: details.custStyle || "N/A",
        };
        setLocalFormData(newLocalData);
        updateParentFormData(newLocalData);
        setAvailableColors(details.colors || []);
      } catch (error) {
        console.error(t("scc.errorFetchingOrderDetailsLog"), error);
        const newLocalData = { ...localFormData, buyer: "", buyerStyle: "" };
        setLocalFormData(newLocalData);
        updateParentFormData(newLocalData);
        setAvailableColors([]);
      } finally {
        setOrderDetailsLoading(false);
      }
    };
    if (localFormData.moNo) fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFormData.moNo, t]); // updateParentFormData removed due to potential loop

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    const newLocalData = {
      ...localFormData,
      color: newColor,
      _id: null,
      baseReqTemp: null,
      baseReqTime: null,
      baseReqPressure: null,
      stretchTestResult: "Pending",
      washingTestResult: "Pending",
      isStretchWashingTestDone: false,
      inspections: [],
    };
    TIME_SLOTS_CONFIG.forEach((slot) => {
      newLocalData.slotsDetailed[slot.key] = {
        ...initialSlotData,
        inspectionNo: slot.inspectionNo,
        timeSlotKey: slot.key,
      };
    });
    setLocalFormData(newLocalData);
    setRecordStatusMessage("");
    updateParentFormData(newLocalData);
  };

  // Fetch First Output Specs (HT) for Base Requirements
  const fetchBaseSpecs = useCallback(async () => {
    if (
      !localFormData.moNo ||
      !localFormData.color ||
      !localFormData.inspectionDate
    )
      return;
    setFirstOutputSpecsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/scc/get-first-output-specs`,
        {
          params: {
            moNo: localFormData.moNo,
            color: localFormData.color,
            inspectionDate: localFormData.inspectionDate.toISOString(),
          },
        }
      );
      let newBaseReqTemp = null,
        newBaseReqTime = null,
        newBaseReqPressure = null;
      if (response.data.data) {
        const specs = response.data.data;
        newBaseReqTemp = specs.tempC || null;
        newBaseReqTime = specs.timeSec || null;
        newBaseReqPressure = specs.pressure || null;
      }
      const newLocalData = {
        ...localFormData,
        baseReqTemp: newBaseReqTemp,
        baseReqTime: newBaseReqTime,
        baseReqPressure: newBaseReqPressure,
      };

      // Apply base specs to the active slot's req fields if not already modified by user
      const activeSlotKeyToUpdate =
        currentActiveSlotKey || TIME_SLOTS_CONFIG[0].key;
      if (
        activeSlotKeyToUpdate &&
        newLocalData.slotsDetailed[activeSlotKeyToUpdate]
      ) {
        const slot = newLocalData.slotsDetailed[activeSlotKeyToUpdate];
        if (!slot.temp_isUserModified && !slot.temp_isNA)
          slot.temp_req = newBaseReqTemp;
        if (!slot.time_isUserModified && !slot.time_isNA)
          slot.time_req = newBaseReqTime;
        if (!slot.pressure_isUserModified && !slot.pressure_isNA)
          slot.pressure_req = newBaseReqPressure;

        // also set actual to req for the current active slot IF actual is null (first time loading)
        if (slot.temp_actual === null && !slot.temp_isNA)
          slot.temp_actual = newBaseReqTemp;
        if (slot.time_actual === null && !slot.time_isNA)
          slot.time_actual = newBaseReqTime;
        if (slot.pressure_actual === null && !slot.pressure_isNA)
          slot.pressure_actual = newBaseReqPressure;

        // Recalculate status for active slot
        if (
          !slot.temp_isNA &&
          slot.temp_actual !== null &&
          newBaseReqTemp !== null
        ) {
          slot.temp_status =
            Math.abs(slot.temp_actual - newBaseReqTemp) <= TEMP_TOLERANCE
              ? "ok"
              : slot.temp_actual < newBaseReqTemp
              ? "low"
              : "high";
        } else if (slot.temp_isNA) {
          slot.temp_status = "na";
        } else {
          slot.temp_status = "pending";
        }
        // Similar for time and pressure if they have tolerance checks
      }
      setLocalFormData(newLocalData);
      updateParentFormData(newLocalData);
    } catch (error) {
      console.error(t("scc.errorFetchingHtSpecsLog"), error);
      const newLocalData = {
        ...localFormData,
        baseReqTemp: null,
        baseReqTime: null,
        baseReqPressure: null,
      };
      setLocalFormData(newLocalData);
      updateParentFormData(newLocalData);
    } finally {
      setFirstOutputSpecsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    localFormData.moNo,
    localFormData.color,
    localFormData.inspectionDate,
    t,
    currentActiveSlotKey,
  ]); // updateParentFormData removed

  // Fetch Existing Daily HTQC Record or list of MOs for Date/Machine
  const fetchDailyHTQCData = useCallback(async () => {
    if (!localFormData.inspectionDate || !localFormData.machineNo) return;

    setExistingQCRecordLoading(true);
    setRecordStatusMessage("");
    try {
      const params = {
        inspectionDate: localFormData.inspectionDate.toISOString(),
        machineNo: localFormData.machineNo,
      };
      if (localFormData.moNo && localFormData.color) {
        params.moNo = localFormData.moNo;
        params.color = localFormData.color;
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/scc/daily-htfu-test`,
        { params }
      );
      const { message, data } = response.data;
      let newLocalData = { ...localFormData };

      if (
        message === "DAILY_HTFU_RECORD_NOT_FOUND" ||
        (message === "NO_RECORDS_FOR_DATE_MACHINE" && !params.moNo)
      ) {
        setRecordStatusMessage(
          t("sccDailyHTQC.newRecord", "New QC record. Fetching base specs.")
        );
        newLocalData = {
          ...newLocalData,
          _id: null,
          stretchTestResult: "Pending",
          washingTestResult: "Pending",
          isStretchWashingTestDone: false,
          inspections: [],
        };
        TIME_SLOTS_CONFIG.forEach((slot) => {
          newLocalData.slotsDetailed[slot.key] = {
            ...initialSlotData,
            inspectionNo: slot.inspectionNo,
            timeSlotKey: slot.key,
          };
        });
        setCurrentActiveSlotKey(TIME_SLOTS_CONFIG[0].key); // Default to first slot
        if (params.moNo && params.color) await fetchBaseSpecs(); // Fetch specs if MO/Color known
      } else if (message === "RECORD_FOUND" && data) {
        setRecordStatusMessage(
          t("sccDailyHTQC.recordLoaded", "Existing QC record loaded.")
        );
        newLocalData = {
          ...newLocalData,
          _id: data._id,
          moNo: data.moNo,
          buyer: data.buyer,
          buyerStyle: data.buyerStyle,
          color: data.color,
          baseReqTemp: data.baseReqTemp,
          baseReqTime: data.baseReqTime,
          baseReqPressure: data.baseReqPressure,
          stretchTestResult: data.stretchTestResult || "Pending",
          washingTestResult: data.washingTestResult || "Pending",
          isStretchWashingTestDone: data.isStretchWashingTestDone || false,
          inspections: data.inspections || [],
        };
        // Populate slotsDetailed from data.inspections
        TIME_SLOTS_CONFIG.forEach((slotConf) => {
          const existingInsp = data.inspections.find(
            (i) => i.timeSlotKey === slotConf.key
          );
          if (existingInsp) {
            newLocalData.slotsDetailed[slotConf.key] = {
              ...initialSlotData,
              ...existingInsp,
            };
          } else {
            newLocalData.slotsDetailed[slotConf.key] = {
              ...initialSlotData,
              inspectionNo: slotConf.inspectionNo,
              timeSlotKey: slotConf.key,
            };
          }
        });
        // Determine active slot
        const lastSubmittedInspNo =
          data.inspections.length > 0
            ? Math.max(...data.inspections.map((i) => i.inspectionNo))
            : 0;
        const nextInspNo = lastSubmittedInspNo + 1;
        const activeSlot = TIME_SLOTS_CONFIG.find(
          (s) => s.inspectionNo === nextInspNo
        );
        setCurrentActiveSlotKey(activeSlot ? activeSlot.key : null); // Null if all slots done

        if (!data.baseReqTemp && localFormData.moNo && localFormData.color)
          await fetchBaseSpecs(); // Fetch if base specs missing
      } else if (message === "MULTIPLE_MO_COLOR_FOUND" && data.length > 0) {
        setRecordStatusMessage(
          t(
            "sccDailyHTQC.selectMoColor",
            "Multiple records found for this machine/date. Please select MO and Color."
          )
        );
        setAvailableMachineRecords(data); // data is array of {moNo, color, buyer, buyerStyle, docId}
        // User needs to pick one from a new dropdown or something
      }

      setLocalFormData(newLocalData);
      updateParentFormData(newLocalData);
    } catch (error) {
      console.error(t("sccDailyHTQC.errorLoadingRecord"), error);
      Swal.fire(
        t("scc.error"),
        t("sccDailyHTQC.errorLoadingRecordMsg"),
        "error"
      );
    } finally {
      setExistingQCRecordLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    localFormData.inspectionDate,
    localFormData.machineNo,
    localFormData.moNo,
    localFormData.color,
    t,
    fetchBaseSpecs,
  ]); // updateParentFormData removed

  useEffect(() => {
    if (localFormData.inspectionDate && localFormData.machineNo) {
      // If MO and Color are also set, fetch specific record and base specs
      if (localFormData.moNo && localFormData.color) {
        fetchDailyHTQCData(); // This will call fetchBaseSpecs if needed
      } else {
        // Only Date and Machine selected, fetch list of MOs or auto-fill if unique
        fetchDailyHTQCData();
      }
    }
  }, [
    localFormData.inspectionDate,
    localFormData.machineNo,
    localFormData.moNo,
    localFormData.color,
    fetchDailyHTQCData,
  ]);

  // Auto-set req values for the active slot when baseSpecs or activeSlotKey changes
  useEffect(() => {
    if (
      currentActiveSlotKey &&
      localFormData.slotsDetailed[currentActiveSlotKey]
    ) {
      const newSlotsDetailed = { ...localFormData.slotsDetailed };
      const slot = newSlotsDetailed[currentActiveSlotKey];

      if (
        !slot.temp_isUserModified &&
        !slot.temp_isNA &&
        localFormData.baseReqTemp !== null
      ) {
        slot.temp_req = localFormData.baseReqTemp;
        if (slot.temp_actual === null)
          slot.temp_actual = localFormData.baseReqTemp; // Default actual to req if not set
      }
      if (
        !slot.time_isUserModified &&
        !slot.time_isNA &&
        localFormData.baseReqTime !== null
      ) {
        slot.time_req = localFormData.baseReqTime;
        if (slot.time_actual === null)
          slot.time_actual = localFormData.baseReqTime;
      }
      if (
        !slot.pressure_isUserModified &&
        !slot.pressure_isNA &&
        localFormData.baseReqPressure !== null
      ) {
        slot.pressure_req = localFormData.baseReqPressure;
        if (slot.pressure_actual === null)
          slot.pressure_actual = localFormData.baseReqPressure;
      }

      // Re-calculate status for active slot after potential defaulting
      if (
        !slot.temp_isNA &&
        slot.temp_actual !== null &&
        slot.temp_req !== null
      ) {
        slot.temp_status =
          Math.abs(slot.temp_actual - slot.temp_req) <= TEMP_TOLERANCE
            ? "ok"
            : slot.temp_actual < slot.temp_req
            ? "low"
            : "high";
      } else if (slot.temp_isNA) {
        slot.temp_status = "na";
      }

      const newLocalData = {
        ...localFormData,
        slotsDetailed: newSlotsDetailed,
      };
      setLocalFormData(newLocalData);
      // DO NOT call updateParentFormData here to avoid loops, it will be called on user interaction or submit.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentActiveSlotKey,
    localFormData.baseReqTemp,
    localFormData.baseReqTime,
    localFormData.baseReqPressure,
  ]);

  const handleSlotValueChange = (slotKey, fieldType, action) => {
    // action can be 'increment', 'decrement'
    const newSlotsDetailed = { ...localFormData.slotsDetailed };
    const slot = newSlotsDetailed[slotKey];
    if (!slot) return;

    const field_actual = `${fieldType}_actual`;
    const field_req = `${fieldType}_req`;
    const field_status = `${fieldType}_status`;
    const field_isUserModified = `${fieldType}_isUserModified`;
    const field_isNA = `${fieldType}_isNA`;

    if (slot[field_isNA]) return; // Cannot change if N/A

    let currentValue =
      parseFloat(slot[field_actual]) || parseFloat(slot[field_req]) || 0;
    if (action === "increment") currentValue += 1;
    if (action === "decrement") currentValue -= 1;

    slot[field_actual] = currentValue;
    slot[field_isUserModified] = true;

    if (fieldType === "temp" && slot[field_req] !== null) {
      slot[field_status] =
        Math.abs(currentValue - slot[field_req]) <= TEMP_TOLERANCE
          ? "ok"
          : currentValue < slot[field_req]
          ? "low"
          : "high";
    } // Add similar for time/pressure if they have tolerance

    const newLocalData = { ...localFormData, slotsDetailed: newSlotsDetailed };
    setLocalFormData(newLocalData);
    updateParentFormData(newLocalData);
  };

  const toggleSlotNA = (slotKey, fieldType) => {
    const newSlotsDetailed = { ...localFormData.slotsDetailed };
    const slot = newSlotsDetailed[slotKey];
    if (!slot) return;

    const field_actual = `${fieldType}_actual`;
    const field_req = `${fieldType}_req`;
    const field_status = `${fieldType}_status`;
    const field_isNA = `${fieldType}_isNA`;
    const field_isUserModified = `${fieldType}_isUserModified`;

    slot[field_isNA] = !slot[field_isNA];
    if (slot[field_isNA]) {
      slot[field_actual] = null;
      slot[field_status] = "na";
    } else {
      // Restore: if user modified before NA, keep that. Else, default to req.
      slot[field_actual] =
        slot[field_isUserModified] && slot[field_actual] !== null
          ? slot[field_actual]
          : slot[field_req];
      slot[field_status] = "pending"; // Recalculate status or set to pending
      if (
        fieldType === "temp" &&
        slot[field_actual] !== null &&
        slot[field_req] !== null
      ) {
        slot[field_status] =
          Math.abs(slot[field_actual] - slot[field_req]) <= TEMP_TOLERANCE
            ? "ok"
            : slot[field_actual] < slot[field_req]
            ? "low"
            : "high";
      }
    }

    const newLocalData = { ...localFormData, slotsDetailed: newSlotsDetailed };
    setLocalFormData(newLocalData);
    updateParentFormData(newLocalData);
  };

  const handleTestResultChange = (field, value) => {
    const newLocalData = { ...localFormData, [field]: value };
    setLocalFormData(newLocalData);
    updateParentFormData(newLocalData);
  };

  const getCellBG = (status, isNA) => {
    if (isNA) return "bg-gray-200 text-gray-500";
    if (status === "ok") return "bg-green-100 text-green-700";
    if (status === "low" || status === "high") return "bg-red-100 text-red-700";
    return "bg-white";
  };

  const handleFormActualSubmit = () => {
    // Validation
    if (
      !localFormData.inspectionDate ||
      !localFormData.machineNo ||
      !localFormData.moNo ||
      !localFormData.color
    ) {
      Swal.fire(
        t("scc.validationErrorTitle"),
        t(
          "sccDailyHTQC.validation.fillBasic",
          "Please fill Date, Machine, MO No, and Color."
        ),
        "warning"
      );
      return;
    }
    if (!currentActiveSlotKey) {
      Swal.fire(
        t("scc.validationErrorTitle"),
        t(
          "sccDailyHTQC.validation.allSlotsDone",
          "All inspection slots seem complete or no active slot."
        ),
        "info"
      );
      return;
    }
    const activeSlotData = localFormData.slotsDetailed[currentActiveSlotKey];
    if (
      !activeSlotData ||
      (activeSlotData.temp_actual === null && !activeSlotData.temp_isNA)
    ) {
      // Add checks for time/pressure if mandatory
      Swal.fire(
        t("scc.validationErrorTitle"),
        t(
          "sccDailyHTQC.validation.fillActiveSlot",
          "Please fill data for the current active inspection time slot or mark as N/A."
        ),
        "warning"
      );
      return;
    }

    // Prepare payload for onFormSubmit (which is handleFormSubmit in SCCPage)
    const payloadForParent = {
      ...localFormData, // Includes _id, date, machine, mo, color, baseSpecs, stretch/wash results
      emp_id: user.emp_id,
      emp_kh_name: user.kh_name,
      emp_eng_name: user.eng_name,
      emp_dept_name: user.dept_name,
      emp_sect_name: user.sect_name,
      emp_job_title: user.job_title,
      currentInspection: {
        // Only the data for the slot being submitted
        inspectionNo: activeSlotData.inspectionNo,
        timeSlotKey: activeSlotData.timeSlotKey,
        temp_req: activeSlotData.temp_req,
        temp_actual: activeSlotData.temp_actual,
        temp_status: activeSlotData.temp_status,
        temp_isUserModified: activeSlotData.temp_isUserModified,
        temp_isNA: activeSlotData.temp_isNA,
        time_req: activeSlotData.time_req,
        time_actual: activeSlotData.time_actual,
        time_status: activeSlotData.time_status,
        time_isUserModified: activeSlotData.time_isUserModified,
        time_isNA: activeSlotData.time_isNA,
        pressure_req: activeSlotData.pressure_req,
        pressure_actual: activeSlotData.pressure_actual,
        pressure_status: activeSlotData.pressure_status,
        pressure_isUserModified: activeSlotData.pressure_isUserModified,
        pressure_isNA: activeSlotData.pressure_isNA,
      },
    };
    // Remove slotsDetailed as backend expects `currentInspection` object
    delete payloadForParent.slotsDetailed;

    onFormSubmit(formType, payloadForParent); // Pass formType and specific payload
  };

  const loading =
    orderDetailsLoading || firstOutputSpecsLoading || existingQCRecordLoading;

  // Render Table Row (Helper) - This makes the table rendering cleaner
  const renderTableRow = (label, fieldType, unit) => {
    const reqField =
      localFormData[
        `baseReq${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}`
      ];

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-3 py-2.5 border border-gray-300 font-medium text-gray-700 sticky left-0 bg-gray-100 z-10 min-w-[150px] w-[150px]">
          {label} {unit ? `(${unit})` : ""}
          <input
            type={fieldType === "pressure" ? "text" : "number"}
            value={
              localFormData.slotsDetailed[currentActiveSlotKey]?.[
                `${fieldType}_req`
              ] ??
              reqField ??
              ""
            }
            onChange={(e) => {
              const newSlotsDetailed = { ...localFormData.slotsDetailed };
              if (newSlotsDetailed[currentActiveSlotKey]) {
                newSlotsDetailed[currentActiveSlotKey][`${fieldType}_req`] =
                  fieldType === "pressure"
                    ? e.target.value
                    : parseFloat(e.target.value);
                newSlotsDetailed[currentActiveSlotKey][
                  `${fieldType}_isUserModified`
                ] = true; // Mark req as modified too
                // Optionally re-calculate status if actual value exists
                const actual =
                  newSlotsDetailed[currentActiveSlotKey][`${fieldType}_actual`];
                const newReq =
                  newSlotsDetailed[currentActiveSlotKey][`${fieldType}_req`];
                if (
                  fieldType === "temp" &&
                  actual !== null &&
                  newReq !== null &&
                  !newSlotsDetailed[currentActiveSlotKey][`${fieldType}_isNA`]
                ) {
                  newSlotsDetailed[currentActiveSlotKey][
                    `${fieldType}_status`
                  ] =
                    Math.abs(actual - newReq) <= TEMP_TOLERANCE
                      ? "ok"
                      : actual < newReq
                      ? "low"
                      : "high";
                }
                const newLocalData = {
                  ...localFormData,
                  slotsDetailed: newSlotsDetailed,
                };
                setLocalFormData(newLocalData);
                updateParentFormData(newLocalData);
              }
            }}
            className={`${inputFieldClasses} text-center text-xs p-1 w-20 inline-block ml-2`}
            disabled={
              !currentActiveSlotKey ||
              localFormData.slotsDetailed[currentActiveSlotKey]
                ?.inspectionNo !==
                TIME_SLOTS_CONFIG.find((s) => s.key === currentActiveSlotKey)
                  ?.inspectionNo
            }
          />
        </td>
        {TIME_SLOTS_CONFIG.map((slotConf) => {
          const slotData = localFormData.slotsDetailed[slotConf.key];
          const isCurrentActiveSubmitColumn =
            slotConf.key === currentActiveSlotKey;
          const isSubmittedColumn = localFormData.inspections.some(
            (insp) => insp.timeSlotKey === slotConf.key
          );
          const isDisabled = !isCurrentActiveSubmitColumn; // Disable if not the active column for submission

          return (
            <td
              key={slotConf.key}
              className={`px-1 py-2 border border-gray-300 text-center min-w-[130px] ${getCellBG(
                slotData?.[`${fieldType}_status`],
                slotData?.[`${fieldType}_isNA`]
              )}`}
            >
              {slotData?.[`${fieldType}_isNA`] ? (
                <span className="italic text-gray-500">
                  {t("scc.na", "N/A")}
                </span>
              ) : slotData?.[`${fieldType}_actual`] !== null ? (
                slotData?.[`${fieldType}_actual`]
              ) : (
                ""
              )}
              {!isDisabled && ( // Show controls only for the active, non-NA column
                <div className="mt-1 flex justify-center items-center space-x-1">
                  {!slotData?.[`${fieldType}_isNA`] &&
                    fieldType !== "pressure" && ( // No +/- for pressure string for now
                      <>
                        <button
                          onClick={() =>
                            handleSlotValueChange(
                              slotConf.key,
                              fieldType,
                              "decrement"
                            )
                          }
                          className="p-0.5 hover:bg-gray-300 rounded"
                        >
                          <Minus size={14} />
                        </button>
                        <button
                          onClick={() =>
                            handleSlotValueChange(
                              slotConf.key,
                              fieldType,
                              "increment"
                            )
                          }
                          className="p-0.5 hover:bg-gray-300 rounded"
                        >
                          <Plus size={14} />
                        </button>
                      </>
                    )}
                  {!slotData?.[`${fieldType}_isNA`] &&
                    fieldType === "pressure" && (
                      <input
                        type="text"
                        value={slotData?.[`${fieldType}_actual`] ?? ""}
                        onChange={(e) => {
                          const newSlotsDetailed = {
                            ...localFormData.slotsDetailed,
                          };
                          newSlotsDetailed[slotConf.key][
                            `${fieldType}_actual`
                          ] = e.target.value;
                          newSlotsDetailed[slotConf.key][
                            `${fieldType}_isUserModified`
                          ] = true;
                          const newLocalData = {
                            ...localFormData,
                            slotsDetailed: newSlotsDetailed,
                          };
                          setLocalFormData(newLocalData);
                          updateParentFormData(newLocalData);
                        }}
                        className={`${inputFieldClasses} text-center text-xs p-1 w-20 inline-block`}
                        disabled={isDisabled || slotData?.[`${fieldType}_isNA`]}
                      />
                    )}
                  <button
                    onClick={() => toggleSlotNA(slotConf.key, fieldType)}
                    className="p-0.5 hover:bg-gray-300 rounded"
                  >
                    {slotData?.[`${fieldType}_isNA`] ? (
                      <EyeOff size={14} className="text-gray-500" />
                    ) : (
                      <Eye size={14} />
                    )}
                  </button>
                </div>
              )}
              {/* Show check if submitted and OK, X if submitted and not OK */}
              {isSubmittedColumn &&
                !isCurrentActiveSubmitColumn &&
                slotData?.[`${fieldType}_status`] &&
                slotData?.[`${fieldType}_status`] !== "pending" &&
                !slotData?.[`${fieldType}_isNA`] &&
                (slotData?.[`${fieldType}_status`] === "ok" ? (
                  <CheckCircle
                    size={12}
                    className="inline-block ml-1 text-green-500"
                  />
                ) : (
                  <AlertTriangle
                    size={12}
                    className="inline-block ml-1 text-red-500"
                  />
                ))}
              {isSubmittedColumn &&
                !isCurrentActiveSubmitColumn &&
                slotData?.[`${fieldType}_isNA`] && (
                  <Info
                    size={12}
                    className="inline-block ml-1 text-blue-500"
                    title="Not Assessed"
                  />
                )}
            </td>
          );
        })}
      </tr>
    );
  };

  if (!user)
    return (
      <div className="p-6 text-center">
        {t("scc.loadingUser", "Loading user data...")}
      </div>
    );

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">
        {t(
          "sccDailyHTQC.title",
          "Daily Heat Transfer / Fusing Machine Test and Calibration Sheet"
        )}
      </h2>
      <p className="text-xs text-gray-600 -mt-3">
        {t(
          "sccDailyHTQC.subtitle",
          "Calibration test need to perform every 2 hours during production and verify by QA."
        )}
      </p>

      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <Loader2 className="animate-spin h-12 w-12 text-white" />
        </div>
      )}
      {recordStatusMessage && (
        <div
          className={`p-3 mb-3 rounded-md text-sm flex items-center shadow-sm border ${
            recordStatusMessage.includes("New")
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-green-50 text-green-700 border-green-200"
          }`}
        >
          <Info size={18} className="mr-2 flex-shrink-0" />{" "}
          {recordStatusMessage}
        </div>
      )}

      {/* Row 1: Date, Machine No, MO No Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 items-end">
        <div>
          <label htmlFor="htqcInspectionDate" className={labelClasses}>
            {t("scc.date")}
          </label>
          <DatePicker
            selected={
              localFormData.inspectionDate
                ? new Date(localFormData.inspectionDate)
                : new Date()
            }
            onChange={handleDateChange}
            dateFormat="MM/dd/yyyy"
            className={inputFieldClasses}
            required
          />
        </div>
        <div>
          <label htmlFor="htqcMachineNo" className={labelClasses}>
            {t("scc.machineNo")}
          </label>
          <select
            id="htqcMachineNo"
            name="machineNo"
            value={localFormData.machineNo}
            onChange={handleMachineNoChange}
            className={inputFieldClasses}
            required
          >
            <option value="">{t("scc.selectMachine")}</option>
            {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={String(num)}>
                {String(num)}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <label htmlFor="htqcMoNoSearch" className={labelClasses}>
            {t("scc.moNo")}
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="htqcMoNoSearch"
              value={moNoSearch}
              ref={moNoInputRef}
              onChange={(e) => {
                setMoNoSearch(e.target.value);
                setShowMoNoDropdown(true);
              }}
              onFocus={() => setShowMoNoDropdown(true)}
              placeholder={t("scc.searchMoNo")}
              className={`${inputFieldClasses} pl-10`}
              required
            />
            {showMoNoDropdown && moNoOptions.length > 0 && (
              <ul
                ref={moNoDropdownRef}
                className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
              >
                {moNoOptions.map((mo) => (
                  <li
                    key={mo}
                    onClick={() => handleMoSelect(mo)}
                    className="text-gray-900 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-500 hover:text-white"
                  >
                    {mo}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {availableMachineRecords.length > 0 && !localFormData.moNo && (
            <div className="mt-1">
              <label
                htmlFor="selectExistingMo"
                className={`${labelClasses} text-xs`}
              >
                {t(
                  "sccDailyHTQC.selectExisting",
                  "Select existing MO/Color for this Machine/Date:"
                )}
              </label>
              <select
                id="selectExistingMo"
                onChange={(e) => {
                  const selectedVal = e.target.value;
                  if (selectedVal) {
                    const [selectedMo, selectedColor] = selectedVal.split("|");
                    const newLocalData = {
                      ...localFormData,
                      moNo: selectedMo,
                      color: selectedColor,
                    };
                    setLocalFormData(newLocalData);
                    setMoNoSearch(selectedMo);
                    // This will trigger useEffect for fetchDailyHTQCData with moNo and color
                  }
                }}
                className={inputFieldClasses}
              >
                <option value="">-- Select --</option>
                {availableMachineRecords.map((rec) => (
                  <option
                    key={`${rec.moNo}-${rec.color}`}
                    value={`${rec.moNo}|${rec.color}`}
                  >
                    {rec.moNo} - {rec.color} ({rec.buyerStyle})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Buyer, Buyer Style, Color */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 items-end">
        <div>
          <label className={labelClasses}>{t("scc.buyer")}</label>
          <input
            type="text"
            value={localFormData.buyer || ""}
            readOnly
            className={inputFieldReadonlyClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>{t("scc.buyerStyle")}</label>
          <input
            type="text"
            value={localFormData.buyerStyle || ""}
            readOnly
            className={inputFieldReadonlyClasses}
          />
        </div>
        <div>
          <label htmlFor="htqcColor" className={labelClasses}>
            {t("scc.color")}
          </label>
          <select
            id="htqcColor"
            value={localFormData.color || ""}
            onChange={handleColorChange}
            className={inputFieldClasses}
            disabled={!localFormData.moNo || availableColors.length === 0}
            required
          >
            <option value="">{t("scc.selectColor")}</option>
            {availableColors.map((c) => (
              <option key={c.key || c.original} value={c.original}>
                {c.original} {c.chn ? `(${c.chn})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inspection Tables */}
      {localFormData.moNo && localFormData.color && (
        <div className="mt-4 space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-gray-700">
              {t("sccDailyHTQC.inspectionDetails", "Inspection Details")}
            </h3>
            <div className="text-sm text-indigo-600 font-medium">
              {t(
                "sccDailyHTQC.currentInspectionNo",
                "Current Inspection Slot:"
              )}{" "}
              {currentActiveSlotKey
                ? `${
                    TIME_SLOTS_CONFIG.find(
                      (s) => s.key === currentActiveSlotKey
                    )?.label
                  } (#${
                    TIME_SLOTS_CONFIG.find(
                      (s) => s.key === currentActiveSlotKey
                    )?.inspectionNo
                  })`
                : t("scc.naCap", "N/A - All slots may be complete")}
            </div>
          </div>
          <div className="overflow-x-auto border border-gray-300 rounded-md shadow-sm bg-white">
            <table className="min-w-full divide-y divide-gray-300 text-xs">
              <thead className="bg-gray-100 sticky top-0 z-20">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left font-semibold text-gray-800 border-r border-gray-300 sticky left-0 bg-gray-100 z-30 min-w-[150px] w-[150px]"
                  >
                    {t("sccDailyHTQC.parameter", "Parameter")} /{" "}
                    {t("sccDailyHTQC.reqValue", "Req.Value")}
                  </th>
                  {TIME_SLOTS_CONFIG.map((slot) => (
                    <th
                      key={slot.key}
                      scope="col"
                      className={`px-3 py-2.5 text-center font-semibold text-gray-800 border-r border-gray-300 min-w-[130px] ${
                        slot.key === currentActiveSlotKey ? "bg-indigo-100" : ""
                      }`}
                    >
                      {slot.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {renderTableRow(
                  t("sccDailyHTQC.temperature", "Temperature"),
                  "temp",
                  "°C"
                )}
                {renderTableRow(
                  t("sccDailyHTQC.timing", "Timing"),
                  "time",
                  "Sec"
                )}
                {renderTableRow(
                  t("sccDailyHTQC.pressure", "Pressure"),
                  "pressure",
                  ""
                )}
              </tbody>
            </table>
          </div>

          {/* Stretch & Washing Tests */}
          {!localFormData.isStretchWashingTestDone &&
            currentActiveSlotKey &&
            (localFormData.inspections.length === 0 ||
              localFormData.inspections.find(
                (i) => i.timeSlotKey === currentActiveSlotKey
              )) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start pt-3">
                <div>
                  <label htmlFor="htqcStretchTest" className={labelClasses}>
                    {t(
                      "sccDailyHTQC.stretchScratchTest",
                      "Stretch & Scratch Test"
                    )}
                  </label>
                  <select
                    id="htqcStretchTest"
                    value={localFormData.stretchTestResult || "Pending"}
                    onChange={(e) =>
                      handleTestResultChange(
                        "stretchTestResult",
                        e.target.value
                      )
                    }
                    className={`${inputFieldClasses} ${
                      localFormData.stretchTestResult === "Pass"
                        ? "bg-green-50 text-green-700"
                        : localFormData.stretchTestResult === "Reject"
                        ? "bg-red-50 text-red-700"
                        : ""
                    }`}
                  >
                    <option value="Pending">
                      {t("scc.pending", "Pending")}
                    </option>
                    <option value="Pass">{t("scc.pass", "Pass")}</option>
                    <option value="Reject">{t("scc.reject", "Reject")}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="htqcWashingTest" className={labelClasses}>
                    {t("sccDailyHTQC.washingTest", "Washing Test")}
                  </label>
                  <select
                    id="htqcWashingTest"
                    value={localFormData.washingTestResult || "Pending"}
                    onChange={(e) =>
                      handleTestResultChange(
                        "washingTestResult",
                        e.target.value
                      )
                    }
                    className={`${inputFieldClasses} ${
                      localFormData.washingTestResult === "Pass"
                        ? "bg-green-50 text-green-700"
                        : localFormData.washingTestResult === "Reject"
                        ? "bg-red-50 text-red-700"
                        : ""
                    }`}
                  >
                    <option value="Pending">
                      {t("scc.pending", "Pending")}
                    </option>
                    <option value="Pass">{t("scc.pass", "Pass")}</option>
                    <option value="Reject">{t("scc.reject", "Reject")}</option>
                  </select>
                </div>
              </div>
            )}
          {localFormData.isStretchWashingTestDone && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start pt-3">
              <div>
                <label className={labelClasses}>
                  {t(
                    "sccDailyHTQC.stretchScratchTest",
                    "Stretch & Scratch Test"
                  )}
                </label>
                <input
                  type="text"
                  value={t(
                    `scc.${
                      localFormData.stretchTestResult?.toLowerCase() ||
                      "pending"
                    }`
                  )}
                  readOnly
                  className={`${inputFieldReadonlyClasses} ${
                    localFormData.stretchTestResult === "Pass"
                      ? "bg-green-100 text-green-700"
                      : localFormData.stretchTestResult === "Reject"
                      ? "bg-red-100 text-red-700"
                      : ""
                  }`}
                />
              </div>
              <div>
                <label className={labelClasses}>
                  {t("sccDailyHTQC.washingTest", "Washing Test")}
                </label>
                <input
                  type="text"
                  value={t(
                    `scc.${
                      localFormData.washingTestResult?.toLowerCase() ||
                      "pending"
                    }`
                  )}
                  readOnly
                  className={`${inputFieldReadonlyClasses} ${
                    localFormData.washingTestResult === "Pass"
                      ? "bg-green-100 text-green-700"
                      : localFormData.washingTestResult === "Reject"
                      ? "bg-red-100 text-red-700"
                      : ""
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={handleFormActualSubmit}
          disabled={isSubmitting || !currentActiveSlotKey || loading}
          className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {isSubmitting && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
          {currentActiveSlotKey
            ? `${t("scc.submit")} (${
                TIME_SLOTS_CONFIG.find((s) => s.key === currentActiveSlotKey)
                  ?.label
              })`
            : t("scc.noActiveSlot", "No Active Slot")}
        </button>
      </div>
    </div>
  );
};

export default DailyHTQC;
