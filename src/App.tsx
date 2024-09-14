import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function calculateMoney(budget: number, expenses: string | any[], left: boolean) {
  let totalExpense = 0;

  for (let i = 0; i < expenses.length; i++) {
    totalExpense += expenses[i];
  }
  if (left) return budget - totalExpense;
  else return totalExpense;
}

function App() {
  let moneyLeft = calculateMoney(1000, [100], true);
  let moneySpent = calculateMoney(1000, [100], false);

  const data = {
    labels: ["Left: " + moneyLeft, "Spent: " + moneySpent],
    datasets: [
      {
        data: [moneyLeft, moneySpent],
        backgroundColor: ["green", "red"],
        borderColor: "",
      },
    ],
  };

  const centerTextPlugin: Plugin<"doughnut"> = {
    id: "centerTextPlugin",
    afterDraw(chart) {
      const { ctx, width, height } = chart;
      const text = `${moneyLeft}€`;
      ctx.save();
      ctx.font = "bold 60px Arial";  // Increased font size
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "green";  // Green color for the text
      ctx.fillText(text, width / 2, height / 2);
      ctx.restore();
    },
  };

  const options: ChartOptions<"doughnut"> = {
    plugins: {
      legend: {
        position: "bottom", // Position the legend below the chart
      },
    },
  };

  // Inline styles to increase chart size
  const chartStyle = {
    width: "500px",  // Increased chart width
    height: "500px", // Increased chart height
  };

  return (
    <div className="App">
      <div style={chartStyle}>
        <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
      </div>
    </div>
  );
}

export default App;
