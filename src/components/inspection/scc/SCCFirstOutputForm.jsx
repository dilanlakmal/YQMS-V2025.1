// import React, { useState, useEffect, useRef, useCallback } from "react";
// import axios from "axios";
// import { API_BASE_URL } from "../../../../config";
// import { useAuth } from "../../authentication/AuthContext";
// import { useTranslation } from "react-i18next";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import Swal from "sweetalert2";
// import { Loader2, AlertCircle, Info, Search } from "lucide-react"; // Removed ChevronDown as select has its own
// import SCCImageUpload from "./SCCImageUpload";

// const initialSpecState = {
//   type: "", // 'first' or 'afterHat'
//   method: "",
//   timeSec: "",
//   tempC: "",
//   tempOffset: "0",
//   pressure: "",
//   status: "Pass",
//   remarks: ""
// };

// const SCCFirstOutputForm = ({
//   formType, // "HT" or "FU"
//   formData,
//   onFormDataChange,
//   onFormSubmit,
//   isSubmitting
// }) => {
//   const { t } = useTranslation();
//   const { user } = useAuth();

//   const [moNoSearch, setMoNoSearch] = useState(formData.moNo || "");
//   const [moNoOptions, setMoNoOptions] = useState([]);
//   const [showMoNoDropdown, setShowMoNoDropdown] = useState(false);
//   const [availableColors, setAvailableColors] = useState([]);
//   const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
//   const [existingRecordLoading, setExistingRecordLoading] = useState(false);
//   const [recordStatusMessage, setRecordStatusMessage] = useState("");

//   const moNoDropdownRef = useRef(null);
//   const moNoInputRef = useRef(null);
//   const machineNoDropdownRef = useRef(null); // Added for completeness, might not be complex enough for a separate click-outside

//   const methodText =
//     formType === "HT"
//       ? t("scc.heatTransfer", "Heat Transfer")
//       : t("scc.fusingMethod", "Fusing");

//   const formTitle =
//     formType === "HT"
//       ? t("scc.firstOutputHTTitle", "First Output - Heat Transfer")
//       : t("scc.firstOutputFUTitle", "First Output - Fusing");

//   const machineNoOptions =
//     formType === "HT"
//       ? Array.from({ length: 15 }, (_, i) => String(i + 1))
//       : Array.from({ length: 5 }, (_, i) => String(i + 1).padStart(3, "0"));

//   useEffect(() => {
//     // Initialize or update standardSpecification based on formType
//     // This also ensures 'method' is correctly set if formType changes (e.g. due to parent tab logic)
//     const defaultSpecs = [
//       { ...initialSpecState, type: "first", method: methodText, remarks: "" },
//       { ...initialSpecState, type: "afterHat", method: methodText, remarks: "" }
//     ];

//     let currentSpecs = formData.standardSpecification;
//     let specsChanged = false;

//     if (!currentSpecs || currentSpecs.length < 2) {
//       currentSpecs = defaultSpecs;
//       specsChanged = true;
//     } else {
//       // Check if method needs update or remarks need initialization
//       currentSpecs = currentSpecs.map((spec) => {
//         const updatedSpec = { ...spec };
//         if (updatedSpec.method !== methodText) {
//           updatedSpec.method = methodText;
//           specsChanged = true;
//         }
//         if (typeof updatedSpec.remarks === "undefined") {
//           updatedSpec.remarks = ""; // Ensure remarks field exists
//           specsChanged = true;
//         }
//         return updatedSpec;
//       });
//     }

//     if (specsChanged) {
//       onFormDataChange({
//         ...formData,
//         standardSpecification: currentSpecs
//       });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [formType, methodText, t]); // formData and onFormDataChange removed to prevent potential deep comparison loops
//   // methodText depends on t, formType.

//   const fetchMoNumbers = useCallback(async () => {
//     if (moNoSearch.trim() === "") {
//       setMoNoOptions([]);
//       setShowMoNoDropdown(false);
//       return;
//     }
//     try {
//       const response = await axios.get(`${API_BASE_URL}/api/search-mono`, {
//         params: { term: moNoSearch }
//       });
//       setMoNoOptions(response.data || []);
//       setShowMoNoDropdown(response.data.length > 0);
//     } catch (error) {
//       console.error(t("scc.errorFetchingMoLog"), error);
//       setMoNoOptions([]);
//       setShowMoNoDropdown(false);
//     }
//   }, [moNoSearch, t]);

//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       if (moNoSearch !== formData.moNo || !formData.moNo) {
//         fetchMoNumbers();
//       }
//     }, 300);
//     return () => clearTimeout(delayDebounceFn);
//   }, [moNoSearch, formData.moNo, fetchMoNumbers]);

//   const handleMoSelect = (selectedMo) => {
//     setMoNoSearch(selectedMo);
//     onFormDataChange({
//       ...formData, // Preserve date and machineNo
//       moNo: selectedMo,
//       buyer: "",
//       buyerStyle: "",
//       color: "", // Reset color
//       _id: null,
//       standardSpecification: [
//         { ...initialSpecState, type: "first", method: methodText, remarks: "" },
//         {
//           ...initialSpecState,
//           type: "afterHat",
//           method: methodText,
//           remarks: ""
//         }
//       ],
//       referenceSampleImageFile: null,
//       referenceSampleImageUrl: null,
//       afterWashImageFile: null,
//       afterWashImageUrl: null,
//       remarks: ""
//     });
//     setShowMoNoDropdown(false);
//     setRecordStatusMessage("");
//   };

//   useEffect(() => {
//     const fetchOrderDetails = async () => {
//       if (!formData.moNo) {
//         if (formData.buyer || formData.buyerStyle || formData.color) {
//           onFormDataChange((prev) => ({
//             ...prev,
//             buyer: "",
//             buyerStyle: "",
//             color: "" // Also clear color when MO is cleared
//           }));
//         }
//         setAvailableColors([]);
//         return;
//       }
//       setOrderDetailsLoading(true);
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/api/order-details/${formData.moNo}`
//         );
//         const details = response.data;
//         onFormDataChange((prev) => ({
//           ...prev,
//           buyer: details.engName || "N/A",
//           buyerStyle: details.custStyle || "N/A"
//         }));
//         setAvailableColors(details.colors || []);
//       } catch (error) {
//         console.error(t("scc.errorFetchingOrderDetailsLog"), error);
//         Swal.fire(t("scc.error"), t("scc.errorFetchingOrderDetails"), "error");
//         onFormDataChange((prev) => ({
//           ...prev,
//           buyer: "",
//           buyerStyle: "",
//           color: ""
//         }));
//         setAvailableColors([]);
//       } finally {
//         setOrderDetailsLoading(false);
//       }
//     };

//     if (formData.moNo) {
//       fetchOrderDetails();
//     } else {
//       // If moNo becomes empty (e.g., user clears it), clear related fields
//       if (formData.buyer || formData.buyerStyle || formData.color) {
//         onFormDataChange((prev) => ({
//           ...prev,
//           buyer: "",
//           buyerStyle: "",
//           color: ""
//         }));
//       }
//       setAvailableColors([]);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [formData.moNo, t]); // onFormDataChange removed from deps to avoid loops. Direct calls are okay.

//   useEffect(() => {
//     const fetchExistingRecord = async () => {
//       if (
//         !formData.moNo ||
//         !formData.color ||
//         !formData.inspectionDate ||
//         !formData.machineNo
//       )
//         return;

//       setExistingRecordLoading(true);
//       setRecordStatusMessage("");
//       try {
//         const endpoint =
//           formType === "HT"
//             ? "/api/scc/ht-first-output"
//             : "/api/scc/fu-first-output";
//         const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
//           params: {
//             moNo: formData.moNo,
//             color: formData.color,
//             inspectionDate: formData.inspectionDate.toISOString(),
//             machineNo: formData.machineNo
//           }
//         });

//         const recordData = response.data;

//         if (
//           recordData.message === "HT_RECORD_NOT_FOUND" ||
//           recordData.message === "FU_RECORD_NOT_FOUND" ||
//           !recordData.data
//         ) {
//           setRecordStatusMessage(t("scc.newRecordMessage"));
//           // When a new record is identified for the current criteria,
//           // reset specific fields like _id and images, but preserve current MO, Color, Date, MachineNo,
//           // and potentially user-typed remarks in specs or main remarks.
//           onFormDataChange((prev) => ({
//             ...prev, // This keeps existing date, machineNo, moNo, color, buyer, buyerStyle
//             _id: null, // Ensure it's treated as new
//             standardSpecification: [
//               // Reset specs but try to preserve any typed remarks
//               {
//                 ...initialSpecState,
//                 type: "first",
//                 method: methodText,
//                 remarks: prev.standardSpecification?.[0]?.remarks || ""
//               },
//               {
//                 ...initialSpecState,
//                 type: "afterHat",
//                 method: methodText,
//                 remarks: prev.standardSpecification?.[1]?.remarks || ""
//               }
//             ],
//             referenceSampleImageFile: null,
//             referenceSampleImageUrl: null,
//             afterWashImageFile: null,
//             afterWashImageUrl: null,
//             remarks: prev.remarks || "" // Preserve main remarks if typed
//           }));
//         } else {
//           const loadedRecord = recordData.data || recordData;
//           const mapSpecsForDisplay = (specs) =>
//             specs.map((spec) => ({
//               ...spec,
//               tempOffset:
//                 spec.tempOffsetPlus !== 0
//                   ? String(spec.tempOffsetPlus)
//                   : spec.tempOffsetMinus !== 0
//                   ? String(spec.tempOffsetMinus)
//                   : "0",
//               remarks: spec.remarks || "",
//               pressure: spec.pressure !== null ? String(spec.pressure) : "" // Convert pressure to string for input
//             }));

//           setRecordStatusMessage(t("scc.existingRecordLoadedShort"));
//           onFormDataChange((prev) => ({
//             ...prev, // Keeps current date, machineNo, moNo, color, buyer, buyerStyle
//             _id: loadedRecord._id,
//             standardSpecification: mapSpecsForDisplay(
//               loadedRecord.standardSpecification
//             ),
//             referenceSampleImageUrl: loadedRecord.referenceSampleImage,
//             afterWashImageUrl: loadedRecord.afterWashImage,
//             remarks:
//               loadedRecord.remarks === "NA" ? "" : loadedRecord.remarks || ""
//           }));
//         }
//       } catch (error) {
//         console.error(t("scc.errorFetchingExistingLog"), error);
//         if (
//           !(
//             error.response &&
//             (error.response.data.message === "HT_RECORD_NOT_FOUND" ||
//               error.response.data.message === "FU_RECORD_NOT_FOUND")
//           )
//         ) {
//           Swal.fire(t("scc.error"), t("scc.errorFetchingExisting"), "error");
//         }
//         onFormDataChange((prev) => ({
//           ...prev,
//           _id: null,
//           standardSpecification: [
//             {
//               ...initialSpecState,
//               type: "first",
//               method: methodText,
//               remarks: ""
//             },
//             {
//               ...initialSpecState,
//               type: "afterHat",
//               method: methodText,
//               remarks: ""
//             }
//           ],
//           referenceSampleImageUrl: null,
//           afterWashImageUrl: null,
//           remarks: ""
//         }));
//       } finally {
//         setExistingRecordLoading(false);
//       }
//     };

//     if (
//       formData.moNo &&
//       formData.color &&
//       formData.inspectionDate &&
//       formData.machineNo
//     ) {
//       fetchExistingRecord();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     formData.moNo,
//     formData.color,
//     formData.inspectionDate,
//     formData.machineNo,
//     formType,
//     methodText,
//     t
//   ]);
//   // onFormDataChange removed to prevent loops.

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     let newFormData = { ...formData, [name]: value };
//     if (
//       name === "moNo" ||
//       name === "machineNo" ||
//       name === "color" ||
//       name === "inspectionDate"
//     ) {
//       newFormData._id = null;
//       setRecordStatusMessage("");
//       if (name === "moNo") {
//         setMoNoSearch(value);
//         newFormData.color = "";
//         newFormData.buyer = "";
//         newFormData.buyerStyle = "";
//         setAvailableColors([]);
//       }
//     }
//     onFormDataChange(newFormData);
//   };

//   const handleDateChange = (date) => {
//     onFormDataChange({ ...formData, inspectionDate: date, _id: null });
//     setRecordStatusMessage(""); // Clear status on date change
//   };

//   const handleMachineNoChange = (e) => {
//     onFormDataChange({ ...formData, machineNo: e.target.value, _id: null });
//     setRecordStatusMessage(""); // Clear status on machine change
//   };

//   const handleColorChange = (e) => {
//     onFormDataChange({ ...formData, color: e.target.value, _id: null });
//     setRecordStatusMessage(""); // Clear status on color change
//   };

//   const handleSpecChange = (specIndex, field, value) => {
//     const newSpecs = formData.standardSpecification
//       ? [...formData.standardSpecification]
//       : [
//           { ...initialSpecState, type: "first", method: methodText },
//           { ...initialSpecState, type: "afterHat", method: methodText }
//         ];

//     if (!newSpecs[specIndex]) {
//       // Should not happen if initialized correctly
//       newSpecs[specIndex] = {
//         ...initialSpecState,
//         type: specIndex === 0 ? "first" : "afterHat",
//         method: methodText
//       };
//     }
//     newSpecs[specIndex] = { ...newSpecs[specIndex], [field]: value };
//     onFormDataChange({ ...formData, standardSpecification: newSpecs });
//   };

//   const handleImageChange = (imageType, file, previewUrl) => {
//     if (imageType === "referenceSample") {
//       onFormDataChange({
//         ...formData,
//         referenceSampleImageFile: file,
//         referenceSampleImageUrl: previewUrl
//       });
//     } else if (imageType === "afterWash") {
//       onFormDataChange({
//         ...formData,
//         afterWashImageFile: file,
//         afterWashImageUrl: previewUrl
//       });
//     }
//   };

//   const handleImageRemove = (imageType) => {
//     if (imageType === "referenceSample") {
//       onFormDataChange({
//         ...formData,
//         referenceSampleImageFile: null,
//         referenceSampleImageUrl: null
//       });
//     } else if (imageType === "afterWash") {
//       onFormDataChange({
//         ...formData,
//         afterWashImageFile: null,
//         afterWashImageUrl: null
//       });
//     }
//   };

//   const firstSpecStatus = formData.standardSpecification?.[0]?.status;
//   // After Heat is REQUIRED if First is Reject.
//   // If First is Pass, After Heat fields are optional/can be different.
//   const isAfterHeatDisabled = firstSpecStatus === "Pass";
//   const isSpecTableDisabled = !formData.color;

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         moNoDropdownRef.current &&
//         !moNoDropdownRef.current.contains(event.target) &&
//         moNoInputRef.current &&
//         !moNoInputRef.current.contains(event.target)
//       ) {
//         setShowMoNoDropdown(false);
//       }
//       // No complex dropdown for machineNo currently, so no specific click-outside for it.
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   if (!user) {
//     return (
//       <div className="p-6 text-center">
//         {t("scc.loadingUser", "Loading user data...")}
//       </div>
//     );
//   }

//   // Ensure specs are always an array of 2, even if formData.standardSpecification is briefly undefined
//   const specs =
//     formData.standardSpecification &&
//     formData.standardSpecification.length === 2
//       ? formData.standardSpecification
//       : [
//           {
//             ...initialSpecState,
//             type: "first",
//             method: methodText,
//             remarks: ""
//           },
//           {
//             ...initialSpecState,
//             type: "afterHat",
//             method: methodText,
//             remarks: ""
//           }
//         ];

//   return (
//     <form
//       onSubmit={(e) => {
//         e.preventDefault();
//         onFormSubmit(formType);
//       }}
//       className="space-y-6"
//     >
//       <h2 className="text-xl font-semibold text-gray-700 mb-4">{formTitle}</h2>

//       {(orderDetailsLoading || existingRecordLoading) && (
//         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
//           <Loader2 className="animate-spin h-12 w-12 text-white" />
//         </div>
//       )}
//       {recordStatusMessage && (
//         <div
//           className={`p-3 mb-4 rounded-md text-sm flex items-center ${
//             recordStatusMessage.includes(
//               t("scc.newRecordMessageKey", "new record")
//             )
//               ? "bg-blue-100 text-blue-700"
//               : "bg-green-100 text-green-700"
//           }`}
//         >
//           <Info size={18} className="mr-2" />
//           {recordStatusMessage}
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div>
//           <label
//             htmlFor={`${formType}-inspectionDate`}
//             className="block text-sm font-medium text-gray-700"
//           >
//             {t("scc.date", "Date")}
//           </label>
//           <DatePicker
//             selected={
//               formData.inspectionDate
//                 ? new Date(formData.inspectionDate)
//                 : new Date()
//             }
//             onChange={handleDateChange}
//             dateFormat="MM/dd/yyyy"
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             required
//             id={`${formType}-inspectionDate`}
//           />
//         </div>
//         <div ref={machineNoDropdownRef}>
//           <label
//             htmlFor={`${formType}-machineNo`}
//             className="block text-sm font-medium text-gray-700"
//           >
//             {t("scc.machineNo", "Machine No")}
//           </label>
//           <select
//             id={`${formType}-machineNo`}
//             name="machineNo"
//             value={formData.machineNo || ""}
//             onChange={handleMachineNoChange}
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             required
//           >
//             <option value="">
//               {t("scc.selectMachine", "Select Machine...")}
//             </option>
//             {machineNoOptions.map((num) => (
//               <option key={num} value={num}>
//                 {num}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="relative">
//           <label
//             htmlFor={`${formType}-moNoSearch`}
//             className="block text-sm font-medium text-gray-700"
//           >
//             {t("scc.moNo", "MO No")}
//           </label>
//           <div className="relative mt-1" ref={moNoDropdownRef}>
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
//             </div>
//             <input
//               type="text"
//               id={`${formType}-moNoSearch`}
//               ref={moNoInputRef}
//               value={moNoSearch}
//               onChange={(e) => setMoNoSearch(e.target.value)}
//               onFocus={() => setShowMoNoDropdown(true)}
//               placeholder={t("scc.searchMoNo", "Search MO No...")}
//               className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               required
//             />
//             {showMoNoDropdown && moNoOptions.length > 0 && (
//               <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
//                 {moNoOptions.map((mo) => (
//                   <li
//                     key={mo}
//                     onClick={() => handleMoSelect(mo)}
//                     className="px-3 py-2 cursor-pointer hover:bg-gray-100"
//                   >
//                     {mo}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             {t("scc.buyer", "Buyer")}
//           </label>
//           <input
//             type="text"
//             value={formData.buyer || ""}
//             readOnly
//             className="mt-1 block w-full bg-gray-100 px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             {t("scc.buyerStyle", "Buyer Style")}
//           </label>
//           <input
//             type="text"
//             value={formData.buyerStyle || ""}
//             readOnly
//             className="mt-1 block w-full bg-gray-100 px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
//           />
//         </div>
//         <div>
//           <label
//             htmlFor={`${formType}-color`}
//             className="block text-sm font-medium text-gray-700"
//           >
//             {t("scc.color", "Color")}
//           </label>
//           <select
//             id={`${formType}-color`}
//             name="color"
//             value={formData.color || ""}
//             onChange={handleColorChange}
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             disabled={!formData.moNo || availableColors.length === 0}
//             required
//           >
//             <option value="">{t("scc.selectColor", "Select Color...")}</option>
//             {availableColors.map((c) => (
//               <option key={c.key || c.original} value={c.original}>
//                 {c.original} {c.chn ? `(${c.chn})` : ""}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div
//         className={`mt-6 ${
//           isSpecTableDisabled ? "opacity-50 pointer-events-none" : ""
//         }`}
//       >
//         <h3 className="text-lg font-medium leading-6 text-gray-900">
//           {t("scc.standardSpecifications", "Standard Specifications")}
//         </h3>
//         <div className="mt-2 overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200 border">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
//                   {t("scc.parameter", "Parameter")}
//                 </th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
//                   {t("scc.first", "First")}
//                 </th>
//                 <th
//                   className={`px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
//                 >
//                   {t("scc.afterHeat", "After Heat")}
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {[
//                 {
//                   key: "method",
//                   label: t("scc.method", "Method"),
//                   type: "text",
//                   readOnly: true
//                 },
//                 {
//                   key: "timeSec",
//                   label: t("scc.timeSec", "Time (sec)"),
//                   type: "number",
//                   inputMode: "numeric"
//                 },
//                 {
//                   key: "tempC",
//                   label: t("scc.tempC", "Temp (°C)"),
//                   type: "number",
//                   inputMode: "numeric"
//                 },
//                 {
//                   key: "tempOffset",
//                   label: t("scc.tempOffset", "Temp Offset (±)"),
//                   type: "number",
//                   inputMode: "numeric"
//                 },
//                 {
//                   key: "pressure",
//                   label: t("scc.pressure", "Pressure"),
//                   type: "number",
//                   inputMode: "numeric"
//                 },
//                 {
//                   key: "status",
//                   label: t("scc.status", "Status"),
//                   type: "select",
//                   options: ["Pass", "Reject"]
//                 },
//                 {
//                   key: "remarks",
//                   label: t("scc.specRemarks", "Remarks"),
//                   type: "textarea"
//                 }
//               ].map(({ key, label, type, inputMode, readOnly, options }) => (
//                 <tr key={key}>
//                   <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
//                     {label}
//                   </td>
//                   <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border-r">
//                     {type === "select" ? (
//                       <select
//                         value={
//                           specs[0]?.[key] || (key === "status" ? "Pass" : "")
//                         }
//                         onChange={(e) =>
//                           handleSpecChange(0, key, e.target.value)
//                         }
//                         className="w-full p-1 border-gray-300 rounded-md text-sm"
//                         disabled={isSpecTableDisabled}
//                       >
//                         {options.map((opt) => (
//                           <option key={opt} value={opt}>
//                             {t(`scc.${opt.toLowerCase()}`, opt)}
//                           </option>
//                         ))}
//                       </select>
//                     ) : type === "textarea" ? (
//                       <textarea
//                         value={specs[0]?.[key] || ""}
//                         onChange={(e) =>
//                           handleSpecChange(0, key, e.target.value)
//                         }
//                         rows="2"
//                         className={`w-full p-1 border-gray-300 rounded-md text-sm ${
//                           readOnly ? "bg-gray-100" : ""
//                         }`}
//                         readOnly={readOnly}
//                         disabled={isSpecTableDisabled}
//                       />
//                     ) : (
//                       <input
//                         type={type}
//                         inputMode={inputMode || "text"}
//                         value={specs[0]?.[key] || ""}
//                         readOnly={readOnly}
//                         onChange={(e) =>
//                           handleSpecChange(0, key, e.target.value)
//                         }
//                         className={`w-full p-1 border-gray-300 rounded-md text-sm ${
//                           readOnly ? "bg-gray-100" : ""
//                         }`}
//                         disabled={isSpecTableDisabled}
//                       />
//                     )}
//                   </td>
//                   <td
//                     className={`px-4 py-2 whitespace-nowrap text-sm text-gray-500 ${
//                       isAfterHeatDisabled &&
//                       key !== "method" &&
//                       key !== "remarks" &&
//                       key !== "status"
//                         ? "bg-gray-100"
//                         : ""
//                     }`}
//                   >
//                     {key === "method" ||
//                     (key === "status" && specs[1]) ||
//                     (key === "remarks" && specs[1]) ? (
//                       type === "select" ? (
//                         <select
//                           value={
//                             specs[1]?.[key] || (key === "status" ? "Pass" : "")
//                           }
//                           onChange={(e) =>
//                             handleSpecChange(1, key, e.target.value)
//                           }
//                           className="w-full p-1 border-gray-300 rounded-md text-sm"
//                           disabled={
//                             isSpecTableDisabled ||
//                             (isAfterHeatDisabled &&
//                               key !== "method" &&
//                               key !== "remarks" &&
//                               key !== "status")
//                           }
//                         >
//                           {options.map((opt) => (
//                             <option key={opt} value={opt}>
//                               {t(`scc.${opt.toLowerCase()}`, opt)}
//                             </option>
//                           ))}
//                         </select>
//                       ) : type === "textarea" ? (
//                         <textarea
//                           value={specs[1]?.[key] || ""}
//                           onChange={(e) =>
//                             handleSpecChange(1, key, e.target.value)
//                           }
//                           rows="2"
//                           className={`w-full p-1 border-gray-300 rounded-md text-sm ${
//                             readOnly ||
//                             (isAfterHeatDisabled &&
//                               key !== "method" &&
//                               key !== "remarks")
//                               ? "bg-gray-100"
//                               : ""
//                           }`}
//                           readOnly={
//                             readOnly ||
//                             (isAfterHeatDisabled &&
//                               key !== "method" &&
//                               key !== "remarks")
//                           }
//                           disabled={
//                             isSpecTableDisabled ||
//                             (isAfterHeatDisabled &&
//                               key !== "method" &&
//                               key !== "remarks")
//                           }
//                         />
//                       ) : (
//                         <input
//                           type={type}
//                           inputMode={inputMode || "text"}
//                           value={specs[1]?.[key] || ""}
//                           readOnly={
//                             readOnly ||
//                             (isAfterHeatDisabled &&
//                               key !== "method" &&
//                               key !== "remarks" &&
//                               key !== "status")
//                           }
//                           onChange={(e) =>
//                             handleSpecChange(1, key, e.target.value)
//                           }
//                           className={`w-full p-1 border-gray-300 rounded-md text-sm ${
//                             readOnly ||
//                             (isAfterHeatDisabled &&
//                               key !== "method" &&
//                               key !== "remarks" &&
//                               key !== "status")
//                               ? "bg-gray-100"
//                               : ""
//                           }`}
//                           disabled={
//                             isSpecTableDisabled ||
//                             (isAfterHeatDisabled &&
//                               key !== "method" &&
//                               key !== "remarks" &&
//                               key !== "status")
//                           }
//                         />
//                       )
//                     ) : specs[1] ? (
//                       <input
//                         type={type}
//                         inputMode={inputMode || "text"}
//                         value={specs[1]?.[key] || ""}
//                         readOnly={isAfterHeatDisabled}
//                         onChange={(e) =>
//                           handleSpecChange(1, key, e.target.value)
//                         }
//                         className={`w-full p-1 border-gray-300 rounded-md text-sm ${
//                           isAfterHeatDisabled ? "bg-gray-100" : ""
//                         }`}
//                         disabled={isSpecTableDisabled || isAfterHeatDisabled}
//                       />
//                     ) : null}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           {firstSpecStatus === "Reject" && !isSpecTableDisabled && (
//             <p className="mt-2 text-sm text-red-600 flex items-center">
//               <AlertCircle size={16} className="mr-1" />
//               {t("scc.afterHeatIsRequired", "After Heat details are required.")}
//             </p>
//           )}
//           {isSpecTableDisabled && (
//             <p className="mt-2 text-sm text-blue-600 flex items-center">
//               <Info size={16} className="mr-1" />
//               {t(
//                 "scc.selectColorToEnableSpecs",
//                 "Please select a color to enable specification entry."
//               )}
//             </p>
//           )}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//         <SCCImageUpload
//           label={t("scc.referenceSample", "Reference Sample")}
//           onImageChange={(file, url) =>
//             handleImageChange("referenceSample", file, url)
//           }
//           onImageRemove={() => handleImageRemove("referenceSample")}
//           initialImageUrl={formData.referenceSampleImageUrl}
//           imageType="referenceSample"
//         />
//         <SCCImageUpload
//           label={t("scc.afterWash", "After Wash")}
//           onImageChange={(file, url) =>
//             handleImageChange("afterWash", file, url)
//           }
//           onImageRemove={() => handleImageRemove("afterWash")}
//           initialImageUrl={formData.afterWashImageUrl}
//           imageType="afterWash"
//         />
//       </div>

//       <div className="mt-6">
//         <label
//           htmlFor="remarks"
//           className="block text-sm font-medium text-gray-700"
//         >
//           {t("scc.mainRemarks", "Remarks")}
//         </label>
//         <textarea
//           id="remarks"
//           name="remarks"
//           rows="3"
//           maxLength="250"
//           value={formData.remarks || ""}
//           onChange={handleInputChange} // Use generic input change handler
//           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           placeholder={t("scc.remarksPlaceholder", "Enter remarks here...")}
//         ></textarea>
//         <p className="mt-1 text-xs text-gray-500 text-right">
//           {(formData.remarks || "").length} / 250{" "}
//           {t("scc.characters", "characters")}
//         </p>
//       </div>

//       <div className="pt-5">
//         <div className="flex justify-end">
//           <button
//             type="submit"
//             disabled={isSubmitting || isSpecTableDisabled}
//             className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
//           >
//             {isSubmitting ? (
//               <Loader2 className="animate-spin h-5 w-5 mr-2" />
//             ) : null}
//             {formData._id
//               ? t("scc.update", "Update")
//               : t("scc.submit", "Submit")}
//           </button>
//         </div>
//       </div>
//     </form>
//   );
// };

// export default SCCFirstOutputForm;

// src/components/inspection/scc/SCCFirstOutputForm.jsx
import axios from "axios";
import { Info, Loader2, Search } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../../../../config";
import { useAuth } from "../../authentication/AuthContext";
import SCCImageUpload from "./SCCImageUpload";

const initialSpecState = {
  type: "first", // Default to 'first'
  method: "",
  timeSec: "",
  tempC: "",
  tempOffset: "5", // Default Temp Offset
  pressure: "",
  status: "Pass",
  remarks: "",
};

const SCCFirstOutputForm = ({
  formType, // "HT" or "FU"
  formData,
  onFormDataChange,
  onFormSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [moNoSearch, setMoNoSearch] = useState(formData.moNo || "");
  const [moNoOptions, setMoNoOptions] = useState([]);
  const [showMoNoDropdown, setShowMoNoDropdown] = useState(false);
  const [availableColors, setAvailableColors] = useState([]);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [existingRecordLoading, setExistingRecordLoading] = useState(false);
  const [recordStatusMessage, setRecordStatusMessage] = useState("");

  const moNoDropdownRef = useRef(null);
  const moNoInputRef = useRef(null);

  const methodText =
    formType === "HT"
      ? t("scc.heatTransfer", "Heat Transfer")
      : t("scc.fusingMethod", "Fusing");

  const formTitle =
    formType === "HT"
      ? t("scc.firstOutputHTTitle", "First Output - Heat Transfer")
      : t("scc.firstOutputFUTitle", "First Output - Fusing");

  const machineNoOptions =
    formType === "HT"
      ? Array.from({ length: 15 }, (_, i) => String(i + 1))
      : Array.from({ length: 5 }, (_, i) => String(i + 1).padStart(3, "0"));

  // Ensure standardSpecification is initialized correctly
  useEffect(() => {
    let currentSpecs = formData.standardSpecification;
    let specsChanged = false;

    // Ensure first spec exists and has correct method
    if (!currentSpecs || currentSpecs.length === 0) {
      currentSpecs = [
        { ...initialSpecState, type: "first", method: methodText },
      ];
      specsChanged = true;
    } else {
      if (
        currentSpecs[0].method !== methodText ||
        typeof currentSpecs[0].remarks === "undefined" ||
        typeof currentSpecs[0].tempOffset === "undefined"
      ) {
        currentSpecs[0] = {
          ...initialSpecState, // ensure all fields from initialSpecState are there
          ...currentSpecs[0], // then overlay existing data
          type: "first",
          method: methodText,
          remarks: currentSpecs[0].remarks || "",
          tempOffset: currentSpecs[0].tempOffset || "5",
        };
        specsChanged = true;
      }
    }

    // Ensure second spec exists if showSecondHeatSpec is true, and has correct method
    if (formData.showSecondHeatSpec) {
      if (currentSpecs.length < 2) {
        currentSpecs.push({
          ...initialSpecState,
          type: "2nd heat",
          method: methodText,
        });
        specsChanged = true;
      } else {
        if (
          currentSpecs[1].method !== methodText ||
          typeof currentSpecs[1].remarks === "undefined" ||
          typeof currentSpecs[1].tempOffset === "undefined"
        ) {
          currentSpecs[1] = {
            ...initialSpecState,
            ...currentSpecs[1],
            type: "2nd heat",
            method: methodText,
            remarks: currentSpecs[1].remarks || "",
            tempOffset: currentSpecs[1].tempOffset || "5",
          };
          specsChanged = true;
        }
      }
    } else if (!formData.showSecondHeatSpec && currentSpecs.length > 1) {
      // Remove second spec if showSecondHeatSpec is false
      currentSpecs = [currentSpecs[0]];
      specsChanged = true;
    }

    if (specsChanged) {
      onFormDataChange({
        ...formData,
        standardSpecification: currentSpecs,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formType, methodText, t, formData.showSecondHeatSpec]); // formData and onFormDataChange removed to prevent deep comparison loops

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
      if (moNoSearch !== formData.moNo || !formData.moNo) {
        fetchMoNumbers();
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [moNoSearch, formData.moNo, fetchMoNumbers]);

  const handleMoSelect = (selectedMo) => {
    setMoNoSearch(selectedMo);
    onFormDataChange({
      ...formData, // Preserve existing specs, images, remarks, showSecondHeatSpec
      moNo: selectedMo,
      buyer: "",
      buyerStyle: "",
      color: "",
      _id: null, // Reset ID
      // Do NOT reset standardSpecification, referenceSampleImageFile, etc. here
    });
    setShowMoNoDropdown(false);
    setRecordStatusMessage("");
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!formData.moNo) {
        if (formData.buyer || formData.buyerStyle || formData.color) {
          onFormDataChange((prev) => ({
            ...prev,
            buyer: "",
            buyerStyle: "",
            color: "",
          }));
        }
        setAvailableColors([]);
        return;
      }
      setOrderDetailsLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/order-details/${formData.moNo}`
        );
        const details = response.data;
        onFormDataChange((prev) => ({
          ...prev,
          buyer: details.engName || "N/A",
          buyerStyle: details.custStyle || "N/A",
        }));
        setAvailableColors(details.colors || []);
      } catch (error) {
        console.error(t("scc.errorFetchingOrderDetailsLog"), error);
        Swal.fire(t("scc.error"), t("scc.errorFetchingOrderDetails"), "error");
        onFormDataChange((prev) => ({
          ...prev,
          buyer: "",
          buyerStyle: "",
          color: "",
        }));
        setAvailableColors([]);
      } finally {
        setOrderDetailsLoading(false);
      }
    };

    if (formData.moNo) {
      fetchOrderDetails();
    } else {
      if (formData.buyer || formData.buyerStyle || formData.color) {
        onFormDataChange((prev) => ({
          ...prev,
          buyer: "",
          buyerStyle: "",
          color: "",
        }));
      }
      setAvailableColors([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.moNo, t]);

  useEffect(() => {
    const fetchExistingRecord = async () => {
      if (
        !formData.moNo ||
        !formData.color ||
        !formData.inspectionDate ||
        !formData.machineNo
      )
        return;

      setExistingRecordLoading(true);
      setRecordStatusMessage("");
      try {
        const endpoint =
          formType === "HT"
            ? "/api/scc/ht-first-output"
            : "/api/scc/fu-first-output";
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          params: {
            moNo: formData.moNo,
            color: formData.color,
            inspectionDate: formData.inspectionDate.toISOString(),
            machineNo: formData.machineNo,
          },
        });

        const recordData = response.data;

        if (
          recordData.message === "HT_RECORD_NOT_FOUND" ||
          recordData.message === "FU_RECORD_NOT_FOUND" ||
          !recordData.data
        ) {
          setRecordStatusMessage(t("scc.newRecordMessage"));
          // When a new record is identified, preserve existing form data (specs, images, remarks)
          // but ensure _id is null.
          onFormDataChange((prev) => ({
            ...prev, // This keeps existing date, machineNo, moNo, color, buyer, buyerStyle, specs, images, remarks
            _id: null, // Ensure it's treated as new
          }));
        } else {
          const loadedRecord = recordData.data || recordData;
          const mapSpecsForDisplay = (specs) =>
            specs.map((spec) => ({
              ...spec,
              type: spec.type, // 'first' or '2nd heat'
              method: spec.method || methodText,
              tempOffset:
                spec.tempOffsetPlus !== 0
                  ? String(spec.tempOffsetPlus)
                  : spec.tempOffsetMinus !== 0
                  ? String(spec.tempOffsetMinus)
                  : "5", // Default to 5 if not set
              remarks: spec.remarks || "",
              pressure: spec.pressure !== null ? String(spec.pressure) : "",
              status: spec.status || "Pass",
              timeSec: spec.timeSec !== null ? String(spec.timeSec) : "",
              tempC: spec.tempC !== null ? String(spec.tempC) : "",
            }));

          setRecordStatusMessage(t("scc.existingRecordLoadedShort"));
          onFormDataChange((prev) => ({
            ...prev, // Keeps current date, machineNo, moNo, color, buyer, buyerStyle
            _id: loadedRecord._id,
            standardSpecification: mapSpecsForDisplay(
              loadedRecord.standardSpecification
            ),
            referenceSampleImageUrl: loadedRecord.referenceSampleImage,
            afterWashImageUrl: loadedRecord.afterWashImage,
            remarks:
              loadedRecord.remarks === "NA" ? "" : loadedRecord.remarks || "",
            showSecondHeatSpec: loadedRecord.standardSpecification?.length > 1,
          }));
        }
      } catch (error) {
        console.error(t("scc.errorFetchingExistingLog"), error);
        if (
          !(
            error.response &&
            (error.response.data.message === "HT_RECORD_NOT_FOUND" ||
              error.response.data.message === "FU_RECORD_NOT_FOUND")
          )
        ) {
          Swal.fire(t("scc.error"), t("scc.errorFetchingExisting"), "error");
        }
        // Preserve current form data, but ensure _id is null
        onFormDataChange((prev) => ({
          ...prev,
          _id: null,
          // standardSpecification array is preserved by not resetting it here.
          // referenceSampleImageUrl etc are also preserved.
        }));
      } finally {
        setExistingRecordLoading(false);
      }
    };

    if (
      formData.moNo &&
      formData.color &&
      formData.inspectionDate &&
      formData.machineNo
    ) {
      fetchExistingRecord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.moNo,
    formData.color,
    formData.inspectionDate,
    formData.machineNo,
    formType,
    methodText,
    t,
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    if (
      name === "moNo" ||
      name === "machineNo" ||
      name === "color"
      // inspectionDate change handled by handleDateChange
    ) {
      newFormData._id = null; // Reset _id, but keep spec data
      setRecordStatusMessage("");
      if (name === "moNo") {
        setMoNoSearch(value);
        newFormData.color = ""; // MO change should clear color selection
        newFormData.buyer = "";
        newFormData.buyerStyle = "";
        setAvailableColors([]);
      }
    }
    onFormDataChange(newFormData);
  };

  const handleDateChange = (date) => {
    onFormDataChange({
      ...formData, // Preserve existing spec data
      inspectionDate: date,
      _id: null,
    });
    setRecordStatusMessage("");
  };

  const handleMachineNoChange = (e) => {
    onFormDataChange({
      ...formData, // Preserve existing spec data
      machineNo: e.target.value,
      _id: null,
    });
    setRecordStatusMessage("");
  };

  const handleColorChange = (e) => {
    onFormDataChange({
      ...formData, // Preserve existing spec data
      color: e.target.value,
      _id: null,
    });
    setRecordStatusMessage("");
  };

  const handleShowSecondHeatChange = (e) => {
    const show = e.target.value === "yes";
    let newSpecs = [...(formData.standardSpecification || [])];

    if (show) {
      if (newSpecs.length < 2) {
        newSpecs.push({
          ...initialSpecState,
          type: "2nd heat",
          method: methodText,
        });
      } else {
        // Ensure the second spec is correctly typed if it exists
        newSpecs[1] = { ...newSpecs[1], type: "2nd heat", method: methodText };
      }
    } else {
      if (newSpecs.length > 1) {
        newSpecs = [newSpecs[0]]; // Keep only the first spec
      }
    }
    onFormDataChange({
      ...formData,
      showSecondHeatSpec: show,
      standardSpecification: newSpecs,
    });
  };

  const handleSpecChange = (specIndex, field, value) => {
    const newSpecs = [...formData.standardSpecification];
    if (!newSpecs[specIndex]) {
      // Should ideally not happen
      newSpecs[specIndex] = {
        ...initialSpecState,
        type: specIndex === 0 ? "first" : "2nd heat",
        method: methodText,
      };
    }
    newSpecs[specIndex] = { ...newSpecs[specIndex], [field]: value };
    onFormDataChange({ ...formData, standardSpecification: newSpecs });
  };

  const handleImageChange = (imageType, file, previewUrl) => {
    if (imageType === "referenceSample") {
      onFormDataChange({
        ...formData,
        referenceSampleImageFile: file,
        referenceSampleImageUrl: previewUrl,
      });
    } else if (imageType === "afterWash") {
      onFormDataChange({
        ...formData,
        afterWashImageFile: file,
        afterWashImageUrl: previewUrl,
      });
    }
  };

  const handleImageRemove = (imageType) => {
    if (imageType === "referenceSample") {
      onFormDataChange({
        ...formData,
        referenceSampleImageFile: null,
        referenceSampleImageUrl: null,
      });
    } else if (imageType === "afterWash") {
      onFormDataChange({
        ...formData,
        afterWashImageFile: null,
        afterWashImageUrl: null,
      });
    }
  };

  const isSpecTableDisabled =
    !formData.machineNo || !formData.moNo || !formData.color;

  useEffect(() => {
    const handleClickOutside = (event) => {
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

  if (!user) {
    return (
      <div className="p-6 text-center">
        {t("scc.loadingUser", "Loading user data...")}
      </div>
    );
  }

  // Ensure specs array exists and has at least one item for the first table
  const firstSpec = (formData.standardSpecification &&
    formData.standardSpecification[0]) || {
    ...initialSpecState,
    type: "first",
    method: methodText,
  };
  const secondSpec = (formData.showSecondHeatSpec &&
    formData.standardSpecification &&
    formData.standardSpecification[1]) || {
    ...initialSpecState,
    type: "2nd heat",
    method: methodText,
  };

  const renderSpecTable = (specData, specIndex, title, isDisabled) => {
    const specType = specIndex === 0 ? "first" : "2nd heat";
    return (
      <div
        className={`mt-6 ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        {isDisabled && (
          <p className="mt-2 text-sm text-blue-600 flex items-center">
            <Info size={16} className="mr-1" />
            {t(
              "scc.fillMachineMoColorToEnableSpecs",
              "Please fill Machine No, MO No, and Color to enable specification entry."
            )}
          </p>
        )}
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r w-1/3">
                  {t("scc.parameter", "Parameter")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/3">
                  {t(
                    `scc.${specType}`,
                    specType.charAt(0).toUpperCase() + specType.slice(1)
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                {
                  key: "method",
                  label: t("scc.method", "Method"),
                  type: "text",
                  readOnly: true,
                },
                {
                  key: "timeSec",
                  label: t("scc.timeSec", "Time (sec)"),
                  type: "number",
                  inputMode: "numeric",
                },
                {
                  key: "tempC",
                  label: t("scc.tempC", "Temp (°C)"),
                  type: "number",
                  inputMode: "numeric",
                },
                {
                  key: "tempOffset",
                  label: t("scc.tempOffset", "Temp Offset (±)"),
                  type: "number",
                  inputMode: "numeric",
                },
                {
                  key: "pressure",
                  label: t("scc.pressure", "Pressure"),
                  type: "number",
                  inputMode: "numeric",
                },
                {
                  key: "status",
                  label: t("scc.status", "Status"),
                  type: "select",
                  options: ["Pass", "Reject"],
                },
                {
                  key: "remarks",
                  label: t("scc.specRemarks", "Remarks"),
                  type: "textarea",
                },
              ].map(({ key, label, type, inputMode, readOnly, options }) => (
                <tr key={`${specType}-${key}`}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                    {label}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {type === "select" ? (
                      <select
                        value={
                          specData?.[key] || (key === "status" ? "Pass" : "")
                        }
                        onChange={(e) =>
                          handleSpecChange(specIndex, key, e.target.value)
                        }
                        className="w-full p-1 border-gray-300 rounded-md text-sm"
                        disabled={isDisabled}
                      >
                        {options.map((opt) => (
                          <option key={opt} value={opt}>
                            {t(`scc.${opt.toLowerCase()}`, opt)}
                          </option>
                        ))}
                      </select>
                    ) : type === "textarea" ? (
                      <textarea
                        value={specData?.[key] || ""}
                        onChange={(e) =>
                          handleSpecChange(specIndex, key, e.target.value)
                        }
                        rows="2"
                        className={`w-full p-1 border-gray-300 rounded-md text-sm ${
                          readOnly ? "bg-gray-100" : ""
                        }`}
                        readOnly={readOnly}
                        disabled={isDisabled}
                      />
                    ) : (
                      <input
                        type={type}
                        inputMode={inputMode || "text"}
                        value={
                          specData?.[key] ||
                          (key === "tempOffset" && !specData?.[key] ? "5" : "")
                        } // Default tempOffset to 5 if empty
                        readOnly={readOnly}
                        onChange={(e) =>
                          handleSpecChange(specIndex, key, e.target.value)
                        }
                        className={`w-full p-1 border-gray-300 rounded-md text-sm ${
                          readOnly ? "bg-gray-100" : ""
                        }`}
                        disabled={isDisabled}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onFormSubmit(formType);
      }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold text-gray-700 mb-4">{formTitle}</h2>

      {(orderDetailsLoading || existingRecordLoading) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <Loader2 className="animate-spin h-12 w-12 text-white" />
        </div>
      )}
      {recordStatusMessage && (
        <div
          className={`p-3 mb-4 rounded-md text-sm flex items-center ${
            recordStatusMessage.includes(
              t("scc.newRecordMessageKey", "new record")
            )
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          <Info size={18} className="mr-2" />
          {recordStatusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor={`${formType}-inspectionDate`}
            className="block text-sm font-medium text-gray-700"
          >
            {t("scc.date", "Date")}
          </label>
          <DatePicker
            selected={
              formData.inspectionDate
                ? new Date(formData.inspectionDate)
                : new Date()
            }
            onChange={handleDateChange}
            dateFormat="MM/dd/yyyy"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
            id={`${formType}-inspectionDate`}
          />
        </div>
        <div>
          <label
            htmlFor={`${formType}-machineNo`}
            className="block text-sm font-medium text-gray-700"
          >
            {t("scc.machineNo", "Machine No")}
          </label>
          <select
            id={`${formType}-machineNo`}
            name="machineNo"
            value={formData.machineNo || ""}
            onChange={handleMachineNoChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">
              {t("scc.selectMachine", "Select Machine...")}
            </option>
            {machineNoOptions.map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <label
            htmlFor={`${formType}-moNoSearch`}
            className="block text-sm font-medium text-gray-700"
          >
            {t("scc.moNo", "MO No")}
          </label>
          <div className="relative mt-1" ref={moNoDropdownRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              id={`${formType}-moNoSearch`}
              ref={moNoInputRef}
              value={moNoSearch}
              onChange={(e) => setMoNoSearch(e.target.value)}
              onFocus={() => setShowMoNoDropdown(true)}
              placeholder={t("scc.searchMoNo", "Search MO No...")}
              className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
            {showMoNoDropdown && moNoOptions.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                {moNoOptions.map((mo) => (
                  <li
                    key={mo}
                    onClick={() => handleMoSelect(mo)}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    {mo}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("scc.buyer", "Buyer")}
          </label>
          <input
            type="text"
            value={formData.buyer || ""}
            readOnly
            className="mt-1 block w-full bg-gray-100 px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("scc.buyerStyle", "Buyer Style")}
          </label>
          <input
            type="text"
            value={formData.buyerStyle || ""}
            readOnly
            className="mt-1 block w-full bg-gray-100 px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor={`${formType}-color`}
            className="block text-sm font-medium text-gray-700"
          >
            {t("scc.color", "Color")}
          </label>
          <select
            id={`${formType}-color`}
            name="color"
            value={formData.color || ""}
            onChange={handleColorChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={!formData.moNo || availableColors.length === 0}
            required
          >
            <option value="">{t("scc.selectColor", "Select Color...")}</option>
            {availableColors.map((c) => (
              <option key={c.key || c.original} value={c.original}>
                {c.original} {c.chn ? `(${c.chn})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {renderSpecTable(
        firstSpec,
        0,
        t("scc.standardSpecifications", "Standard Specifications"),
        isSpecTableDisabled
      )}

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">
          {t("scc.secondHeatSpecificationQuestion", "2nd Heat Specification?")}
        </label>
        <div className="mt-1 flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="showSecondHeatSpec"
              value="yes"
              checked={formData.showSecondHeatSpec === true}
              onChange={handleShowSecondHeatChange}
              className="form-radio h-4 w-4 text-indigo-600"
              disabled={isSpecTableDisabled}
            />
            <span className="ml-2 text-sm text-gray-700">
              {t("scc.yes", "Yes")}
            </span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="showSecondHeatSpec"
              value="no"
              checked={formData.showSecondHeatSpec === false}
              onChange={handleShowSecondHeatChange}
              className="form-radio h-4 w-4 text-indigo-600"
              disabled={isSpecTableDisabled}
            />
            <span className="ml-2 text-sm text-gray-700">
              {t("scc.no", "No")}
            </span>
          </label>
        </div>
      </div>

      {formData.showSecondHeatSpec &&
        renderSpecTable(
          secondSpec,
          1,
          t("scc.specsAfterSecondHeat", "Specifications after 2nd Heat"),
          isSpecTableDisabled
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <SCCImageUpload
          label={t("scc.referenceSample", "Reference Sample")}
          onImageChange={(file, url) =>
            handleImageChange("referenceSample", file, url)
          }
          onImageRemove={() => handleImageRemove("referenceSample")}
          initialImageUrl={formData.referenceSampleImageUrl}
          imageType="referenceSample"
        />
        <SCCImageUpload
          label={t("scc.afterWash", "After Wash")}
          onImageChange={(file, url) =>
            handleImageChange("afterWash", file, url)
          }
          onImageRemove={() => handleImageRemove("afterWash")}
          initialImageUrl={formData.afterWashImageUrl}
          imageType="afterWash"
        />
      </div>

      <div className="mt-6">
        <label
          htmlFor="remarks"
          className="block text-sm font-medium text-gray-700"
        >
          {t("scc.mainRemarks", "Remarks")}
        </label>
        <textarea
          id="remarks"
          name="remarks"
          rows="3"
          maxLength="250"
          value={formData.remarks || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder={t("scc.remarksPlaceholder", "Enter remarks here...")}
        ></textarea>
        <p className="mt-1 text-xs text-gray-500 text-right">
          {(formData.remarks || "").length} / 250{" "}
          {t("scc.characters", "characters")}
        </p>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isSpecTableDisabled}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : null}
            {formData._id
              ? t("scc.update", "Update")
              : t("scc.submit", "Submit")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SCCFirstOutputForm;
