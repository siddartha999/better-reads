import React, { useState } from 'react';
import './UserRatingsChart.css';
import { Chart as ChartJS } from 'chart.js/auto';
import { Chart, Bar, Pie, Doughnut } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Switch from '@mui/material/Switch';

const UserRatingsChart = (props) => {
    const data = props.data;
    const [barChart, setBarChart] = useState(true);
    let labels = [];
    let values = [];
    for(let key in data) {
        labels.push(key);
        values.push(data[key]);
    }
    let chartData = {
        labels: labels,
        datasets: [{
            data: values,
            backgroundColor: [
                '#292826',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
                'rgb(255, 99, 132)',
                '#AA96DA',
              ]
        }]
    };

    const options = {
        scales: {
            x: {
                grid:  {
                    display: false
                }
               },
            y: {
               display: false
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };

    /**
     * Handler to close the dialog
     */
    const handleClose = () => {
        props.setOpenReviewChart(false);
    };

    /**
     * Handler to toggle the chart
     */
    const handleChange = (event) => {
        setBarChart(event.target.checked);
    };

    return (
        <div className="UserRatingsChart">
           <Dialog onClose={handleClose} open={props.open}>
                <DialogTitle>
                    <p className='UserRatingsChart-title'>@{props.profileName}'s Ratings</p>
                </DialogTitle>
                <div className='UserRatingsChart-charts-wrapper'>
                    <div className='UserRatingsChart-chart-wrapper'>
                        <div className='Bar'>
                            <Bar data={chartData} height={200} width={200} options={options}/>         
                        </div>
                    </div>
                    <div className='UserRatingsChart-chart-wrapper'>
                        <div className='Pie'>
                            <Pie data={chartData} height={200} width={200} options={{ plugins: { legend: { display: false }} }}/> 
                        </div>
                    </div>
                </div>
           </Dialog>
        </div>
    );
};

export default UserRatingsChart;