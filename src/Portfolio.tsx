import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Container, Card, Table } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

const client = generateClient<Schema>();

export default function Portfolio() {
  const { user } = useAuthenticator();
  const [portfolioHistory, setPortfolioHistory] = useState<number[]>([]);
  const [transactions, setTransactions] = useState<Array<Schema["Transaction"]["type"]>>([]);
  const [account, setAccount] = useState<Schema["Account"]["type"] | null>(null);

  useEffect(() => {
    const sub1 = client.models.Portfoliohistory.observeQuery().subscribe({
      next: (data) => {
        const userHist = data.items
          .filter((entry) => entry.user === user?.username)
          .map((entry) => Number(entry.totalvalue))
          .sort((a, b) => a - b);
        setPortfolioHistory(userHist);
      },
    });

    const sub2 = client.models.Transaction.observeQuery().subscribe({
      next: (data) => {
        const userTx = data.items.filter((t) => t.user === user?.username);
        setTransactions(userTx);
      },
    });

    const sub3 = client.models.Account.observeQuery().subscribe({
      next: (data) => {
        const found = data.items.find((acc) => acc.user === user?.username);
        setAccount(found || null);
      },
    });

    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
      sub3.unsubscribe();
    };
  }, [user?.username]);

  const totalHoldings = transactions.reduce((acc, tx) => {
    if (!acc[tx.symbol]) acc[tx.symbol] = 0;
    acc[tx.symbol] += tx.amount;
    return acc;
  }, {} as Record<string, number>);

  const labels = portfolioHistory.map((_, index) => `Day ${index + 1}`);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Portfolio Value ($)",
        data: portfolioHistory,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: "Portfolio Growth Over Time" },
    },
  };

  return (
    <Container fluid className="py-5">
      <h2 className="text-center text-light mb-4">Your Portfolio</h2>

      {/* Account Balance */}
      <Card className="bg-dark text-light mb-4 p-3">
        <h4>Account Overview</h4>
        <p><strong>Username:</strong> {user?.username}</p>
        <p><strong>Balance:</strong> ${account?.balance?.toFixed(2) || "0.00"}</p>
      </Card>

      {/* Portfolio Line Chart */}
      <Card className="bg-secondary text-light mb-4 p-4">
        <h4 className="text-center mb-4">Portfolio Value History</h4>
        {portfolioHistory.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <p className="text-center text-muted">No portfolio history data yet.</p>
        )}
      </Card>

      {/* Holdings */}
      <Card className="bg-dark text-light p-4">
        <h4>Current Holdings</h4>
        {Object.keys(totalHoldings).length > 0 ? (
          <Table striped bordered hover variant="dark" responsive>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Amount Owned</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(totalHoldings).map(([symbol, amount]) => (
                <tr key={symbol}>
                  <td>{symbol}</td>
                  <td>{amount}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-muted">No stocks owned yet.</p>
        )}
      </Card>
    </Container>
  );
}
