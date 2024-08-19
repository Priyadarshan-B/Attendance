import React from "react";
import AppLayout from "../../components/applayout/AppLayout";
import '../../components/applayout/styles.css'
import requestApi from "../../components/utils/axios";
import Chart from "../Chart/date";
import Present from "../Chart/present";

import './admin_dashboard.css'

function AdminDashboard(){
  return <AppLayout  body={<Body />} />;

}

function Body(){
return(
    
    <div>
        <h3>Admin Dashboard</h3>
        <div className="charts">
            <div className="chart">
                <Chart/>
            </div>
            <div className="present">
                <Present/>
            </div>
        </div>
    </div>
)

}
export default AdminDashboard