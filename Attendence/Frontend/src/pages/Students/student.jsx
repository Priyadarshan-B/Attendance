import React, { useEffect, useState } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import requestApi from "../../components/utils/axios";
import "../Stu_Dashboard/stu_dashboard.css";

import StudentDashboard from "./students";
import noresult from "../../assets/no-results.png";

import Select from "react-select";

function Student({ selectedStudent }) {
  return <AppLayout body={<Body student={selectedStudent} />} />;
}

function Body() {
  const [yearOptions, setYearOptions] = useState([
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
  ]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    const fetchStudentOptions = async () => {
      try {
        const response = await requestApi(
          "GET",
          `/all-students?year=${selectedYear}`
        );
        const students = response.data.map((student) => ({
          value: student.id,
          label: `${student.name}-${student.register_number}`,
          details: student, // Include all student details
        }));
        setStudentOptions(students);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    if (selectedYear) {
      fetchStudentOptions();
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedStudent) {
      const selected = studentOptions.find(
        (option) => option.value === selectedStudent
      );
      setStudentDetails(selected?.details || null);
    } else {
      setStudentDetails(null);
    }
  }, [selectedStudent, studentOptions]);

  return (
    <div>
      <div className="dropdown">
        <div className="label-dropdown">
          <h4>Year</h4>
          <div style={{ flex: "1" }}>
            <Select
              options={yearOptions}
              onChange={(option) => setSelectedYear(option?.value)}
              placeholder="Select Year"
            />
          </div>
        </div>
        <div className="label-dropdown">
          <h4>Student</h4>
          <div style={{ flex: "1" }}>
            <Select
              options={studentOptions}
              onChange={(option) => setSelectedStudent(option?.value)}
              placeholder="Select Student"
              isDisabled={!selectedYear}
              isClearable
            />
          </div>
        </div>
      </div>
      {!selectedStudent ? (
        <div className="no-stu">
          Select a student to view details.
          <img src={noresult} alt="" height="200px" />
        </div>
      ) : !studentDetails ? (
        <div>Loading...</div>
      ) : (
        <StudentDashboard
          id={studentDetails.id}
          roll={studentDetails.register_number}
        />
      )}
    </div>
  );
}

export default Student;
