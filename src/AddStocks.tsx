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
    } catch (err) {
      console.error("Failed to add stock:", err);
    }
  }

  return (
    <Container>
      <h1>Add Stock</h1>
      <Form onSubmit={createStock}>
        <Form.Group>
          <Form.Label>Stock Name</Form.Label>
          <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </Form.Group>
        <Form.Group>
          <Form.Label>Symbol</Form.Label>
          <Form.Control type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} maxLength={5} required />
        </Form.Group>
        <Form.Group>
          <Form.Label>Price</Form.Label>
          <Form.Control type="text" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </Form.Group>
        <Button type="submit">Add</Button>
      </Form>
    </Container>
  );
}