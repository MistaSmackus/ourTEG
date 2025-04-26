import { useAuthenticator } from "@aws-amplify/ui-react";
import { Container, Card, Accordion, Button, Modal, Form, Table, Col, Toast, ToastContainer } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export default function BuySell() {
  const { user } = useAuthenticator();
  const [stock, setStock] = useState<Schema["Stock"]["type"][]>([]);
  const [account, setAccount] = useState<Schema["Account"]["type"][]>([]);
  const [ownedStock, setOwnedStock] = useState<Schema["Ownedstock"]["type"][]>([]);

  const [buyShow, setBuyShow] = useState(false);
  const [sellShow, setSellShow] = useState(false);
  const [stockIndex, setStockIndex] = useState(0);
  const [shareAmount, setShareAmount] = useState(0);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const stockSub = client.models.Stock.observeQuery().subscribe({
      next: (data) => setStock([...data.items]),
    });
    const accountSub = client.models.Account.observeQuery().subscribe({
      next: (data) => setAccount([...data.items]),
    });
    const ownedStockSub = client.models.Ownedstock.observeQuery().subscribe({
      next: (data) => setOwnedStock([...data.items]),
    });

    return () => {
      stockSub.unsubscribe();
      accountSub.unsubscribe();
      ownedStockSub.unsubscribe();
    };
  }, []);

  const handleBuyClose = () => setBuyShow(false);
  const handleBuyShow = (index: number) => {
    setStockIndex(index);
    setShareAmount(0);
    setBuyShow(true);
  };

  const handleSellClose = () => setSellShow(false);
  const handleSellShow = (index: number) => {
    setStockIndex(index);
    setShareAmount(0);
    setSellShow(true);
  };

  async function buyStock() {
    const selected = stock[stockIndex];
    if (!selected || shareAmount <= 0 || isNaN(shareAmount)) return;

    const totalCost = Number(selected.price) * shareAmount;
    const userAccount = account[0];
    if (!userAccount || Number(userAccount.balance) < totalCost) return;

    const existing = ownedStock.find((o) => o.stockId === selected.id);
    if (existing) {
      await client.models.Ownedstock.update({
        id: existing.id,
        shares: (Number(existing.shares) + shareAmount).toFixed(2),
      });
    } else {
      await client.models.Ownedstock.create({
        stockId: selected.id,
        stockName: selected.name,
        currentPrice: selected.price,
        shares: shareAmount.toFixed(2),
        owns: true,
      });
    }

    await client.models.Transaction.create({
      type: "buystock",
      amount: totalCost.toFixed(2),
      date: new Date().toISOString(),
      stock: selected.name,
      owns: true,
      success: true,
      stockId: selected.id,
      shares: shareAmount.toFixed(2),
    });

    await client.models.Account.update({
      id: userAccount.id,
      balance: (Number(userAccount.balance) - totalCost).toFixed(2),
      accountvalue: (Number(userAccount.accountvalue) + totalCost).toFixed(2),
    });

    setToastMessage(`Bought ${shareAmount} share(s) of ${selected.name}!`);
    setBuyShow(false);
  }

  async function sellStock() {
    const selected = stock[stockIndex];
    const holding = ownedStock.find((o) => o.stockId === selected.id);
    if (!holding || shareAmount <= 0 || Number(holding.shares) < shareAmount) return;

    const totalGain = Number(selected.price) * shareAmount;
    const newShareCount = Number(holding.shares) - shareAmount;

    if (newShareCount === 0) {
      await client.models.Ownedstock.delete({ id: holding.id });
    } else {
      await client.models.Ownedstock.update({
        id: holding.id,
        shares: newShareCount.toFixed(2),
      });
    }

    await client.models.Transaction.create({
      type: "sellstock",
      amount: totalGain.toFixed(2),
      date: new Date().toISOString(),
      stock: selected.name,
      owns: false,
      success: true,
      stockId: selected.id,
      shares: shareAmount.toFixed(2),
    });

    const userAccount = account[0];
    await client.models.Account.update({
      id: userAccount.id,
      balance: (Number(userAccount.balance) + totalGain).toFixed(2),
      accountvalue: (Number(userAccount.accountvalue) - totalGain).toFixed(2),
    });

    setToastMessage(`Sold ${shareAmount} share(s) of ${selected.name}!`);
    setSellShow(false);
  }

  const availableShares = (stockId: string) => {
    const owned = ownedStock.find((o) => o.stockId === stockId);
    return owned ? Number(owned.shares) : 0;
  };

  return (
    <Container className="py-5">
      <h1 className="text-white text-center mb-4">Time to Engage</h1>
      <Card>
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
                  <Table>
                    <thead><tr><th>Name</th><th>Symbol</th><th>Buy</th><th>Sell</th></tr></thead>
                    <tbody>
                      <tr>
                        <td>{s.name}</td>
                        <td>{s.symbol}</td>
                        <td>
                          <Button onClick={() => handleBuyShow(index)}>Buy</Button>
                        </td>
                        <td>
                          <Button variant="danger" onClick={() => handleSellShow(index)}>Sell</Button>
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

      {/* Buy Modal */}
      <Modal show={buyShow} onHide={handleBuyClose} centered>
        <Modal.Header closeButton><Modal.Title>Buy Stock</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Shares</Form.Label>
            <Form.Control type="number" value={shareAmount} onChange={(e) => setShareAmount(Number(e.target.value))} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleBuyClose}>Cancel</Button>
          <Button onClick={buyStock}>Confirm Buy</Button>
        </Modal.Footer>
      </Modal>

      {/* Sell Modal */}
      <Modal show={sellShow} onHide={handleSellClose} centered>
        <Modal.Header closeButton><Modal.Title>Sell Stock</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Shares (Available: {availableShares(stock[stockIndex]?.id)})</Form.Label>
            <Form.Control type="number" value={shareAmount} onChange={(e) => setShareAmount(Number(e.target.value))} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleSellClose}>Cancel</Button>
          <Button variant="danger" onClick={sellStock}>Confirm Sell</Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Message */}
      <ToastContainer position="bottom-center" className="mb-4">
        <Toast show={!!toastMessage} onClose={() => setToastMessage("")} delay={2500} autohide bg="success">
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}
