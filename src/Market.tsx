import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Card } from "react-bootstrap";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export default function MarketOverview() {
  const [stocks, setStocks] = useState<Schema["Stock"]["type"][]>([]);
  const [showSections, setShowSections] = useState({
    marketMovers: true,
    trendingStocks: true,
    globalMarkets: true,
  });

  useEffect(() => {
    const sub = client.models.Stock.observeQuery().subscribe({
      next: (data) => setStocks([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  const movers = [...stocks]
    .filter((s) => s.change)
    .sort((a, b) => Math.abs(Number(b.change)) - Math.abs(Number(a.change)))
    .slice(0, 3);

  const trending = [...stocks]
    .filter((s) => s.mentions !== null)
    .sort((a, b) => Number(b.mentions) - Number(a.mentions))
    .slice(0, 3);

  const toggleSection = (section: keyof typeof showSections) => {
    setShowSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Container className="py-5 text-light">
      <h2 className="text-center mb-4">Market Overview</h2>

      <div className="d-flex justify-content-center gap-2 mb-4">
        <Button variant="primary" onClick={() => toggleSection("globalMarkets")}>
          Toggle Market Indices
        </Button>
        <Button variant="primary" onClick={() => toggleSection("marketMovers")}>
          Toggle Market Movers
        </Button>
        <Button variant="primary" onClick={() => toggleSection("trendingStocks")}>
          Toggle Trending Stocks
        </Button>
        <Button variant="primary" disabled>
          Toggle Economic Events
        </Button>
      </div>

      <Row className="g-4">
        {showSections.marketMovers && (
          <Col md={4}>
            <Card className="bg-dark text-light">
              <Card.Header className="text-center fw-bold">Market Movers</Card.Header>
              <Card.Body>
                <Table variant="dark" responsive>
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Price</th>
                      <th>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movers.map((s) => (
                      <tr key={s.id}>
                        <td>{s.symbol}</td>
                        <td>${s.price}</td>
                        <td className={s.change?.includes("-") ? "text-danger" : "text-success"}>
                          {s.change}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        )}

        {showSections.trendingStocks && (
          <Col md={4}>
            <Card className="bg-dark text-light">
              <Card.Header className="text-center fw-bold">Trending Stocks</Card.Header>
              <Card.Body>
                <Table variant="dark" responsive>
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Price</th>
                      <th>Mentions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trending.map((s) => (
                      <tr key={s.id}>
                        <td>{s.symbol}</td>
                        <td>${s.price}</td>
                        <td>{s.mentions}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        )}

        {showSections.globalMarkets && (
          <Col md={4}>
            <Card className="bg-dark text-light">
              <Card.Header className="text-center fw-bold">Global Markets</Card.Header>
              <Card.Body>
                <Table variant="dark" responsive>
                  <tbody>
                    <tr><td>Nikkei 225</td><td>32,100.50</td><td className="text-success">+1.50%</td></tr>
                    <tr><td>DAX (Germany)</td><td>15,780.20</td><td className="text-danger">-0.80%</td></tr>
                    <tr><td>Crude Oil</td><td>$85.12</td><td className="text-success">+2.30%</td></tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
}
