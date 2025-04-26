import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import {
  Container,
  Table,
  Card,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export default function BuySell() {
  const { user } = useAuthenticator();
  const [stock, setStock] = useState<Array<Schema["Stock"]["type"]>>([]);
  const [account, setAccount] = useState<Schema["Account"]["type"] | null>(null);
  const [transaction, setTransaction] = useState<Array<Schema["Transaction"]["type"]>>([]);
  const [selectedStock, setSelectedStock] = useState<Schema["Stock"]["type"] | null>(null);
  const [amount, setAmount] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sub1 = client.models.Stock.observeQuery().subscribe({
      next: (data) => setStock(data.items),
    });

    const sub2 = client.models.Account.observeQuery().subscribe({
      next: (data) => {
        const found = data.items.find((acc) => acc.user === user?.username);
        setAccount(found || null);
      },
    });

    const sub3 = client.models.Transaction.observeQuery().subscribe({
      next: (data) => {
        const userTx = data.items.filter((t) => t.user === user?.username);
        setTransaction(userTx);
      },
    });

    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
      sub3.unsubscribe();
    };
  }, [user?.username]);

  const handleOpenModal = (stock: Schema["Stock"]["type"]) => {
    setSelectedStock(stock);
    setShow(true);
  };

  const handleCloseModal = () => {
    setSelectedStock(null);
    setAmount("");
    setShow(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !amount) return alert("Missing input");

    try {
      await client.models.Transaction.create({
        stockID: selectedStock.id!,
        user: user?.username || "unknown",
        action: "BUY",
        amount: Number(amount),
        symbol: selectedStock.symbol,
      });
      alert(`Bought ${amount} of ${selectedStock.symbol}`);
      handleCloseModal();
    } catch (err) {
      console.error("Transaction error:", err);
      alert("Failed to submit transaction");
    }
  };

  const totalHoldings = transaction.reduce((acc, tx) => {
    if (!acc[tx.symbol]) acc[tx.symbol] = 0;
    acc[tx.symbol] += tx.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Container fluid className="py-5">
      <h2 className="text-center text-light mb-4">Buy Stocks</h2>

      {/* Balance and Holdings Section */}
      <Card className="bg-dark text-light mb-4 p-3">
        <h4>Your Account</h4>
        <p><strong>Username:</strong> {user?.username}</p>
        <p><strong>Balance:</strong> ${account?.balance?.toFixed(2) || "0.00"}</p>

        <h5 className="mt-3">Portfolio Holdings</h5>
        {Object.keys(totalHoldings).length > 0 ? (
          <ul>
            {Object.entries(totalHoldings).map(([symbol, amount]) => (
              <li key={symbol}>
                {symbol}: {amount}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">You don't own any stocks yet.</p>
        )}
      </Card>

      {/* Stock Table */}
      <Card className="bg-secondary text-light p-3">
        <Table striped bordered hover responsive variant="dark">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Price</th>
              <th>Buy</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((stk) => (
              <tr key={stk.id}>
                <td>{stk.symbol}</td>
                <td>{stk.name}</td>
                <td>${stk.price}</td>
                <td>
                  <Button variant="outline-success" onClick={() => handleOpenModal(stk)}>
                    Buy
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Buy Modal */}
      <Modal show={show} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Buy {selectedStock?.symbol}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Amount to Buy</Form.Label>
              <Form.Control
                type="number"
                value={amount}
                min={1}
                required
                onChange={(e) => setAmount(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Purchase
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
