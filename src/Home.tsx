import Marquee from "react-fast-marquee";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

const formatChange = (change: number, isIncrease: boolean) => `${isIncrease ? "+" : "-"}${change.toFixed(2)}`;

const features = [
  { title: "Real-Time Trading", desc: "Instant market access." },
  { title: "Portfolio Tracking", desc: "Manage your investments." },
  { title: "Market Insights", desc: "AI-driven analytics." },
];

export default function Home(): JSX.Element {
  const [stock, setStock] = useState<Array<Schema["Stock"]["type"]>>([]);
  const [marketval, setMarketVal] = useState<Array<{ time: string; value: number }>>([]);

  useEffect(() => {
    const stockSubscription = client.models.Stock.observeQuery().subscribe({
      next: (data) => setStock([...data.items]),
    });
    return () => stockSubscription.unsubscribe();
  }, []);

  useEffect(() => {
    const marketSubscription = client.models.Marketvalue.observeQuery().subscribe({
      next: (data) => {
        const transformed = data.items
          .filter((item) => item.time != null && item.value != null)
          .map((item) => ({
            time: item.time!,
            value: parseFloat(item.value!),
          }));
        setMarketVal(transformed);
      },
    });
    return () => marketSubscription.unsubscribe();
  }, []);

  useEffect(() => {
    window.onbeforeunload = generateRandomNight;

    const intervalInc = setInterval(generateRandomDayIncrease, 90000);
    const intervalDec = setInterval(generateRandomDayDecrease, 1000000);

    return () => {
      clearInterval(intervalInc);
      clearInterval(intervalDec);
    };
  }, [stock]);

  function generateRandomNight() {
    if (stock.length === 0) return;
    for (let i = 0; i < 5; i++) updateStockRandomly(true);
    for (let i = 0; i < 5; i++) updateStockRandomly(false);
  }

  function generateRandomDayIncrease() {
    if (stock.length === 0) return;
    updateStockRandomly(true);
  }

  function generateRandomDayDecrease() {
    if (stock.length === 0) return;
    updateStockRandomly(false);
  }

  function updateStockRandomly(isIncrease: boolean) {
    const randIndex = Math.floor(Math.random() * stock.length);
    const selectedStock = stock[randIndex];
    if (!selectedStock) return;

    const oldPrice = Number(selectedStock.price);
    let change = Math.floor(Math.random() * 10);

    if (!isIncrease && change > oldPrice) {
      change = Math.floor(Math.random() * 5);
    }

    const newPrice = isIncrease ? oldPrice + change : oldPrice - change;
    const mentions = Math.floor(Math.random() * 100);

    client.models.Stock.update({
      id: selectedStock.id,
      price: newPrice.toFixed(2),
      change: formatChange(change, isIncrease),
      last: oldPrice.toFixed(2),
      mentions: mentions,
    });
  }

  return (
    <Container fluid className="min-vh-100 d-flex flex-column align-items-center py-5">
      <div className="w-100 bg-dark text-white text-center py-2">
        <Marquee>
          {stock.map((s) => (
            <span key={s.id} className="mx-3">
              {s.symbol}: ${s.price}
              <span className={s.change?.includes("-") ? "text-danger" : "text-success"}>
                ({s.change})
              </span>
            </span>
          ))}
        </Marquee>
      </div>

      <div className="text-center mb-4">
        <h1 className="fw-bold">Your Wealth, Your Future -- Powered by Titan.</h1>
        <p className="text-muted">Rise Above. Invest Like a Titan.</p>
      </div>

      <Card className="w-100 shadow-sm mb-4" style={{ maxWidth: "600px" }}>
        <Card.Body>
          <h2 className="h5 mb-3">Market Snapshot</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={marketval}>
              <XAxis dataKey="time" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#007bff" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      <Container>
        <Row className="g-3">
          {features.map((feature, idx) => (
            <Col key={idx} md={4}>
              <Card className="p-3 text-center shadow-sm">
                <Card.Body>
                  <h5>{feature.title}</h5>
                  <p className="text-muted">{feature.desc}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  );
}
