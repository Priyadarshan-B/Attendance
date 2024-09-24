import React from "react";
import AbsentReport from "./AbsentReport";
import PresentReport from "./PresentReport";
import StudentReport from "./StudentReport";
import AbsentSlotReport from "./AbsentSlotReport";
import PresentSlotReport from "./PresentSlotReport";
import ConsolidateReport from "./ConsolidateReport";
import "./report.css";

function ReportPage() {
  return (
    <div className="report-container">
      <h2>Summary</h2>
      <div className="report-flex">
        <AbsentReport />
        <PresentReport />
        <StudentReport />
        <AbsentSlotReport />
        <PresentSlotReport />
        <ConsolidateReport />
      </div>
    </div>
  );
}

export default ReportPage;
