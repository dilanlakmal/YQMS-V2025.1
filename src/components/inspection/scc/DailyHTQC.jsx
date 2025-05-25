// src/components/inspection/scc/DailyHTQC.jsx
import axios from "axios";
import {
  CheckCircle,
  ChevronDown,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Minus,
  Plus,
  Search,
  Triangle,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  { key: "07:00", label: "07.00", inspectionNo: 1 },
  { key: "09:00", label: "09.00", inspectionNo: 2 },
  { key: "12:00", label: "12.00", inspectionNo: 3 },
  { key: "14:00", label: "2.00 PM", inspectionNo: 4 },
  { key: "16:00", label: "4.00 PM", inspectionNo: 5 },
  { key: "18:00", label: "6.00 PM", inspectionNo: 6 },
];

const TEMP_TOLERANCE = 5;
const TIME_TOLERANCE = 2;
const PRESSURE_TOLERANCE = 0.5;

const initialSlotData = {
  inspectionNo: 0,
  timeSlotKey: "",
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

const STRETCH_TEST_REJECT_REASONS_OPTIONS = ["NA1", "NA2", "NA3", "Other"];

const parsePressure = (pressureValue) => {
  if (
    pressureValue === null ||
    pressureValue === undefined ||
    pressureValue === ""
  )
    return null;
  const num = parseFloat(pressureValue);
  return isNaN(num) ? null : num;
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

  const [localFormData, setLocalFormData] = useState(() => {
    const initialSlots = TIME_SLOTS_CONFIG.reduce((acc, slot) => {
      acc[slot.key] = {
        ...initialSlotData,
        inspectionNo: slot.inspectionNo,
        timeSlotKey: slot.key,
      };
      return acc;
    }, {});
    return {
      ...formData,
      slotsDetailed: initialSlots,
      baseReqPressure: parsePressure(formData.baseReqPressure),
    };
  });

  const [moNoSearch, setMoNoSearch] = useState(formData.moNo || "");
  const [moNoOptions, setMoNoOptions] = useState([]);
  const [showMoNoDropdown, setShowMoNoDropdown] = useState(false);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableMachineRecords, setAvailableMachineRecords] = useState([]);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [firstOutputSpecsLoading, setFirstOutputSpecsLoading] = useState(false);
  const [existingQCRecordLoading, setExistingQCRecordLoading] = useState(false);
  const [recordStatusMessage, setRecordStatusMessage] = useState("");
  const [currentActiveSlotKey, setCurrentActiveSlotKey] = useState(null);
  const [showRejectReasonDropdown, setShowRejectReasonDropdown] =
    useState(false);

  const moNoInputRef = useRef(null);
  const moNoDropdownRef = useRef(null);
  const rejectReasonDropdownRef = useRef(null);

  useEffect(() => {
    setMoNoSearch(formData.moNo || "");
    const newSlotsDetailed = TIME_SLOTS_CONFIG.reduce((acc, slotConf) => {
      const existingInsp = formData.inspections?.find(
        (i) => i.timeSlotKey === slotConf.key
      );
      acc[slotConf.key] = existingInsp
        ? {
            ...initialSlotData,
            ...existingInsp,
            temp_req:
              existingInsp.temp_req !== null
                ? Number(existingInsp.temp_req)
                : null,
            temp_actual:
              existingInsp.temp_actual !== null
                ? Number(existingInsp.temp_actual)
                : null,
            time_req:
              existingInsp.time_req !== null
                ? Number(existingInsp.time_req)
                : null,
            time_actual:
              existingInsp.time_actual !== null
                ? Number(existingInsp.time_actual)
                : null,
            pressure_req: parsePressure(existingInsp.pressure_req),
            pressure_actual: parsePressure(existingInsp.pressure_actual),
          }
        : {
            ...initialSlotData,
            inspectionNo: slotConf.inspectionNo,
            timeSlotKey: slotConf.key,
          };
      return acc;
    }, {});

    setLocalFormData((prev) => ({
      ...prev, // Keep local UI states
      ...formData, // Sync with all data from parent
      baseReqPressure: parsePressure(formData.baseReqPressure),
      slotsDetailed: newSlotsDetailed,
    }));
  }, [formData]);

  const updateParentFormData = useCallback(
    (updatedLocalData) => {
      const inspectionsArray = Object.values(updatedLocalData.slotsDetailed)
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
        )
        .map((slot) => ({
          inspectionNo: slot.inspectionNo,
          timeSlotKey: slot.timeSlotKey,
          temp_req: slot.temp_req !== null ? Number(slot.temp_req) : null,
          temp_actual:
            slot.temp_actual !== null ? Number(slot.temp_actual) : null,
          temp_status: slot.temp_status,
          temp_isUserModified: slot.temp_isUserModified,
          temp_isNA: slot.temp_isNA,
          time_req: slot.time_req !== null ? Number(slot.time_req) : null,
          time_actual:
            slot.time_actual !== null ? Number(slot.time_actual) : null,
          time_status: slot.time_status,
          time_isUserModified: slot.time_isUserModified,
          time_isNA: slot.time_isNA,
          pressure_req:
            slot.pressure_req !== null ? Number(slot.pressure_req) : null,
          pressure_actual:
            slot.pressure_actual !== null ? Number(slot.pressure_actual) : null,
          pressure_status: slot.pressure_status,
          pressure_isUserModified: slot.pressure_isUserModified,
          pressure_isNA: slot.pressure_isNA,
        }));

      onFormDataChange({
        _id: updatedLocalData._id,
        inspectionDate: updatedLocalData.inspectionDate,
        machineNo: updatedLocalData.machineNo,
        moNo: updatedLocalData.moNo,
        buyer: updatedLocalData.buyer,
        buyerStyle: updatedLocalData.buyerStyle,
        color: updatedLocalData.color,
        baseReqTemp:
          updatedLocalData.baseReqTemp !== null
            ? Number(updatedLocalData.baseReqTemp)
            : null,
        baseReqTime:
          updatedLocalData.baseReqTime !== null
            ? Number(updatedLocalData.baseReqTime)
            : null,
        baseReqPressure:
          updatedLocalData.baseReqPressure !== null
            ? Number(updatedLocalData.baseReqPressure)
            : null,
        inspections: inspectionsArray,
        stretchTestResult: updatedLocalData.stretchTestResult,
        stretchTestRejectReasons:
          updatedLocalData.stretchTestResult === "Reject"
            ? updatedLocalData.stretchTestRejectReasons || []
            : [],
        washingTestResult: updatedLocalData.washingTestResult,
        isStretchWashingTestDone: updatedLocalData.isStretchWashingTestDone,
      });
    },
    [onFormDataChange]
  );

  const resetLocalDetailedSlots = (currentLocalData) => {
    const newSlots = { ...currentLocalData.slotsDetailed };
    TIME_SLOTS_CONFIG.forEach((slot) => {
      newSlots[slot.key] = {
        ...initialSlotData,
        inspectionNo: slot.inspectionNo,
        timeSlotKey: slot.key,
      };
    });
    return { ...currentLocalData, slotsDetailed: newSlots };
  };

  const resetFormForNewMoOrColor = (
    prevLocalData,
    newMoNo = "",
    newColor = ""
  ) => {
    let newLocalData = {
      ...prevLocalData,
      moNo: newMoNo,
      color: newColor,
      buyer: "",
      buyerStyle: "",
      _id: null, // Critical: treat as a new record for this MO/Color
      baseReqTemp: null,
      baseReqTime: null,
      baseReqPressure: null,
      stretchTestResult: "Pending",
      stretchTestRejectReasons: [],
      washingTestResult: "Pending",
      isStretchWashingTestDone: false,
      inspections: [], // Clear inspections for the new MO/Color
    };
    newLocalData = resetLocalDetailedSlots(newLocalData); // Reset all slot details
    if (newMoNo) setMoNoSearch(newMoNo); // Update search bar if MO is set
    else setMoNoSearch(""); // Clear search if MO is cleared

    setAvailableColors([]); // Will be refetched if MO is valid
    setCurrentActiveSlotKey(TIME_SLOTS_CONFIG[0]?.key || null); // Reset to first slot
    setRecordStatusMessage("");
    return newLocalData;
  };

  const handleDateChange = (date) => {
    setLocalFormData((prev) => {
      let newLocalData = {
        ...prev,
        inspectionDate: date,
        machineNo: prev.machineNo, // Keep machineNo
        moNo: "", // Clear MO and related fields
        color: "",
        buyer: "",
        buyerStyle: "",
        _id: null,
        baseReqTemp: null,
        baseReqTime: null,
        baseReqPressure: null,
        stretchTestResult: "Pending",
        stretchTestRejectReasons: [],
        washingTestResult: "Pending",
        isStretchWashingTestDone: false,
        inspections: [],
      };
      newLocalData = resetLocalDetailedSlots(newLocalData);
      setMoNoSearch("");
      setAvailableColors([]);
      setAvailableMachineRecords([]); // Clear list of MOs for previous date
      setCurrentActiveSlotKey(null);
      setRecordStatusMessage("");
      updateParentFormData(newLocalData);
      return newLocalData;
    });
  };

  const handleMachineNoChange = (e) => {
    const machineNo = e.target.value;
    setLocalFormData((prev) => {
      let newLocalData = {
        ...prev,
        machineNo,
        inspectionDate: prev.inspectionDate, // Keep date
        moNo: "", // Clear MO and related fields
        color: "",
        buyer: "",
        buyerStyle: "",
        _id: null,
        baseReqTemp: null,
        baseReqTime: null,
        baseReqPressure: null,
        stretchTestResult: "Pending",
        stretchTestRejectReasons: [],
        washingTestResult: "Pending",
        isStretchWashingTestDone: false,
        inspections: [],
      };
      newLocalData = resetLocalDetailedSlots(newLocalData);
      setMoNoSearch("");
      setAvailableColors([]);
      setAvailableMachineRecords([]); // Will be refetched by effect
      setCurrentActiveSlotKey(null);
      setRecordStatusMessage("");
      updateParentFormData(newLocalData);
      return newLocalData;
    });
  };

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
      console.error(t("scc.errorFetchingMoLog"), error);
      setMoNoOptions([]);
      setShowMoNoDropdown(false);
    }
  }, [moNoSearch, t]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Fetch if search term is different from current MO or if current MO is empty
      if (moNoSearch !== localFormData.moNo || !localFormData.moNo) {
        // Also, ensure we don't fetch if the search term is empty after clearing it
        if (moNoSearch.trim() !== "") fetchMoNumbers();
        else {
          setMoNoOptions([]);
          setShowMoNoDropdown(false);
        }
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [moNoSearch, localFormData.moNo, fetchMoNumbers]);

  const handleMoSelect = (selectedMo) => {
    // This is when user selects an MO from the search dropdown
    setShowMoNoDropdown(false);
    setLocalFormData((prev) => {
      const newLocalData = resetFormForNewMoOrColor(prev, selectedMo, ""); // Reset color for new MO
      updateParentFormData(newLocalData);
      return newLocalData;
    });
  };

  // When user selects from "Existing MOs for this Machine/Date" dropdown
  const handleExistingMoColorSelect = (e) => {
    const val = e.target.value;
    if (val) {
      const [selectedMo, selectedColor] = val.split("|");
      setLocalFormData((prev) => {
        // Don't fully reset, as we are loading an existing context
        let newLocalData = {
          ...prev,
          moNo: selectedMo,
          color: selectedColor,
          // _id, baseReqTemp, inspections etc., will be fetched by fetchDailyHTQCData
        };
        // Slots will be populated by fetchDailyHTQCData
        setMoNoSearch(selectedMo); // Sync search input
        updateParentFormData(newLocalData); // Trigger data fetch via useEffect
        return newLocalData;
      });
    } else {
      // If "-- Select --" is chosen
      setLocalFormData((prev) => {
        const newLocalData = resetFormForNewMoOrColor(prev, "", ""); // Reset to blank MO/Color
        updateParentFormData(newLocalData);
        return newLocalData;
      });
    }
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!localFormData.moNo) {
        if (localFormData.buyer || localFormData.buyerStyle) {
          setLocalFormData((prev) => {
            const updatedData = {
              ...prev,
              buyer: "",
              buyerStyle: "",
              color: "",
            }; // Also clear color
            updateParentFormData(updatedData);
            return updatedData;
          });
        }
        setAvailableColors([]);
        return;
      }
      setOrderDetailsLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/order-details/${localFormData.moNo}`
        );
        const details = response.data;
        setLocalFormData((prev) => {
          const newLocalData = {
            ...prev,
            buyer: details.engName || "N/A",
            buyerStyle: details.custStyle || "N/A",
          };
          // If color was set but not in new available colors, clear it
          if (
            prev.color &&
            !details.colors?.find((c) => c.original === prev.color)
          ) {
            newLocalData.color = "";
          }
          updateParentFormData(newLocalData);
          return newLocalData;
        });
        setAvailableColors(details.colors || []);
      } catch (error) {
        console.error(t("scc.errorFetchingOrderDetailsLog"), error);
        setLocalFormData((prev) => {
          const newLocalData = {
            ...prev,
            buyer: "",
            buyerStyle: "",
            color: "",
          };
          updateParentFormData(newLocalData);
          return newLocalData;
        });
        setAvailableColors([]);
      } finally {
        setOrderDetailsLoading(false);
      }
    };
    if (localFormData.moNo) {
      // Only fetch if MO is present
      fetchOrderDetails();
    } else {
      // If MO is cleared, clear dependent fields
      if (
        localFormData.buyer ||
        localFormData.buyerStyle ||
        localFormData.color
      ) {
        setLocalFormData((prev) => {
          const updatedData = { ...prev, buyer: "", buyerStyle: "", color: "" };
          updateParentFormData(updatedData);
          return updatedData;
        });
      }
      setAvailableColors([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFormData.moNo, t]); // updateParentFormData removed

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setLocalFormData((prev) => {
      const newLocalData = resetFormForNewMoOrColor(prev, prev.moNo, newColor); // Keep current MO, reset for new color
      updateParentFormData(newLocalData);
      return newLocalData;
    });
  };

  const calculateStatusAndDiff = (actual, req, tolerance) => {
    if (actual === null || req === null)
      return { status: "pending", diff: null };
    const numActual = Number(actual);
    const numReq = Number(req);
    if (isNaN(numActual) || isNaN(numReq))
      return { status: "pending", diff: null };

    const difference = numActual - numReq;
    if (Math.abs(difference) <= tolerance)
      return { status: "ok", diff: difference };
    return { status: numActual < numReq ? "low" : "high", diff: difference };
  };

  const fetchBaseSpecs = useCallback(
    async (
      moNoToFetch,
      colorToFetch,
      inspectionDateToFetch,
      activeSlotKeyForUpdate
    ) => {
      if (!moNoToFetch || !colorToFetch || !inspectionDateToFetch) return;
      setFirstOutputSpecsLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/scc/get-first-output-specs`,
          {
            params: {
              moNo: moNoToFetch,
              color: colorToFetch,
              inspectionDate:
                inspectionDateToFetch instanceof Date
                  ? inspectionDateToFetch.toISOString()
                  : inspectionDateToFetch,
            },
          }
        );
        let newBaseReqTemp = null,
          newBaseReqTime = null,
          newBaseReqPressure = null;
        if (response.data.data) {
          const specs = response.data.data;
          newBaseReqTemp = specs.tempC !== null ? Number(specs.tempC) : null;
          newBaseReqTime =
            specs.timeSec !== null ? Number(specs.timeSec) : null;
          newBaseReqPressure = parsePressure(specs.pressure);
        }
        setLocalFormData((prevLocalData) => {
          const updatedSlotsDetailed = { ...prevLocalData.slotsDetailed };
          // Update req values for ALL slots if base specs are found
          // And actual values if they are not user modified and not N/A
          Object.keys(updatedSlotsDetailed).forEach((slotKey) => {
            const slot = updatedSlotsDetailed[slotKey];
            if (!slot.temp_isUserModified && !slot.temp_isNA)
              slot.temp_req = newBaseReqTemp;
            if (!slot.time_isUserModified && !slot.time_isNA)
              slot.time_req = newBaseReqTime;
            if (!slot.pressure_isUserModified && !slot.pressure_isNA)
              slot.pressure_req = newBaseReqPressure;

            // If actual is null and not NA, set to req
            if (slot.temp_actual === null && !slot.temp_isNA)
              slot.temp_actual = slot.temp_req;
            if (slot.time_actual === null && !slot.time_isNA)
              slot.time_actual = slot.time_req;
            if (slot.pressure_actual === null && !slot.pressure_isNA)
              slot.pressure_actual = slot.pressure_req;

            // Recalculate status
            slot.temp_status = slot.temp_isNA
              ? "na"
              : calculateStatusAndDiff(
                  slot.temp_actual,
                  slot.temp_req,
                  TEMP_TOLERANCE
                ).status;
            slot.time_status = slot.time_isNA
              ? "na"
              : calculateStatusAndDiff(
                  slot.time_actual,
                  slot.time_req,
                  TIME_TOLERANCE
                ).status;
            slot.pressure_status = slot.pressure_isNA
              ? "na"
              : calculateStatusAndDiff(
                  slot.pressure_actual,
                  slot.pressure_req,
                  PRESSURE_TOLERANCE
                ).status;
          });

          const newLocalData = {
            ...prevLocalData,
            baseReqTemp: newBaseReqTemp,
            baseReqTime: newBaseReqTime,
            baseReqPressure: newBaseReqPressure,
            slotsDetailed: updatedSlotsDetailed,
          };
          updateParentFormData(newLocalData);
          return newLocalData;
        });
      } catch (error) {
        console.error(t("scc.errorFetchingHtSpecsLog"), error);
        setLocalFormData((prevLocalData) => {
          const newLocalData = {
            ...prevLocalData,
            baseReqTemp: null,
            baseReqTime: null,
            baseReqPressure: null,
          };
          // Clear req fields in slots if specs fetch failed
          const updatedSlots = { ...prevLocalData.slotsDetailed };
          Object.values(updatedSlots).forEach((slot) => {
            if (!slot.temp_isUserModified) slot.temp_req = null;
            if (!slot.time_isUserModified) slot.time_req = null;
            if (!slot.pressure_isUserModified) slot.pressure_req = null;
          });
          newLocalData.slotsDetailed = updatedSlots;
          updateParentFormData(newLocalData);
          return newLocalData;
        });
      } finally {
        setFirstOutputSpecsLoading(false);
      }
    },
    [t, updateParentFormData]
  );

  useEffect(() => {
    // This effect auto-populates current slot based on base specs
    if (
      currentActiveSlotKey &&
      localFormData.slotsDetailed &&
      localFormData.slotsDetailed[currentActiveSlotKey]
    ) {
      setLocalFormData((prevLocalData) => {
        const currentSlotsDetailed = { ...prevLocalData.slotsDetailed };
        const slotToUpdate = { ...currentSlotsDetailed[currentActiveSlotKey] };
        const baseTemp = prevLocalData.baseReqTemp;
        const baseTime = prevLocalData.baseReqTime;
        const basePressure = prevLocalData.baseReqPressure;
        let hasChanged = false;

        if (!slotToUpdate.temp_isUserModified && !slotToUpdate.temp_isNA) {
          if (slotToUpdate.temp_req !== baseTemp) {
            slotToUpdate.temp_req = baseTemp;
            hasChanged = true;
          }
          if (slotToUpdate.temp_actual === null && baseTemp !== null) {
            slotToUpdate.temp_actual = baseTemp;
            hasChanged = true;
          }
          slotToUpdate.temp_status = calculateStatusAndDiff(
            slotToUpdate.temp_actual,
            slotToUpdate.temp_req,
            TEMP_TOLERANCE
          ).status;
        } else if (slotToUpdate.temp_isNA) slotToUpdate.temp_status = "na";

        if (!slotToUpdate.time_isUserModified && !slotToUpdate.time_isNA) {
          if (slotToUpdate.time_req !== baseTime) {
            slotToUpdate.time_req = baseTime;
            hasChanged = true;
          }
          if (slotToUpdate.time_actual === null && baseTime !== null) {
            slotToUpdate.time_actual = baseTime;
            hasChanged = true;
          }
          slotToUpdate.time_status = calculateStatusAndDiff(
            slotToUpdate.time_actual,
            slotToUpdate.time_req,
            TIME_TOLERANCE
          ).status;
        } else if (slotToUpdate.time_isNA) slotToUpdate.time_status = "na";

        if (
          !slotToUpdate.pressure_isUserModified &&
          !slotToUpdate.pressure_isNA
        ) {
          if (slotToUpdate.pressure_req !== basePressure) {
            slotToUpdate.pressure_req = basePressure;
            hasChanged = true;
          }
          if (slotToUpdate.pressure_actual === null && basePressure !== null) {
            slotToUpdate.pressure_actual = basePressure;
            hasChanged = true;
          }
          slotToUpdate.pressure_status = calculateStatusAndDiff(
            slotToUpdate.pressure_actual,
            slotToUpdate.pressure_req,
            PRESSURE_TOLERANCE
          ).status;
        } else if (slotToUpdate.pressure_isNA)
          slotToUpdate.pressure_status = "na";

        if (hasChanged) {
          const newSlotsDetailedState = {
            ...currentSlotsDetailed,
            [currentActiveSlotKey]: slotToUpdate,
          };
          // No need to call updateParentFormData here, this is an internal sync
          return { ...prevLocalData, slotsDetailed: newSlotsDetailedState };
        }
        return prevLocalData;
      });
    }
  }, [
    currentActiveSlotKey,
    localFormData.baseReqTemp,
    localFormData.baseReqTime,
    localFormData.baseReqPressure,
    // localFormData.slotsDetailed // Be careful with this dependency
  ]);

  // Main data fetching logic
  const fetchDailyHTQCData = useCallback(
    async (
      currentMoNo,
      currentColor,
      currentInspectionDate,
      currentMachineNo
    ) => {
      if (!currentInspectionDate || !currentMachineNo) {
        setAvailableMachineRecords([]); // Clear if essential params missing
        return;
      }
      setExistingQCRecordLoading(true);
      setRecordStatusMessage("");
      let baseSpecsShouldBeFetched = false;

      try {
        const params = {
          inspectionDate:
            currentInspectionDate instanceof Date
              ? currentInspectionDate.toISOString()
              : currentInspectionDate,
          machineNo: currentMachineNo,
        };
        // If specific MO/Color provided, try to fetch that record
        if (currentMoNo && currentColor) {
          params.moNo = currentMoNo;
          params.color = currentColor;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/scc/daily-htfu-test`,
          { params }
        );
        const { message, data } = response.data;

        if (
          message === "DAILY_HTFU_RECORD_NOT_FOUND" &&
          params.moNo &&
          params.color
        ) {
          setRecordStatusMessage(t("sccDailyHTQC.newRecord"));
          const firstSlotKey = TIME_SLOTS_CONFIG[0]?.key || null;
          setLocalFormData((prev) => {
            // Keep current date, machine, MO, Color, but reset slots and other details
            let newLocalState = resetFormForNewMoOrColor(
              prev,
              currentMoNo,
              currentColor
            );
            newLocalState.inspectionDate = prev.inspectionDate; // ensure date is preserved
            newLocalState.machineNo = prev.machineNo; // ensure machineNo is preserved
            setCurrentActiveSlotKey(firstSlotKey);
            return newLocalState;
          });
          baseSpecsShouldBeFetched = true; // Fetch base specs for this new MO/Color context
        } else if (message === "RECORD_FOUND" && data) {
          setRecordStatusMessage(t("sccDailyHTQC.recordLoaded"));
          const populatedSlots = TIME_SLOTS_CONFIG.reduce((acc, slotConf) => {
            const existingInsp = (data.inspections || []).find(
              (i) => i.timeSlotKey === slotConf.key
            );
            acc[slotConf.key] = existingInsp
              ? {
                  ...initialSlotData,
                  ...existingInsp,
                  temp_actual:
                    existingInsp.temp_actual !== null
                      ? Number(existingInsp.temp_actual)
                      : null,
                  time_actual:
                    existingInsp.time_actual !== null
                      ? Number(existingInsp.time_actual)
                      : null,
                  pressure_actual: parsePressure(existingInsp.pressure_actual),
                }
              : {
                  ...initialSlotData,
                  inspectionNo: slotConf.inspectionNo,
                  timeSlotKey: slotConf.key,
                };
            return acc;
          }, {});

          setLocalFormData((prev) => {
            const newLocalState = {
              ...prev, // Keep existing local state like currentActiveSlotKey potentially
              _id: data._id,
              moNo: data.moNo,
              buyer: data.buyer,
              buyerStyle: data.buyerStyle,
              color: data.color,
              baseReqTemp:
                data.baseReqTemp !== null ? Number(data.baseReqTemp) : null,
              baseReqTime:
                data.baseReqTime !== null ? Number(data.baseReqTime) : null,
              baseReqPressure: parsePressure(data.baseReqPressure),
              stretchTestResult: data.stretchTestResult || "Pending",
              stretchTestRejectReasons: data.stretchTestRejectReasons || [],
              washingTestResult: data.washingTestResult || "Pending",
              isStretchWashingTestDone: data.isStretchWashingTestDone || false,
              inspections: data.inspections || [],
              slotsDetailed: populatedSlots,
            };
            setMoNoSearch(data.moNo || "");
            const lastSubmittedInspNo =
              (data.inspections || []).length > 0
                ? Math.max(...data.inspections.map((i) => i.inspectionNo))
                : 0;
            const nextInspNo = lastSubmittedInspNo + 1;
            const activeSlotConfig = TIME_SLOTS_CONFIG.find(
              (s) => s.inspectionNo === nextInspNo
            );
            setCurrentActiveSlotKey(
              activeSlotConfig ? activeSlotConfig.key : null
            );
            return newLocalState;
          });
          if (!data.baseReqTemp && data.moNo && data.color)
            baseSpecsShouldBeFetched = true;
          // After loading a specific record, also fetch the list of other MOs for this date/machine
          axios
            .get(`${API_BASE_URL}/api/scc/daily-htfu-test`, {
              params: {
                inspectionDate:
                  currentInspectionDate instanceof Date
                    ? currentInspectionDate.toISOString()
                    : currentInspectionDate,
                machineNo: currentMachineNo,
              },
            })
            .then((listRes) => {
              if (
                listRes.data.message === "MULTIPLE_MO_COLOR_FOUND" &&
                listRes.data.data.length > 0
              ) {
                setAvailableMachineRecords(listRes.data.data);
              } else {
                setAvailableMachineRecords([]); // Clear if no other records
              }
            })
            .catch(() => setAvailableMachineRecords([]));
        } else if (message === "MULTIPLE_MO_COLOR_FOUND" && data.length > 0) {
          setRecordStatusMessage(t("sccDailyHTQC.selectMoColor"));
          setAvailableMachineRecords(data);
          setLocalFormData((prev) => resetFormForNewMoOrColor(prev, "", "")); // Reset if multiple MOs and none selected
          setCurrentActiveSlotKey(null);
        } else {
          // NO_RECORDS_FOR_DATE_MACHINE or other cases
          setRecordStatusMessage(t("sccDailyHTQC.newRecordMachineDate"));
          setLocalFormData((prev) => resetFormForNewMoOrColor(prev, "", ""));
          setCurrentActiveSlotKey(TIME_SLOTS_CONFIG[0]?.key || null);
          setAvailableMachineRecords([]); // No existing records
        }

        if (
          baseSpecsShouldBeFetched &&
          currentMoNo &&
          currentColor &&
          currentInspectionDate
        ) {
          fetchBaseSpecs(
            currentMoNo,
            currentColor,
            currentInspectionDate,
            currentActiveSlotKey
          );
        }
      } catch (error) {
        console.error(t("sccDailyHTQC.errorLoadingRecord"), error);
        Swal.fire(
          t("scc.error"),
          t("sccDailyHTQC.errorLoadingRecordMsg"),
          "error"
        );
        setLocalFormData((prev) => resetFormForNewMoOrColor(prev, "", "")); // Reset on error
      } finally {
        setExistingQCRecordLoading(false);
      }
    },
    [t, fetchBaseSpecs, updateParentFormData, currentActiveSlotKey] // currentActiveSlotKey might be needed for fetchBaseSpecs context
  );

  // Effect for initial load / Date or Machine change
  useEffect(() => {
    if (localFormData.inspectionDate && localFormData.machineNo) {
      // Fetch list of MOs or specific record if MO/Color are already set
      fetchDailyHTQCData(
        localFormData.moNo,
        localFormData.color,
        localFormData.inspectionDate,
        localFormData.machineNo
      );
    } else {
      setAvailableMachineRecords([]); // Clear if date/machine not set
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFormData.inspectionDate, localFormData.machineNo]);

  // Effect for MO or Color change (after Date/Machine are set)
  useEffect(() => {
    if (
      localFormData.inspectionDate &&
      localFormData.machineNo &&
      localFormData.moNo &&
      localFormData.color
    ) {
      fetchDailyHTQCData(
        localFormData.moNo,
        localFormData.color,
        localFormData.inspectionDate,
        localFormData.machineNo
      );
    }
    // If only MO is set but no color, do nothing here, wait for color selection.
    // If MO/Color are cleared, the date/machine useEffect handles fetching the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFormData.moNo, localFormData.color]);

  const handleSlotActualValueChange = (slotKey, fieldType, value) => {
    setLocalFormData((prev) => {
      const newSlotsDetailed = { ...prev.slotsDetailed };
      const slot = { ...newSlotsDetailed[slotKey] };
      if (!slot) return prev;
      const field_actual = `${fieldType}_actual`,
        field_req = `${fieldType}_req`,
        field_status = `${fieldType}_status`,
        field_isUserModified = `${fieldType}_isUserModified`,
        field_isNA = `${fieldType}_isNA`;
      if (slot[field_isNA]) return prev;
      const numValue = value === "" || value === null ? null : Number(value);
      slot[field_actual] = numValue;
      slot[field_isUserModified] = true;
      const tolerance =
        fieldType === "temp"
          ? TEMP_TOLERANCE
          : fieldType === "time"
          ? TIME_TOLERANCE
          : PRESSURE_TOLERANCE;
      slot[field_status] = calculateStatusAndDiff(
        numValue,
        slot[field_req],
        tolerance
      ).status;
      newSlotsDetailed[slotKey] = slot;
      const newLocalData = { ...prev, slotsDetailed: newSlotsDetailed };
      updateParentFormData(newLocalData);
      return newLocalData;
    });
  };

  const handleSlotIncrementDecrement = (slotKey, fieldType, action) => {
    setLocalFormData((prev) => {
      const newSlotsDetailed = { ...prev.slotsDetailed };
      const slot = { ...newSlotsDetailed[slotKey] };
      if (!slot) return prev;
      const field_actual = `${fieldType}_actual`,
        field_req = `${fieldType}_req`,
        field_status = `${fieldType}_status`,
        field_isUserModified = `${fieldType}_isUserModified`,
        field_isNA = `${fieldType}_isNA`;
      if (slot[field_isNA]) return prev;
      let currentValue = parseFloat(slot[field_actual]);
      if (isNaN(currentValue)) {
        currentValue = parseFloat(slot[field_req]);
        if (isNaN(currentValue)) currentValue = 0;
      }
      if (action === "increment") currentValue += 1;
      if (action === "decrement") currentValue -= 1;
      slot[field_actual] = currentValue;
      slot[field_isUserModified] = true;
      const tolerance =
        fieldType === "temp"
          ? TEMP_TOLERANCE
          : fieldType === "time"
          ? TIME_TOLERANCE
          : PRESSURE_TOLERANCE;
      slot[field_status] = calculateStatusAndDiff(
        currentValue,
        slot[field_req],
        tolerance
      ).status;
      newSlotsDetailed[slotKey] = slot;
      const newLocalData = { ...prev, slotsDetailed: newSlotsDetailed };
      updateParentFormData(newLocalData);
      return newLocalData;
    });
  };

  const toggleSlotNA = (slotKey, fieldType) => {
    setLocalFormData((prev) => {
      const newSlotsDetailed = { ...prev.slotsDetailed };
      const slot = { ...newSlotsDetailed[slotKey] };
      if (!slot) return prev;
      const field_actual = `${fieldType}_actual`,
        field_req = `${fieldType}_req`,
        field_status = `${fieldType}_status`,
        field_isNA = `${fieldType}_isNA`;
      slot[field_isNA] = !slot[field_isNA];
      if (slot[field_isNA]) {
        slot[field_actual] = null;
        slot[field_status] = "na";
      } else {
        slot[field_actual] =
          slot[field_actual] === null ? slot[field_req] : slot[field_actual];
        const tolerance =
          fieldType === "temp"
            ? TEMP_TOLERANCE
            : fieldType === "time"
            ? TIME_TOLERANCE
            : PRESSURE_TOLERANCE;
        slot[field_status] = calculateStatusAndDiff(
          slot[field_actual],
          slot[field_req],
          tolerance
        ).status;
      }
      newSlotsDetailed[slotKey] = slot;
      const newLocalData = { ...prev, slotsDetailed: newSlotsDetailed };
      updateParentFormData(newLocalData);
      return newLocalData;
    });
  };

  const handleTestResultChange = (field, value) => {
    setLocalFormData((prev) => {
      const newLocalData = { ...prev, [field]: value };
      if (field === "stretchTestResult" && value !== "Reject") {
        newLocalData.stretchTestRejectReasons = [];
      }
      updateParentFormData(newLocalData);
      return newLocalData;
    });
  };

  const handleRejectReasonSelect = (reason) => {
    setLocalFormData((prev) => {
      const currentReasons = prev.stretchTestRejectReasons || [];
      let newReasons;
      if (currentReasons.includes(reason)) {
        newReasons = currentReasons.filter((r) => r !== reason);
      } else {
        newReasons = [...currentReasons, reason];
      }
      const newLocalData = { ...prev, stretchTestRejectReasons: newReasons };
      updateParentFormData(newLocalData);
      return newLocalData;
    });
  };

  const getCellBG = (status, isNA) => {
    if (isNA) return "bg-gray-200 text-gray-500";
    if (status === "ok") return "bg-green-100 text-green-700";
    if (status === "low" || status === "high") return "bg-red-100 text-red-700";
    return "bg-white";
  };

  const handleFormActualSubmit = () => {
    if (
      !localFormData.inspectionDate ||
      !localFormData.machineNo ||
      !localFormData.moNo ||
      !localFormData.color
    ) {
      Swal.fire(
        t("scc.validationErrorTitle"),
        t("sccDailyHTQC.validation.fillBasic"),
        "warning"
      );
      return;
    }
    if (!currentActiveSlotKey) {
      Swal.fire(
        t("scc.validationErrorTitle"),
        t("sccDailyHTQC.validation.allSlotsDone"),
        "info"
      );
      return;
    }
    const activeSlotData = localFormData.slotsDetailed[currentActiveSlotKey];
    if (!activeSlotData) {
      Swal.fire(
        t("scc.validationErrorTitle"),
        "Error: Active slot data not found.",
        "error"
      );
      return;
    }
    if (
      (activeSlotData.temp_actual === null && !activeSlotData.temp_isNA) ||
      (activeSlotData.time_actual === null && !activeSlotData.time_isNA) ||
      (activeSlotData.pressure_actual === null && !activeSlotData.pressure_isNA)
    ) {
      Swal.fire(
        t("scc.validationErrorTitle"),
        t("sccDailyHTQC.validation.fillActiveSlot"),
        "warning"
      );
      return;
    }
    if (
      localFormData.stretchTestResult === "Reject" &&
      (!localFormData.stretchTestRejectReasons ||
        localFormData.stretchTestRejectReasons.length === 0)
    ) {
      Swal.fire(
        t("scc.validationErrorTitle"),
        t("sccDailyHTQC.validation.rejectReasonRequired"),
        "warning"
      );
      return;
    }

    const payloadForParent = {
      _id: localFormData._id,
      inspectionDate: localFormData.inspectionDate,
      machineNo: localFormData.machineNo,
      moNo: localFormData.moNo,
      buyer: localFormData.buyer,
      buyerStyle: localFormData.buyerStyle,
      color: localFormData.color,
      baseReqTemp:
        localFormData.baseReqTemp !== null
          ? Number(localFormData.baseReqTemp)
          : null,
      baseReqTime:
        localFormData.baseReqTime !== null
          ? Number(localFormData.baseReqTime)
          : null,
      baseReqPressure:
        localFormData.baseReqPressure !== null
          ? Number(localFormData.baseReqPressure)
          : null,
      stretchTestResult: localFormData.stretchTestResult,
      stretchTestRejectReasons:
        localFormData.stretchTestResult === "Reject"
          ? localFormData.stretchTestRejectReasons || []
          : [],
      washingTestResult: localFormData.washingTestResult,
      isStretchWashingTestDone: localFormData.isStretchWashingTestDone,
      emp_id: user.emp_id,
      emp_kh_name: user.kh_name,
      emp_eng_name: user.eng_name,
      emp_dept_name: user.dept_name,
      emp_sect_name: user.sect_name,
      emp_job_title: user.job_title,
      currentInspection: {
        inspectionNo: activeSlotData.inspectionNo,
        timeSlotKey: activeSlotData.timeSlotKey,
        temp_req:
          activeSlotData.temp_req !== null
            ? Number(activeSlotData.temp_req)
            : null,
        temp_actual:
          activeSlotData.temp_actual !== null
            ? Number(activeSlotData.temp_actual)
            : null,
        temp_status: activeSlotData.temp_status,
        temp_isUserModified: activeSlotData.temp_isUserModified,
        temp_isNA: activeSlotData.temp_isNA,
        time_req:
          activeSlotData.time_req !== null
            ? Number(activeSlotData.time_req)
            : null,
        time_actual:
          activeSlotData.time_actual !== null
            ? Number(activeSlotData.time_actual)
            : null,
        time_status: activeSlotData.time_status,
        time_isUserModified: activeSlotData.time_isUserModified,
        time_isNA: activeSlotData.time_isNA,
        pressure_req:
          activeSlotData.pressure_req !== null
            ? Number(activeSlotData.pressure_req)
            : null,
        pressure_actual:
          activeSlotData.pressure_actual !== null
            ? Number(activeSlotData.pressure_actual)
            : null,
        pressure_status: activeSlotData.pressure_status,
        pressure_isUserModified: activeSlotData.pressure_isUserModified,
        pressure_isNA: activeSlotData.pressure_isNA,
      },
    };
    onFormSubmit(formType, payloadForParent);
  };

  const loading =
    orderDetailsLoading || firstOutputSpecsLoading || existingQCRecordLoading;

  const renderDifference = (actual, req, tolerance, fieldType) => {
    if (
      actual === null ||
      req === null ||
      isNaN(Number(actual)) ||
      isNaN(Number(req))
    )
      return null;
    const { status, diff } = calculateStatusAndDiff(actual, req, tolerance);
    if (status === "ok" || diff === 0 || diff === null) return null;

    const isHigh = status === "high";
    const colorClass = isHigh ? "text-red-500" : "text-orange-500";
    const sign = isHigh ? "+" : "";

    return (
      <span
        className={`ml-1 text-xs font-semibold ${colorClass} flex items-center`}
      >
        <Triangle
          className={`w-2 h-2 fill-current ${
            isHigh ? "rotate-0" : "rotate-180"
          }`}
        />
        {sign}
        {diff.toFixed(fieldType === "pressure" ? 1 : 0)}
      </span>
    );
  };

  const currentSlotTableTitle = useMemo(() => {
    if (!currentActiveSlotKey) return t("sccDailyHTQC.noActiveSlot");
    const slotConfig = TIME_SLOTS_CONFIG.find(
      (s) => s.key === currentActiveSlotKey
    );
    if (!slotConfig) return t("sccDailyHTQC.noActiveSlot");
    return `${t("sccDailyHTQC.currentInspectionSlot")}: ${slotConfig.label} (#${
      slotConfig.inspectionNo
    })`;
  }, [currentActiveSlotKey, t]);

  const renderCurrentSlotTable = () => {
    if (!currentActiveSlotKey) return null;
    const currentSlot = localFormData.slotsDetailed[currentActiveSlotKey];
    if (!currentSlot) return null;

    const parameters = [
      {
        label: t("sccDailyHTQC.temperature"),
        field: "temp",
        unit: "°C",
        tolerance: TEMP_TOLERANCE,
      },
      {
        label: t("sccDailyHTQC.timing"),
        field: "time",
        unit: "Sec",
        tolerance: TIME_TOLERANCE,
      },
      {
        label: t("sccDailyHTQC.pressure"),
        field: "pressure",
        unit: "Bar",
        tolerance: PRESSURE_TOLERANCE,
      },
    ];

    return (
      <div className="border border-gray-300 rounded-lg shadow-sm bg-white overflow-hidden">
        <table className="min-w-full text-xs divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r w-1/3">
                {t("sccDailyHTQC.parameter")}
              </th>
              <th className="px-3 py-2.5 text-center font-semibold text-gray-700 border-r w-1/3">
                {t("sccDailyHTQC.reqValue")}
              </th>
              <th className="px-3 py-2.5 text-center font-semibold text-gray-700 w-1/3">
                {t("sccDailyHTQC.actualValue")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {parameters.map((param) => {
              const reqVal = currentSlot[`${param.field}_req`];
              const actualVal = currentSlot[`${param.field}_actual`];
              const isNA = currentSlot[`${param.field}_isNA`];
              const { status } = calculateStatusAndDiff(
                actualVal,
                reqVal,
                param.tolerance
              );

              return (
                <tr
                  key={param.field}
                  className={`hover:bg-gray-50 ${getCellBG(status, isNA)}`}
                >
                  <td className="px-3 py-2 border-r font-medium">
                    {param.label} {param.unit ? `(${param.unit})` : ""}
                  </td>
                  <td className="px-3 py-2 border-r text-center">
                    {reqVal !== null ? reqVal : "N/A"}
                  </td>
                  <td className={`px-1.5 py-1.5 text-center`}>
                    {isNA ? (
                      <span className="italic text-gray-500">
                        {t("scc.na")}
                      </span>
                    ) : (
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          inputMode="numeric"
                          value={actualVal !== null ? actualVal : ""}
                          onChange={(e) =>
                            handleSlotActualValueChange(
                              currentActiveSlotKey,
                              param.field,
                              e.target.value
                            )
                          }
                          className={`${inputFieldClasses} text-center text-xs p-1 w-20`}
                        />
                        {renderDifference(
                          actualVal,
                          reqVal,
                          param.tolerance,
                          param.field
                        )}
                      </div>
                    )}
                    <div className="flex justify-center items-center space-x-2 mt-1">
                      {!isNA && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleSlotIncrementDecrement(
                                currentActiveSlotKey,
                                param.field,
                                "decrement"
                              )
                            }
                            className="p-1 hover:bg-gray-200 rounded-full"
                          >
                            <Minus size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleSlotIncrementDecrement(
                                currentActiveSlotKey,
                                param.field,
                                "increment"
                              )
                            }
                            className="p-1 hover:bg-gray-200 rounded-full"
                          >
                            <Plus size={12} />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          toggleSlotNA(currentActiveSlotKey, param.field)
                        }
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        {isNA ? (
                          <EyeOff size={12} className="text-gray-500" />
                        ) : (
                          <Eye size={12} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        rejectReasonDropdownRef.current &&
        !rejectReasonDropdownRef.current.contains(event.target)
      ) {
        setShowRejectReasonDropdown(false);
      }
      if (
        moNoDropdownRef.current &&
        !moNoDropdownRef.current.contains(event.target) &&
        moNoInputRef.current &&
        !moNoInputRef.current.contains(event.target)
      ) {
        setShowMoNoDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user)
    return <div className="p-6 text-center">{t("scc.loadingUser")}</div>;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-800">
        {t("sccDailyHTQC.title")}
      </h2>
      <p className="text-xs text-gray-600 -mt-3">
        {t("sccDailyHTQC.subtitle")}
      </p>

      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[100]">
          <Loader2 className="animate-spin h-12 w-12 text-white" />
        </div>
      )}
      {recordStatusMessage && (
        <div
          className={`p-3 mb-3 rounded-md text-sm flex items-center shadow-sm border ${
            recordStatusMessage.includes(
              t("sccDailyHTQC.newRecordKey", "New")
            ) ||
            recordStatusMessage.includes(
              t("sccDailyHTQC.selectMoColorKey", "select MO and Color")
            ) ||
            recordStatusMessage.includes(
              t(
                "sccDailyHTQC.newRecordMachineDate",
                "New record for this Machine & Date"
              )
            )
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-green-50 text-green-700 border-green-200"
          }`}
        >
          <Info size={18} className="mr-2 shrink-0" /> {recordStatusMessage}
        </div>
      )}

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
            popperPlacement="bottom-start"
            id="htqcInspectionDate"
          />
        </div>
        <div>
          <label htmlFor="htqcMachineNo" className={labelClasses}>
            {t("scc.machineNo")}
          </label>
          <select
            id="htqcMachineNo"
            name="machineNo"
            value={localFormData.machineNo || ""}
            onChange={handleMachineNoChange}
            className={inputFieldClasses}
            required
          >
            <option value="">{t("scc.selectMachine")}</option>
            {Array.from({ length: 15 }, (_, i) => String(i + 1)).map((num) => (
              <option key={`machine-${num}`} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <label htmlFor="htqcMoNoSearch" className={labelClasses}>
            {t("scc.moNo")}
          </label>
          <div className="relative mt-1" ref={moNoDropdownRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="htqcMoNoSearch"
              value={moNoSearch}
              ref={moNoInputRef}
              onChange={(e) => setMoNoSearch(e.target.value)}
              onFocus={() => {
                // If there are existing records, show them, otherwise show MO search results
                if (availableMachineRecords.length > 0 && !moNoSearch) {
                  setShowMoNoDropdown(false); // Don't show search results if existing list is primary
                } else {
                  setShowMoNoDropdown(true);
                }
              }}
              placeholder={t("scc.searchMoNo")}
              className={`${inputFieldClasses} pl-10`}
            />
            {showMoNoDropdown && moNoOptions.length > 0 && (
              <ul className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
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
          {availableMachineRecords.length > 0 && (
            <div className="mt-1">
              <label
                htmlFor="selectExistingMo"
                className={`${labelClasses} text-xs`}
              >
                {t(
                  "sccDailyHTQC.selectExisting",
                  "Or select existing for this Machine/Date:"
                )}
              </label>
              <select
                id="selectExistingMo"
                onChange={handleExistingMoColorSelect}
                className={inputFieldClasses}
                value={
                  localFormData.moNo && localFormData.color
                    ? `${localFormData.moNo}|${localFormData.color}`
                    : ""
                }
              >
                <option value="">-- {t("scc.select")} --</option>
                {availableMachineRecords.map((rec) => (
                  <option
                    key={`${rec.moNo}-${rec.color}`}
                    value={`${rec.moNo}|${rec.color}`}
                  >
                    {rec.moNo} - {rec.color} ({rec.buyerStyle || t("scc.naCap")}
                    )
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

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
            name="color"
            value={localFormData.color || ""}
            onChange={handleColorChange}
            className={inputFieldClasses}
            disabled={!localFormData.moNo || availableColors.length === 0} // Disabled if no MO or no colors for MO
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

      {localFormData.moNo &&
        localFormData.color && ( // Only show table if MO and Color are selected
          <div className="mt-4 space-y-4">
            <h3 className="text-md font-semibold text-gray-700">
              {currentSlotTableTitle}
            </h3>
            {currentActiveSlotKey ? (
              renderCurrentSlotTable()
            ) : (
              <div className="text-center py-4 text-gray-500 italic">
                {t("sccDailyHTQC.allInspectionsCompleted")}
              </div>
            )}

            {!localFormData.isStretchWashingTestDone &&
              currentActiveSlotKey && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start pt-4 border-t border-gray-200 mt-4">
                  <div>
                    <label htmlFor="htqcStretchTest" className={labelClasses}>
                      {t("sccDailyHTQC.stretchScratchTest")}
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
                      <option value="Pending">{t("scc.pending")}</option>
                      <option value="Pass">{t("scc.pass")}</option>
                      <option value="Reject">{t("scc.reject")}</option>
                    </select>
                    {localFormData.stretchTestResult === "Reject" && (
                      <div
                        className="mt-2 relative"
                        ref={rejectReasonDropdownRef}
                      >
                        <label className={`${labelClasses} text-xs`}>
                          {t("sccDailyHTQC.rejectReasons")}
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setShowRejectReasonDropdown((prev) => !prev)
                          }
                          className="w-full text-left px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm flex justify-between items-center"
                        >
                          <span>
                            {(
                              localFormData.stretchTestRejectReasons || []
                            ).join(", ") || t("sccDailyHTQC.selectReasons")}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`transform transition-transform ${
                              showRejectReasonDropdown ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {showRejectReasonDropdown && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto py-1">
                            {STRETCH_TEST_REJECT_REASONS_OPTIONS.map(
                              (reason) => (
                                <div
                                  key={reason}
                                  onClick={() =>
                                    handleRejectReasonSelect(reason)
                                  }
                                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                                    (
                                      localFormData.stretchTestRejectReasons ||
                                      []
                                    ).includes(reason)
                                      ? "bg-indigo-50 text-indigo-700"
                                      : ""
                                  }`}
                                >
                                  {reason}
                                  {(
                                    localFormData.stretchTestRejectReasons || []
                                  ).includes(reason) && (
                                    <CheckCircle
                                      size={14}
                                      className="text-indigo-600"
                                    />
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="htqcWashingTest" className={labelClasses}>
                      {t("sccDailyHTQC.washingTest")}
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
                      <option value="Pending">{t("scc.pending")}</option>
                      <option value="Pass">{t("scc.pass")}</option>
                      <option value="Reject">{t("scc.reject")}</option>
                    </select>
                  </div>
                </div>
              )}
            {localFormData.isStretchWashingTestDone && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start pt-4 border-t border-gray-200 mt-4">
                <div>
                  <label className={labelClasses}>
                    {t("sccDailyHTQC.stretchScratchTest")}
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
                  {localFormData.stretchTestResult === "Reject" &&
                    (localFormData.stretchTestRejectReasons || []).length >
                      0 && (
                      <div className="mt-1 text-xs text-gray-600">
                        <strong>{t("sccDailyHTQC.reasons")}:</strong>{" "}
                        {localFormData.stretchTestRejectReasons.join(", ")}
                      </div>
                    )}
                </div>
                <div>
                  <label className={labelClasses}>
                    {t("sccDailyHTQC.washingTest")}
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

      <div className="pt-5 flex justify-end">
        <button
          type="button"
          onClick={handleFormActualSubmit}
          disabled={
            isSubmitting ||
            !currentActiveSlotKey ||
            loading ||
            !localFormData.moNo ||
            !localFormData.color
          }
          className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
          {currentActiveSlotKey
            ? `${t("scc.submit")} (${
                TIME_SLOTS_CONFIG.find((s) => s.key === currentActiveSlotKey)
                  ?.label
              })`
            : t("sccDailyHTQC.selectMoColorPrompt")}
        </button>
      </div>
    </div>
  );
};

export default DailyHTQC;
