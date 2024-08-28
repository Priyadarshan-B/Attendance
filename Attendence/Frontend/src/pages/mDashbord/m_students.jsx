import React, { useState, useEffect } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import Select from "react-select";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import requestApi from "../../components/utils/axios";
import StudentDashboard from "../Students/students";

function MStudent() {
  return <AppLayout body={<Body />} />;
}

function Body() {
  const deid = Cookies.get("id");
  const secretKey = "secretKey123";
  const id = CryptoJS.AES.decrypt(deid, secretKey).toString(CryptoJS.enc.Utf8);

  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await requestApi("GET", `/mentor-students?mentor=${id}`);
        const options = response.data.map((student) => ({
          value: student.id,
          label: `${student.name}-${student.register_number}`,
          registerNumber: student.register_number,  
        }));
        setStudentOptions(options);
      } catch (err) {
        console.error("Error fetching students", err);
      }
    };

    fetchStudents();
  }, [id]);

  const handleSelectChange = (selectedOption) => {
    setSelectedStudent(selectedOption);
  };

  return (
    <div>
      <Select
        options={studentOptions}
        onChange={handleSelectChange}
        placeholder="Select a student"
        isClearable
      />
      <br />
      {selectedStudent && (
      <div>
          <h3>Student Details - {selectedStudent.registerNumber} </h3> <br />
            <StudentDashboard
              id={selectedStudent.value}
              roll={selectedStudent.registerNumber}
            />
      </div>
      )}
    </div>
  );
}

export default MStudent;
