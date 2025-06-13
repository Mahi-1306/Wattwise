// import React, { useEffect, useState } from 'react';
// import { Input, Select, DatePicker, Space, Spin } from 'antd';
// import { SearchOutlined } from '@ant-design/icons';
// import dayjs from 'dayjs';
// import './report.css';

// const { Option } = Select;

// const Report = () => {
//   const [appliances, setAppliances] = useState([]);
//   const [selectedAppliance, setSelectedAppliance] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [tableData, setTableData] = useState([]);
//   const [fromDate, setFromDate] = useState(null);
//   const [toDate, setToDate] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingMachines, setLoadingMachines] = useState(false);

//   const getAuthHeaders = () => {
//     const token = localStorage.getItem("token");
//     console.log(token);
//     return {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     };
//   };

//   useEffect(() => {
//     const fetchMachines = async () => {
//       setLoadingMachines(true);
//       try {
//         const response = await fetch('http://localhost:3001/machineroute/', getAuthHeaders());
//         if (!response.ok) throw new Error('Failed to fetch machines');
//         const data = await response.json();

//         const machineList = data.map(machine => ({
//           id: machine.id,
//           machine_name: machine.machine_name,
//         }));

//         setAppliances(machineList);
//         setError(null);
//       } catch (err) {
//         console.error('Machine fetch error:', err);
//         setError('Could not load machine list.');
//         setAppliances([]);
//       } finally {
//         setLoadingMachines(false);
//       }
//     };

//     fetchMachines();
//   }, []);

//   const handleApplianceChange = (value) => {
//     setSelectedAppliance(value || '');
//   };

//   useEffect(() => {
//     const fetchTableData = async () => {
//       setLoading(true);
//       try {
//         const selectedMachine = appliances.find(
//           (a) => String(a.id) === selectedAppliance
//         );
//         const machineName = selectedMachine?.machine_name;
//         const queryParams = new URLSearchParams();

//         if (fromDate)
//           queryParams.append('startDate', dayjs(fromDate).format('YYYY-MM-DD'));
//         if (toDate)
//           queryParams.append('endDate', dayjs(toDate).format('YYYY-MM-DD'));

//         let url = '';

//         if (searchQuery) {
//           url = `http://localhost:3001/machinedataroute/getbyname/${encodeURIComponent(searchQuery)}`;
//         } else if (selectedAppliance && machineName) {
//           if (fromDate || toDate) {
//             url = 'http://localhost:3001/machinedataroute/bydate';
//             queryParams.append('machineName', machineName);
//           } else {
//             url = `http://localhost:3001/machinedataroute/getbyname/${encodeURIComponent(machineName)}`;
//           }
//         } else {
//           url = fromDate || toDate
//             ? 'http://localhost:3001/machinedataroute/bydate'
//             : 'http://localhost:3001/machinedataroute/';
//         }

//         const fullUrl = queryParams.toString()
//           ? `${url}?${queryParams.toString()}`
//           : url;

//         const headers = getAuthHeaders();

//         const response = await fetch(fullUrl, {
//           method: 'GET',
//           ...headers, 
//         });

//         if (!response.ok) throw new Error(`HTTP ${response.status}`);
//         const data = await response.json();
//         setTableData(data);
//         setError(null);
//       } catch (err) {
//         console.error('Report data fetch error:', err);
//         setTableData([]);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTableData();
//   }, [searchQuery, selectedAppliance, fromDate, toDate, appliances]);

//   return (
//     <div className="report-container">
//       <div className="Rep">Reports</div>

//       {error && <p className="error-message">{error}</p>}

//       <div className="report-controls">
//         <Input
//           className="report-search"
//           placeholder="Search machines..."
//           prefix={<SearchOutlined />}
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           allowClear
//         />

//         <Space className="input-date" size="middle">
//           <label>
//             From:{' '}
//             <DatePicker
//               value={fromDate ? dayjs(fromDate) : null}
//               onChange={(date) => setFromDate(date ? date.toDate() : null)}
//               allowClear
//             />
//           </label>
//           <label>
//             To:{' '}
//             <DatePicker
//               value={toDate ? dayjs(toDate) : null}
//               onChange={(date) => setToDate(date ? date.toDate() : null)}
//               allowClear
//             />
//           </label>
//         </Space>

//         <Select
//           className="report-dropdown"
//           value={selectedAppliance}
//           onChange={handleApplianceChange}
//           placeholder="Select Machine"
//           allowClear
//           loading={loadingMachines}
//           style={{ minWidth: 180 }}
//           notFoundContent={loadingMachines ? <Spin size="small" /> : null}
//         >
//           <Option value="">All Machines</Option>
//           {appliances.map((appliance) => (
//             <Option key={appliance.id} value={String(appliance.id)}>
//               {appliance.machine_name}
//             </Option>
//           ))}
//         </Select>
//       </div>

//       <div className="report-table">
//         {loading ? (
//           <div className="loading-indicator">
//             <Spin tip="Loading data..." />
//           </div>
//         ) : (
//           <table className="table">
//             <thead>
//               <tr>
//                 <th>SNO</th>
//                 <th>Machine Name</th>
//                 <th>Data (KW)</th>
//                 <th>Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {tableData.length > 0 ? (
//                 tableData.map((item, index) => (
//                   <tr key={item.id || index}>
//                     <td>{index + 1}</td>
//                     <td>{item.machine?.machine_name || item.machine_name || 'Unknown'}</td>
//                     <td>{item.data ?? 'N/A'}</td>
//                     <td>
//                       {item.date
//                         ? dayjs(item.date).format('YYYY-MM-DD HH:mm:ss')
//                         : 'N/A'}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={4} className="no-data-cell">
//                     <div className="no-data-ui">
//                       <SearchOutlined className="no-data-icon" />
//                       <p>No data found for the selected filters.</p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Report;





import React, { useEffect, useState } from 'react';
import { Input, Select, DatePicker, Space, Spin, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './report.css';

const { Option } = Select;

const Report = () => {
  const [appliances, setAppliances] = useState([]);
  const [selectedAppliance, setSelectedAppliance] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tableData, setTableData] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMachines, setLoadingMachines] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || ''}`,
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
        setError(null);
      } catch (err) {
        console.error('Machine fetch error:', err);
        setError('Could not load machine list.');
        setAppliances([]);
      } finally {
        setLoadingMachines(false);
      }
    };

    fetchMachines();
  }, []);

  const handleApplianceChange = (value) => {
    setSelectedAppliance(value || '');
    setCurrentPage(1); // Reset to first page when appliance changes
  };

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1); // Reset to first page if page size changes
    }
  };

  useEffect(() => {
    const fetchTableData = async () => {
      setLoading(true);
      try {
        const selectedMachine = appliances.find(
          (a) => String(a.id) === selectedAppliance
        );
        const machineName = selectedMachine?.machine_name;
        const queryParams = new URLSearchParams();

        if (fromDate)
          queryParams.append('startDate', dayjs(fromDate).format('YYYY-MM-DD'));
        if (toDate)
          queryParams.append('endDate', dayjs(toDate).format('YYYY-MM-DD'));
        queryParams.append('limit', pageSize);
        queryParams.append('offset', (currentPage - 1) * pageSize);

        let url = '';

        if (searchQuery) {
          url = `http://localhost:3001/machinedataroute/getbyname/${encodeURIComponent(searchQuery)}`;
        } else if (selectedAppliance && machineName) {
          if (fromDate || toDate) {
            url = 'http://localhost:3001/machinedataroute/bydate';
            queryParams.append('machineName', machineName);
          } else {
            url = `http://localhost:3001/machinedataroute/getbyname/${encodeURIComponent(machineName)}`;
          }
        } else {
          url = fromDate || toDate
            ? 'http://localhost:3001/machinedataroute/bydate'
            : 'http://localhost:3001/machinedataroute/';
        }

        const fullUrl = queryParams.toString()
          ? `${url}?${queryParams.toString()}`
          : url;

        const response = await fetch(fullUrl, getAuthHeaders());
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // Assume backend returns { data: [], total: number } for paginated endpoints
        setTableData(data.data || data);
        setTotalItems(data.total || data.length || 0);
        setError(null);
      } catch (err) {
        console.error('Report data fetch error:', err);
        setTableData([]);
        setTotalItems(0);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, [searchQuery, selectedAppliance, fromDate, toDate, appliances, currentPage, pageSize]);

  return (
    <div className="report-container">
      <div className="Rep">Reports</div>

      {error && <p className="error-message">{error}</p>}

      <div className="report-controls">
        <Input
          className="report-search"
          placeholder="Search machines..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          allowClear
        />

        <Space className="input-date" size="middle">
          <label>
            From:{' '}
            <DatePicker
              value={fromDate ? dayjs(fromDate) : null}
              onChange={(date) => {
                setFromDate(date ? date.toDate() : null);
                setCurrentPage(1); // Reset to first page on date change
              }}
              allowClear
            />
          </label>
          <label>
            To:{' '}
            <DatePicker
              value={toDate ? dayjs(toDate) : null}
              onChange={(date) => {
                setToDate(date ? date.toDate() : null);
                setCurrentPage(1); // Reset to first page on date change
              }}
              allowClear
            />
          </label>
        </Space>

        <Select
          className="report-dropdown"
          value={selectedAppliance || undefined}
          onChange={handleApplianceChange}
          placeholder="Select Machine"
          allowClear
          loading={loadingMachines}
          style={{ minWidth: 180 }}
          notFoundContent={loadingMachines ? <Spin size="small" /> : null}
        >
          <Option value="">All Machines</Option>
          {appliances.map((appliance) => (
            <Option key={appliance.id} value={String(appliance.id)}>
              {appliance.machine_name}
            </Option>
          ))}
        </Select>
      </div>

      <div className="report-table">
        {loading ? (
          <div className="loading-indicator">
            <Spin tip="Loading data..." />
          </div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>SNO</th>
                  <th>Machine Name</th>
                  <th>Data (KW)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{(currentPage - 1) * pageSize + index + 1}</td>
                      <td>{item.machine?.machine_name || item.machine_name || 'Unknown'}</td>
                      <td>{item.data ?? 'N/A'}</td>
                      <td>
                        {item.date
                          ? dayjs(item.date).format('YYYY-MM-DD HH:mm:ss')
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="no-data-cell">
                      <div className="no-data-ui">
                        <SearchOutlined className="no-data-icon" />
                        <p>No data found for the selected filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalItems}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['10', '20', '50']}
              style={{ marginTop: '16px', textAlign: 'right' }}
              showTotal={(total) => `Total ${total} items`}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Report;
