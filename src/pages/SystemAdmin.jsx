import {
  AlertTriangle,
  CheckCircle,
  CheckSquare,
  FileCog,
  ListX,
  PlusCircle,
  Scissors,
  Settings,
  ThermometerSnowflake,
} from "lucide-react"; // Added ThermometerSnowflake for SCC Defects
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

// Import your actual components
import AuditCheckPoints from "../components/inspection/audit/AuditCheckPoints";
import CuttingDefectsModifyAdd from "../components/inspection/cutting/CuttingDefectsModifyAdd";
import CuttingInspectionManage from "../components/inspection/cutting/CuttingInspectionManage"; // ** IMPORT NEW COMPONENT **
import CuttingMeasurementPointsModify from "../components/inspection/cutting/CuttingMeasurementPointsModify";
import CuttingOrderModify from "../components/inspection/cutting/CuttingOrderModify";
import DefectBuyerStatus from "../components/inspection/qc_roving/DefectBuyserStatus";
import SCCDefectsModifyAdd from "../components/inspection/scc/SCCDefectsModifyAdd"; // Import the new SCC component

// Placeholder components for other tabs
const PlaceholderComponent = ({ titleKey, contentKey }) => {
  const { t } = useTranslation();
  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[300px] flex flex-col justify-center items-center">
      <AlertTriangle size={48} className="text-yellow-400 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        {t(titleKey)}
      </h2>
      <p className="text-gray-600 text-center">
        {t(
          contentKey,
          "This section is under development. Content will be available soon."
        )}
      </p>
    </div>
  );
};

const SystemAdmin = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("rovingDefects");

  const tabs = useMemo(
    () => [
      {
        id: "rovingDefects",
        labelKey: "systemAdmin.rovingDefects",
        icon: <CheckCircle size={18} />,
        component: <DefectBuyerStatus />,
      },
      {
        id: "cuttingPoints",
        labelKey: "systemAdmin.cuttingPoints",
        icon: <Scissors size={18} />,
        component: <CuttingMeasurementPointsModify />,
      },
      {
        id: "cuttingAdding",
        labelKey: "systemAdmin.cuttingAdding",
        icon: <PlusCircle size={18} />,
        component: <CuttingOrderModify />,
      },
      {
        id: "cuttingFabricDefects",
        labelKey: "systemAdmin.cuttingFabricDefects",
        icon: <ListX size={18} />,
        component: <CuttingDefectsModifyAdd />,
      },
      {
        // New Tab for SCC Defects
        id: "sccHeatTransferDefects",
        labelKey: "systemAdmin.sccHeatTransferDefects", // New translation key
        icon: <ThermometerSnowflake size={18} />, // Example icon for heat transfer
        component: <SCCDefectsModifyAdd />, // Use the new component
      },
      {
        id: "manageCuttingReports",
        labelKey: "systemAdmin.manageCuttingReports",
        icon: <FileCog size={18} />,
        component: <CuttingInspectionManage />, // Use the new component
      },
      {
        id: "qc2Defects",
        labelKey: "systemAdmin.qc2Defects",
        icon: <Settings size={18} />,
        component: (
          <PlaceholderComponent
            titleKey="systemAdmin.qc2Defects"
            contentKey="systemAdmin.contentComingSoon"
          />
        ),
      },
      {
        // New Tab for Audit Checkpoints
        id: "auditCheckpoints",
        labelKey: "systemAdmin.auditCheckpointsTab", // You'll need to add this translation key
        icon: <CheckSquare size={18} />, // Example Icon
        component: <AuditCheckPoints />,
      },
    ],
    []
  );

  const activeComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-8xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            {t("systemAdmin.title", "System Administration")}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {t(
              "systemAdmin.subtitle",
              "Manage system configurations and master data."
            )}
          </p>
        </header>
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="border-b border-gray-300">
            <nav
              className="-mb-px flex space-x-1 sm:space-x-2 px-4 sm:px-6 overflow-x-auto"
              aria-label="Tabs"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-sm
                    whitespace-nowrap transition-all duration-150 ease-in-out
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                    ${
                      activeTab === tab.id
                        ? "border-indigo-600 text-indigo-700"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }
                  `}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                >
                  {tab.icon &&
                    React.cloneElement(tab.icon, {
                      className: `mr-1.5 sm:mr-2 h-5 w-5 ${
                        activeTab === tab.id
                          ? "text-indigo-600"
                          : "text-slate-400 group-hover:text-slate-500"
                      }`,
                    })}
                  {t(tab.labelKey, tab.labelKey.split(".").pop())}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-[calc(100vh-250px)]">
            {activeComponent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAdmin;
