import {
  BarChart,
  Box,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Home,
  Menu,
  Package,
  Search,
  Shirt,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";

const NavigationPanel = ({
  isOpen,
  toggleNav,
  setActiveSection,
  activeSection,
}) => {
  const [expandedMenus, setExpandedMenus] = useState({});

  const menuItems = [
    { name: "Home", icon: <Home size={18} />, subMenus: [] },
    {
      name: "QC Inline Roving",
      icon: <Search size={16} />,
      subMenus: [
        { name: "Roving Report", icon: <BarChart size={16} /> },
        { name: "Roving Trend", icon: <TrendingUp size={16} /> },
      ],
    },
    {
      name: "Cutting",
      icon: <Search size={16} />,
      subMenus: [
        { name: "Cutting Reports", icon: <BarChart size={16} /> },
        { name: "Cutting Trend", icon: <TrendingUp size={16} /> },
      ],
    },
    {
      name: "Digital Measurement",
      icon: <Shirt size={16} />,
      subMenus: [
        { name: "Buyer Specs", icon: <BarChart size={16} /> },
        { name: "Measurement Summary", icon: <TrendingUp size={16} /> },
        { name: "Measurement Summary - CPK", icon: <TrendingUp size={16} /> },
      ],
    },
    {
      name: "QC 1 Dashboard",
      icon: <BarChart size={16} />,
      subMenus: [
        { name: "Daily Analysis", icon: <BarChart size={16} /> },
        { name: "Daily Trend", icon: <TrendingUp size={16} /> },
        { name: "Monthly Trend", icon: <TrendingUp size={16} /> },
        { name: "Yearly Trend", icon: <TrendingUp size={16} /> },
      ],
    },
    { name: "Order Data", icon: <Package size={18} />, subMenus: [] },
    { name: "Washing", icon: <Shirt size={18} />, subMenus: [] },
    { name: "Ironing", icon: <Shirt size={18} />, subMenus: [] },
    { name: "OPA", icon: <Eye size={18} />, subMenus: [] },
    {
      name: "QC2",
      icon: <BarChart size={18} />,
      subMenus: [
        { name: "Live Dashboard", icon: <BarChart size={16} /> },
        { name: "MO Analysis", icon: <Clock size={16} /> },
        { name: "Line Hr Trend", icon: <TrendingUp size={16} /> },
        { name: "Daily Summary", icon: <Calendar size={16} /> },
        { name: "Weekly Analysis", icon: <FileText size={16} /> },
        { name: "Monthly Analysis", icon: <FileText size={16} /> },
      ],
    },
    { name: "Packing", icon: <Box size={18} />, subMenus: [] },
  ];

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  return (
    <>
      {/* Navigation Panel */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white shadow-2xl transition-all duration-300 ease-in-out z-40 ${
          isOpen ? "w-72" : "w-0"
        } overflow-hidden`}
      >
        <div className="p-6 pt-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold tracking-wide text-blue-100">
              Dashboard
            </h2>
            {isOpen && (
              <button
                onClick={toggleNav}
                className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                <ChevronLeft size={24} />
              </button>
            )}
          </div>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <div
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                    activeSection === item.name && item.subMenus.length === 0
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-800 text-gray-200"
                  }`}
                  onClick={() => {
                    if (item.subMenus.length > 0) {
                      toggleMenu(item.name);
                    } else {
                      setActiveSection(item.name);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {item.subMenus.length > 0 && (
                    <span>
                      {expandedMenus[item.name] ? (
                        <ChevronDown size={18} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={18} className="text-gray-400" />
                      )}
                    </span>
                  )}
                </div>
                {expandedMenus[item.name] && item.subMenus.length > 0 && (
                  <ul className="ml-8 mt-2 space-y-1">
                    {item.subMenus.map((subMenu) => (
                      <li
                        key={subMenu.name}
                        className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                          activeSection === subMenu.name
                            ? "bg-blue-500 text-white"
                            : "hover:bg-gray-700 text-gray-300"
                        }`}
                        onClick={() => setActiveSection(subMenu.name)}
                      >
                        <span className="mr-2">{subMenu.icon}</span>
                        <span className="text-sm">{subMenu.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Toggle Button (Menu Icon) - Positioned below the Navbar on the left */}
      {!isOpen && (
        <button
          onClick={toggleNav}
          className="fixed left-4 z-50 p-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          style={{ top: "80px" }}
        >
          <Menu size={24} />
        </button>
      )}
    </>
  );
};

export default NavigationPanel;
