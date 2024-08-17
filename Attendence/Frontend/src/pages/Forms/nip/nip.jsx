import React, { useState, useEffect } from "react";
import Select from "react-select";
import AppLayout from "../../../components/applayout/AppLayout";
import '../../../components/applayout/styles.css'
import requestApi from "../../../components/utils/axios";
import Button from "../../../components/Button/Button";
import './nip.css'

function Nip() {
    return <Body/>
}

function Body() {
    const [options, setOptions] = useState([]);
    const [option, setOption] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState([]);

    useEffect(() => {
        requestApi("GET", '/get-type1')
            .then(response => {
                const data = response.data.map(item => ({
                    value: item.id,
                    label: `${item.name} - ${item.register_number}`
                }));
                setOptions(data);
            })
            .catch(error => {
                console.error("Error fetching data", error);
            });
    }, []);

    const handleChange = selected => {
        setSelectedOptions(selected);
    };

    const handleSubmit = () => {
        const ids = selectedOptions.map(option => option.value);
        console.log("Data to be sent to /change-type2:", ids);
        requestApi("PUT", '/change-type2', ids)
            .then(response => {
                console.log("Data submitted successfully", response.data);
            })
            .catch(error => {
                console.error("Error submitting data", error);
            });
    };

    useEffect(() => {
        requestApi("GET", '/get-type2')
            .then(response => {
                const data = response.data.map(item => ({
                    value: item.id,
                    label: `${item.name} - ${item.register_number}`
                }));
                setOption(data);
            })
            .catch(error => {
                console.error("Error fetching data", error);
            });
    }, []);

    const handleChangetype = selected => {
        setSelectedOption(selected);
    };

    const handleSubmittype = () => {
        const ids = selectedOption.map(option => option.value);
        console.log("Data to be sent to /change-type1:", ids);
        requestApi("PUT", '/change-type1', ids)
            .then(response => {
                console.log("Data submitted successfully", response.data);
            })
            .catch(error => {
                console.error("Error submitting data", error);
            });
    };

    return (
        <div className="nip-form">
            <div className="nip">
                <h3>Change the Student to NIP / Re-Appear</h3>
                <Select
                    isMulti
                    options={options}
                    onChange={handleChange}
                    placeholder="Select students..."
                />
                <Button onClick={handleSubmit} label = 'Submit'/>
            </div>
            <br />
            <div className="nip">
                <h3>Change the Student from NIP</h3>
                <Select
                    isMulti
                    options={option}
                    onChange={handleChangetype}
                    placeholder="Select students..."
                />
                <Button onClick={handleChangetype} label = 'Submit'/>
            </div>
        </div>
    );
}

export default Nip;
