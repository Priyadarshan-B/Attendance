import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import requestApi from "../../components/utils/axios";

const Present = () => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        height: 250,
        type: "bar",
      },
      plotOptions: {
        bar: {
          borderRadius: 5,
          horizontal: true,
          dataLabels: {
            position: "bottom",
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val;
        },
        offsetX: 0, 
        style: {
          fontSize: "15px",
          colors: ["#000"],
        },
      },
      xaxis: {
        categories: ["Students Count", "Yesterday's Attendance", "Today's Attendance"], // Labels for the bars
        position: "bottom",
        axisBorder: {
          show: true,
        },
        axisTicks: {
          show: true,
        },
        crosshairs: {
          fill: {
            type: "gradient",
            gradient: {
              colorFrom: "#D8E3F0",
              colorTo: "#BED1E6",
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5,
            },
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      yaxis: {
        labels: {
          show: true,
          formatter: function (val) {
            return val;
          },
        },
      },
      title: {
        text: "Attendance Details",
        floating: false,
        offsetY: 0,
        align: "center",
        style: {
          color: "#444",
        },
      },
    },
  });

  useEffect(() => {
    // Fetch data from API
    requestApi("GET", "/dashboard").then((response) => {
      const { students, previousDateCount, todayDateCount } = response.data;

      // Update chart state with the new data
      setChartData({
        ...chartData,
        series: [{ name: "Count", data: [students, previousDateCount, todayDateCount] }],
      });
    });
  }, []);

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="bar"
          height={350}
        />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

export default Present;
