import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Line } from "react-chartjs-2";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";


ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

const client = generateClient<Schema>();

export default function Portfolio() {
  const { user } = useAuthenticator();
  const fallbackName = user?.signInDetails?.loginId?.split("@")[0];
  const displayName = fallbackName || "Guest";

  const [portfolioHistory, setPortfolioHistory] = useState<number[]>([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState("$0.00");
  const [purchasedStocks, setPurchasedStocks] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const accountRes = await client.models.Account.list();
        const account = accountRes.data?.[0];
        setTotalPortfolioValue(`$${account?.accountvalue || "0"}`);

        const historyRes = await client.models.Marketvalue.list();
        const sorted = historyRes.data
          ?.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
          ?.map((entry) => parseFloat(entry.value));
        setPortfolioHistory(sorted || []);

        const ownedRes = await client.models.Ownedstock.list();
        setPurchasedStocks(ownedRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }

    fetchData();
  }, []);

  const handleTestWrite = async () => {
    try {
      const res = await client.models.Marketvalue.create({
        value: (Math.random() * 100000).toFixed(2),
        time: new Date().toISOString(),
      });
      console.log("Test write success:", res);
      alert("Test write to DynamoDB succeeded!");
    } catch (err) {
      console.error("Test write failed:", err);
      alert("Write failed. Check console for details.");
    }
  };

  const labels = Array.from({ length: portfolioHistory.length }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (portfolioHistory.length - 1 - i));
    return date.toLocaleDateString();
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Portfolio Value ($)",
        data: portfolioHistory,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "rgba(75,192,192,1)"
      }
    ]
  };

  return (
    <Container fluid className="d-flex flex-column align-items-center mt-4">
      <Card className="m-3 p-3 bg-dark text-light w-100" style={{ maxWidth: "400px" }}>
        <div className="text-center">
          <h2 className="fw-bold">{displayName}'s Portfolio</h2>
          <h4>
            Total Value: <span className="text-success">{totalPortfolioValue}</span>
          </h4>
        </div>
      </Card>

      <Card className="m-3 p-3 bg-secondary text-light w-100" style={{ maxWidth: "700px" }}>
        <h5 className="text-center">Portfolio Value Over Time</h5>
        <Line data={data} />
      </Card>

      <Card className="m-3 p-3 bg-secondary text-light w-100" style={{ maxWidth: "800px" }}>
        <h5 className="text-center">Your Purchased Stocks</h5>
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>Stock Name</th>
              <th>Shares</th>
              <th>Current Price</th>
            </tr>
          </thead>
          <tbody>
            {purchasedStocks.map((stock, index) => (
              <tr key={index}>
                <td>{stock.stockName}</td>
                <td>{stock.shares}</td>
                <td>{stock.currentPrice}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Button onClick={handleTestWrite} variant="success" className="m-3">
        Test Write to Marketvalue Table
      </Button>
    </Container>
  );
}
