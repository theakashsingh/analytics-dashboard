import { useCallback, useEffect, useState } from "react";
import Electric_Vehicle_Population_Data from "../data-to-visualize/Electric_Vehicle_Population_Data.csv"
import { parseCSVData, processCSVData } from "./component/utils/dataProcessing";
import { Header } from "./component/Header";
import { FileUploader } from "./component/FileUploader";
import { TabNavigation } from "./component/TabNavigation";
import { DashboardContent } from "./DashboardContent";

export default function App() {
  const [processedData, setProcessedData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      fetch(Electric_Vehicle_Population_Data)
        .then(response => response.text())
        .then(csvText => {
          const parsedData = parseCSVData(csvText);
          const processed = processCSVData(parsedData);
          setProcessedData(processed);
        })
        .catch(err => {
          setError("Error loading default data: " + err.message);
        });
    } catch (err) {
      setError("Error loading default data: " + err.message);
    }
  }, []);

  const handleFileProcess = useCallback((data) => {
    setIsLoading(true);
    setError("");
    try {
      const processed = processCSVData(data);
      setProcessedData(processed);
    } catch (err) {
      setError("Error processing file: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Header />
        <FileUploader 
          onFileProcess={handleFileProcess}
          isLoading={isLoading}
          error={error}
        />
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {processedData && (
          <DashboardContent 
            data={processedData}
            activeTab={activeTab}
            isLoading={!processedData || isLoading} 
          />
        )}
      </div>
    </div>
  );
}