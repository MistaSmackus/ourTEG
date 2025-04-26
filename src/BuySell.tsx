import { useAuthenticator } from '@aws-amplify/ui-react';
import { Container, Card, Accordion, Button, Modal, Form, Table, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export default function BuySell() {
  const { user: _user } = useAuthenticator(); // Prefix to silence unused warning
  const [stock, setStock] = useState<Array<Schema["Stock"]["type"]>>([]);
  const [account, setAccount] = useState<Array<Schema["Account"]["type"]>>([]);
  const [ownedStock, setOwnedStock] = useState<Array<Schema["Ownedstock"]["type"]>>([]);

  const [buyShow, setBuyShow] = useState(false);
  const handleBuyClose = () => setBuyShow(false);
  const handleBuyShow = () => setBuyShow(true);

  const [stockBuyIndex, setStockBuyIndex] = useState<number>(0);
  const [stockBuyAmount, setStockBuyAmount] = useState<number>(0);

  useEffect(() => {
    const stockSub = client.models.Stock.observeQuery().subscribe({ next: (data) => setStock([...data.items]) });
    const accountSub = client.models.Account.observeQuery().subscribe({ next: (data) => setAccount([...data.items]) });
    const ownedStockSub = client.models.Ownedstock.observeQuery().subscribe({ next: (data) => setOwnedStock([...data.items]) });

    return () => {
      stockSub.unsubscribe();
      accountSub.unsubscribe();
      ownedStockSub.unsubscribe();
    };
  }, []);

  async function buyStock() {
    const selectedStock = stock[stockBuyIndex];
    const sharesToBuy = stockBuyAmount;

    if (sharesToBuy <= 0 || isNaN(sharesToBuy)) {
      alert("Invalid number of shares.");
      handleBuyClose();
      return;
    }

    const totalCost = Number((sharesToBuy * Number(selectedStock.price)).toFixed(2));

    if (account.length === 0) {
      alert("You have no money. Deposit funds to buy stocks.");
      handleBuyClose();
      return;
    }

    const oldBalance = Number(account[0].balance);

    if (oldBalance < totalCost) {
      alert(`Not enough balance to buy ${selectedStock.name}. Needed: $${totalCost}`);
      handleBuyClose();
      return;
    }

    try {
      const existingOwned = ownedStock.find((os) => os.stockId === selectedStock.id);

      if (existingOwned) {
        await client.models.Ownedstock.update({
          id: existingOwned.id,
          currentPrice: selectedStock.price,
          stockName: selectedStock.name,
          owns: true,
          stockId: selectedStock.id,
          shares: (Number(existingOwned.shares) + sharesToBuy).toFixed(2),
        });
      } else {
        await client.models.Ownedstock.create({
          currentPrice: selectedStock.price,
          stockName: selectedStock.name,
          owns: true,
          stockId: selectedStock.id,
          shares: sharesToBuy.toFixed(2),
        });
      }

      await client.models.Transaction.create({
        type: "buystock",
        amount: totalCost.toFixed(2),
        date: new Date().toISOString().split("T")[0],
        stock: selectedStock.name,
        owns: true,
        success: true,
        stockId: selectedStock.id,
        shares: sharesToBuy.toFixed(2),
      });

      const newBalance = oldBalance - totalCost;
      const newAccountValue = Number(account[0].accountvalue) + totalCost;

      await client.models.Account.update({
        id: account[0].id,
        balance: newBalance.toFixed(2),
        accountvalue: newAccountValue.toFixed(2),
      });

      handleBuyClose();
    } catch (err) {
      console.error("Failed to buy stock:", err);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <Container className="py-4">
      <h1 className="text-white text-center mb-4">Time to Engage</h1>

      <Card className="mb-5">
        <Card.Header><h4>Available Stocks</h4></Card.Header>
        <Card.Body>
          <Accordion>
            {stock.map((s, index) => (
              <Accordion.Item eventKey={s.id} key={s.id}>
                <Accordion.Header>
                  <Col>{s.name}</Col>
                  <Col>${s.price}</Col>
                </Accordion.Header>
                <Accordion.Body>
                  <Table striped bordered hover responsive>
                    <thead><tr><th>Company Name</th><th>Symbol</th><th>Price</th><th>Buy</th></tr></thead>
                    <tbody>
                      <tr>
                        <td>{s.name}</td>
                        <td>{s.symbol}</td>
                        <td>{s.price}</td>
                        <td>
                          <Button variant="primary" onClick={() => { setStockBuyIndex(index); handleBuyShow(); }}>
                            Buy {s.name}
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Card.Body>
      </Card>

      <Modal show={buyShow} onHide={handleBuyClose} backdrop="static" keyboard={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>Buy Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select Stock:</Form.Label>
              <Form.Select
                value={stockBuyIndex}
                onChange={(e) => setStockBuyIndex(Number(e.target.value))}
              >
                {stock.map((s, index) => (
                  <option key={s.id} value={index}>{s.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Number of Shares:</Form.Label>
              <Form.Control
                type="number"
                placeholder="0"
                value={stockBuyAmount}
                onChange={(e) => setStockBuyAmount(Number(e.target.value))}
              />
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={handleBuyClose} className="me-2">Cancel</Button>
              <Button variant="primary" onClick={buyStock}>Confirm Purchase</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
