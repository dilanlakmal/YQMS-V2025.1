// import { AlertCircle, QrCode, Table } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { API_BASE_URL } from "../../config";
// import { useAuth } from "../components/authentication/AuthContext";
// import QrCodeScanner from "../components/forms/QRCodeScanner";

// const PackingPage = () => {
//   const { user, loading } = useAuth();
//   const [error, setError] = useState(null);
//   const [loadingData, setLoadingData] = useState(false);
//   const [activeTab, setActiveTab] = useState("scan");
//   const [packingRecords, setPackingRecords] = useState([]);
//   const [scannedData, setScannedData] = useState(null);
//   const [countdown, setCountdown] = useState(5);
//   const [isAdding, setIsAdding] = useState(false);
//   const [autoAdd, setAutoAdd] = useState(true);
//   const [passQtyPack, setPassQtyPack] = useState(0);
//   const [packingRecordId, setPackingRecordId] = useState(1);
//   const [isDefectCard, setIsDefectCard] = useState(false);

//   useEffect(() => {
//     const fetchInitialRecordId = async () => {
//       if (user && user.emp_id) {
//         try {
//           const response = await fetch(
//             `${API_BASE_URL}/api/last-packing-record-id/${user.emp_id}`
//           );
//           if (!response.ok)
//             throw new Error("Failed to fetch last packing record ID");
//           const data = await response.json();
//           setPackingRecordId(data.lastRecordId + 1);
//         } catch (err) {
//           console.error("Error fetching initial record ID:", err);
//           setError(err.message);
//         }
//       }
//     };
//     fetchInitialRecordId();
//   }, [user]);

//   useEffect(() => {
//     let timer;
//     if (autoAdd && isAdding && countdown > 0) {
//       timer = setInterval(() => {
//         setCountdown((prev) => prev - 1);
//       }, 1000);
//     } else if (countdown === 0) {
//       handleAddRecord();
//     }
//     return () => clearInterval(timer);
//   }, [autoAdd, isAdding, countdown]);

//   const fetchBundleData = async (randomId) => {
//     try {
//       const trimmedId = randomId.trim();
//       setLoadingData(true);
//       setIsDefectCard(false);
//       console.log("Scanned QR Code (10-digit):", trimmedId);

//       let orderResponse = await fetch(
//         `${API_BASE_URL}/api/qc2-inspection-pass-bundle-by-random-id/${trimmedId}`
//       );
//       if (orderResponse.ok) {
//         const bundleData = await orderResponse.json();
//         if (!bundleData || !bundleData.bundle_id) {
//           throw new Error(
//             "Order card data not found or invalid for this bundle_random_id"
//           );
//         }
//         console.log(
//           "Order card data fetched from qc2_inspection_pass_bundle (bundle_random_id):",
//           bundleData
//         );

//         const existsResponse = await fetch(
//           `${API_BASE_URL}/api/check-packing-exists/${bundleData.bundle_id}-62`
//         );
//         const existsData = await existsResponse.json();
//         if (existsData.exists) {
//           throw new Error("This order card already exists");
//         }

//         const formattedData = {
//           bundle_id: bundleData.bundle_id,
//           bundle_random_id: bundleData.bundle_random_id,
//           package_no: bundleData.package_no,
//           moNo: bundleData.moNo,
//           selectedMono: bundleData.moNo,
//           custStyle: bundleData.custStyle,
//           buyer: bundleData.buyer,
//           color: bundleData.color,
//           size: bundleData.size,
//           factory: bundleData.factory || "N/A",
//           country: bundleData.country || "N/A",
//           lineNo: bundleData.lineNo,
//           department: bundleData.department,
//           count: bundleData.totalPass,
//           totalBundleQty: 1,
//           emp_id_inspection: bundleData.emp_id_inspection,
//           inspection_date: bundleData.inspection_date,
//           inspection_time: bundleData.inspection_time,
//           sub_con: bundleData.sub_con,
//           sub_con_factory: bundleData.sub_con_factory
//         };

//         setScannedData(formattedData);
//         setPassQtyPack(bundleData.totalPass);
//       } else {
//         const defectResponse = await fetch(
//           `${API_BASE_URL}/api/qc2-inspection-pass-bundle-by-defect-print-id/${trimmedId}?includeCompleted=true`
//         );
//         if (defectResponse.ok) {
//           const defectData = await defectResponse.json();
//           if (!defectData) {
//             throw new Error(
//               "Defect card data not found for this defect_print_id"
//             );
//           }
//           console.log(
//             "Defect card data fetched from qc2_inspection_pass_bundle (defect_print_id):",
//             defectData
//           );

//           const printData = defectData.printArray.find(
//             (item) => item.defect_print_id === trimmedId
//           );
//           if (!printData) {
//             throw new Error("Defect print ID not found in printArray");
//           }

//           const existsResponse = await fetch(
//             `${API_BASE_URL}/api/check-packing-exists/${trimmedId}-62`
//           );
//           const existsData = await existsResponse.json();
//           if (existsData.exists) {
//             throw new Error("This defect card already exists");
//           }

//           const formattedData = {
//             defect_print_id: printData.defect_print_id,
//             totalRejectGarmentCount: printData.totalRejectGarmentCount,
//             totalRejectGarment_Var: printData.totalRejectGarment_Var,
//             package_no: defectData.package_no,
//             moNo: defectData.moNo,
//             selectedMono: defectData.moNo,
//             custStyle: defectData.custStyle,
//             buyer: defectData.buyer,
//             color: defectData.color,
//             size: defectData.size,
//             factory: defectData.factory || "N/A",
//             country: defectData.country || "N/A",
//             lineNo: defectData.lineNo,
//             department: defectData.department,
//             count: printData.totalRejectGarment_Var,
//             totalBundleQty: 1,
//             emp_id_inspection: defectData.emp_id_inspection,
//             inspection_date: defectData.inspection_date,
//             inspection_time: defectData.inspection_time,
//             sub_con: defectData.sub_con,
//             sub_con_factory: defectData.sub_con_factory,
//             bundle_id: defectData.bundle_id,
//             bundle_random_id: defectData.bundle_random_id
//           };

//           setScannedData(formattedData);
//           setPassQtyPack(printData.totalRejectGarment_Var);
//           setIsDefectCard(true);
//         } else {
//           const errorData = await defectResponse.json();
//           throw new Error(
//             errorData.message || "Failed to fetch defect card data"
//           );
//         }
//       }

//       setIsAdding(true);
//       setCountdown(5);
//       setError(null);
//     } catch (err) {
//       console.error("Fetch error:", err.message);
//       setError(err.message);
//       setScannedData(null);
//       setIsAdding(false);
//     } finally {
//       setLoadingData(false);
//     }
//   };

//   const handleAddRecord = async () => {
//     try {
//       const now = new Date();
//       const taskNoPacking = 62;

//       const newRecord = {
//         packing_record_id: packingRecordId,
//         task_no_packing: taskNoPacking,
//         packing_bundle_id: isDefectCard
//           ? `${scannedData.defect_print_id}-62`
//           : `${scannedData.bundle_id}-62`,
//         packing_updated_date: now.toLocaleDateString("en-US", {
//           month: "2-digit",
//           day: "2-digit",
//           year: "numeric"
//         }),
//         packing_update_time: now.toLocaleTimeString("en-US", {
//           hour12: false,
//           hour: "2-digit",
//           minute: "2-digit",
//           second: "2-digit"
//         }),
//         package_no: scannedData.package_no,
//         ...scannedData,
//         passQtyPack,
//         emp_id_packing: user.emp_id,
//         eng_name_packing: user.eng_name,
//         kh_name_packing: user.kh_name,
//         job_title_packing: user.job_title,
//         dept_name_packing: user.dept_name,
//         sect_name_packing: user.sect_name
//       };
//       console.log("New Record to be saved:", newRecord);

//       const response = await fetch(`${API_BASE_URL}/api/save-packing`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newRecord)
//       });
//       if (!response.ok) throw new Error("Failed to save packing record");

//       // Update qc2_orderdata
//       const inspectionType = isDefectCard ? "defect" : "first";
//       const updateData = {
//         inspectionType,
//         process: "packing",
//         data: {
//           task_no: taskNoPacking,
//           passQty: newRecord.passQtyPack,
//           updated_date: newRecord.packing_updated_date,
//           update_time: newRecord.packing_update_time,
//           emp_id: newRecord.emp_id_packing,
//           eng_name: newRecord.eng_name_packing,
//           kh_name: newRecord.kh_name_packing,
//           job_title: newRecord.job_title_packing,
//           dept_name: newRecord.dept_name_packing,
//           sect_name: newRecord.sect_name_packing,
//           packing_record_id: newRecord.packing_record_id,
//           ...(isDefectCard && { defect_print_id: scannedData.defect_print_id })
//         }
//       };

//       const updateResponse = await fetch(
//         `${API_BASE_URL}/api/update-qc2-orderdata/${scannedData.bundle_id}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(updateData)
//         }
//       );
//       if (!updateResponse.ok) throw new Error("Failed to update qc2_orderdata");

//       setPackingRecords((prev) => [...prev, newRecord]);
//       setScannedData(null);
//       setIsAdding(false);
//       setCountdown(5);
//       setPackingRecordId((prev) => prev + 1);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const handleReset = () => {
//     setScannedData(null);
//     setIsAdding(false);
//     setCountdown(5);
//     setIsDefectCard(false);
//   };

//   const handleScanSuccess = (decodedText) => {
//     if (!isAdding) fetchBundleData(decodedText);
//   };

//   const handlePassQtyChange = (value) => {
//     const maxQty = isDefectCard
//       ? scannedData.totalRejectGarment_Var || scannedData.count
//       : scannedData.count;
//     if (value >= 0 && value <= maxQty) {
//       setPassQtyPack(value);
//     }
//   };

//   const fetchPackingRecords = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/packing-records`);
//       if (!response.ok) throw new Error("Failed to fetch Packing records");
//       const data = await response.json();
//       setPackingRecords(data);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   useEffect(() => {
//     fetchPackingRecords();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center gap-2 mb-4">
//             <QrCode className="w-8 h-8 text-blue-600" />
//             <h1 className="text-3xl font-bold text-gray-800">
//               Packing Process Scanner
//             </h1>
//           </div>
//           <p className="text-gray-600">
//             Scan the QR code on the bundle to record Packing details
//           </p>
//         </div>
//         <div className="flex space-x-4 mb-6">
//           <button
//             onClick={() => setActiveTab("scan")}
//             className={`px-4 py-2 rounded-md flex items-center gap-2 ${
//               activeTab === "scan"
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-200 text-gray-700"
//             }`}
//           >
//             <QrCode className="w-5 h-5" />
//             QR Scan
//           </button>
//           <button
//             onClick={() => setActiveTab("data")}
//             className={`px-4 py-2 rounded-md flex items-center gap-2 ${
//               activeTab === "data"
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-200 text-gray-700"
//             }`}
//           >
//             <Table className="w-5 h-5" />
//             Data
//           </button>
//         </div>
//         <div className="flex items-center mb-4">
//           <label className="text-gray-700 mr-2">Auto Add:</label>
//           <input
//             type="checkbox"
//             checked={autoAdd}
//             onChange={(e) => setAutoAdd(e.target.checked)}
//             className="form-checkbox"
//           />
//         </div>
//         {error && (
//           <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2">
//             <AlertCircle className="w-5 h-5 text-red-500" />
//             <p className="text-red-700">{error}</p>
//           </div>
//         )}
//         {activeTab === "scan" ? (
//           <QrCodeScanner
//             onScanSuccess={handleScanSuccess}
//             onScanError={(err) => setError(err)}
//             autoAdd={autoAdd}
//             isAdding={isAdding}
//             countdown={countdown}
//             handleAddRecord={handleAddRecord}
//             handleReset={handleReset}
//             scannedData={scannedData}
//             loadingData={loadingData}
//             passQtyPack={passQtyPack}
//             handlePassQtyChange={handlePassQtyChange}
//             isIroningPage={false}
//             isPackingPage={true}
//             isDefectCard={isDefectCard}
//           />
//         ) : (
//           <div className="bg-white p-6 rounded-lg shadow-lg">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
//                 <thead className="bg-sky-100">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       Packing ID
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       Task No
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       Package No
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       Department
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       Updated Date
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       Updated Time
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       MONo
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       Cust. Style
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       Buyer
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       Country
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       Factory
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       Line No
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       Color
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       Size
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       Count
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
//                       Pass Qty (Packing)
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {packingRecords.map((record, index) => (
//                     <tr key={index} className="hover:bg-gray-50">
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.packing_record_id}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.task_no_packing}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.package_no}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.department}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.packing_updated_date}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.packing_update_time}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.selectedMono || record.moNo}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.custStyle}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.buyer}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.country}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.factory}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.lineNo}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.color}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.size}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.count || record.totalRejectGarment_Var}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
//                         {record.passQtyPack}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PackingPage;

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  Package as PackageIcon,
  QrCode,
  Table,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react"; // Added useRef
import { API_BASE_URL } from "../../config";
import { useAuth } from "../components/authentication/AuthContext";
import QrCodeScanner from "../components/forms/QRCodeScanner";

const SummaryStatCard_Packing = ({
  title,
  value1,
  label1,
  value2,
  label2,
  icon,
}) => {
  const IconComponent = icon || PackageIcon;
  return (
    <div className="bg-white p-5 shadow-xl rounded-xl border border-gray-200 flex flex-col justify-between min-h-[160px] hover:shadow-2xl transition-shadow duration-300">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
          <div className="p-2 bg-green-100 text-green-600 rounded-lg">
            {" "}
            <IconComponent size={20} />{" "}
          </div>
        </div>
        {label1 && <p className="text-gray-600 text-xs mt-1">{label1}</p>}
        <p className="text-3xl font-bold text-gray-800">
          {(value1 || 0).toLocaleString()}
        </p>
        {label2 && (
          <p className="text-gray-600 text-xs mt-2 pt-2 border-t border-gray-100">
            {label2}
          </p>
        )}
        {value2 !== undefined && (
          <p className="text-2xl font-semibold text-gray-700 mt-1">
            {(value2 || 0).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};
const SummaryStatCardSimple_Packing = ({
  title,
  currentValue,
  previousDayValue,
  icon,
}) => {
  const IconComponent = icon || PackageIcon;
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
          <div className="p-2 bg-green-100 text-green-600 rounded-lg">
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

const PackingPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("scan");
  const [packingRecords, setPackingRecords] = useState([]);
  const [scannedData, setScannedData] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [isAdding, setIsAdding] = useState(false);
  const [autoAdd, setAutoAdd] = useState(true);
  const [passQtyPack, setPassQtyPack] = useState(0);
  const [packingRecordId, setPackingRecordId] = useState(1);
  const [isDefectCard, setIsDefectCard] = useState(false);

  const qrScannerRef = useRef(null); // For potentially calling reset/focus on Scanner component

  const fetchInitialRecordId = useCallback(async () => {
    if (user && user.emp_id) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/last-packing-record-id/${user.emp_id}`
        );
        if (!response.ok) {
          console.warn(
            "Failed to fetch last packing record ID, defaulting to 1."
          );
          setPackingRecordId(1); // Default if fetch fails
          return;
        }
        const data = await response.json();
        setPackingRecordId(data.lastRecordId + 1);
      } catch (err) {
        console.error("Error fetching initial record ID:", err);
        setPackingRecordId(1); // Default on error
      }
    }
  }, [user]);

  useEffect(() => {
    fetchInitialRecordId();
  }, [fetchInitialRecordId]);

  const handleAddRecord = useCallback(async () => {
    if (!scannedData || !user) {
      setError("Scanned data or user information is missing.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const now = new Date();
      const taskNoPacking = 62;
      const currentPackingRecordId = isDefectCard ? 0 : packingRecordId;

      const newRecord = {
        packing_record_id: currentPackingRecordId,
        task_no_packing: taskNoPacking,
        packing_bundle_id: isDefectCard
          ? `${scannedData.defect_print_id}-${taskNoPacking}`
          : `${scannedData.bundle_id}-${taskNoPacking}`,
        packing_updated_date: now.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
        packing_update_time: now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        package_no: scannedData.package_no,
        selectedMono: scannedData.selectedMono || scannedData.moNo,
        custStyle: scannedData.custStyle,
        buyer: scannedData.buyer,
        color: scannedData.color,
        size: scannedData.size,
        factory: scannedData.factory || "N/A",
        country: scannedData.country || "N/A",
        lineNo: scannedData.lineNo,
        department: scannedData.department,
        count: scannedData.count,
        totalBundleQty: scannedData.totalBundleQty,
        sub_con: scannedData.sub_con,
        sub_con_factory: scannedData.sub_con_factory,
        bundle_id: scannedData.bundle_id,
        bundle_random_id: scannedData.bundle_random_id,
        ...(isDefectCard && { defect_print_id: scannedData.defect_print_id }),
        passQtyPack,
        emp_id_packing: user.emp_id,
        eng_name_packing: user.eng_name,
        kh_name_packing: user.kh_name,
        job_title_packing: user.job_title,
        dept_name_packing: user.dept_name,
        sect_name_packing: user.sect_name,
      };

      const response = await fetch(`${API_BASE_URL}/api/save-packing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save packing record");
      }

      setSuccessMessage(
        `Record ${
          isDefectCard ? "(Defect)" : ""
        } added! Packing ID: ${currentPackingRecordId}. Packed Qty: ${passQtyPack}`
      );

      if (scannedData.bundle_id) {
        const inspectionType = isDefectCard ? "defect" : "first_pass";
        const updatePayload = {
          inspectionType,
          process: "packing",
          data: {
            task_no: newRecord.task_no_packing,
            passQty: newRecord.passQtyPack,
            updated_date: newRecord.packing_updated_date,
            update_time: newRecord.packing_update_time,
            emp_id: newRecord.emp_id_packing,
            eng_name: newRecord.eng_name_packing,
            // kh_name: newRecord.kh_name_packing, // Consider if all these are needed for qc2_orderdata
            // job_title: newRecord.job_title_packing,
            // dept_name: newRecord.dept_name_packing,
            // sect_name: newRecord.sect_name_packing,
            packing_record_id: newRecord.packing_record_id,
            ...(isDefectCard && {
              defect_print_id: scannedData.defect_print_id,
            }),
          },
        };
        try {
          const updateResponse = await fetch(
            `${API_BASE_URL}/api/update-qc2-orderdata/${scannedData.bundle_id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatePayload),
            }
          );
          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error(
              "qc2_orderdata update failed:",
              errorData.message || "Unknown error"
            );
          } else {
            console.log(
              "qc2_orderdata updated successfully for bundle_id:",
              scannedData.bundle_id
            );
          }
        } catch (qc2UpdateError) {
          console.error(
            "Error during qc2_orderdata update HTTP call:",
            qc2UpdateError
          );
        }
      } else if (isDefectCard) {
        console.log(
          "Skipping qc2_orderdata update for defect card as bundle_id is not available in scannedData."
        );
      }

      setPackingRecords((prev) => {
        const recordExists = prev.some(
          (rec) => rec.packing_bundle_id === newRecord.packing_bundle_id
        );
        return recordExists ? prev : [newRecord, ...prev];
      });

      if (!isDefectCard) {
        setPackingRecordId((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error in handleAddRecord:", err.message);
      setError(err.message);
    } finally {
      handleReset(); // Call full reset which includes clearing scannedData and flags
    }
  }, [scannedData, user, passQtyPack, packingRecordId, isDefectCard]);

  useEffect(() => {
    let timer;
    if (autoAdd && isAdding && countdown > 0 && scannedData && !isSubmitting) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (
      autoAdd &&
      countdown === 0 &&
      isAdding &&
      scannedData &&
      !isSubmitting
    ) {
      handleAddRecord();
    }
    return () => clearInterval(timer);
  }, [
    autoAdd,
    isAdding,
    countdown,
    scannedData,
    handleAddRecord,
    isSubmitting,
  ]);

  const fetchBundleData = useCallback(
    async (qrInput) => {
      if (loadingData || isAdding || isSubmitting) return;

      const trimmedId = qrInput.trim();
      if (!trimmedId) {
        setError("QR code cannot be empty.");
        return;
      }

      setLoadingData(true);
      setIsDefectCard(false);
      setError(null);
      setSuccessMessage(null);
      setScannedData(null);
      setPassQtyPack(0); // Reset passQtyPack on new scan

      try {
        let orderResponse = await fetch(
          `${API_BASE_URL}/api/qc2-inspection-pass-bundle-by-random-id/${trimmedId}`
        );

        if (orderResponse.ok) {
          const bundleData = await orderResponse.json();
          if (!bundleData || !bundleData.bundle_id) {
            throw new Error("Order card data not found or invalid.");
          }

          const existsResponse = await fetch(
            `${API_BASE_URL}/api/check-packing-exists/${bundleData.bundle_id}-62`
          );
          const existsData = await existsResponse.json();
          if (existsData.exists) {
            throw new Error(
              `Order card (Bundle ID: ${bundleData.bundle_id}) already packed.`
            );
          }

          const formattedData = {
            bundle_id: bundleData.bundle_id,
            bundle_random_id: bundleData.bundle_random_id,
            package_no: bundleData.package_no,
            moNo: bundleData.moNo,
            selectedMono: bundleData.moNo,
            custStyle: bundleData.custStyle,
            buyer: bundleData.buyer,
            color: bundleData.color,
            size: bundleData.size,
            factory: bundleData.factory || "N/A",
            country: bundleData.country || "N/A",
            lineNo: bundleData.lineNo,
            department: bundleData.department,
            count: bundleData.totalPass,
            totalBundleQty: 1,
            emp_id_inspection: bundleData.emp_id_inspection,
            inspection_date: bundleData.inspection_date,
            inspection_time: bundleData.inspection_time,
            sub_con: bundleData.sub_con,
            sub_con_factory: bundleData.sub_con_factory,
          };
          setScannedData(formattedData);
          setPassQtyPack(bundleData.totalPass); // Set passQtyPack to scanned count
          setIsDefectCard(false);
        } else {
          const defectResponse = await fetch(
            `${API_BASE_URL}/api/qc2-inspection-pass-bundle-by-defect-print-id/${trimmedId}?includeCompleted=true`
          );
          if (defectResponse.ok) {
            const defectData = await defectResponse.json();
            if (
              !defectData ||
              !defectData.printArray ||
              defectData.printArray.length === 0
            ) {
              throw new Error("Defect card data not found or invalid.");
            }

            const printData = defectData.printArray.find(
              (item) => item.defect_print_id === trimmedId
            );

            if (!printData) {
              throw new Error(
                "Specific defect print ID not found in the defect card data."
              );
            }

            const existsResponse = await fetch(
              `${API_BASE_URL}/api/check-packing-exists/${trimmedId}-62`
            );
            const existsData = await existsResponse.json();
            if (existsData.exists) {
              throw new Error(`Defect card (ID: ${trimmedId}) already packed.`);
            }

            const formattedData = {
              defect_print_id: printData.defect_print_id,
              package_no: defectData.package_no,
              moNo: defectData.moNo,
              selectedMono: defectData.moNo,
              custStyle: defectData.custStyle,
              buyer: defectData.buyer,
              color: defectData.color,
              size: defectData.size,
              factory: defectData.factory || "N/A",
              country: defectData.country || "N/A",
              lineNo: defectData.lineNo,
              department: defectData.department,
              count: printData.totalRejectGarment_Var,
              totalBundleQty: 1,
              emp_id_inspection: defectData.emp_id_inspection,
              inspection_date: defectData.inspection_date,
              inspection_time: defectData.inspection_time,
              sub_con: defectData.sub_con,
              sub_con_factory: defectData.sub_con_factory,
              bundle_id: defectData.bundle_id,
              bundle_random_id: defectData.bundle_random_id,
              totalRejectGarment_Var: printData.totalRejectGarment_Var, // Keep this for maxQty logic
            };
            setScannedData(formattedData);
            setPassQtyPack(printData.totalRejectGarment_Var); // Set passQtyPack to scanned count
            setIsDefectCard(true);
          } else {
            let errorMsg = "QR code not found or invalid.";
            try {
              const errorJson = await defectResponse.json();
              errorMsg = errorJson.message || errorJson.error || errorMsg;
            } catch (e) {
              /* ignore parsing error */
            }
            throw new Error(errorMsg);
          }
        }
        setIsAdding(true);
        setCountdown(5);
      } catch (err) {
        console.error("Fetch bundle data error:", err.message);
        setError(err.message);
        setScannedData(null);
        setIsAdding(false);
      } finally {
        setLoadingData(false);
      }
    },
    [isAdding, loadingData, isSubmitting]
  ); // Added isSubmitting

  const handleReset = useCallback(() => {
    setScannedData(null);
    setIsAdding(false);
    setCountdown(5);
    setIsDefectCard(false);
    setError(null);
    setSuccessMessage(null); // Clear success message on reset
    setPassQtyPack(0);
    setIsSubmitting(false); // Ensure submitting state is also reset
    if (qrScannerRef.current && qrScannerRef.current.resetScanner) {
      qrScannerRef.current.resetScanner(); // If Scanner component exposes a reset
    }
  }, []);

  const handleScanSuccess = useCallback(
    (decodedText) => {
      if (!isAdding && !loadingData && !isSubmitting) {
        fetchBundleData(decodedText);
      } else {
        console.log("Scan ignored: already processing or loading data.");
      }
    },
    [isAdding, loadingData, isSubmitting, fetchBundleData]
  );

  const handlePassQtyChange = useCallback(
    (newValue) => {
      if (isNaN(newValue) || newValue === undefined) {
        setPassQtyPack(0);
        return;
      }
      const numValue = Number(newValue); // Ensure it's a number

      const maxQty = scannedData
        ? isDefectCard
          ? scannedData.totalRejectGarment_Var || scannedData.count || 0
          : scannedData.count || 0
        : 0;

      if (numValue >= 0 && numValue <= maxQty) {
        setPassQtyPack(numValue);
      } else if (numValue > maxQty) {
        setPassQtyPack(maxQty);
      } else {
        setPassQtyPack(0);
      }
    },
    [scannedData, isDefectCard]
  );

  const fetchPackingRecords = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/packing-records`);
      if (!response.ok) throw new Error("Failed to fetch Packing records");
      const data = await response.json();
      setPackingRecords(
        data.sort((a, b) => {
          const dateA = new Date(
            `${a.packing_updated_date} ${a.packing_update_time}`
          );
          const dateB = new Date(
            `${b.packing_updated_date} ${b.packing_update_time}`
          );
          return dateB - dateA;
        })
      );
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "data") {
      fetchPackingRecords();
    }
  }, [activeTab, fetchPackingRecords]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading user data...
      </div>
    );
  }
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Please log in to use the Packing Scanner.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
            <QrCode className="w-7 h-7 md:w-8 md:h-8 text-green-600" />{" "}
            {/* Green for Packing */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Packing Process Scanner
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-600">
            Scan QR on bundle. User: {user.eng_name} ({user.emp_id})
          </p>
        </div>
        <div className="flex space-x-2 md:space-x-4 mb-4 md:mb-6">
          <button
            onClick={() => setActiveTab("scan")}
            className={`px-3 py-2 md:px-4 rounded-md flex items-center gap-2 text-sm md:text-base transition-colors duration-150 ${
              activeTab === "scan"
                ? "bg-green-500 text-white shadow-md" // Green theme
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <QrCode className="w-4 h-4 md:w-5 md:h-5" />
            QR Scan
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`px-3 py-2 md:px-4 rounded-md flex items-center gap-2 text-sm md:text-base transition-colors duration-150 ${
              activeTab === "data"
                ? "bg-green-500 text-white shadow-md" // Green theme
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <Table className="w-4 h-4 md:w-5 md:h-5" />
            Data
          </button>
        </div>
        <div className="flex items-center mb-4 justify-end">
          <label
            htmlFor="autoAddCheckbox"
            className="text-gray-700 mr-2 text-sm md:text-base"
          >
            Auto Add:
          </label>
          <input
            id="autoAddCheckbox"
            type="checkbox"
            checked={autoAdd}
            onChange={(e) => setAutoAdd(e.target.checked)}
            disabled={isSubmitting || isAdding} // Disable if processing
            className="form-checkbox h-4 w-4 md:h-5 md:w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
        </div>
        {error && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 text-sm md:text-base">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-green-100 border border-green-200 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <p className="text-green-700 text-sm md:text-base">
              {successMessage}
            </p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {activeTab === "scan" ? (
          <QrCodeScanner
            key={scannedData ? "scanner-with-data" : "scanner-no-data"} // Re-mount QrScanner on data change to reset its internal state if needed
            ref={qrScannerRef}
            onScanSuccess={handleScanSuccess}
            onScanError={(err) => {
              console.error("Scanner Error:", err);
              setError("QR Scan failed. Invalid QR or network issue.");
            }}
            autoAdd={autoAdd}
            isAdding={isAdding}
            countdown={countdown}
            handleAddRecord={handleAddRecord}
            handleReset={handleReset}
            scannedData={scannedData}
            loadingData={loadingData}
            passQty={passQtyPack}
            handlePassQtyChange={handlePassQtyChange}
            isPackingPage={true}
            isDefectCard={isDefectCard}
            moduleName="Packing"
            submitButtonDisabled={isSubmitting}
            isIroningPage={false}
            isWashingPage={false}
            isOPAPage={false}
          />
        ) : (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
              Recent Packing Records (Latest 50)
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-green-100">
                  {" "}
                  {/* Green theme for Packing */}
                  <tr>
                    {[
                      "Pack ID",
                      "Task",
                      "Pkg No",
                      "Card Type",
                      "Dept",
                      "Date",
                      "Time",
                      "MONo",
                      "Style",
                      "Buyer",
                      "Qty",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-left text-xs md:text-sm font-medium text-gray-600 border-r border-gray-200 whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {packingRecords.length > 0 ? (
                    packingRecords.slice(0, 50).map((record, index) => (
                      <tr
                        key={record.packing_bundle_id || index}
                        className={`hover:bg-green-50 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        {" "}
                        {/* Green theme */}
                        <td className="px-3 py-2 text-xs md:text-sm text-gray-700 border-r">
                          {record.packing_record_id}
                        </td>
                        <td className="px-3 py-2 text-xs md:text-sm text-gray-700 border-r">
                          {record.task_no_packing}
                        </td>
                        <td className="px-3 py-2 text-xs md:text-sm text-gray-700 border-r">
                          {record.package_no}
                        </td>
                        <td
                          className={`px-3 py-2 text-xs md:text-sm font-medium border-r ${
                            record.packing_record_id === 0
                              ? "text-red-600"
                              : "text-green-700"
                          }`}
                        >
                          {record.packing_record_id === 0 ? "Defect" : "Order"}
                        </td>
                        <td className="px-3 py-2 text-xs md:text-sm text-gray-700 border-r">
                          {record.department}
                        </td>
                        <td className="px-3 py-2 text-xs md:text-sm text-gray-700 border-r">
                          {record.packing_updated_date}
                        </td>
                        <td className="px-3 py-2 text-xs md:text-sm text-gray-700 border-r">
                          {record.packing_update_time}
                        </td>
                        <td className="px-3 py-2 text-xs md:text-sm text-gray-700 border-r">
                          {record.selectedMono || record.moNo}
                        </td>
                        <td className="px-3 py-2 text-xs md:text-sm text-gray-700 border-r">
                          {record.custStyle}
                        </td>
                        <td className="px-3 py-2 text-xs md:text-sm text-gray-700 border-r">
                          {record.buyer}
                        </td>
                        <td className="px-3 py-2 text-xs md:text-sm text-gray-700 border-r text-center">
                          {record.passQtyPack}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={11}
                        className="text-center py-4 text-gray-500"
                      >
                        No packing records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackingPage;
