import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import axios from 'axios';
import { Select, Spin } from 'antd';

const { Option } = Select;

const Dashboard = () => {
  const [groupBy, setGroupBy] = useState('day');
  const todayISO = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayISO);
  const [endDate, setEndDate] = useState(todayISO);
  const [chartData, setChartData] = useState({ labels: [], powerData: [] });
  const [summary, setSummary] = useState({ totalPower: 0, entryCount: 0, usageTimeInHours: 0 });
  const [todayVsYesterday, setTodayVsYesterday] = useState({
    yesterday: { power: 0 },
    today: { power: 0 },
  });
  const [loading, setLoading] = useState(false);
  const maxPercentage = 50000; // Removed unused fullCapacity

  const [appliances, setAppliances] = useState([]);
  const [selectedAppliance, setSelectedAppliance] = useState('');
  const [loadingMachines, setLoadingMachines] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token || ''}`, // Handle missing token
      },
    };
  };

  useEffect(() => {
    const fetchMachines = async () => {
      setLoadingMachines(true);
      try {
        const response = await fetch('http://localhost:3001/machineroute/', getAuthHeaders());
        if (!response.ok) throw new Error('Failed to fetch machines');
        const data = await response.json();
        const machineList = data.map(machine => ({
          id: machine.id,
          machine_name: machine.machine_name,
        }));
        setAppliances(machineList);
      } catch (err) {
        console.error('Machine fetch error:', err);
        setAppliances([]);
      } finally {
        setLoadingMachines(false);
      }
    };
    fetchMachines();
  }, []);

  const formatDateWithTime = (date, start = true) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) throw new Error('Invalid date');
      if (start) d.setHours(0, 0, 0, 0);
      else d.setHours(23, 59, 59, 999);
      return d.toISOString();
    } catch {
      return null; // Return null for invalid dates
    }
  };

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const selectedMachine = appliances.find(a => String(a.id) === selectedAppliance);
      const machineName = selectedMachine?.machine_name || null;

      const params = {
        groupBy,
        ...(startDate && formatDateWithTime(startDate, true) && { startDate: formatDateWithTime(startDate, true) }),
        ...(endDate && formatDateWithTime(endDate, false) && { endDate: formatDateWithTime(endDate, false) }),
        ...(machineName && { machineName }),
      };

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const { data: responseData } = await axios.get('http://localhost:3001/chartroute/data', {
        params,
        ...getAuthHeaders(),
      });

      const labels = responseData.data.map(item => item.period.split('T')[0]);
      const powerData = responseData.data.map(item => parseFloat(item.total) || 0);
      const totalPower = powerData.reduce((sum, val) => sum + val, 0);
      const entryCount = responseData.data.length;
      const usageTimeInHours =
        startDate && endDate && !isNaN(new Date(endDate) - new Date(startDate))
          ? (new Date(endDate) - new Date(startDate)) / 1000 / 3600
          : 0;

      setChartData({ labels, powerData });
      setSummary({ totalPower, entryCount, usageTimeInHours });
    } catch (error) {
      console.error('Error fetching chart data:', error.response?.data || error.message);
      if (error.message === 'No authentication token found') {
        // Optionally redirect to login
        // window.location.href = '/login';
      }
      setChartData({ labels: [], powerData: [] });
      setSummary({ totalPower: 0, entryCount: 0, usageTimeInHours: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayVsYesterday = async () => {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const todayStr = formatDateWithTime(today, true);
      const todayEndStr = formatDateWithTime(today, false);
      const yesterdayStr = formatDateWithTime(yesterday, true);
      const yesterdayEndStr = formatDateWithTime(yesterday, false);

      const selectedMachine = appliances.find(a => String(a.id) === selectedAppliance);
      const machineName = selectedMachine?.machine_name || null;

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const params = {
        groupBy: 'day',
        ...(machineName && { machineName }), // Filter by selected machine
      };

      const [todayRes, yesterdayRes] = await Promise.all([
        axios.get('http://localhost:3001/chartroute/data', {
          params: { ...params, startDate: todayStr, endDate: todayEndStr },
          ...getAuthHeaders(),
        }),
        axios.get('http://localhost:3001/chartroute/data', {
          params: { ...params, startDate: yesterdayStr, endDate: yesterdayEndStr },
          ...getAuthHeaders(),
        }),
      ]);

      const todayEnergy = todayRes.data.data.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
      const yesterdayEnergy = yesterdayRes.data.data.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

      const hoursInDay = 24;
      const todayPower = todayEnergy / hoursInDay;
      const yesterdayPower = yesterdayEnergy / hoursInDay;

      setTodayVsYesterday({
        today: { power: todayPower },
        yesterday: { power: yesterdayPower },
      });
    } catch (error) {
      console.error('Error fetching today vs yesterday data:', error.response?.data || error.message);
      if (error.message === 'No authentication token found') {
        // Optionally redirect to login
        // window.location.href = '/login';
      }
      setTodayVsYesterday({
        today: { power: 0 },
        yesterday: { power: 0 },
      });
    }
  };

  useEffect(() => {
    fetchChartData();
    fetchTodayVsYesterday();
  }, [groupBy, startDate, endDate, selectedAppliance]);

  const handleDateChange = (e, type) => {
    const val = e.target.value;
    if (type === 'start') setStartDate(val);
    else setEndDate(val);
  };

  const handleApplianceChange = (value) => {
    setSelectedAppliance(value || '');
  };

  return (
    <div className="dashboard-container">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="filter-bar">
            <div className="date-filter">
              <label>
                From: <input type="date" value={startDate} onChange={e => handleDateChange(e, 'start')} />
              </label>
              <label>
                To: <input type="date" value={endDate} onChange={e => handleDateChange(e, 'end')} />
              </label>
            </div>

            <div className="range-buttons">
              <button className={groupBy === 'day' ? 'active' : ''} onClick={() => setGroupBy('day')}>
                Daily
              </button>
              <button className={groupBy === 'month' ? 'active' : ''} onClick={() => setGroupBy('month')}>
                Monthly
              </button>
              <button
                className={groupBy === 'year' ? 'active' : ''}
                onClick={() => setGroupBy('year')}
                disabled={!startDate || !endDate}
              >
                Yearly
              </button>
            </div>

            <Select
              className="report-dropdown"
              value={selectedAppliance || undefined} // Ensure placeholder shows when cleared
              onChange={handleApplianceChange}
              placeholder="Select Machine"
              allowClear
              loading={loadingMachines}
              style={{ minWidth: 180 }}
              notFoundContent={loadingMachines ? <Spin size="small" /> : null}
            >
              <Option value="">All Machines</Option>
              {appliances.map(appliance => (
                <Option key={appliance.id} value={String(appliance.id)}>
                  {appliance.machine_name}
                </Option>
              ))}
            </Select>
          </div>

          {chartData.labels.length === 0 ? (
            <div>No data available for the selected period. Please adjust the filters or add machine data.</div>
          ) : (
            <>
              <div className="row first-row">
                <div className="large-card" id="card">
                  <h3 className="card-title">Power Consumption (Bar Chart)</h3>
                  <BarChart
                    xAxis={[{ scaleType: 'band', data: chartData.labels, tickLabelStyle: { fill: '#ffffff' } }]}
                    yAxis={[{ tickLabelStyle: { fill: '#ffffff' } }]}
                    series={[{ data: chartData.powerData, label: 'Power (kWh)', color: '#1976d2' }]}
                    width={400}
                    height={250}
                  />
                </div>

                <div className="large-card" id="card">
                  <h3 className="card-title">Power Over Time (Line Chart)</h3>
                  <LineChart
                    xAxis={[{ scaleType: 'band', data: chartData.labels, tickLabelStyle: { fill: '#ffffff' } }]}
                    yAxis={[{ tickLabelStyle: { fill: '#ffffff' } }]}
                    series={[{ data: chartData.powerData, label: 'Power (kWh)', color: '#0077cc' }]}
                    width={400}
                    height={250}
                  />
                </div>
              </div>

              <div className="row second-row">
                <div className="small-card" id="card">
                  <h3 className="card-title">Usage Meter (Gauge)</h3>
                  <CircularProgressbar
                    value={(summary.totalPower / maxPercentage) * 100}
                    text={`${((summary.totalPower / maxPercentage) * 100).toFixed(1)}%`}
                    styles={buildStyles({
                      textColor: '#fff',
                      pathColor: '#4FD1C5',
                      trailColor: '#2D3748', // dark trail background
                    })}
                  />

                  <div className="usage-label" style={{ color: '#fff', textAlign: 'center', marginTop: '10px' }}>
                    Usage: {((summary.totalPower / maxPercentage) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="small-card" id="card">
                  <h3 className="card-title">Usage Summary</h3>
                  <table className="summary-table">
                    <tbody>
                      <tr>
                        <th className="label">Total Power Usage</th>
                        <td className="value">{summary.totalPower.toFixed(2)} kWh</td>
                      </tr>
                      <tr>
                        <th className="label">Total Usage Time</th>
                        <td className="value">{summary.usageTimeInHours.toFixed(2)} hours</td>
                      </tr>
                      <tr>
                        <th className="label">Sum of Usages</th>
                        <td className="value">{summary.totalPower.toFixed(2)} kWh</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="small-card" id="card">
                  <h3 className="card-title">Today vs Yesterday</h3>
                  <table className="summary-table" id="table2">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Yesterday</th>
                        <th>Today</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th>Average Power</th>
                        <td>{todayVsYesterday.yesterday.power.toFixed(2)} kWh</td>
                        <td>{todayVsYesterday.today.power.toFixed(2)} kWh</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;