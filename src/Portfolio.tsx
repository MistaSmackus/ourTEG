import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Container, Table, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

export default function Portfolio() {
  const { user } = useAuthenticator();
  const [account, setAccount] = useState<Array<Schema["Account"]["type"]>>([]);
  const [ownedStock, setOwnedStock] = useState<Array<Schema["Ownedstock"]["type"]>>([]);

  useEffect(() => {
    const sub1 = client.models.Account.observeQuery().subscribe({
      next: (data) => setAccount([...data.items]),
    });

    const sub2 = client.models.Ownedstock.observeQuery().subscribe({
      next: (data) => setOwnedStock([...data.items]),
    });

    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    };
  }, []);

  const portfolioTotalValue = ownedStock.reduce((acc, stock) => {
    const stockTotal = Number(stock.currentPrice) * Number(stock.shares);
    return acc + stockTotal;
  }, 0);

  return (
    <Container fluid className="py-5">
      <h2 className="text-center text-light mb-4">Your Portfolio Overview</h2>

      {/* Account Balance & Portfolio Value */}
      <Card className="bg-dark text-light mb-4 p-4">
        <h4>Account Information</h4>
        <p><strong>Username:</strong> {user?.signInDetails?.loginId?.split("@")[0]}</p>
        <p><strong>Account Balance:</strong> ${account.length > 0 ? Number(account[0].balance ?? 0).toFixed(2) : "0.00"}</p>
        <p><strong>Account Value (Investments):</strong> ${portfolioTotalValue.toFixed(2)}</p>
        <p><strong>Total Net Worth:</strong> ${(portfolioTotalValue + Number(account[0]?.balance ?? 0)).toFixed(2)}</p>
      </Card>

      {/* Owned Stocks Table */}
      <Card className="bg-secondary text-light p-4">
        <h4>Owned Stocks</h4>
        {ownedStock.length > 0 ? (
          <Table striped bordered hover responsive variant="dark">
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
                  <td>${Number(stock.currentPrice).toFixed(2)}</td>
                  <td>${(Number(stock.currentPrice) * Number(stock.shares)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-muted">You don't own any stocks yet.</p>
        )}
      </Card>
    </Container>
  );
}
