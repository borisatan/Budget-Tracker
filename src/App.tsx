import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions, Plugin, Chart } from "chart.js";
import React, { useState, useEffect, useRef } from 'react';
import { Doughnut } from "react-chartjs-2";
import { Calendar } from "react-calendar";
import 'react-calendar/dist/Calendar.css'; // Uncomment this to include default calendar styles
import "./App.css"

ChartJS.register(ArcElement, Tooltip, Legend);

function calculateMoney(budget: number, expenses: number[], left: boolean): number {
  let totalExpense = 0;

  for (const expense of expenses) {
    if (typeof expense === 'number') {
      totalExpense += expense;
    } else {
      console.error('Invalid expense value:', expense);
      return budget; // or handle the error as needed
    }
  }
  
  return left ? budget - totalExpense : totalExpense;
}

interface ExpenseEntry {
  date: Date;
  amountSpent: number;
  description: string;
}

function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [amountSpent, setAmountSpent] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]); // Array to store expense entries
  const [darkMode, setDarkMode] = useState(false); // New state for dark mode
  

  const budget = 1000;
  
  const moneyLeft = calculateMoney(budget, expenses.map(e => e.amountSpent), true);
  const moneySpent = calculateMoney(budget, expenses.map(e => e.amountSpent), false);

  const data = {
    labels: [`Left: ${moneyLeft}€`, `Spent: ${moneySpent}€`],
    datasets: [
      {
        data: [moneyLeft, moneySpent],
        backgroundColor: ["#4caf50", "#f44336"], // Use colors that look nice together
        borderColor: "#000", 
        borderWidth: 1
      },
    ],
  };

  // Chart reference to force updates
  const chartRef = useRef<Chart<'doughnut'>>(null);

  // Define the plugin inside the component to use the latest moneyLeft value
  const centerTextPlugin: Plugin<'doughnut'> = {
    id: "centerTextPlugin",
    afterDraw(chart) {
      const { ctx, width, height } = chart;
      
      // Cast chart.options.plugins to allow centerText with a string text property
      const centerTextOptions = chart.options.plugins as { centerText?: { text: string } };
  
      // Use custom text or default to `moneyLeft`
      const text = centerTextOptions?.centerText?.text || `${moneyLeft}€`;
  
      ctx.save();
      ctx.font = "bold 40px Arial"; // Adjusted font size for better fit
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#4caf50"; // Use the same color as the chart segment
      ctx.fillText(text, width / 2, height / 2);
      ctx.restore();
    },
  };
  

  const options = {
    plugins: {
      legend: {
        position: "bottom",
      },
      centerText: {
        text: `${moneyLeft}€`,
      },
    },
  } as ChartOptions<'doughnut'> & { plugins: { centerText: { text: string } } };


  // Inline styles to control sizes
  const chartStyle = {
    width: "500px", // Adjusted chart width
    height: "500px", // Adjusted chart height
    borderRadius: '10px', // Rounded corners for the chart
    overflow: 'hidden', // Hide overflow for rounded corners
  };

  const calendarStyle = {
    width: "800px", // Adjusted calendar width
    height: "auto", // Let height be adjusted automatically
    borderRadius: '10px', // Rounded corners for the calendar
    overflow: 'hidden', // Hide overflow for rounded corners
  };

  const calendarContainerStyle = {
    display: 'flex',
    width: "800px", // Adjusted calendar width
    height: "auto", // Let height be adjusted automatically
    borderRadius: '10px', // Rounded corners for the calendar
    overflow: 'hidden', // Hide overflow for rounded corners
  };

  const inputContainerStyle = {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '10px',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    width: '450px', // Adjust as needed
  };

  const labelStyle = {
    display: 'flex',
    marginBottom: '10px',
    flexDirection: 'column' as 'column',
    gap: '5px',
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // Find entry for the selected date
    const entry = expenses.find(e => e.date.toDateString() === date.toDateString());
    if (entry) {
      setAmountSpent(entry.amountSpent);
      setDescription(entry.description);
    } else {
      setAmountSpent(0);
      setDescription('');
    }
  };

  const handleSave = () => {
    if (selectedDate) {
      const newEntry: ExpenseEntry = {
        date: selectedDate,
        amountSpent,
        description
      };

      // Check if there's already an entry for the selected date
      const updatedExpenses = expenses.filter(e => e.date.toDateString() !== selectedDate.toDateString());
      setExpenses([...updatedExpenses, newEntry]);

      
      // Close the input container
      setSelectedDate(null);
      setAmountSpent(0);
      setDescription('');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
    document.body.classList.toggle('dark-mode');
  };

  // Update chart when moneyLeft changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [moneyLeft, expenses]); // Added expenses to ensure the chart updates when expenses change

  return (
    <div className="App">
      <button className="dark-mode-toggle" onClick={toggleDarkMode}>
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      <div className="container">
        <div style={chartStyle}>
          <Doughnut
            data={data}
            options={options}
            plugins={[centerTextPlugin]}
            ref={chartRef}
          />
        </div>
        <div style={calendarContainerStyle}>
          <Calendar onClickDay={handleDateClick} />
          {selectedDate && (
            <div style={inputContainerStyle}>
              <h3>Details for {selectedDate.toDateString()}</h3>
              <label>
                Amount Spent: &nbsp;
                <input
                  type="number"
                  value={amountSpent}
                  onChange={(e) => {
                    let value = parseFloat(e.target.value)
                    if (!isNaN(value)) setAmountSpent(value)
                    else setAmountSpent(0)}}
                    
                />
              </label>
              <label style={labelStyle}>
                Description:
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              <button onClick={handleSave}>Save</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
