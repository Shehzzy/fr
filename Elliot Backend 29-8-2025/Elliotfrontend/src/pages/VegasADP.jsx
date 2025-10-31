import React, { useEffect, useState, useMemo } from "react";
import { Container } from "react-bootstrap";
import Footer from "../components/Footer";
import Header from "../components/Header";
import axios from "axios";
import Loader from "../components/Loader";
import Table from "react-bootstrap/Table";
import Select from "react-select";
import { BASE_URL_ADMIN } from "../API";
import CouponShower from "../components/CouponShower";

const VegasADP = () => {
    const [loading, setLoading] = useState(true);
    const [rankingsData, setRankingsData] = useState([]);
    const [positionType, setPositionType] = useState("QB");
    const [scoringType, setScoringType] = useState("Standard");
    const [tableHeaders, setTableHeaders] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const positionOptions = [
        { value: "QB", label: "QB" },
        { value: "RB", label: "RB" },
        { value: "WR", label: "WR" },
        { value: "TE", label: "TE" },
    ];

    const scoringOptions = [
        { value: "Standard", label: "Standard" },
        { value: "PPR", label: "PPR" },
        { value: "HalfPPR", label: "Half PPR" },
    ];

    const customStyles = {
        control: (provided) => ({
            ...provided,
            position: "relative",
        }),
    };

    const fetchRankingsData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${BASE_URL_ADMIN}/rankings/${positionType}/${scoringType}`
            );

            const data = response.data[0]?.data || [];
            setRankingsData(data);

            if (data.length > 0) {
                const headers = Object.keys(data[0]);
                setTableHeaders(headers);
                setSortConfig({ key: headers[0], direction: "asc" });
            } else {
                setTableHeaders([]);
                setSortConfig({ key: null, direction: "asc" });
            }
        } catch (error) {
            console.error("Error fetching rankings data:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRankingsData();
    }, [positionType, scoringType]);

    const handlePositionChange = (selectedOption) => {
        setPositionType(selectedOption.value);
    };

    const handleScoringChange = (selectedOption) => {
        setScoringType(selectedOption.value);
    };

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return rankingsData;

        const sorted = [...rankingsData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (!isNaN(parseFloat(aValue)) && !isNaN(parseFloat(bValue))) {
                return sortConfig.direction === "asc"
                    ? aValue - bValue
                    : bValue - aValue;
            } else {
                return sortConfig.direction === "asc"
                    ? aValue.toString().localeCompare(bValue.toString())
                    : bValue.toString().localeCompare(aValue.toString());
            }
        });

        return sorted;
    }, [rankingsData, sortConfig]);

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (header) => {
        if (sortConfig.key === header) {
            return sortConfig.direction === "asc" ? "▲" : "▼";
        }
        return "▼"; // Default icon
    };

    return (
        <div className="comm_page_wrapper2">
            <Header />
            <CouponShower />
            {loading ? (
                <div className="loader-wrapper">
                    <Loader isLoading={true} />
                </div>
            ) : (
                <>
                    <section className="comm_second_sec_padd">
                        <Container>
                            <div className="comm_sec_padd comm_blog_page_outer">
                                <h3 className="comm_sec_heading text-center mb-4">
                                    Vegas <span>ADP</span>
                                </h3>
                                <p
                                    className="text-white text-center mx-auto"
                                    style={{ maxWidth: "600px" }}
                                >
                                    Everyone has already seen the ADP widely available across
                                    fantasy websites. But where do the latest Vegas odds rank
                                    players based off their Over / Under yards totals, Receptions,
                                    and TDs.
                                </p>

                                <div className="d-flex gap-4 avg_top_select_wrap">
                                    <Select
                                        styles={customStyles}
                                        menuPlacement="bottom"
                                        options={positionOptions}
                                        value={positionOptions.find(
                                            (option) => option.value === positionType
                                        )}
                                        onChange={handlePositionChange}
                                    />
                                    <Select
                                        styles={customStyles}
                                        menuPlacement="bottom"
                                        options={scoringOptions}
                                        value={scoringOptions.find(
                                            (option) => option.value === scoringType
                                        )}
                                        onChange={handleScoringChange}
                                    />
                                </div>

                                <div className="table-responsive avg_table_outer">
                                    <div className="table-main-listng avg_table">
                                        <Table striped>
                                            <thead>
                                                <tr>
                                                    {tableHeaders.map((header, i) => (
                                                        <th
                                                            key={i}
                                                            style={{ cursor: "pointer", userSelect: "none" }}
                                                            onClick={() => handleSort(header)}
                                                        >
                                                            {header} {renderSortIcon(header)}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedData.length > 0 ? (
                                                    sortedData.map((row, idx) => (
                                                        <tr key={idx}>
                                                            {tableHeaders.map((header, i) => (
                                                                <td key={i}>{row[header]}</td>
                                                            ))}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={tableHeaders.length || 1}>
                                                            No data available
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </Container>
                    </section>
                    <Footer />
                </>
            )}
        </div>
    );
};

export default VegasADP;
