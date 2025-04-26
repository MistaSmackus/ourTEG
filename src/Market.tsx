import { useEffect, useState } from "react";
import { Container, Table, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

const globalMarkets = [
  { name: "Nikkei 225", value: "32,100.50", change: "+1.50%" },
  { name: "DAX (Germany)", value: "15,780.20", change: "-0.80%" },
  { name: "Crude Oil", value: "$85.12", change: "+2.30%" },
];

const economicEvents = [
  { date: "Oct 15", event: "CPI Inflation Report", forecast: "+3.8%", previous: "+4.0%" },
  { date: "Oct 20", event: "Fed Interest Rate Decision", forecast: "5.50%", previous: "5.25%" },
];

export default function MarketOverview() {
  const [stock, setStock] = useState<Array<Schema["Stock"]["type"]>>([]);

  useEffect(() => {
    const subscription = client.models.Stock.observeQuery().subscribe({
      next: (data) => {
        console.log("Fetched stock data:", data.items);
        setStock([...data.items]);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  const indices = [...stock]
    .filter(s => s.price)
    .sort((a, b) => Math.abs(Number(b.price)) - Math.abs(Number(a.price)))
    .slice(0, 5);

  const movers = [...stock]
    .filter(s => s.change)
    .sort((a, b) => Math.abs(Number(b.change)) - Math.abs(Number(a.change)))
    .slice(0, 5);

  const trends = [...stock]
    .filter(s => typeof s.mentions === "number")
    .sort((a, b) => Number(b.mentions) - Number(a.mentions))
    .slice(0, 5);

  return (
    <Container fluid className="py-5 text-white text-center">
      <h2 className="text-light mb-4">Market Overview</h2>

      <div className="d-flex flex-column align-items-center">
        {/* Top row widgets */}
        <div className="d-flex justify-content-center flex-wrap w-100">
          {/* Market Indices */}
          <Card className="m-2 p-3 bg-secondary text-light" style={{ width: "30%" }}>
            <h5>Market Indices</h5>
            <Table striped bordered hover responsive variant="dark">
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Price</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {indices.map((s) => (
                  <tr key={s.name}>
                    <td>{s.name || "N/A"}</td>
                    <td>{s.price || "-"}</td>
                    <td style={{ color: s.change?.includes("-") ? "red" : "green" }}>
                      {s.change || "0.00%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          {/* Market Movers */}
          <Card className="m-2 p-3 bg-secondary text-light" style={{ width: "30%" }}>
            <h5>Market Movers</h5>
            <Table striped bordered hover responsive variant="dark">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Last</th>
                  <th>Change</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {movers.map((mover) => (
                  <tr key={mover.symbol}>
                    <td>{mover.symbol || "N/A"}</td>
                    <td>{mover.last || "-"}</td>
                    <td style={{ color: mover.change?.includes("-") ? "red" : "green" }}>
                      {mover.change || "0.00%"}
                    </td>
                    <td>{mover.volume || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          {/* Global Markets */}
          <Card className="m-2 p-3 bg-secondary text-light" style={{ width: "30%" }}>
            <h5>Global Markets</h5>
            <Table striped bordered hover responsive variant="dark">
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Value</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {globalMarkets.map((market) => (
                  <tr key={market.name}>
                    <td>{market.name}</td>
                    <td>{market.value}</td>
                    <td style={{ color: market.change.includes("-") ? "red" : "green" }}>
                      {market.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>

        {/* Bottom row widgets */}
        <div className="d-flex justify-content-center flex-wrap w-100">
          {/* Trending Stocks */}
          <Card className="m-2 p-3 bg-secondary text-light" style={{ width: "45%" }}>
            <h5>Trending Stocks</h5>
            <Table striped bordered hover responsive variant="dark">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Last Price</th>
                  <th>Mentions</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((stock) => (
                  <tr key={stock.symbol}>
                    <td>{stock.symbol || "N/A"}</td>
                    <td>{stock.last || "-"}</td>
                    <td>{stock.mentions ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          {/* Economic Events */}
          <Card className="m-2 p-3 bg-secondary text-light" style={{ width: "45%" }}>
            <h5>Economic Events</h5>
            <Table striped bordered hover responsive variant="dark">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event</th>
                  <th>Forecast</th>
                  <th>Previous</th>
                </tr>
              </thead>
              <tbody>
                {economicEvents.map((event) => (
                  <tr key={event.date}>
                    <td>{event.date}</td>
                    <td>{event.event}</td>
                    <td>{event.forecast}</td>
                    <td>{event.previous}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      </div>
    </Container>
  );
}
