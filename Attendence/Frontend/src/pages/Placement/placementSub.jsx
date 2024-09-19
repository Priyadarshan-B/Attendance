import React, { useState, useEffect } from "react";
import { TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from "@mui/material";
import requestApi from "../../components/utils/axios";
import InputBox from "../../components/TextBox/textbox";
import './placement.css';
import { getDecryptedCookie } from "../../components/utils/encrypt";

function PlacementSub() {
    return <Body />;
}

function Body() {
    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const id = getDecryptedCookie('id');

    useEffect(() => {
        fetchPlacementData();
    }, []);

    const fetchPlacementData = async () => {
        try {
            const response = await requestApi("GET", `/placementSub?mentor=${id}`);
            setData(response.data.data);
        } catch (error) {
            console.error("Error fetching placement data", error);
        }
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Only apply filter if data length is greater than 1
    const filteredData = data.length > 0 
        ? data.filter((row) =>
            row.name.toLowerCase().includes(search.toLowerCase()) ||
            row.register_number.toLowerCase().includes(search.toLowerCase())
        ) 
        : data;

    return (
        <div>
            <h3>Student Records (Sub-Mentor)</h3>
            <br />
            <InputBox
                label="Search"
                value={search}
                placeholder="Search by Name, Register Number"
                onChange={handleSearchChange}
                style={{ width: '300px' }}
            />
            <br /><br />
            <div className="table-container">
                <TableContainer component={Paper}>
                    <Table className="custom-table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: 150 }}><b>Name</b></TableCell>
                                <TableCell sx={{ width: 180 }}><b>Register Number</b></TableCell>
                                <TableCell sx={{ width: 120 }}><b> Rank</b></TableCell>
                                <TableCell sx={{ width: 150 }}><b>Group</b></TableCell>
                                <TableCell sx={{ width: 120 }}><b>Score</b></TableCell>
                                <TableCell sx={{ width: 300 }}><b>Personalized Skill</b></TableCell>
                                <TableCell sx={{ width: 150 }}><b>Reward Points</b></TableCell>
                                <TableCell sx={{ width: 150 }}><b>Attendance Percentage</b></TableCell>
                            </TableRow>
                        </TableHead>
                        {filteredData.length > 0 ? (
                            <TableBody>
                                {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={{ width: 150, whiteSpace:'nowrap' }}>{row.name || "N/A"}</TableCell>
                                        <TableCell sx={{ width: 180, whiteSpace:'nowrap' }}>{row.register_number || "N/A"}</TableCell>
                                        <TableCell sx={{ width: 120, whiteSpace:'nowrap' }}>{row.placement_rank || "N/A"}</TableCell>
                                        <TableCell sx={{ width: 150, whiteSpace:'nowrap' }}>{row.placement_group || "N/A"}</TableCell>
                                        <TableCell sx={{ width: 120, whiteSpace:'nowrap' }}>{row.placement_score || "N/A"}</TableCell>
                                        <TableCell sx={{ width: 250 }}className="personalized-skill-cell">{row.personalized_skill || "N/A"}</TableCell>
                                        <TableCell sx={{ width: 150, whiteSpace:'nowrap' }}>{row.reward_points || "N/A"}</TableCell>
                                        <TableCell sx={{ width: 150, whiteSpace:'nowrap' }}>{row.att_percent || "N/A"}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        ) : (
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={8}>No records found</TableCell>
                                </TableRow>
                            </TableBody>
                        )}
                    </Table>
                    <TablePagination
                        component="div"
                        count={filteredData.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                        sx={{
                            backgroundColor: 'var(--text)',
                            '.MuiTablePagination-toolbar': {
                                backgroundColor: 'var(--background-1)',
                            },
                        }}
                    />
                </TableContainer>
            </div>
        </div>
    );
}

export default PlacementSub;
