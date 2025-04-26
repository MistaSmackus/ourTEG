import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Container, Row, Col, Table, Card } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

export default function Portfolio() {
  const { user } = useAuthenticator();
  const [account, setAccount] = useState<Array<Schema["Account"]["type"]>>([]);
  const [ownedStock, setOwnedStock] = useState<Array<Schema["Ownedstock"]["type"]>>([]);
  const [portfolioHistory, setPortfolioHistory] = useState<Array<{ time: string; value: number }>>([]);

  useEffect(() => {
    const sub1 = client.models.Account.observeQuery().subscribe({
      next: (data) => setAccount([...data.items]),
    });

    const sub2 = client.models.Ownedstock.observeQuery().subscribe({
      next: (data) => setOwnedStock([...data.items]),
    });

    const sub3 = client.models.Marketvalue.observeQuery().subscribe({
      next: (data) => {
        const transformed = data.items
          .filter((item) => item.time != null && item.value != null)
          .map((item) => ({
            time: item.time!,
            value: parseFloat(item.value!),
          }));
        setPortfolioHistory(transformed);
      },
    });

    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
      sub3.unsubscribe();
    };
  }, []);

  const portfolioTotalValue = ownedStock.reduce((acc, stock) => {
    const stockTotal = Number(stock.currentPrice) * Number(stock.shares);
    return acc + stockTotal;
  }, 0);

  const currentAccount = account.length > 0 ? account[0] : null;

  return (
    <Container className="py-5">
      <h2 className="text-center text-light mb-4">Your Portfolio Overview</h2>

      <Container style={{ maxWidth: "900px" }} className="mx-auto">

        <Row className="justify-content-center mb-4">
          <Col md={8}>
            <Card className="bg-dark text-light p-4 shadow">
              <h4>Account Information</h4>
              {currentAccount ? (
                <ul className="list-unstyled">
                  <li><strong>Username:</strong> {user?.username}</li>
                  <li><strong>Account Balance:</strong> ${Number(currentAccount.accountBalance).toFixed(2)}</li>
                  <li><strong>Account Value (Investments):</strong> ${portfolioTotalValue.toFixed(2)}</li>
                  <li><strong>Total Net Worth:</strong> ${(Number(currentAccount.accountBalance) + portfolioTotalValue).toFixed(2)}</li>
                </ul>
              ) : (
                <p className="text-muted">Loading account info...</p>
              )}
            </Card>
          </Col>
        </Row>

        <Row className="justify-content-center mb-4">
          <Col md={10}>
            <Card className="bg-dark text-light p-4 shadow">
              <h4>Portfolio History</h4>
              {portfolioHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={portfolioHistory}>
                    <XAxis dataKey="time" stroke="#aaa" />
                    <YAxis stroke="#aaa" />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#0dcaf0" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted">No portfolio history data yet.</p>
              )}
            </Card>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={10}>
            <Card className="bg-secondary text-light p-4 shadow">
              <h4>Owned Stocks</h4>
              {ownedStock.length > 0 ? (
                <Table striped bordered hover responsive variant="dark" className="mt-3">
                  <thead>
                    <tr>
                      <th>Stock Name</th>
                      <th>Shares Owned</th>
                      <th>Current Price</th>
                      <th>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownedStock.map((stock) => (
                      <tr key={stock.id}>
                        <td>{stock.stockName}</td>
                        <td>{stock.shares}</td>
                        <td>${Number(stock.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td>${(Number(stock.currentPrice) * Number(stock.shares)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">You don't own any stocks yet.</p>
              )}
            </Card>
          </Col>
        </Row>

      </Container>
    </Container>
  );
}
