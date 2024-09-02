import React, { useEffect, useState } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import StudentDashboard from "../Students/students";
import "./stu_dashboard.css";


function StuDashboard({ id }) {
  return <AppLayout rId={2} body={<Body id={id} />} />;
}

function Body() {
  const deroll = Cookies.get("roll");
  const deid = Cookies.get("id");
  const secretKey = "secretKey123";
  const roll = CryptoJS.AES.decrypt(deroll, secretKey).toString(
    CryptoJS.enc.Utf8
  );
  const id = CryptoJS.AES.decrypt(deid, secretKey).toString(CryptoJS.enc.Utf8);

  return(
    <div>

      <StudentDashboard 
      id={id}
      roll={roll} />
    </div>
  )
}

export default StuDashboard;
