import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import requestApi from "../../components/utils/axios";

const AttendanceChart = ({ mentorId }) => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: '55%',
          endingShape: 'rounded'
        },
      },
      dataLabels: {
        enabled: false,
        style: {
            colors: ['#a9f2a4', '#f0b5b5']
          }
      },
      colors:['#a9f2a4', '#f0b5b5'],
      markers: {
        colors: ['#a9f2a4', '#f0b5b5']
     },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: [],
      },
      yaxis: {
        title: {
          text: 'Number of Students'
        }
      },
      fill: {
        opacity: 1,
        colors: ['#a9f2a4', '#f0b5b5']
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " students"
          }
        }
      }
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
              name: 'Present',
              data: presentCounts
            },
            {
              name: 'Absent',
              data: absentCounts
            }
          ],
          options: {
            ...prevState.options,
            xaxis: {
              ...prevState.options.xaxis,
              categories: dates
            }
          }
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
      <ReactApexChart options={chartData.options} series={chartData.series} type="bar" height={350} />
    </div>
  );
};

export default AttendanceChart;