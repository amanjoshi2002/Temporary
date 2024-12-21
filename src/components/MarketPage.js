import React, { useState } from "react";
import axios from "axios"; // Import axios
import './MarketPage.css'; // Ensure you have the necessary CSS for styling
import Chart from 'chart.js/auto'; // Ensure you have chart.js installed

const MarketPage = () => {
    const [companySymbol, setCompanySymbol] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [stockData, setStockData] = useState(null);
    const [stockChart, setStockChart] = useState(null);

    const searchStock = async () => {
        setLoading(true);
        setError("");
        setStockData(null);

        try {
            const response = await axios.get(`/search?company=${companySymbol}`);
            const data = response.data;

            if (data.error) {
                setError(data.error);
                return;
            }

            setStockData(data);
            updateChart(data.historical_data);
        } catch (err) {
            setError("Error fetching stock data");
        } finally {
            setLoading(false);
        }
    };

    const updateChart = (historicalData) => {
        if (stockChart) {
            stockChart.destroy();
        }

        const ctx = document.getElementById('stockChart').getContext('2d');
        const sortedData = historicalData.sort((a, b) => new Date(a.date) - new Date(b.date));

        const newChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedData.map(item => item.date),
                datasets: [{
                    label: 'Stock Price',
                    data: sortedData.map(item => item.price),
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Historical Stock Price'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });

        setStockChart(newChart);
    };

    return (
        <div className="container">
            <h2>Stock Analysis</h2>
            <div className="search-container">
                <input
                    type="text"
                    value={companySymbol}
                    onChange={(e) => setCompanySymbol(e.target.value)}
                    placeholder="Enter stock symbol (e.g., TSLA)"
                />
                <button onClick={searchStock}>Search</button>
            </div>

            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">{error}</div>}

            {stockData && (
                <div id="stockHeader" className="header">
                    <h1>{stockData.company}</h1>
                    <div className="price-badge">${stockData.current_price.toFixed(2)}</div>
                    <div className="suggestion">{stockData.suggestion}</div>
                </div>
            )}

            <div id="chartContainer" className="chart-container">
                <canvas id="stockChart"></canvas>
            </div>
        </div>
    );
};

export default MarketPage; 