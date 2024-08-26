import React, { useState } from "react";
import Select from "react-select";
import requestApi from "../../../components/utils/axios";
import Button from "../../../components/Button/Button";
import toast from "react-hot-toast";
import './nip.css';

function Nip() {
    return <Body />;
}

function Body() {
    const [type1Options, setType1Options] = useState([]);
    const [type2Options, setType2Options] = useState([]);
    const [selectedType1Options, setSelectedType1Options] = useState([]);
    const [selectedType2Options, setSelectedType2Options] = useState([]);

    const fetchType1Students = (query) => {
        if (query.length >= 3) {
            requestApi("GET", `/get-type1?search=${query}`)
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
        } else {
            setType1Options([]);
        }
    };

    const fetchType2Students = (query) => {
        if (query.length >= 3) {
            requestApi("GET", `/get-type2?search=${query}`)
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
        } else {
            setType2Options([]);
        }
    };

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
                setSelectedType1Options([]);
                setType1Options([]);
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
                toast.success("Students changed successfully!");
                setSelectedType2Options([]);
                setType2Options([]);
            })
            .catch(error => {
                toast.error("Error changing students..");
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
                    placeholder="Search students..."
                    onInputChange={fetchType1Students}
                    noOptionsMessage={({ inputValue }) => 
                        inputValue.length > 0 
                            ? inputValue.length < 3 
                                ? "Type at least 3 characters to search" 
                                : "No students found" 
                            : "Type to search..."}
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
                    placeholder="Search students..."
                    onInputChange={fetchType2Students}
                    noOptionsMessage={({ inputValue }) => 
                        inputValue.length > 0 
                            ? inputValue.length < 3 
                                ? "Type at least 3 characters to search" 
                                : "No students found" 
                            : "Type to search..."}
                />
                <Button onClick={handleSubmitType2} label="Submit" />
            </div>
        </div>
    );
}

export default Nip;