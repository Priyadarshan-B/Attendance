import React, { useEffect, useState } from 'react';
import './attProgress.css';
import requestApi from '../utils/axios';
import approve from '../../assets/approve.png';
import decline from '../../assets/decline.png';
import { styled } from '@mui/material/styles';
import { LinearProgress, Box, linearProgressClasses, Grid, Tooltip } from '@mui/material';
import moment from 'moment';

const TableLayout = ({ studentId, date, year, register_number }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [progressValue1, setProgressValue1] = useState(0);
  const [progressValue2, setProgressValue2] = useState(0);
  const [tooltipTime1, setTooltipTime1] = useState('');
  const [tooltipTime2, setTooltipTime2] = useState('');

  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: theme.palette.grey[200],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: '#1a90ff',
    },
  }));

  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      try {
        const response = await requestApi('GET', `/att-details?student=${register_number}`);
        const attendanceDetails = response.data;
        processAttendanceDetails(attendanceDetails);
      } catch (error) {
        console.error('Error fetching attendance details:', error);
      }
    };

    const processAttendanceDetails = (details) => {
      let progress1 = 0;
      let progress2 = 0;

      details.forEach(detail => {
        const attendanceDateTime = moment(detail.attendence_raw);
        const time = attendanceDateTime.format('HH:mm:ss');

        if (time >= '08:00:00' && time <= '08:45:00') {
          progress1 = 1;
          setTooltipTime1(detail.time); 
        }
        if (time >= '12:00:00' && time <= '14:00:00') {
          progress2 = 1;
          setTooltipTime2(detail.time); 
        }
      });

      setProgressValue1(progress1);
      setProgressValue2(progress2);
    };

    fetchAttendanceDetails();
  }, [register_number]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await requestApi('GET', `/slot-year?year=${year}`);
        setTimeSlots(response.data);
      } catch (error) {
        console.error('Error fetching time slots:', error);
      }
    };

    const fetchAttendance = async () => {
      try {
        const response = await requestApi('GET', `/att-progress?student=${studentId}&date=${date}&year=${year}`);
        setAttendanceData(response.data);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    fetchTimeSlots();
    fetchAttendance();
  }, [studentId, date, year]);

  const isAfternoon = (time) => time >= '12:30:00';

  const fnSlots = timeSlots.filter(slot => !isAfternoon(slot.start_time));
  const anSlots = timeSlots.filter(slot => isAfternoon(slot.start_time));

  const totalSlots = [...fnSlots, ...anSlots];
  const columnLabels = totalSlots.map((_, index) => {
    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return romanNumerals[index % romanNumerals.length];
  });

  const renderAttendanceStatus = (slotId) => {
    const slotData = attendanceData.find(slot => slot.slot_id === slotId);
    if (!slotData) return null;
    return slotData.is_present === 1 ? <img src={approve} alt="Present" height='20px'/> : <img src={decline} alt="Absent" height='20px' />;
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
        </tbody>
      </table>

      <Grid container spacing={2} sx={{ marginTop: '20px' }}>
        <Grid item xs={6}>
          <Tooltip title={`Attendance Time: ${tooltipTime1 || 'No Data'}`}>
            <Box>
              <BorderLinearProgress variant="determinate" value={progressValue1 * 100} />
            </Box>
          </Tooltip>
        </Grid>
        <Grid item xs={6}>
          <Tooltip title={`Attendance Time: ${tooltipTime2 || 'No Data'}`}>
            <Box>
              <BorderLinearProgress variant="determinate" value={progressValue2 * 100} />
            </Box>
          </Tooltip>
        </Grid>
      </Grid>
    </div>
  );
};

export default TableLayout;
