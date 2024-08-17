import React, { useEffect, useState } from "react";
import AppLayout from "../../../components/applayout/AppLayout";
import "../../../components/applayout/styles.css";
import requestApi from "../../../components/utils/axios";
import Select from "react-select";  // React Select for dropdowns
import Button from "../../../components/Button/Button";
import './mapStudent.css'
function MapStudent() {
  return <Body/>
}

function Body() {
  const [roles, setRoles] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Fetch roles for single select dropdown
  useEffect(() => {
    requestApi
      ("GET","/map-role")
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

  // Fetch students for multi-select dropdown
  useEffect(() => {
    requestApi
      ("GET","/get-type2")
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
  }, []);

  // Handle form submission
  const handleSubmit = () => {
    const payload = {
      roleId: selectedRole?.value,
      studentIds: selectedStudents.map((student) => student.value),
    };

    requestApi
      ("POST","/map-role", payload)
      .then((response) => {
        console.log("Mapping successful:", response.data);
        // Handle success (e.g., show a notification or reset the form)
      })
      .catch((error) => {
        console.error("Error in mapping students to role:", error);
        // Handle error (e.g., show an error message)
      });
  };

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
          placeholder="Select "
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
      <Button  onClick={handleSubmit}
        label='Submit'
      />
    </div>
  );
}

export default MapStudent;
