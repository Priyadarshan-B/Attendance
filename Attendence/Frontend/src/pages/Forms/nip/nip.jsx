import React, { useState, useEffect } from "react";
import Select from "react-select";
import AppLayout from "../../../components/applayout/AppLayout";
import '../../../components/applayout/styles.css'
import requestApi from "../../../components/utils/axios";
import Button from "../../../components/Button/Button";
import toast from "react-hot-toast";
import './nip.css';

function Nip() {
    return <Body />;
}

function Body() {
    const [type1Options, setType1Options] = useState([]); // Separate state for Type 1 options
    const [type2Options, setType2Options] = useState([]); // Separate state for Type 2 options
    const [selectedType1Options, setSelectedType1Options] = useState([]); // Selected options for Type 1
    const [selectedType2Options, setSelectedType2Options] = useState([]); // Selected options for Type 2

    // Fetch Type 1 Students
    const fetchType1Students = () => {
        requestApi("GET", '/get-type1')
            .then(response => {
                const data = response.data.map(item => ({
                    value: item.id,
                    label: `${item.name} - ${item.register_number}`
                }));
                setType1Options(data);
            })
            .catch(error => {
                console.error("Error fetching Type 1 students", error);
            });
    };

    // Fetch Type 2 Students
    const fetchType2Students = () => {
        requestApi("GET", '/get-type2')
            .then(response => {
                const data = response.data.map(item => ({
                    value: item.id,
                    label: `${item.name} - ${item.register_number}`
                }));
                setType2Options(data);
            })
            .catch(error => {
                console.error("Error fetching Type 2 students", error);
            });
    };

    useEffect(() => {
        fetchType1Students();
        fetchType2Students();
    }, []);

    const handleType1Change = selected => {
        setSelectedType1Options(selected);
    };

    const handleType2Change = selected => {
        setSelectedType2Options(selected);
    };

    const handleSubmitType1 = () => {
        const ids = selectedType1Options.map(option => option.value);
        requestApi("PUT", '/change-type2', ids)
            .then(response => {
                toast.success("Students changed to Type 2 successfully!");
                fetchType1Students();
                fetchType2Students();
                setSelectedType1Options([]); // Reset selected options after submission
            })
            .catch(error => {
                toast.error("Error changing students to Type 2.");
                console.error("Error submitting data", error);
            });
    };

    const handleSubmitType2 = () => {
        const ids = selectedType2Options.map(option => option.value);
        requestApi("PUT", '/change-type1', ids)
            .then(response => {
                toast.success("Students changed to Type 1 successfully!");
                fetchType1Students();
                fetchType2Students();
                setSelectedType2Options([]); // Reset selected options after submission
            })
            .catch(error => {
                toast.error("Error changing students to Type 1.");
                console.error("Error submitting data", error);
            });
    };

    return (
        <div className="nip-form">
            <div className="nip">
                <h3>Change the Student to NIP / Re-Appear</h3>
                <Select
                    isMulti
                    options={type1Options}
                    onChange={handleType1Change}
                    value={selectedType1Options}
                    placeholder="Select students..."
                />
                <Button onClick={handleSubmitType1} label="Submit" />
            </div>
            <br />
            <div className="nip">
                <h3>NIP/Re-Appear to Academics</h3>
                <Select
                    isMulti
                    options={type2Options}
                    onChange={handleType2Change}
                    value={selectedType2Options}
                    placeholder="Select students..."
                />
                <Button onClick={handleSubmitType2} label="Submit" />
            </div>
        </div>
    );
}

export default Nip;
