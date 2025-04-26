import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
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
  const [totalEarnings, setTotalEarnings] = useState("$0.00");
  const [accountBalance, setAccountBalance] = useState("$0.00");

  useEffect(() => {
    const subscription = client.models.Marketvalue.observeQuery().subscribe({
      next: async () => {
        try {
          const accountRes = await client.models.Account.list();
          let account = accountRes.data?.[0];
          if (!account) {
            const createRes = await client.models.Account.create({ accountvalue: "0" });
            if (createRes.data) account = createRes.data;
          }

          const balance = account?.balance ?? "0";
          setAccountBalance("$" + balance);

          const ownedRes = await client.models.Ownedstock.list();
          const owned = ownedRes.data || [];

          const stockTotal = owned.reduce((acc, s) => {
            return acc + parseFloat(s.currentPrice || "0") * parseInt(s.shares || "0");
          }, 0);
          setTotalEarnings("$" + stockTotal.toFixed(2));

          const historyRes = await client.models.Marketvalue.list();
          const sorted = historyRes.data
            ?.filter(entry => entry.time)
            ?.sort((a, b) => new Date(a.time ?? "").getTime() - new Date(b.time ?? "").getTime())
            ?.map((entry) => parseFloat(entry.value ?? "0"));
          setPortfolioHistory(sorted || []);

        } catch (err) {
          console.error("Error fetching data:", err);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const netWorth = 
    parseFloat(accountBalance.replace("$", "")) + 
    parseFloat(totalEarnings.replace("$", ""));

  return (
    <Container fluid className="d-flex flex-column align-items-center mt-4">
      <Card className="m-3 p-3 bg-dark text-light w-100" style={{ maxWidth: "400px" }}>
        <div className="text-center">
          <h2 className="fw-bold">{displayName}'s Portfolio</h2>
          <h4>
            Total Earnings: <span className="text-success">{totalEarnings}</span>
          </h4>
          <h5>
            Available Cash: <span className="text-info">{accountBalance}</span>
          </h5>
          <h5>
            Total Net Worth: <span className="text-warning">${netWorth.toFixed(2)}</span>
          </h5>
        </div>
      </Card>

      <Card className="m-3 p-3 bg-secondary text-light w-100" style={{ maxWidth: "700px" }}>
        <h5 className="text-center">Portfolio Value Over Time</h5>
        <Line data={data} />
      </Card>
    </Container>
  );
}
