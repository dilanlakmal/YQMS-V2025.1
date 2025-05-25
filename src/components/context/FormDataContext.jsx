// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react"; // Added useCallback
// import { useAuth } from "../authentication/AuthContext";

// const FormDataContext = createContext();

// export const FormDataProvider = ({ children }) => {
//   const { user } = useAuth();
//   const userId = user?.emp_id || "anonymous";

//   const getDefaultData = () => ({
//     // Helper function for default data
//     bundleRegistration: {
//       date: new Date().toISOString(), // Store date as ISO string for easier serialization
//       department: "",
//       selectedMono: "",
//       buyer: "",
//       orderQty: "",
//       factoryInfo: "",
//       custStyle: "",
//       country: "",
//       color: "",
//       size: "",
//       bundleQty: 1,
//       lineNo: "",
//       count: 10,
//       colorCode: "",
//       chnColor: "",
//       colorKey: "",
//       sizeOrderQty: "",
//       planCutQty: "",
//       isSubCon: false,
//       subConName: "",
//     },
//     washing: {},
//     dyeing: {},
//     ironing: {},
//     packing: {},
//     qc1Inspection: {},
//     qc2Inspection: {},
//     qaAudit: {},
//   });

//   const [formData, setFormData] = useState(() => {
//     try {
//       const savedData = localStorage.getItem(`formData_${userId}`);
//       if (savedData) {
//         const parsedData = JSON.parse(savedData);
//         // Ensure date is a Date object when read, if needed by DatePicker immediately
//         // However, it's often better to handle Date object creation in the component using the date string
//         if (
//           parsedData.bundleRegistration &&
//           parsedData.bundleRegistration.date
//         ) {
//           // Assuming DatePicker can handle ISO string directly, or convert in component
//         }
//         return parsedData;
//       }
//     } catch (error) {
//       console.error("Error parsing saved form data:", error);
//     }
//     return getDefaultData();
//   });

//   // Save to localStorage whenever formData changes
//   useEffect(() => {
//     if (userId && userId !== "anonymous") {
//       localStorage.setItem(`formData_${userId}`, JSON.stringify(formData));
//     }
//     // This effect depends on formData. If formData is frequently changing reference
//     // without actual content change, this could be an issue, but usually stringify handles it.
//     // The main loop is often caused by unstable context functions.
//   }, [formData, userId]);

//   // Effect to load data or reset when userId changes
//   useEffect(() => {
//     if (userId && userId !== "anonymous") {
//       try {
//         const savedData = localStorage.getItem(`formData_${userId}`);
//         if (savedData) {
//           const parsedData = JSON.parse(savedData);
//           setFormData(parsedData); // This will trigger the above useEffect to save again if it's the first load, which is fine.
//         } else {
//           setFormData(getDefaultData());
//         }
//       } catch (error) {
//         console.error(
//           "Error loading/parsing saved form data on user change:",
//           error
//         );
//         setFormData(getDefaultData());
//       }
//     } else if (userId === "anonymous") {
//       // User logged out or not yet loaded
//       setFormData(getDefaultData());
//     }
//   }, [userId]);

//   const updateFormData = useCallback((formName, data) => {
//     setFormData((prev) => {
//       const updatedForm = {
//         ...prev[formName],
//         ...data,
//       };
//       // Ensure date is stored as ISO string if it's a Date object
//       if (updatedForm.date && updatedForm.date instanceof Date) {
//         updatedForm.date = updatedForm.date.toISOString();
//       }
//       return {
//         ...prev,
//         [formName]: updatedForm,
//       };
//     });
//   }, []); // Empty dependency array: function is created once

//   const clearFormData = useCallback((formName) => {
//     setFormData((prev) => {
//       const defaultFormState =
//         formName === "bundleRegistration"
//           ? { date: new Date().toISOString() } // Store as ISO string
//           : {};
//       return {
//         ...prev,
//         [formName]: defaultFormState,
//       };
//     });
//     // localStorage update will be handled by the useEffect listening to formData changes
//   }, []); // Empty dependency array

//   // Convert date strings back to Date objects when providing formData from context
//   // This ensures components receive Date objects if they expect them (e.g., DatePicker)
//   const formDataWithDateObjects = useMemo(() => {
//     const newFormData = { ...formData };
//     if (
//       newFormData.bundleRegistration &&
//       newFormData.bundleRegistration.date &&
//       typeof newFormData.bundleRegistration.date === "string"
//     ) {
//       newFormData.bundleRegistration = {
//         ...newFormData.bundleRegistration,
//         date: new Date(newFormData.bundleRegistration.date),
//       };
//     }
//     // Add similar conversions for other forms if they store dates
//     return newFormData;
//   }, [formData]);

//   return (
//     <FormDataContext.Provider
//       value={{
//         formData: formDataWithDateObjects, // Provide formData with Date objects
//         updateFormData,
//         clearFormData,
//       }}
//     >
//       {children}
//     </FormDataContext.Provider>
//   );
// };

// export const useFormData = () => {
//   const context = useContext(FormDataContext);
//   if (!context) {
//     throw new Error("useFormData must be used within a FormDataProvider");
//   }
//   return context;
// };

// FormDataContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../authentication/AuthContext";

const FormDataContext = createContext();

export const FormDataProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.emp_id || "anonymous";

  const getDefaultData = useCallback(
    () => ({
      // Memoize default data structure
      bundleRegistration: {
        date: new Date().toISOString(),
        department: "",
        selectedMono: "",
        buyer: "",
        orderQty: "",
        factoryInfo: "",
        custStyle: "",
        country: "",
        color: "",
        size: "",
        bundleQty: 1,
        lineNo: "",
        count: 10,
        colorCode: "",
        chnColor: "",
        colorKey: "",
        sizeOrderQty: "",
        planCutQty: "",
        isSubCon: false,
        subConName: "",
      },
      washing: {},
      dyeing: {},
      ironing: {},
      packing: {},
      qc1Inspection: {},
      qc2Inspection: {},
      qaAudit: {},
    }),
    []
  );

  const [internalFormData, setInternalFormData] = useState(() => {
    if (userId && userId !== "anonymous") {
      try {
        const savedData = localStorage.getItem(`formData_${userId}`);
        if (savedData) {
          return JSON.parse(savedData);
        }
      } catch (error) {
        console.error("Error parsing saved form data on initial load:", error);
      }
    }
    return getDefaultData();
  });

  // Effect to load/reset data when userId changes
  useEffect(() => {
    if (userId && userId !== "anonymous") {
      try {
        const savedData = localStorage.getItem(`formData_${userId}`);
        setInternalFormData(
          savedData ? JSON.parse(savedData) : getDefaultData()
        );
      } catch (error) {
        console.error("Error loading form data on user change:", error);
        setInternalFormData(getDefaultData());
      }
    } else if (userId === "anonymous") {
      setInternalFormData(getDefaultData());
    }
  }, [userId, getDefaultData]);

  // Effect to save to localStorage ONLY when internalFormData truly changes content
  // This requires careful string comparison or deep comparison if performance allows
  const stringifiedFormData = useMemo(
    () => JSON.stringify(internalFormData),
    [internalFormData]
  );

  useEffect(() => {
    if (userId && userId !== "anonymous") {
      const currentStoredData = localStorage.getItem(`formData_${userId}`);
      if (currentStoredData !== stringifiedFormData) {
        // Only save if different
        localStorage.setItem(`formData_${userId}`, stringifiedFormData);
      }
    }
  }, [stringifiedFormData, userId]);

  const updateFormData = useCallback((formName, data) => {
    setInternalFormData((prev) => {
      const currentFormState = prev[formName] || {};
      let hasChanged = false;
      const updatedFormPart = { ...currentFormState };

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          let newValue = data[key];
          // Ensure date is stored as ISO string if it's a Date object
          if (key === "date" && newValue instanceof Date) {
            newValue = newValue.toISOString();
          }
          if (currentFormState[key] !== newValue) {
            updatedFormPart[key] = newValue;
            hasChanged = true;
          }
        }
      }

      if (hasChanged) {
        return { ...prev, [formName]: updatedFormPart };
      }
      return prev; // Return previous state if no actual change to avoid re-render loop
    });
  }, []);

  const clearFormData = useCallback(
    (formName) => {
      setInternalFormData((prev) => ({
        ...prev,
        [formName]:
          formName === "bundleRegistration"
            ? {
                ...getDefaultData().bundleRegistration,
                date: new Date().toISOString(),
              }
            : {},
      }));
    },
    [getDefaultData]
  );

  // Convert date strings back to Date objects for consuming components
  const formDataForConsumer = useMemo(() => {
    const newFormData = { ...internalFormData };
    if (
      newFormData.bundleRegistration &&
      newFormData.bundleRegistration.date &&
      typeof newFormData.bundleRegistration.date === "string"
    ) {
      try {
        newFormData.bundleRegistration = {
          ...newFormData.bundleRegistration,
          date: new Date(newFormData.bundleRegistration.date),
        };
      } catch (e) {
        console.error(
          "Error parsing date from context for consumer:",
          newFormData.bundleRegistration.date,
          e
        );
        // keep original string if parsing fails
      }
    }
    return newFormData;
  }, [internalFormData]);

  return (
    <FormDataContext.Provider
      value={{
        formData: formDataForConsumer,
        updateFormData,
        clearFormData,
      }}
    >
      {children}
    </FormDataContext.Provider>
  );
};

export const useFormData = () => {
  const context = useContext(FormDataContext);
  if (!context) {
    throw new Error("useFormData must be used within a FormDataProvider");
  }
  return context;
};
