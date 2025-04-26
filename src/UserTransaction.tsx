import Form from 'react-bootstrap/Form';
import Container from "react-bootstrap/Container";
import Button from 'react-bootstrap/Button';
import Accordion from "react-bootstrap/Accordion";
import Col from 'react-bootstrap/Col';
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export default function UserTransaction() {
  const [transaction, setTransaction] = useState<Array<Schema["Transaction"]["type"]>>([]);
  const [account, setAccount] = useState<Array<Schema["Account"]["type"]>>([]);
  const [depo, setDepo] = useState("");
  const [withdraw, setWithdraw] = useState("");

  useEffect(() => {
    const transactionSub = client.models.Transaction.observeQuery().subscribe({
      next: (data) => setTransaction([...data.items]),
    });
    const accountSub = client.models.Account.observeQuery().subscribe({
      next: (data) => setAccount([...data.items]),
    });
    return () => {
      transactionSub.unsubscribe();
      accountSub.unsubscribe();
    };
  }, []);

  async function createDeposits(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!depo || isNaN(Number(depo))) {
      alert("Please enter a valid deposit amount.");
      return;
    }

    const amount = Number(depo);
    const newDate = new Date().toISOString().split("T")[0];

    if (account.length === 0) {
      await client.models.Transaction.create({
        type: "deposit",
        amount: amount.toFixed(2).toString(),
        date: newDate,
        success: true,
      });
      await client.models.Account.create({
        balance: amount.toFixed(2).toString(),
      });
    } else {
      const oldBal = Number(account[0].balance);
      const newBal = oldBal + amount;

      await client.models.Transaction.create({
        type: "deposit",
        amount: amount.toFixed(2).toString(),
        date: newDate,
        success: true,
      });

      await client.models.Account.update({
        id: account[0].id,
        balance: newBal.toFixed(2).toString(),
      });
    }
    setDepo("");
  }

  async function createWithdraw(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!withdraw || isNaN(Number(withdraw))) {
      alert("Please enter a valid withdrawal amount.");
      return;
    }

    const amount = Number(withdraw);
    const newDate = new Date().toISOString().split("T")[0];

    if (account.length === 0 || Number(account[0].balance) < amount) {
      await client.models.Transaction.create({
        type: "withdraw",
        amount: amount.toFixed(2).toString(),
        date: newDate,
        success: false,
      });
      alert("Insufficient balance to withdraw.");
    } else {
      const oldBal = Number(account[0].balance);
      const newBal = oldBal - amount;

      await client.models.Transaction.create({
        type: "withdraw",
        amount: amount.toFixed(2).toString(),
        date: newDate,
        success: true,
      });

      await client.models.Account.update({
        id: account[0].id,
        balance: newBal.toFixed(2).toString(),
      });
    }
    setWithdraw("");
  }

  return (
    <Container fluid className="min-vh-100 d-flex flex-column align-items-center py-5">
      <div className="text-center mb-8">
        <h1>Ready to make a transaction?</h1>
        <h2 className="text-muted">Account Balance: ${account.length === 1 ? account[0].balance : "0.00"}</h2>
        <br /><br />

        <h2>Add Funds</h2>
        <Form onSubmit={createDeposits}>
          <Form.Group className="mb-3" controlId="depositForm.ControlInput1">
            <Form.Label className="text-muted">Deposit Amount:</Form.Label>
            <Form.Control
              size="lg"
              type="text"
              placeholder="00.00"
              value={depo}
              onChange={(e) => setDepo(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="outline-primary" type="submit">Deposit</Button>
        </Form>
        <br /><br />

        <h2>Withdraw Funds</h2>
        <Form onSubmit={createWithdraw}>
          <Form.Group className="mb-3" controlId="withdrawForm.ControlInput1">
            <Form.Label className="text-muted">Withdraw Amount:</Form.Label>
            <Form.Control
              size="lg"
              type="text"
              placeholder="00.00"
              value={withdraw}
              onChange={(e) => setWithdraw(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="outline-danger" type="submit">Withdraw</Button>
        </Form>
        <br /><br />
      </div>

      <h1>Transaction History</h1>
      <Accordion>
        {transaction.map((trans) => (
          <Accordion.Item eventKey={trans.id} key={trans.id}>
            <Accordion.Header>
              <Col>{trans.date}</Col>
              <Col>{trans.type}</Col>
            </Accordion.Header>
            <Accordion.Body>
              <Col>Amount: ${trans.amount}</Col>
              <Col>Transaction: {trans.success ? "Success" : "Failure"}</Col>
              {trans.stock && <Col>Stock: {trans.stock}</Col>}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
}
