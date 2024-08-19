import React, { useEffect, useState } from "react";
import AppLayout from "../../../components/applayout/AppLayout";
import "../../../components/applayout/styles.css";
import requestApi from "../../../components/utils/axios";
import Select from "react-select"; 
import Button from "../../../components/Button/Button";
import toast from "react-hot-toast";
import './mapStudent.css'

function MapStudent() {
  return <Body />;
}

function Body() {
  const [roles, setRoles] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    requestApi("GET", "/map-role")
      .then((response) => {
        const formattedRoles = response.data.map((role) => ({
          value: role.id,
          label: role.name,
        }));
        setRoles(formattedRoles);
      })
      .catch((error) => {
        console.error("Error fetching roles:", error);
      });
  }, []);

  useEffect(() => {
    if (selectedYear) {
      requestApi("GET", `/all-students?year=${selectedYear.value}`)
        .then((response) => {
          const formattedStudents = response.data.map((student) => ({
            value: student.id,
            label: `${student.name} - ${student.register_number}`,
          }));
          setStudents(formattedStudents);
        })
        .catch((error) => {
          console.error("Error fetching students:", error);
        });
    }
  }, [selectedYear]); // Dependency on selectedYear

  // Handle form submission
  const handleSubmit = () => {
    const payload = {
      roleId: selectedRole?.value,
      studentIds: selectedStudents.map((student) => student.value),
    };

    requestApi("POST", "/map-role", payload)
      .then((response) => {
        console.log("Mapping successful:", response.data);
        toast.success("Role Mapped successfully!");

        setSelectedRole(null);
        setSelectedStudents([]);
        setSelectedYear(null)
      })
      .catch((error) => {
        console.error("Error in mapping students to role:", error);
        toast.error("Error in mapping students to role");
      });

  };
  
  const yearOptions = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
  ];

  return (
    <div className="map-student-container">
      <h3>Map Students to Other Role</h3>
      <br />
      <div className="form-group">
        <label htmlFor="role-select">Select Role</label>
        <Select
          id="role-select"
          options={roles}
          value={selectedRole}
          onChange={setSelectedRole}
          placeholder="Select Role"
        />
      </div>
      <div className="form-group">
        <label htmlFor="role-select">Select Year</label>
        <Select
          id="role-select"
          options={yearOptions}
          value={selectedYear}
          onChange={setSelectedYear}
          placeholder="Select Year"
        />
      </div>
      <div className="form-group">
        <label htmlFor="students-select">Select Students</label>
        <Select
          id="students-select"
          options={students}
          value={selectedStudents}
          onChange={setSelectedStudents}
          placeholder="Select students"
          isMulti
        />
      </div>
      <Button onClick={handleSubmit} label="Submit" />
    </div>
  );
}

export default MapStudent;
