import { useState, useEffect } from 'react';
import { Card, Nav, Row, Col, Form } from 'react-bootstrap';
import { Mail } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Email Stats Chart Component
const EmailStatsChart = ({ emailData }) => {
  const [viewMode, setViewMode] = useState('days'); // 'days', 'weeks', or 'months'
  const [chartData, setChartData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [incompleteDataInfo, setIncompleteDataInfo] = useState('');

  console.log("EmailData prop:", emailData);

  // Debug the structure of the incoming data
  useEffect(() => {
    console.log("EmailData received:", emailData);
    if (emailData && emailData.length > 0) {
      console.log("First item in emailData:", emailData[0]);
      if (Array.isArray(emailData[0])) {
        console.log("First item in nested array:", emailData[0][0]);
      }
    }
  }, [emailData]);

  // Set default date range on initial load
  useEffect(() => {
    if (!startDate && !endDate) {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      setStartDate(sevenDaysAgo);
      setEndDate(today);
    }
  }, []);

  // Process data whenever viewMode, emailData, or date range changes
  useEffect(() => {
    const { processedData, incompleteInfo } = processData();
    console.log(`Final processed data for ${viewMode}:`, processedData);
    setChartData(processedData);
    setIncompleteDataInfo(incompleteInfo);
  }, [viewMode, emailData, startDate, endDate]);

  // Process data based on viewMode and date range
  const processData = () => {
    if (!emailData || !Array.isArray(emailData) || emailData.length === 0) {
      console.log("No email data available");
      return { processedData: [], incompleteInfo: '' };
    }

    // Extract the actual data array
    let data = [];
    if (Array.isArray(emailData[0])) {
      data = emailData[0]; // Using the first array in emailData
    } else {
      data = emailData; // Assume emailData is already the data array
    }

    if (!Array.isArray(data) || data.length === 0) {
      console.log("Invalid data structure in emailData");
      return { processedData: [], incompleteInfo: '' };
    }

    console.log(`Processing data for ${viewMode} view. Data sample:`, data.slice(0, 3));
    
    // Filter data by date range if dates are selected
    let filteredData = data;
    if (startDate || endDate) {
      filteredData = data.filter(item => {
        if (!item.date) return false;
        
        // Parse the date from the item
        let itemDate;
        try {
          if (typeof item.date === 'string' && item.date.includes('-')) {
            const [year, month, day] = item.date.split('-').map(Number);
            itemDate = new Date(year, month - 1, day);
          } else {
            itemDate = new Date(item.date);
          }
          
          // Check if the date is within range
          let isInRange = true;
          if (startDate) {
            const startOfDay = new Date(startDate);
            startOfDay.setHours(0, 0, 0, 0);
            isInRange = isInRange && itemDate >= startOfDay;
          }
          if (endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            isInRange = isInRange && itemDate <= endOfDay;
          }
          return isInRange;
        } catch (err) {
          console.error("Error parsing date:", item.date, err);
          return false;
        }
      });
      
      console.log(`Filtered data by date range. Items remaining: ${filteredData.length}`);
    }

    // Sort data by date
    filteredData.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    let processedData = [];
    let incompleteInfo = '';
    
    // Process data based on viewMode
    if (viewMode === 'days') {
      // Daily view - use filtered data directly
      processedData = filteredData.map(day => ({
        date: day.date,
        emails_scanned: Number(day.emails_scanned) || 0,
        phishing_emails: Number(day.phishing_emails) || 0
      }));
    } 
    else if (viewMode === 'weeks') {
      // Weekly aggregation
      const weeklyData = new Map();
      let currentWeekStart = null;
      let daysInCurrentWeek = 0;
      let incompleteWeeks = [];
      
      // If we have start date, use it as the first week start
      if (startDate && filteredData.length > 0) {
        currentWeekStart = new Date(startDate);
      } else if (filteredData.length > 0) {
        // Otherwise use the first data point
        currentWeekStart = new Date(filteredData[0].date);
      }
      
      if (currentWeekStart) {
        // Process each data point
        filteredData.forEach(item => {
          const itemDate = new Date(item.date);
          const dayDiff = Math.floor((itemDate - currentWeekStart) / (24 * 60 * 60 * 1000));
          
          // Check if this item belongs to the current week
          if (dayDiff >= 0 && dayDiff < 7) {
            // Add to current week
            const weekKey = currentWeekStart.toISOString().split('T')[0];
            if (!weeklyData.has(weekKey)) {
              weeklyData.set(weekKey, {
                date: `${currentWeekStart.toISOString().split('T')[0]} to ${new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
                emails_scanned: 0,
                phishing_emails: 0,
                days: 0
              });
            }
            
            const weekData = weeklyData.get(weekKey);
            weekData.emails_scanned += Number(item.emails_scanned) || 0;
            weekData.phishing_emails += Number(item.phishing_emails) || 0;
            weekData.days++;
            daysInCurrentWeek++;
          } 
          else if (dayDiff >= 7) {
            // Check if previous week was incomplete
            if (daysInCurrentWeek < 7 && daysInCurrentWeek > 0) {
              incompleteWeeks.push({
                week: currentWeekStart.toISOString().split('T')[0],
                days: daysInCurrentWeek,
                missing: 7 - daysInCurrentWeek
              });
            }
            
            // Move to next week that contains this item
            const weeksToAdd = Math.floor(dayDiff / 7);
            currentWeekStart = new Date(currentWeekStart);
            currentWeekStart.setDate(currentWeekStart.getDate() + (weeksToAdd * 7));
            
            // Reset counter for new week
            daysInCurrentWeek = 1;
            
            // Add this item to the new week
            const weekKey = currentWeekStart.toISOString().split('T')[0];
            weeklyData.set(weekKey, {
              date: `${currentWeekStart.toISOString().split('T')[0]} to ${new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
              emails_scanned: Number(item.emails_scanned) || 0,
              phishing_emails: Number(item.phishing_emails) || 0,
              days: 1
            });
          }
        });
        
        // Check if the last week is incomplete
        if (daysInCurrentWeek < 7 && daysInCurrentWeek > 0) {
          incompleteWeeks.push({
            week: currentWeekStart.toISOString().split('T')[0],
            days: daysInCurrentWeek,
            missing: 7 - daysInCurrentWeek
          });
        }
        
        // Convert map to array
        processedData = Array.from(weeklyData.values());
        
        // Generate incomplete data message
        if (incompleteWeeks.length > 0) {
          incompleteInfo = incompleteWeeks.map(w => 
            `Week starting ${w.week} has only ${w.days} days (missing ${w.missing} days)`
          ).join('; ');
        }
      }
    } 
    else if (viewMode === 'months') {
      // Monthly aggregation (30-day periods)
      const monthlyData = new Map();
      let currentMonthStart = null;
      let daysInCurrentMonth = 0;
      let incompleteMonths = [];
      
      // If we have start date, use it as the first month start
      if (startDate && filteredData.length > 0) {
        currentMonthStart = new Date(startDate);
      } else if (filteredData.length > 0) {
        // Otherwise use the first data point
        currentMonthStart = new Date(filteredData[0].date);
      }
      
      if (currentMonthStart) {
        // Process each data point
        filteredData.forEach(item => {
          const itemDate = new Date(item.date);
          const dayDiff = Math.floor((itemDate - currentMonthStart) / (24 * 60 * 60 * 1000));
          
          // Check if this item belongs to the current month (30-day period)
          if (dayDiff >= 0 && dayDiff < 30) {
            // Add to current month
            const monthKey = currentMonthStart.toISOString().split('T')[0];
            if (!monthlyData.has(monthKey)) {
              monthlyData.set(monthKey, {
                date: `${currentMonthStart.toISOString().split('T')[0]} to ${new Date(currentMonthStart.getTime() + 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
                emails_scanned: 0,
                phishing_emails: 0,
                days: 0
              });
            }
            
            const monthData = monthlyData.get(monthKey);
            monthData.emails_scanned += Number(item.emails_scanned) || 0;
            monthData.phishing_emails += Number(item.phishing_emails) || 0;
            monthData.days++;
            daysInCurrentMonth++;
          } 
          else if (dayDiff >= 30) {
            // Check if previous month was incomplete
            if (daysInCurrentMonth < 30 && daysInCurrentMonth > 0) {
              incompleteMonths.push({
                month: currentMonthStart.toISOString().split('T')[0],
                days: daysInCurrentMonth,
                missing: 30 - daysInCurrentMonth
              });
            }
            
            // Move to next month that contains this item
            const monthsToAdd = Math.floor(dayDiff / 30);
            currentMonthStart = new Date(currentMonthStart);
            currentMonthStart.setDate(currentMonthStart.getDate() + (monthsToAdd * 30));
            
            // Reset counter for new month
            daysInCurrentMonth = 1;
            
            // Add this item to the new month
            const monthKey = currentMonthStart.toISOString().split('T')[0];
            monthlyData.set(monthKey, {
              date: `${currentMonthStart.toISOString().split('T')[0]} to ${new Date(currentMonthStart.getTime() + 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
              emails_scanned: Number(item.emails_scanned) || 0,
              phishing_emails: Number(item.phishing_emails) || 0,
              days: 1
            });
          }
        });
        
        // Check if the last month is incomplete
        if (daysInCurrentMonth < 30 && daysInCurrentMonth > 0) {
          incompleteMonths.push({
            month: currentMonthStart.toISOString().split('T')[0],
            days: daysInCurrentMonth,
            missing: 30 - daysInCurrentMonth
          });
        }
        
        // Convert map to array
        processedData = Array.from(monthlyData.values());
        
        // Generate incomplete data message
        if (incompleteMonths.length > 0) {
          incompleteInfo = incompleteMonths.map(m => 
            `Month starting ${m.month} has only ${m.days} days (missing ${m.missing} days)`
          ).join('; ');
        }
      }
    }

    return { processedData, incompleteInfo };
  };

  // Handle date changes
  const handleStartDateChange = (date) => {
    console.log("Start date changed to:", date);
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    console.log("End date changed to:", date);
    setEndDate(date);
  };

  // Clear date filters
  const clearDateFilters = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    setStartDate(sevenDaysAgo);
    setEndDate(today);
    setViewMode('days');
  };

  // Handle view mode change
  const handleViewModeChange = (e) => {
    setViewMode(e.target.value);
  };

  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <Mail className="me-2" />
          <span>Email Stats</span>
        </div>
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md={3}>
            <div className="mb-2">
              <label className="form-label">From Date:</label>
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="form-control mx-2"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select Start Date"
              />
            </div>
          </Col>
          <Col md={3}>
            <div className="mb-2">
              <label className="form-label">To Date:</label>
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="form-control mx-2"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select End Date"
              />
            </div>
          </Col>
          <Col md={3}>
            <div className="mb-2">
              <label className="form-label">View Mode:</label>
              <Form.Select 
                value={viewMode} 
                onChange={handleViewModeChange}
                className="form-control"
              >
                <option value="days">Daily</option>
                <option value="weeks">Weekly</option>
                <option value="months">Monthly</option>
              </Form.Select>
            </div>
          </Col>
          <Col md={3} className="d-flex align-items-end mb-2">
            <button 
              className="btn btn-outline-secondary w-100" 
              onClick={clearDateFilters}
            >
              Reset Filters
            </button>
          </Col>
        </Row>

        <div className="text-muted small mb-3">
          <div>
            View mode: {viewMode === 'days' ? 'Daily' : viewMode === 'weeks' ? 'Weekly' : 'Monthly'} | 
            Date range: {startDate ? startDate.toLocaleDateString() : 'All'} to {endDate ? endDate.toLocaleDateString() : 'All'} | 
            Data points: {chartData.length}
          </div>
          {incompleteDataInfo && (
            <div className="mt-1 text-warning">
              <strong>Note:</strong> {incompleteDataInfo}
            </div>
          )}
        </div>
        
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="date" />
            <YAxis 
              yAxisId="left" 
              label={{ value: 'Total Emails', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              label={{ value: 'Phishing Emails', angle: 90, position: 'insideRight' }}
            />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="emails_scanned" 
              stroke="#8884d8" 
              name="Emails Scanned" 
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="phishing_emails" 
              stroke="#82ca9d" 
              name="Phishing Emails" 
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-5">
          No data available for the selected timeframe
        </div>
      )}
      </Card.Body>
    </Card>
  );
};

export default EmailStatsChart;
