import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary components with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPreview = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Flagged Emails',
        data: [18, 6, 12, 10, 15],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Flagged External Links',
        data: [8, 17, 24, 9, 4],
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
      },
      {
        label: 'Screened Emails',
        data: [4, 8, 10, 16, 27],
        borderColor: 'rgb(86, 180, 83)',
        backgroundColor: 'rgba(145, 227, 159, 0.2)',
      },
      {
        label: 'Screened External Links',
        data: [12, 20, 5, 29, 10],
        borderColor: 'rgb(231, 203, 63)',
        backgroundColor: 'rgba(218, 197, 145, 0.2)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Activities',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Values (0-50)',
        },
        min: 0,
        max: 50,
        ticks: {
          stepSize: 5, // This sets the granularity to 10 units
        },
      },
    },
  };

  return (
    <>
      <div className='w-100 h-100'>
        <Line data={data} options={options} />
      </div>
    </>
    
  );
};

export default DashboardPreview;
