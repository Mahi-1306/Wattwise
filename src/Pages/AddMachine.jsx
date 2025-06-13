import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Switch, message } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "./addmachine.css";
import { jwtDecode } from "jwt-decode";

const AddMachine = () => {
  const [machines, setMachines] = useState([]);
  const [name, setName] = useState("");
  const [editMachine, setEditMachine] = useState(null);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCardView, setIsCardView] = useState(false);

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:3001/machineroute", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setMachines(response.data);
    } catch (error) {
      message.error("Error loading machines");
    }
  };

  const handleSave = async () => {
    if (name.trim() === "") return;

    const token = localStorage.getItem("token");
    const payload = jwtDecode(token);

    const newMachine = {
      machine_name: name,
      created_by: payload.userId,
    };

    try {
      const response = await axios.post(
        "http://localhost:3001/machineroute/post",
        newMachine,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMachines([...machines, response.data]);
      setName("");
      setShowAddForm(false);
      message.success("Machine added successfully");
    } catch (error) {
      message.error(error.response?.data?.error || "Failed to add machine");
    }
  };

  const handleEditClick = (machine) => {
    setEditMachine(machine);
    setName(machine.machine_name);
    setIsEditFormVisible(true);
    setShowAddForm(false);
  };

  const handleEditSave = async () => {
    if (!editMachine || name.trim() === "") return;

    const token = localStorage.getItem("token");
    const updatedMachine = {
      machine_name: name,
      status: editMachine.status ?? true,
    };

    try {
      const response = await axios.put(
        `http://localhost:3001/machineroute/put/${editMachine.id}`,
        updatedMachine,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedList = machines.map((m) =>
        m.id === editMachine.id ? { ...m, ...response.data } : m
      );
      setMachines(updatedList);
      setEditMachine(null);
      setName("");
      setIsEditFormVisible(false);
      message.success("Machine updated successfully");
    } catch (error) {
      message.error("Failed to update machine");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this machine?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:3001/machineroute/del/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMachines(machines.filter((m) => m.id !== id));
      message.success("Machine deleted successfully");
    } catch (error) {
      message.error("Failed to delete machine");
    }
  };

  const handleCancel = () => {
    setName("");
    setShowAddForm(false);
    setIsEditFormVisible(false);
    setEditMachine(null);
  };

  const handleViewToggle = () => {
    setIsCardView(!isCardView);
  };

  return (
    <div className="add-machine-container">
      <div className="mach">Machines</div>
      <div className="search-row">
        <div className="search-box">
          <SearchOutlined className="search-icon" />
          <input placeholder="Search.." />
        </div>
        <div className="add-toggle">
          <Button className="add-button" onClick={() => setShowAddForm(true)}>
            Add
          </Button>
          <Switch className="toggle-button" onChange={handleViewToggle} />
        </div>
      </div>

      {showAddForm && (
        <div className="popup-background">
          <div className="form-popup">
            <h2 style={{ color: "black", fontSize: "22px" }}>Add Machine</h2>
            <input
              type="text"
              placeholder="Machine Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="form-buttons">
              <Button onClick={handleCancel} className="cancel">Cancel</Button>
              <Button type="primary" onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {isEditFormVisible && (
        <div className="popup-background-edit">
          <div className="form-popup-edit">
            <h2 style={{ color: "black", fontSize: "22px" }}>Edit Machine</h2>
            <input type="text" value={editMachine?.id} disabled />
            <input
              type="text"
              placeholder="Machine Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="form-buttons-edit">
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" onClick={handleEditSave}>Update</Button>
            </div>
          </div>
        </div>
      )}

      {!isCardView ? (
        <table>
          <thead>
            <tr>
              <th>SNO</th>
              <th>Machine Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((machine, index) => (
              <tr key={machine.id} className="hover-row">
                <td>{index + 1}</td>
                <td>{machine.machine_name}</td>
                <td>{machine.status ? "Active" : "Inactive"}</td>
                <td className="action-buttons">
                  <Button type="text" icon={<EditOutlined />} onClick={() => handleEditClick(machine)} />
                  <Button type="text" icon={<DeleteOutlined />} onClick={() => handleDelete(machine.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="cards-container">
          {machines.map((machine) => (
            <div key={machine.id} className="card">
              <h3>{machine.machine_name}</h3>
              <hr />
              <p>Status: {machine.status ? "Active" : "Inactive"}</p>
              <div className="action-buttons-card">
                <Button className="edit" onClick={() => handleEditClick(machine)}>Edit</Button>
                <Button className="delete" onClick={() => handleDelete(machine.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddMachine;
