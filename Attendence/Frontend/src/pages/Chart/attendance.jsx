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
        labels: {
          style: {
            colors: 'var(--text)',
          },
        },
      },
      yaxis: {
        min: 0,
        max: 10,
        labels: {
          style: {
            colors: 'var(--text)',
          },
        },
      },
      fill: {
        opacity: 0.3,
        colors: ['#008000', '#ff0000'],
      },
      tooltip: {
        theme: 'dark',
        style: {
          fontSize: '12px',
          backgroundColor: 'var(--background-2)',
          color: 'var(--text)',
          borderRadius: 8,
        },
        y: {
          formatter: function (val) {
            return val + " students";
          },
        },
      },
      legend: {
        labels: {
          colors: 'var(--text)',
        },
      },
    },
  });

  const [noData, setNoData] = useState(false);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await requestApi("GET", `/mdashboard?mentor=${mentorId}`);
        const attendanceSummary = response.data.attendance_summary;

        if (attendanceSummary.length === 0) {
          setNoData(true);
          return;
        } else {
          setNoData(false); 
        }

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
        setNoData(true); // Handle error case by showing no data
      }
    };

    fetchAttendanceData();
  }, [mentorId]);

  return (
    <div>
      <div style={{display:'flex', justifyContent:'center', alignContent:'center', alignItems:'center', gap:'10px'}}>
        <h3>Attendance Summary (last 10 days)</h3>
      </div>
      {noData ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h4>No Data Available</h4>
        </div>
      ) : (
        <ReactApexChart options={chartData.options} height={400} series={chartData.series} type="line" />
      )}
    </div>
  );
};

export default AttendanceChart;
