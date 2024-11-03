/* eslint-disable react/prop-types */
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Upload,
  Battery,
  Car,
  Zap,
  TrendingUp,
  MapPin,
  Calendar,
  Tag,
  Building2,
} from "lucide-react";
import Electric_Vehicle_Population_Data from "../data-to-visualize/Electric_Vehicle_Population_Data.csv"

const COLORS = ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"];

const getTopUtilities = (data) => {
  const utilityCount = {};
  data.forEach(vehicle => {
    const utilities = vehicle["Electric Utility"].split("|");
    utilities.forEach(utility => {
      utilityCount[utility] = (utilityCount[utility] || 0) + 1;
    });
  });
  return Object.entries(utilityCount)
    .map(([utility, count]) => ({ utility, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

const processCSVData = (data) => {
  try {
    // Basic counting metrics
    const makeCount = {};
    const modelCount = {};
    const yearCount = {};
    const countyCount = {};
    const typeCount = {};
    const eligibilityCount = {};
    const cityCount = {};
    let totalRange = 0;
    let validRangeCount = 0;
    let cafvEligibleCount = 0;
    let bevCount = 0;
    let phevCount = 0;
    let minRange = Infinity;
    let maxRange = -Infinity;
    let totalMSRP = 0;
    let validMSRPCount = 0;

    data.forEach(vehicle => {
      // Make & Model counting
      makeCount[vehicle.Make] = (makeCount[vehicle.Make] || 0) + 1;
      const makeModel = `${vehicle.Make} ${vehicle.Model}`;
      modelCount[makeModel] = (modelCount[makeModel] || 0) + 1;

      // City counting
      cityCount[vehicle.City] = (cityCount[vehicle.City] || 0) + 1;

      // Year counting
      const year = parseInt(vehicle["Model Year"]);
      if (year) {
        yearCount[year] = (yearCount[year] || 0) + 1;
      }

      // County counting
      countyCount[vehicle.County] = (countyCount[vehicle.County] || 0) + 1;

      // Vehicle type counting
      const evType = vehicle["Electric Vehicle Type"];
      typeCount[evType] = (typeCount[evType] || 0) + 1;
      if (evType === "Battery Electric Vehicle (BEV)") bevCount++;
      if (evType === "Plug-in Hybrid Electric Vehicle (PHEV)") phevCount++;

      // MSRP tracking
      const msrp = Number(vehicle["Base MSRP"]);
      if (msrp > 0) {
        totalMSRP += msrp;
        validMSRPCount++;
      }

      // CAFV eligibility
      const eligibility = vehicle["Clean Alternative Fuel Vehicle (CAFV) Eligibility"];
      eligibilityCount[eligibility] = (eligibilityCount[eligibility] || 0) + 1;
      if (eligibility === "Clean Alternative Fuel Vehicle Eligible") cafvEligibleCount++;

      // Electric range statistics
      const range = parseFloat(vehicle["Electric Range"]);
      if (range > 0) {
        totalRange += range;
        validRangeCount++;
        minRange = Math.min(minRange, range);
        maxRange = Math.max(maxRange, range);
      }
    });

    // Process data for visualizations
    const processedData = {
      byMake: Object.entries(makeCount)
        .map(([make, count]) => ({ make, count }))
        .sort((a, b) => b.count - a.count),
      byModel: Object.entries(modelCount)
        .map(([model, count]) => ({ model, count }))
        .sort((a, b) => b.count - a.count),
      byCity: Object.entries(cityCount)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count),
      byYear: Object.entries(yearCount)
        .map(([year, count]) => ({ year: parseInt(year), count, total: 0 }))
        .sort((a, b) => a.year - b.year),
      byCounty: Object.entries(countyCount)
        .map(([county, count]) => ({ county, count }))
        .sort((a, b) => b.count - a.count),
      byType: Object.entries(typeCount)
        .map(([type, count]) => ({
          type: type === "Battery Electric Vehicle (BEV)" ? "BEV" : "PHEV",
          count,
          percentage: ((count / data.length) * 100).toFixed(1),
        }))
        .sort((a, b) => b.count - a.count),
      byEligibility: Object.entries(eligibilityCount)
        .map(([status, count]) => ({
          status,
          count,
          percentage: ((count / data.length) * 100).toFixed(1),
        }))
        .sort((a, b) => b.count - a.count),
      byUtility: getTopUtilities(data),
      stats: {
        totalCount: data.length,
        uniqueMakes: Object.keys(makeCount).length,
        uniqueModels: Object.keys(modelCount).length,
        averageRange: validRangeCount ? (totalRange / validRangeCount).toFixed(1) : 0,
        averageMSRP: validMSRPCount ? (totalMSRP / validMSRPCount).toFixed(2) : 0,
        marketLeader: Object.entries(makeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
        topCity: Object.entries(cityCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
        electricRangeStats: {
          min: minRange === Infinity ? 0 : minRange,
          max: maxRange === -Infinity ? 0 : maxRange,
          avg: validRangeCount ? (totalRange / validRangeCount).toFixed(1) : 0,
        },
        cafvEligible: ((cafvEligibleCount / data.length) * 100).toFixed(1),
        bev: ((bevCount / data.length) * 100).toFixed(1),
        phev: ((phevCount / data.length) * 100).toFixed(1),
      }
    };

    // Calculate cumulative totals for year data
    let runningTotal = 0;
    processedData.byYear.forEach(item => {
      runningTotal += item.count;
      item.total = runningTotal;
    });

    return processedData;
  } catch (err) {
    console.error("Data processing error:", err);
    throw err;
  }
};

export default function EVAnalyticsDashboard() {
  const [processedData, setProcessedData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to parse CSV text into data objects
  const parseCSVData = (csvText) => {
    const lines = csvText.split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    return lines
      .slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(",");
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index]?.trim() || "";
          return obj;
        }, {});
      });
  };

  // Load default data on component mount
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

  // File upload and data loading logic
  const onDrop = useCallback(async acceptedFiles => {
    const file = acceptedFiles[0];
    if (!file) {
      setError("Please upload a valid CSV file");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => reject(new Error("File reading failed"));
        reader.readAsText(file);
      });

      const lines = text.split("\n");
      const headers = lines[0].split(",").map(h => h.trim());
      const data = lines
        .slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(",");
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index]?.trim() || "";
            return obj;
          }, {});
        });

      const processed = processCSVData(data);
      setProcessedData(processed);
    } catch (err) {
      setError("Error processing file: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  // Tab navigation component
  const TabButton = ({ tab, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 
        ${activeTab === tab 
          ? "bg-blue-100 text-blue-800 shadow-sm" 
          : "hover:bg-blue-50 text-gray-600"
        }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  // Stats card component
  const StatsCard = ({ title, value, subtext, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtext}</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  // Chart container component
  const ChartContainer = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-blue-900 mb-6">{title}</h2>
      <div className="h-80">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-blue-900 flex items-center">
            <Zap className="w-10 h-10 mr-3 text-blue-600" />
            Washington State EV Analytics
          </h1>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-8
              ${isDragActive ? "border-blue-500 bg-blue-50" : "border-blue-200"}
              ${isLoading ? "opacity-50 cursor-wait" : "cursor-pointer"}
              transition-all duration-200 hover:border-blue-400
              flex flex-col items-center justify-center
            `}
          >
            <input {...getInputProps()} />
            <Upload className={`w-12 h-12 ${isDragActive ? "text-blue-500" : "text-blue-400"} mb-4`} />
            {isLoading ? (
              <p className="text-blue-900 text-lg font-medium">Processing file...</p>
            ) : (
              <>
                <p className="text-blue-900 text-lg font-medium text-center">
                  {isDragActive ? "Drop your CSV file here!" : "Drop your CSV file here, or click to select"}
                </p>
                <p className="text-blue-500 text-sm mt-2">Supports CSV files only</p>
              </>
            )}
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-600">{error}</div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8 overflow-x-auto">
          <TabButton tab="overview" label="Overview" icon={Car} />
          <TabButton tab="geography" label="Geography" icon={MapPin} />
          <TabButton tab="models" label="Makes & Models" icon={Tag} />
          <TabButton tab="timeline" label="Timeline" icon={Calendar} />
          <TabButton tab="utilities" label="Utilities" icon={Building2} />
        </div>

        {processedData && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {activeTab === "overview" && [
                {
                  title: "Total EVs",
                  value: processedData.stats.totalCount.toLocaleString(),
                  subtext: `${processedData.stats.bev}% BEV | ${processedData.stats.phev}% PHEV`,
                  icon: Car,
                },
                {
                  title: "Average Range",
                  value: `${processedData.stats.averageRange} mi`,
                  subtext: `Max: ${processedData.stats.electricRangeStats.max} mi`,
                  icon: Battery,
                },
                {
                  title: "Market Leader",
                  value: processedData.stats.marketLeader,
                  subtext: `${processedData.stats.uniqueMakes} Makes`,
                  icon: TrendingUp,
                },
                {
                  title: "CAFV Eligible",
                  value: `${processedData.stats.cafvEligible}%`,
                  subtext: "Clean Alternative Fuel Vehicles",
                  icon: Zap,
                },
              ].map((stat, idx) => (
                <StatsCard key={idx} {...stat} />
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {activeTab === "overview" && (
                <>
                  <ChartContainer title="Vehicle Type Distribution">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={processedData.byType}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="type"
                          label={({ type, percentage }) => `${type} (${percentage}%)`}
                        >
                          {processedData.byType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <ChartContainer title="CAFV Eligibility Status">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedData.byEligibility}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </>
              )}

              {activeTab === "geography" && (
                <>
                  <ChartContainer title="Top Counties">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedData.byCounty.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="county" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <ChartContainer title="Top Cities">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedData.byCity.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="city" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </>
              )}

              {activeTab === "models" && (
                <>
                  <ChartContainer title="Top Manufacturers">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedData.byMake.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="make" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <ChartContainer title="Top Models">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedData.byModel.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="model" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </>
              )}

              {activeTab === "timeline" && (
                <ChartContainer title="Registration Trend">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={processedData.byYear}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3B82F6"
                        name="New Registrations"
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#60A5FA"
                        name="Cumulative"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}

              {activeTab === "utilities" && (
                <ChartContainer title="Top Electric Utilities">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedData.byUtility}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="utility" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}