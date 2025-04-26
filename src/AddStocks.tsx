import Form from 'react-bootstrap/Form';
import Container from "react-bootstrap/Container";
import Button from 'react-bootstrap/Button';
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export default function AddStocks() {
  const [stock, setStock] = useState<Array<Schema["Stock"]["type"]>>([]);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [price, setPrice] = useState<string>("");

  useEffect(() => {
    const subscription = client.models.Stock.observeQuery().subscribe({
      next: (data) => setStock([...data.items]),
    });
    return () => subscription.unsubscribe();
  }, []);

  async function createStock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!price || isNaN(Number(price))) {
      alert("Enter a valid price.");
      return;
    }
    try {
      await client.models.Stock.create({
        name: name,
        symbol: symbol,
        price: Number(price).toFixed(2).toString(),
      });
      setName("");
      setSymbol("");
      setPrice("");
      alert("Stock added successfully!");
    } catch (err) {
      console.error("Failed to add stock:", err);
      alert("Something went wrong.");
    }
  }

  return (
    <Container fluid className="min-vh-100 d-flex flex-column align-items-center py-5">
      <div className="text-center mb-8">
        <h1>Add or Remove Stocks</h1>
        <h2 className="text-muted">Current Total Stocks: {stock.length}</h2>
        <br /><br />

        <h2>Add Stock</h2>
        <Form onSubmit={createStock}>
          <Form.Group className="mb-3" controlId="stockName">
            <Form.Label className="text-muted">Stock Name:</Form.Label>
            <Form.Control
              size="lg"
              type="text"
              placeholder="e.g., ABCDEF Company"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="stockSymbol">
            <Form.Label className="text-muted">Stock Symbol:</Form.Label>
            <Form.Control
              size="lg"
              type="text"
              placeholder="Max 5 characters"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              maxLength={5}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="stockPrice">
            <Form.Label className="text-muted">Stock Price:</Form.Label>
            <Form.Control
              size="lg"
              type="text"
              placeholder="e.g., 00.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="outline-primary" type="submit">Add Stock</Button>
        </Form>
        <br /><br />
      </div>
    </Container>
  );
}
