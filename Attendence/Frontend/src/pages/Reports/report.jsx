import React, { useState } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import '../../components/applayout/styles.css';
import * as XLSX from 'xlsx';
import requestApi from "../../components/utils/axios";
import Select from 'react-select';
import Button from "../../components/Button/Button";
import './report.css'


function AbReport() {
    return <AppLayout body={<Body />} />;
}

function Body() {
    const [year, setYear] = useState('All');

    const handleDownload = async () => {
        try {
            const response = await requestApi("GET",`/ab-report?year=${year}`);
            const data = response.data; 

            const worksheet = XLSX.utils.json_to_sheet(data);

            const workbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(workbook, worksheet, "Absent Report");

            const currentDate = new Date().toISOString().split('T')[0];

            const fileName = `student - ${year} - ${currentDate}.xlsx`;
            XLSX.writeFile(workbook, fileName);
        } catch (error) {
            console.error("Error downloading the Excel file", error);
        }
    };
    const yearOptions = [
        { value: 'All', label: 'All' },
        { value: 'I', label: 'I' },
        { value: 'II', label: 'II' },
        { value: 'III', label: 'III' },
        { value: 'IV', label: 'IV' }
    ];

    return (
        <div className="report-flex">
            <div className="absentReport" style={{flex:'1'}}>
                <h3>Absentee Report (today)  </h3>
                <br />
                <div>
                    <Select
                        value={year}
                        onChange={setYear}
                        options={yearOptions}
                        placeholder='Select Year..'
                        isClearable
                    />
                    <Button
                    onClick={handleDownload}
                    label='Download'
                    />
                </div>
            </div>
            <div className="presentReport" style={{flex:'1'}}>
            <h3>Present Report (today)  </h3>
            <br />
            <div>
                <Select
                    value={year}
                    onChange={setYear}
                    options={yearOptions}
                    placeholder='Select Year..'
                    isClearable
                />
                <Button
                onClick={handleDownload}
                label='Download'
                />
            </div>
                </div>
        </div>
    );
}

export default AbReport;
