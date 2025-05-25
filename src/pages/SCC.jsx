// SCCPage.jsx
import axios from "axios";
import {
  CheckSquare,
  Eye,
  FileText,
  Settings2,
  ShieldCheck,
  ThermometerSun,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../../config";
import { useAuth } from "../components/authentication/AuthContext";
import DailyFUQC from "../components/inspection/scc/DailyFUQC";
import DailyHTQC from "../components/inspection/scc/DailyHTQC";
import HTInspectionReport from "../components/inspection/scc/HTInspectionReport";
import SCCDailyTesting from "../components/inspection/scc/SCCDailyTesting";
import SCCFirstOutputForm from "../components/inspection/scc/SCCFirstOutputForm";

const DEFAULT_TEMP_OFFSET_FUQC = 5;

const initialSharedStateFirstOutput = {
  _id: null,
  inspectionDate: new Date(),
  machineNo: "",
  moNo: "",
  buyer: "",
  buyerStyle: "",
  color: "",
  standardSpecification: [
    {
      type: "first",
      method: "",
      timeSec: "",
      tempC: "",
      tempOffset: "5",
      pressure: "",
      status: "Pass",
      remarks: "",
    },
  ],
  showSecondHeatSpec: false,
  referenceSampleImageFile: null,
  referenceSampleImageUrl: null,
  afterWashImageFile: null,
  afterWashImageUrl: null,
  remarks: "",
};

const initialSharedStateDailyTesting = {
  _id: null,
  inspectionDate: new Date(),
  moNo: "",
  buyer: "",
  buyerStyle: "",
  color: "",
  machineNo: "",
  standardSpecifications: { tempC: null, timeSec: null, pressure: null },
  numberOfRejections: 0,
  parameterAdjustmentRecords: [],
  finalResult: "Pending",
  remarks: "",
  afterWashImageFile: null,
  afterWashImageUrl: null,
};

const initialDailyHTQCState = {
  _id: null,
  inspectionDate: new Date(),
  machineNo: "",
  moNo: "",
  buyer: "",
  buyerStyle: "",
  color: "",
  baseReqTemp: null,
  baseReqTime: null,
  baseReqPressure: null,
  inspections: [],
  stretchTestResult: "Pending",
  stretchTestRejectReasons: [],
  washingTestResult: "Pending",
  isStretchWashingTestDone: false,
};

const initialDailyFUQCState = {
  _id: null,
  inspectionDate: new Date(),
  machineNo: "",
  moNo: "",
  buyer: "",
  buyerStyle: "",
  color: "",
  baseReqTemp: null,
  temp_offset: DEFAULT_TEMP_OFFSET_FUQC,
  inspections: [],
  remarks: "",
};

const initialHTInspectionReportState = {
  _id: null,
  inspectionDate: new Date(),
  machineNo: "",
  moNo: "",
  buyer: "",
  buyerStyle: "",
  color: "",
  batchNo: "",
  totalBundle: null,
  totalPcs: null,
  defects: [],
  remarks: "",
  defectImageFile: null,
  defectImageUrl: null,
};

const SCCPage = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("firstOutputHT");

  const [htFormData, setHtFormData] = useState({
    ...initialSharedStateFirstOutput,
  });
  const [fuFormData, setFuFormData] = useState({
    ...initialSharedStateFirstOutput,
  });
  const [dailyTestingFormData, setDailyTestingFormData] = useState({
    ...initialSharedStateDailyTesting,
  });
  const [dailyHTQCFormData, setDailyHTQCFormData] = useState({
    ...initialDailyHTQCState,
  });
  const [dailyFUQCFormData, setDailyFUQCFormData] = useState({
    ...initialDailyFUQCState,
  });
  const [htInspectionReportData, setHtInspectionReportData] = useState({
    ...initialHTInspectionReportState,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadSccImage = useCallback(
    async (file, currentDataForImage, imageTypeIdentifierForUpload) => {
      const imageFormData = new FormData();
      imageFormData.append("imageFile", file);
      imageFormData.append("moNo", currentDataForImage.moNo || "UNKNOWN_MO");
      if (currentDataForImage.machineNo) {
        imageFormData.append("machineNo", currentDataForImage.machineNo);
      }
      imageFormData.append(
        "color",
        currentDataForImage.color || "UNKNOWN_COLOR"
      );
      imageFormData.append("imageType", imageTypeIdentifierForUpload);
      imageFormData.append(
        "inspectionDate",
        currentDataForImage.inspectionDate instanceof Date
          ? currentDataForImage.inspectionDate.toISOString().split("T")[0]
          : String(
              currentDataForImage.inspectionDate ||
                new Date().toISOString().split("T")[0]
            ).split("T")[0]
      );
      if (
        imageTypeIdentifierForUpload.startsWith("htDefect-") &&
        currentDataForImage.batchNo
      ) {
        imageFormData.append("batchNo", currentDataForImage.batchNo);
      }
      const imgRes = await axios.post(
        `${API_BASE_URL}/api/scc/upload-image`,
        imageFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (!imgRes.data.success) {
        throw new Error(
          t(
            "scc.errorUploadingImageGeneric",
            `Failed to upload ${imageTypeIdentifierForUpload} image.`
          )
        );
      }
      return imgRes.data;
    },
    [t]
  );

  const tabs = useMemo(
    () => [
      {
        id: "firstOutputHT",
        labelKey: "scc.tabs.firstOutputHT",
        icon: <FileText size={16} />,
        formType: "HT",
        data: htFormData,
        setter: setHtFormData,
        component: SCCFirstOutputForm,
        disabled: false,
      },
      {
        id: "firstOutputFU",
        labelKey: "scc.tabs.firstOutputFU",
        icon: <FileText size={16} />,
        formType: "FU",
        data: fuFormData,
        setter: setFuFormData,
        component: SCCFirstOutputForm,
        disabled: false,
      },
      {
        id: "dailyTesting",
        labelKey: "scc.tabs.dailyTesting",
        icon: <ThermometerSun size={16} />,
        formType: "DailyTesting",
        data: dailyTestingFormData,
        setter: setDailyTestingFormData,
        component: SCCDailyTesting,
        disabled: false,
      },
      {
        id: "dailyHTQC",
        labelKey: "scc.tabs.dailyHTQC",
        icon: <CheckSquare size={16} />,
        formType: "DailyHTQC",
        data: dailyHTQCFormData,
        setter: setDailyHTQCFormData,
        component: DailyHTQC,
        disabled: false,
      },
      {
        id: "dailyFUQC",
        labelKey: "scc.tabs.dailyFUQC",
        icon: <ShieldCheck size={16} />,
        formType: "DailyFUQC",
        data: dailyFUQCFormData,
        setter: setDailyFUQCFormData,
        component: DailyFUQC,
        disabled: false,
      },
      {
        id: "htInspection",
        labelKey: "scc.tabs.htInspection",
        icon: <Eye size={16} />,
        formType: "HTInspectionReport",
        data: htInspectionReportData,
        setter: setHtInspectionReportData,
        component: HTInspectionReport,
        disabled: false,
      },
    ],
    [
      htFormData,
      fuFormData,
      dailyTestingFormData,
      dailyHTQCFormData,
      dailyFUQCFormData,
      htInspectionReportData,
      t,
    ]
  );

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const CurrentFormComponent = activeTabData?.component;

  const handleFormSubmit = useCallback(
    async (formTypeToSubmit, specificPayload = null) => {
      let currentSetter,
        endpoint,
        successMessageKey,
        initialStateForReset,
        payloadToSend;

      const formDataToProcess =
        specificPayload ||
        (formTypeToSubmit === "HT"
          ? htFormData
          : formTypeToSubmit === "FU"
          ? fuFormData
          : formTypeToSubmit === "DailyTesting"
          ? dailyTestingFormData
          : formTypeToSubmit === "DailyHTQC"
          ? dailyHTQCFormData
          : formTypeToSubmit === "DailyFUQC"
          ? dailyFUQCFormData
          : formTypeToSubmit === "HTInspectionReport"
          ? htInspectionReportData
          : {});

      // Define initialStateForReset for each form type, preserving the inspectionDate from formDataToProcess
      if (formTypeToSubmit === "HT" || formTypeToSubmit === "FU") {
        currentSetter =
          formTypeToSubmit === "HT" ? setHtFormData : setFuFormData;
        endpoint =
          formTypeToSubmit === "HT"
            ? "/api/scc/ht-first-output"
            : "/api/scc/fu-first-output";
        successMessageKey = "scc.dataSavedSuccess";
        initialStateForReset = {
          ...initialSharedStateFirstOutput,
          inspectionDate: formDataToProcess.inspectionDate,
        };
      } else if (formTypeToSubmit === "DailyTesting") {
        currentSetter = setDailyTestingFormData;
        endpoint = "/api/scc/daily-testing";
        successMessageKey = "sccdaily.reportSavedSuccess";
        initialStateForReset = {
          ...initialSharedStateDailyTesting,
          inspectionDate: formDataToProcess.inspectionDate,
        };
      } else if (formTypeToSubmit === "DailyHTQC") {
        currentSetter = setDailyHTQCFormData;
        endpoint = "/api/scc/daily-htfu-test";
        successMessageKey = "sccDailyHTQC.reportSavedSuccess";
        initialStateForReset = {
          ...initialDailyHTQCState,
          inspectionDate: formDataToProcess.inspectionDate,
        };
      } else if (formTypeToSubmit === "DailyFUQC") {
        currentSetter = setDailyFUQCFormData;
        endpoint = "/api/scc/daily-fuqc-test";
        successMessageKey = "sccDailyFUQC.reportSavedSuccess";
        initialStateForReset = {
          ...initialDailyFUQCState,
          inspectionDate: formDataToProcess.inspectionDate,
        };
      } else if (formTypeToSubmit === "HTInspectionReport") {
        currentSetter = setHtInspectionReportData;
        endpoint = "/api/scc/ht-inspection-report";
        successMessageKey = "sccHTInspection.reportSavedSuccess";
        initialStateForReset = {
          ...initialHTInspectionReportState,
          inspectionDate: formDataToProcess.inspectionDate,
        };
      } else {
        console.error("Unknown form type:", formTypeToSubmit);
        Swal.fire(t("scc.error"), "Unknown form type.", "error");
        return;
      }

      if (!user) {
        Swal.fire(t("scc.error"), t("scc.userNotLoggedIn"), "error");
        return;
      }

      // Basic Validation (using formDataToProcess)
      if (formTypeToSubmit === "HT" || formTypeToSubmit === "FU") {
        if (
          !formDataToProcess.inspectionDate ||
          !formDataToProcess.machineNo ||
          !formDataToProcess.moNo ||
          !formDataToProcess.color
        ) {
          Swal.fire(
            t("scc.validationErrorTitle"),
            t("scc.validationErrorBasicMachine"),
            "warning"
          );
          return;
        }
      } else if (formTypeToSubmit === "HTInspectionReport") {
        if (
          !formDataToProcess ||
          !formDataToProcess.inspectionDate ||
          !formDataToProcess.machineNo ||
          !formDataToProcess.moNo ||
          !formDataToProcess.color ||
          !formDataToProcess.batchNo ||
          formDataToProcess.totalPcs === null ||
          formDataToProcess.totalPcs <= 0
        ) {
          Swal.fire(
            t("scc.validationErrorTitle"),
            t("sccHTInspection.validation.fillBasicPayload"),
            "warning"
          );
          return;
        }
      } else if (formTypeToSubmit === "DailyTesting") {
        if (
          !formDataToProcess.inspectionDate ||
          !formDataToProcess.moNo ||
          !formDataToProcess.color ||
          !formDataToProcess.machineNo
        ) {
          Swal.fire(
            t("scc.validationErrorTitle"),
            t("scc.validationErrorBasicMachine"),
            "warning"
          );
          return;
        }
      } else if (
        formTypeToSubmit === "DailyHTQC" ||
        formTypeToSubmit === "DailyFUQC"
      ) {
        if (
          !formDataToProcess ||
          !formDataToProcess.inspectionDate ||
          !formDataToProcess.machineNo ||
          !formDataToProcess.moNo ||
          !formDataToProcess.color ||
          !formDataToProcess.currentInspection
        ) {
          Swal.fire(
            t("scc.validationErrorTitle"),
            t(
              formTypeToSubmit === "DailyHTQC"
                ? "sccDailyHTQC.validation.fillBasicPayload"
                : "sccDailyFUQC.validation.fillBasicPayload"
            ),
            "warning"
          );
          return;
        }
      }

      let formIsValid = true;
      if (formTypeToSubmit === "HT" || formTypeToSubmit === "FU") {
        if (
          !formDataToProcess.standardSpecification ||
          formDataToProcess.standardSpecification.length === 0
        ) {
          formIsValid = false;
          Swal.fire(
            t("scc.validationErrorTitle"),
            t("scc.validation.specsRequired"),
            "warning"
          );
        } else {
          const firstSpec = formDataToProcess.standardSpecification[0];
          if (
            !firstSpec.timeSec ||
            !firstSpec.tempC ||
            !firstSpec.pressure ||
            !firstSpec.tempOffset
          ) {
            formIsValid = false;
            Swal.fire(
              t("scc.validationErrorTitle"),
              t(
                "scc.validation.firstSpecFieldsRequired",
                "Time, Temp, Temp Offset, and Pressure are required for the first specification."
              ),
              "warning"
            );
          }
          if (formIsValid && formDataToProcess.showSecondHeatSpec) {
            if (formDataToProcess.standardSpecification.length < 2) {
              formIsValid = false;
              Swal.fire(
                t("scc.validationErrorTitle"),
                t(
                  "scc.validation.secondSpecMissing",
                  "2nd Heat Specification data is missing."
                ),
                "warning"
              );
            } else {
              const secondSpec = formDataToProcess.standardSpecification[1];
              if (
                !secondSpec.timeSec ||
                !secondSpec.tempC ||
                !secondSpec.pressure ||
                !secondSpec.tempOffset
              ) {
                formIsValid = false;
                Swal.fire(
                  t("scc.validationErrorTitle"),
                  t(
                    "scc.validation.secondSpecFieldsRequired",
                    "Time, Temp, Temp Offset, and Pressure are required for the 2nd Heat Specification."
                  ),
                  "warning"
                );
              }
            }
          }
        }
        if (
          formIsValid &&
          !formDataToProcess.referenceSampleImageUrl &&
          !formDataToProcess.referenceSampleImageFile
        ) {
          formIsValid = false;
          Swal.fire(
            t("scc.validationErrorTitle"),
            t("scc.validation.refImageRequired"),
            "warning"
          );
        }
      }
      if (!formIsValid) return;

      setIsSubmitting(true);
      try {
        let finalImageUrls = {};
        let imageTypeIdentifier = "";
        if (formTypeToSubmit === "HT" || formTypeToSubmit === "FU") {
          if (formDataToProcess.referenceSampleImageFile) {
            imageTypeIdentifier = `referenceSample-${formDataToProcess.machineNo}-${formTypeToSubmit}`;
            const imgData = await uploadSccImage(
              formDataToProcess.referenceSampleImageFile,
              formDataToProcess,
              imageTypeIdentifier
            );
            finalImageUrls.referenceSampleImage = imgData.filePath;
          } else {
            finalImageUrls.referenceSampleImage =
              formDataToProcess.referenceSampleImageUrl;
          }
          if (formDataToProcess.afterWashImageFile) {
            imageTypeIdentifier = `afterWash-${formDataToProcess.machineNo}-${formTypeToSubmit}`;
            const imgData = await uploadSccImage(
              formDataToProcess.afterWashImageFile,
              formDataToProcess,
              imageTypeIdentifier
            );
            finalImageUrls.afterWashImage = imgData.filePath;
          } else {
            finalImageUrls.afterWashImage = formDataToProcess.afterWashImageUrl;
          }
        } else if (formTypeToSubmit === "DailyTesting") {
          if (formDataToProcess.afterWashImageFile) {
            imageTypeIdentifier = `afterWashDaily-${formDataToProcess.machineNo}`;
            const imgData = await uploadSccImage(
              formDataToProcess.afterWashImageFile,
              formDataToProcess,
              imageTypeIdentifier
            );
            finalImageUrls.afterWashImage = imgData.filePath;
          } else {
            finalImageUrls.afterWashImage = formDataToProcess.afterWashImageUrl;
          }
        } else if (formTypeToSubmit === "HTInspectionReport") {
          if (formDataToProcess.defectImageFile) {
            imageTypeIdentifier = `htDefect-${formDataToProcess.machineNo}-${formDataToProcess.moNo}-${formDataToProcess.color}-${formDataToProcess.batchNo}`;
            const imgData = await uploadSccImage(
              formDataToProcess.defectImageFile,
              formDataToProcess,
              imageTypeIdentifier
            );
            finalImageUrls.defectImageUrl = imgData.filePath;
          } else {
            finalImageUrls.defectImageUrl = formDataToProcess.defectImageUrl;
          }
        }

        const basePayload = {
          _id: formDataToProcess._id || undefined,
          inspectionDate: formDataToProcess.inspectionDate,
          machineNo: formDataToProcess.machineNo,
          moNo: formDataToProcess.moNo,
          buyer: formDataToProcess.buyer,
          buyerStyle: formDataToProcess.buyerStyle,
          color: formDataToProcess.color,
          remarks: formDataToProcess.remarks?.trim() || "NA",
          emp_id: user.emp_id,
          emp_kh_name: user.kh_name || "N/A",
          emp_eng_name: user.eng_name || "N/A",
          emp_dept_name: user.dept_name || "N/A",
          emp_sect_name: user.sect_name || "N/A",
          emp_job_title: user.job_title || "N/A",
          inspectionTime: `${String(new Date().getHours()).padStart(
            2,
            "0"
          )}:${String(new Date().getMinutes()).padStart(2, "0")}:${String(
            new Date().getSeconds()
          ).padStart(2, "0")}`,
        };

        if (formTypeToSubmit === "HT" || formTypeToSubmit === "FU") {
          payloadToSend = {
            ...basePayload,
            referenceSampleImage: finalImageUrls.referenceSampleImage,
            afterWashImage: finalImageUrls.afterWashImage,
            standardSpecification: formDataToProcess.standardSpecification
              .filter((spec) => spec.timeSec || spec.tempC || spec.pressure)
              .map((spec) => {
                const tempOffsetVal = parseFloat(spec.tempOffset) || 0;
                return {
                  type: spec.type,
                  method: spec.method,
                  timeSec: spec.timeSec ? Number(spec.timeSec) : null,
                  tempC: spec.tempC ? Number(spec.tempC) : null,
                  tempOffsetMinus:
                    tempOffsetVal < 0
                      ? tempOffsetVal
                      : tempOffsetVal !== 0
                      ? -Math.abs(tempOffsetVal)
                      : 0,
                  tempOffsetPlus:
                    tempOffsetVal > 0
                      ? tempOffsetVal
                      : tempOffsetVal !== 0
                      ? Math.abs(tempOffsetVal)
                      : 0,
                  pressure: spec.pressure ? Number(spec.pressure) : null,
                  status: spec.status,
                  remarks: spec.remarks?.trim() || "NA",
                };
              }),
          };
        } else if (formTypeToSubmit === "DailyTesting") {
          payloadToSend = {
            ...basePayload,
            standardSpecifications: {
              tempC: formDataToProcess.standardSpecifications.tempC
                ? Number(formDataToProcess.standardSpecifications.tempC)
                : null,
              timeSec: formDataToProcess.standardSpecifications.timeSec
                ? Number(formDataToProcess.standardSpecifications.timeSec)
                : null,
              pressure: formDataToProcess.standardSpecifications.pressure
                ? Number(formDataToProcess.standardSpecifications.pressure)
                : null,
            },
            numberOfRejections: formDataToProcess.numberOfRejections || 0,
            parameterAdjustmentRecords: (
              formDataToProcess.parameterAdjustmentRecords || []
            ).map((rec) => ({
              rejectionNo: rec.rejectionNo,
              adjustedTempC:
                rec.adjustedTempC !== null && rec.adjustedTempC !== ""
                  ? Number(rec.adjustedTempC)
                  : null,
              adjustedTimeSec:
                rec.adjustedTimeSec !== null && rec.adjustedTimeSec !== ""
                  ? Number(rec.adjustedTimeSec)
                  : null,
              adjustedPressure:
                rec.adjustedPressure !== null && rec.adjustedPressure !== ""
                  ? Number(rec.adjustedPressure)
                  : null,
            })),
            finalResult: formDataToProcess.finalResult || "Pending",
            afterWashImage: finalImageUrls.afterWashImage,
          };
        } else if (
          formTypeToSubmit === "DailyHTQC" ||
          formTypeToSubmit === "DailyFUQC"
        ) {
          payloadToSend = { ...formDataToProcess };
          if (
            formTypeToSubmit === "DailyHTQC" &&
            (payloadToSend.stretchTestResult === "Pass" ||
              payloadToSend.stretchTestResult === "Pending")
          ) {
            payloadToSend.stretchTestRejectReasons = [];
          }
        } else if (formTypeToSubmit === "HTInspectionReport") {
          payloadToSend = {
            ...formDataToProcess,
            defectImageUrl: finalImageUrls.defectImageUrl,
            defectImageFile: undefined,
            emp_id: user.emp_id,
            emp_kh_name: user.kh_name || "N/A",
            emp_eng_name: user.eng_name || "N/A",
            emp_dept_name: user.dept_name || "N/A",
            emp_sect_name: user.sect_name || "N/A",
            emp_job_title: user.job_title || "N/A",
          };
        }

        const response = await axios.post(
          `${API_BASE_URL}${endpoint}`,
          payloadToSend
        );
        Swal.fire(
          t("scc.success"),
          response.data.message || t(successMessageKey),
          "success"
        );
        const updatedRecord = response.data.data;

        // State Update Logic
        if (
          formTypeToSubmit === "HT" ||
          formTypeToSubmit === "FU" ||
          formTypeToSubmit === "DailyTesting"
        ) {
          currentSetter({
            ...initialStateForReset,
          });
        } else if (
          formTypeToSubmit === "DailyHTQC" ||
          formTypeToSubmit === "DailyFUQC" ||
          formTypeToSubmit === "HTInspectionReport"
        ) {
          currentSetter((prevData) => ({
            ...initialStateForReset,
            ...updatedRecord,
            inspectionDate: new Date(updatedRecord.inspectionDate),
            ...(formTypeToSubmit === "DailyFUQC" && {
              temp_offset:
                updatedRecord.temp_offset !== undefined
                  ? updatedRecord.temp_offset
                  : DEFAULT_TEMP_OFFSET_FUQC,
            }),
            ...(formTypeToSubmit === "DailyHTQC" && {
              stretchTestRejectReasons:
                updatedRecord.stretchTestRejectReasons || [],
            }),
          }));
        }
      } catch (error) {
        console.error(
          t("scc.errorSubmittingLog"),
          error.response?.data || error.message || error
        );
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          t("scc.errorSubmitting");
        Swal.fire(t("scc.error"), errorMessage, "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      user,
      t,
      uploadSccImage,
      htFormData,
      fuFormData,
      dailyTestingFormData,
      dailyHTQCFormData,
      dailyFUQCFormData,
      htInspectionReportData,
    ]
  );

  if (authLoading) {
    return (
      <div className="p-6 text-center">
        {t("scc.loadingUser", "Loading user data...")}
      </div>
    );
  }
  if (!user && !authLoading) {
    return (
      <div className="p-6 text-center">
        {t("scc.noUserFound", "User not found. Please log in.")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 pt-6 pb-4 text-center border-b">
          {t("scc.title", "SCC Inspection (HT/FU)")}
        </h1>
        <div className="flex flex-wrap justify-center border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center space-x-2 px-3 py-3 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none ${
                activeTab === tab.id
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {tab.icon}
              <span>{t(tab.labelKey, tab.labelKey.split(".").pop())}</span>
            </button>
          ))}
        </div>
        <div className="p-3 sm:p-4 md:p-5 lg:p-6">
          {CurrentFormComponent &&
            activeTabData &&
            !activeTabData.disabled &&
            user && (
              <CurrentFormComponent
                formType={activeTabData.formType}
                key={`${activeTab}-${activeTabData.formType}`}
                formData={activeTabData.data}
                onFormDataChange={activeTabData.setter}
                onFormSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          {activeTabData && activeTabData.disabled && (
            <div className="text-center py-10 text-gray-500">
              <Settings2 size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-xl">{t(activeTabData.labelKey)}</p>
              <p>
                {t(
                  "scc.tabUnderConstruction",
                  "This section is under construction."
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SCCPage;
