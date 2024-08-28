import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import requestApi from "../../components/utils/axios";

const AttendanceChart = ({ mentorId }) => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: 'line',
        height: 350,
      },
      dataLabels: {
        enabled: false,
        style: {
          colors: ['#008000', '#ff0000'],
        },
      },
      colors: ['#008000', '#ff0000'], 
      stroke: {
        curve: 'smooth',
        width: 5,
        colors: ['#008000', '#ff0000'],
      },
      markers: {
        size: 5, 
        colors: ['#008000', '#ff0000'],
        hover: {
          size: 7, 
        },
      },
      xaxis: {
        categories: [],
        
      },
      yaxis:{
        min:0,
        max:+10,
        
      },
      fill: {
        opacity: 0.3, 
        colors: ['#008000', '#ff0000'],
      },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '12px',
          backgroundColor: '#fff',
          color: '#0000',
          borderRadius: 8,
        },
        y: {
          formatter: function (val) {
            return val + " students";
          },
        },
      },
    },
  });

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await requestApi("GET", `/mdashboard?mentor=${mentorId}`);
        const attendanceSummary = response.data.attendance_summary;

        const dates = attendanceSummary.map(item => moment(item.date).format('MMM DD'));
        const presentCounts = attendanceSummary.map(item => item.present_count);
        const absentCounts = attendanceSummary.map(item => item.absent_count);

        setChartData(prevState => ({
          ...prevState,
          series: [
            {
              name: 'Attendees',
              data: presentCounts,
            },
            {
              name: 'Absentees',
              data: absentCounts,
            },
          ],
          options: {
            ...prevState.options,
            xaxis: {
              ...prevState.options.xaxis,
              categories: dates,
            },
          },
        }));
      } catch (err) {
        console.error("Error fetching attendance data", err);
      }
    };

    fetchAttendanceData();
  }, [mentorId]);

  return (
    <div>
      <h2>Attendance Summary</h2>
      <ReactApexChart options={chartData.options} series={chartData.series} type="line" height={350} />
    </div>
  );
};

export default AttendanceChart;
