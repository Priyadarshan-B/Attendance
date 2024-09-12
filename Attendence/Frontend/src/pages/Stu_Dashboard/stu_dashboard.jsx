import React, { useEffect, useState } from "react";
import StudentDashboard from "../Students/students";
import "./stu_dashboard.css";
import { getDecryptedCookie } from "../../components/utils/encrypt";



function StuDashboard() {
  return (
  <Body />
);
}

function Body() {
  const roll =getDecryptedCookie('roll')
  const id = getDecryptedCookie('id')

  return(
    <div>

      <StudentDashboard 
      id={id}
      roll={roll} />
    </div>
  )
}

export default StuDashboard;
