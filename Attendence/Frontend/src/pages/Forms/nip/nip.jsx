import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import AppLayout from "../../../components/applayout/AppLayout";
import '../../../components/applayout/styles.css';
import requestApi from "../../../components/utils/axios";
import Button from "../../../components/Button/Button";
import toast from "react-hot-toast";
import './nip.css';
import debounce from 'lodash/debounce'; 

function Nip() {
    return <Body />;
}

function Body() {
    const [type1Options, setType1Options] = useState([]);
    const [type2Options, setType2Options] = useState([]);
    const [selectedType1Options, setSelectedType1Options] = useState([]);
    const [selectedType2Options, setSelectedType2Options] = useState([]);
    const [searchTermType1, setSearchTermType1] = useState(''); // Search term for Type 1
    const [searchTermType2, setSearchTermType2] = useState(''); // Search term for Type 2

    const fetchType1Students = useCallback(debounce((query) => {
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
    }, 30), []); 
    // Fetch Type 2 Students with search query
    const fetchType2Students = useCallback(debounce((query) => {
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
    }, 30), []); 

    useEffect(() => {
        fetchType1Students(searchTermType1);
        fetchType2Students(searchTermType2);
    }, [searchTermType1, searchTermType2, fetchType1Students, fetchType2Students]);

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
                setSelectedType1Options([]); // Reset selected options after submission
                setSearchTermType1(''); // Clear search term
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
                setSelectedType2Options([]); // Reset selected options after submission
                setSearchTermType2(''); // Clear search term
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
                    placeholder="Search students..."
                    onInputChange={(inputValue) => setSearchTermType1(inputValue)}
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
                    onInputChange={(inputValue) => setSearchTermType2(inputValue)}
                />
                <Button onClick={handleSubmitType2} label="Submit" />
            </div>
        </div>
    );
}

export default Nip;
