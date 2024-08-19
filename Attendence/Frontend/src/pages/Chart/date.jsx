import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import requestApi from "../../components/utils/axios";
import moment from "moment";

const Chart = () => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        height: 350,
        type: "bar",
      },
      plotOptions: {
        bar: {
          borderRadius: 5,
          dataLabels: {
            position: "top", // top, center, bottom
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val;
        },
        offsetY: -20,
        style: {
          fontSize: "12px",
          colors: ["#304758"],
        },
      },
      xaxis: {
        categories: [],
        position: "top",
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
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
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
          formatter: function (val) {
            return val;
          },
        },
      },
      title: {
        text: "Attendance by Date (past 7 days)",
        floating: true,
        offsetY: 330,
        align: "center",
        style: {
          color: "#444",
        },
      },
    },
  });

  useEffect(() => {
    // Fetch data from API
    requestApi("GET","/dashboard").then((response) => {
      const { attendanceByDate } = response.data;

      // Parse data for chart
      const xaxisLabels = attendanceByDate.map((entry) =>
        moment(entry.attendanceDate).format("Do MMM")
      );
      const yaxisCounts = attendanceByDate.map((entry) => entry.attendanceCount);

      // Update chart state
      setChartData({
        ...chartData,
        series: [{ name: "Attendance", data: yaxisCounts }],
        options: {
          ...chartData.options,
          xaxis: {
            ...chartData.options.xaxis,
            categories: xaxisLabels,
          },
        },
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

export default Chart;
