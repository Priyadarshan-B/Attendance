import React from "react";
import AbsentReport from "./AbsentReport";
import PresentReport from "./PresentReport";
import StudentReport from "./StudentReport";
import AbsentSlotReport from "./AbsentSlotReport";
import PresentSlotReport from "./PresentSlotReport";
import ConsolidateReport from "./ConsolidateReport";
import WithOutSlots from "./with_andwithout_slots";
import ExcelBio from "./insertExcel";
import "./report.css";

function ReportPage() {
  return (
    <div className="report-container">
      <h2>Summary</h2>
      <div className="report-flex">
        <AbsentReport />
        <PresentReport />
        <AbsentSlotReport />
        <PresentSlotReport />
        <StudentReport />
        <ConsolidateReport />
        <WithOutSlots/>
        <br />
      </div>
      <br />
      <ExcelBio/>
    </div>
  );
}

export default ReportPage;
