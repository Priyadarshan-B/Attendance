import React, { useEffect, useState } from 'react';
import './attProgress.css';
import requestApi from '../utils/axios';
import approve from '../../assets/approve.png';
import decline from '../../assets/decline.png';

const TableLayout = ({ studentId, date, year }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await requestApi("GET", '/time-slots');
        setTimeSlots(response.data);
      } catch (error) {
        console.error('Error fetching time slots:', error);
      }
    };

    const fetchAttendance = async () => {
      try {
        const response = await requestApi("GET", '/att-progress', {
          student: studentId,
          date:date,
          year:year
        });
        setAttendanceData(response.data);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    fetchTimeSlots();
    fetchAttendance();
  }, [studentId, date, year]);

  const isAfternoon = (time) => {
    return time >= '12:00:00'; // Afternoon starts at 12:00 PM
  };

  const fnSlots = timeSlots.filter(slot => !isAfternoon(slot.start_time));
  const anSlots = timeSlots.filter(slot => isAfternoon(slot.start_time));

  const columnLabels = [...fnSlots, ...anSlots].map((_, index) => {
    return ["I", "II", "III", "IV", "V", "VI"][index % 6];
  });

  const renderAttendanceStatus = (slotId) => {
    const slotData = attendanceData.find(slot => slot.slot_id === slotId);
    if (!slotData) return null;
    return slotData.is_present === 1 ? <img src={approve} alt="Present" /> : <img src={decline} alt="Absent" />;
  };

  return (
    <div className="container1">
      <table>
        <thead>
          <tr>
            <th colSpan={fnSlots.length} className="header">FN</th>
            <th colSpan={anSlots.length} className="header">AN</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {columnLabels.map((label, index) => (
              <td key={index}>{label}</td>
            ))}
          </tr>
          <tr>
            {fnSlots.map(slot => (
              <td key={slot.id}>{renderAttendanceStatus(slot.id)}</td>
            ))}
            {anSlots.map(slot => (
              <td key={slot.id}>{renderAttendanceStatus(slot.id)}</td>
            ))}
          </tr>
          <tr>
            <td colSpan={fnSlots.length} className="footer">FN</td>
            <td colSpan={anSlots.length} className="footer">AN</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TableLayout;
