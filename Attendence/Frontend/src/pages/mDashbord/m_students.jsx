import React, { useState, useEffect } from "react";
import "../../components/applayout/styles.css";
import Select from "react-select";
import requestApi from "../../components/utils/axios";
import StudentDashboard from "../Students/students";
import noresult from "../../assets/no-results.png";
import customStyles from "../../components/applayout/selectTheme";
import { getDecryptedCookie } from "../../components/utils/encrypt";

function MStudent() {
  return <Body />;
}

function Body() {
  const id = getDecryptedCookie("id");

  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await requestApi(
          "GET",
          `/mentor-students?mentor=${id}`
        );
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
      {/* <h3>Student Details</h3><br /> */}
      <div
        style={{
          width: "350px",
        }}
      >
        <Select
          options={studentOptions}
          onChange={handleSelectChange}
          placeholder="Select a student"
          styles={customStyles}
          isClearable
        />
      </div>
      <br />
      {!selectedStudent && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "50vh",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img src={noresult} alt="No Result" width="10%" />
          <h4>Select Students to view Details..</h4>
        </div>
      )}

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
