import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import { useEffect, useState } from 'react';
import type { Schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>();

export default function UserTransaction() {
  const [transaction, setTransaction] = useState<Array<Schema["Transaction"]["type"]>>([]);
  const [account, setAccount] = useState<Array<Schema["Account"]["type"]>>([]);
  const [depo, setDepo] = useState('');
  const [withdraw, setWithdraw] = useState('');

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
    const amount = Number(depo);
    if (!depo || isNaN(amount)) {
      alert("Please enter a valid deposit amount.");
      return;
    }

    const newDate = new Date().toISOString();

    if (account.length === 0) {
      await client.models.Transaction.create({
        type: "deposit",
        amount: amount.toFixed(2),
        date: newDate,
        success: true,
      });
      await client.models.Account.create({
        balance: amount.toFixed(2),
      });
    } else {
      const currentBalance = Number(account[0].balance);
      const updatedBalance = currentBalance + amount;

      await client.models.Transaction.create({
        type: "deposit",
        amount: amount.toFixed(2),
        date: newDate,
        success: true,
      });

      await client.models.Account.update({
        id: account[0].id,
        balance: updatedBalance.toFixed(2),
      });
    }

    setDepo('');
  }

  async function createWithdraw(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const amount = Number(withdraw);
    if (!withdraw || isNaN(amount)) {
      alert("Please enter a valid withdrawal amount.");
      return;
    }

    const newDate = new Date().toISOString();

    if (account.length === 0 || Number(account[0].balance) < amount) {
      await client.models.Transaction.create({
        type: "withdraw",
        amount: amount.toFixed(2),
        date: newDate,
        success: false,
      });
      alert("Insufficient balance to withdraw.");
    } else {
      const currentBalance = Number(account[0].balance);
      const updatedBalance = currentBalance - amount;

      await client.models.Transaction.create({
        type: "withdraw",
        amount: amount.toFixed(2),
        date: newDate,
        success: true,
      });

      await client.models.Account.update({
        id: account[0].id,
        balance: updatedBalance.toFixed(2),
      });
    }

    setWithdraw('');
  }

  return (
    <Container fluid className="min-vh-100 d-flex flex-column align-items-center py-5">
      <div className="text-center mb-5">
        <h1>Ready to make a transaction?</h1>
        <h2 className="text-muted">Account Balance: ${account[0]?.balance || "0.00"}</h2>

        <br /><br />
        <h2>Add Funds</h2>
        <Form onSubmit={createDeposits}>
          <Form.Group className="mb-3" controlId="depositInput">
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
          <Form.Group className="mb-3" controlId="withdrawInput">
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
      </div>

      <h1 className="mb-4">Transaction History</h1>
      <Card style={{ width: '100%', maxWidth: '900px' }}>
        <Accordion className="w-100" style={{ minWidth: '700px' }}>
          {transaction.map((trans, index) => (
            <Accordion.Item eventKey={String(index)} key={trans.id}>
              <Accordion.Header className="d-flex justify-content-between">
                <div style={{ flex: 1 }}>
                  {new Date(trans.date || "1970-01-01T00:00:00Z").toLocaleDateString()}
                </div>
                <div style={{ flex: 1 }}>{trans.type}</div>
                <div style={{ flex: 1 }}>
                  {new Date(trans.date || "1970-01-01T00:00:00Z").toLocaleTimeString()}
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <p><strong>Amount:</strong> ${trans.amount}</p>
                <p><strong>Transaction:</strong> {trans.success ? "Success" : "Failure"}</p>
                {trans.stock && <p><strong>Stock:</strong> {trans.stock}</p>}
                {trans.shares && <p><strong>Shares:</strong> {trans.shares}</p>}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Card>
    </Container>
  );
}
