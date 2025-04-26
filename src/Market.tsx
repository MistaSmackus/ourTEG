
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export default function MarketOverview(): JSX.Element {
  const [stock, setStock] = useState<Array<Schema["Stock"]["type"]>>([]);

  useEffect(() => {
    const stockSubscription = client.models.Stock.observeQuery().subscribe({
      next: (data) => setStock([...data.items]),
    });
    return () => stockSubscription.unsubscribe();
  }, []);

  const trending = [...stock]
    .filter((s) => s.mentions !== null && s.mentions !== undefined)
    .sort((a, b) => Number(b.mentions) - Number(a.mentions))
    .slice(0, 5);

  const movers = [...stock]
    .sort((a, b) => Math.abs(Number(b.change)) - Math.abs(Number(a.change)))
    .slice(0, 5);

  return (
    <Container fluid className="min-vh-100 d-flex flex-column align-items-center py-5">
      {/* Hero Section */}
      <div className="text-center mb-4">
        <h1 className="fw-bold">Market Overview</h1>
        <p className="text-muted">Track the latest market changes and top performers.</p>
      </div>

      {/* Indices Snapshot */}
      <Card className="w-100 shadow-sm mb-4" style={{ maxWidth: "900px" }}>
        <Card.Body>
          <h2 className="h5 mb-3">Indices</h2>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Price</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((s) => (
                <tr key={s.id}>
                  <td>{s.symbol}</td>
                  <td>${s.price}</td>
                  <td style={{ color: s.change?.toString().includes("-") ? "red" : "green" }}>
                    {s.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Top Movers */}
      <Card className="w-100 shadow-sm mb-4" style={{ maxWidth: "900px" }}>
        <Card.Body>
          <h2 className="h5 mb-3">Top Movers</h2>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Price</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {movers.map((mover) => (
                <tr key={mover.id}>
                  <td>{mover.symbol}</td>
                  <td>${mover.price}</td>
                  <td style={{ color: mover.change?.toString().includes("-") ? "red" : "green" }}>
                    {mover.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Trending Stocks */}
      <Card className="w-100 shadow-sm mb-4" style={{ maxWidth: "900px" }}>
        <Card.Body>
          <h2 className="h5 mb-3">Trending Stocks</h2>
          <Row className="g-3">
            {trending.map((trend) => (
              <Col key={trend.id} md={4}>
                <Card className="p-3 text-center shadow-sm">
                  <Card.Body>
                    <h5>{trend.symbol}</h5>
                    <p className="text-muted">Mentions: {trend.mentions}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}
