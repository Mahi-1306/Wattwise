import React, { useEffect, useState } from 'react';
import { Input, Button, Modal, Select, Form } from 'antd';
import { SearchOutlined, UserAddOutlined,DashboardOutlined  } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './adduser.css';

const { Option } = Select;

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
 const navigate = useNavigate();

  const [form] = Form.useForm();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/auth/users");
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    loadUserData();
  }, []);

  const handleAddUser = () => {
    setIsModalOpen(true);
  };

 const handleModalOk = async () => {
  try {
    const values = await form.validateFields();
    await fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    // ✅ Re-fetch users after successful addition
    const response = await fetch("http://localhost:3001/api/auth/users");
    const data = await response.json();
    setUserData(data);

    setIsModalOpen(false);
    form.resetFields();
  } catch (error) {
    console.error('Error adding user:', error);
  }
};


  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const filteredUsers = userData.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="adduser-container">
      {/* Dashboard Icon */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <DashboardOutlined
          style={{ fontSize: "24px", cursor: "pointer", color: "#1890ff" }}
          title="Dashboard"
          onClick={() => navigate('/dashboard')} // Re-navigate to dashboard
        />
      </div>
      <div className="adduser-title">User Management</div>

      <div className="adduser-controls">
        <Input
          className="adduser-search"
          placeholder="Search by username..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type="primary" className="button" icon={<UserAddOutlined />} onClick={handleAddUser}>
          Add User
        </Button>
      </div>

      <div className="adduser-table">
        <table className="table">
          <thead>
            <tr>
              <th><center>SNO</center></th>
              <th><center>Username</center></th>
              <th><center>Role</center></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={index}>
                  <td><center>{index + 1}</center></td>
                  <td><center>{user.username}</center></td>
                  <td><center>{user.role}</center></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>
                  <div className="no-data-ui">
                    <SearchOutlined className="no-data-icon" />
                    <p>No users found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title="Add New User"
        visible={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Add"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Select a role">
              <Option value="ADMIN">ADMIN</Option>
              <Option value="USER">USER</Option>
              <Option value="GUEST">GUEST</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
