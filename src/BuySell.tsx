import { useAuthenticator } from '@aws-amplify/ui-react';
import {
  Container,
  Col,
  Table,
  Card,
  Accordion,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
//import {Col,Button, Alert,} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export default function BuySell() {
    const {user} = useAuthenticator();
    const [stock, setStock] = useState<Array<Schema["Stock"]["type"]>>([]);
    const [account, setAccount] = useState<Array<Schema["Account"]["type"]>>([]);
    const [transaction, setTransaction] = useState<Array<Schema["Transaction"]["type"]>>([]);
    const [ownedStock, setOwnedStock] = useState<Array<Schema["Ownedstock"]["type"]>>([]);

    const [buyShow, setBuyShow] = useState(false);
    const handleBuyClose = () => setBuyShow(false);
    const handleBuyShow = () => setBuyShow(true);

    const [sellShow, setSellShow] = useState(false);
    const handleSellClose = () => setSellShow(false);
    const handleSellShow = () => setSellShow(true);

    const [stockBuyIndex, setStockBuyIndex] = useState("");
    const [stockBuyAmount, setStockBuyAmount] = useState("");

        useEffect(() => {
            client.models.Stock.observeQuery().subscribe({
              next: (data) => setStock([...data.items]),
            });
    
        }, []);

        useEffect(() => {
            client.models.Transaction.observeQuery().subscribe({
                next: (data) => setTransaction([...data.items]),
            });
    
        }, []);   
    
            
        useEffect(() => {
            client.models.Account.observeQuery().subscribe({
                next: (data) => setAccount([...data.items]),
            });
    
        }, []); 

                    
        useEffect(() => {
            client.models.Ownedstock.observeQuery().subscribe({
                next: (data) => setOwnedStock([...data.items]),
            });
    
        }, []); 
    console.log(transaction);
    console.log(ownedStock);

    {/*function buyStock() {
        console.log(stock[Number(stockBuyIndex)].name);
        console.log(stockBuyAmount);
        let newDate = new Date();
        let date = newDate.getDate();
        let month = newDate.getMonth() + 1;
        let year = newDate.getFullYear();
        let transAmount = Number((Number(stockBuyAmount)*Number(stock[Number(stockBuyIndex)].price)).toFixed(2));
        let shareAmount = Number(stockBuyAmount).toFixed(2).toString();
        let oldBal = Number(account[0].balance)
        let newBal = 0;
        let newAccountVal = 0;

        if(account.length===0){
            window.alert("You have no money. Deposit funds to buy stocks.");
        }
        else if(account.length===1 && (oldBal < transAmount)) {
            client.models.Transaction.create({
                type: "buystock",
                amount: transAmount.toString(), 
                date: `${year}-${month}-${date}`,
                stock: stock[Number(stockBuyIndex)].name,
                owns: false,
                success: false,
                stockId: stock[Number(stockBuyIndex)].id,
                shares: shareAmount,
            }); 

            window.alert("You do not have enough money to buy: "+ stock[Number(stockBuyIndex)].name +". Deposit funds to buy these shares which cost: $" + transAmount +".");
        }
        else if (account.length===1 && (oldBal >= transAmount)){
            if(ownedStock.includes(stock[Number(stockBuyIndex)]) === false) {
                client.models.Transaction.create({
                    type: "buystock",
                    amount: transAmount.toString(), 
                    date: `${year}-${month}-${date}`,
                    stock: stock[Number(stockBuyIndex)].name,
                    owns: true,
                    success: true,
                    stockId: stock[Number(stockBuyIndex)].id,
                    shares: shareAmount,
                });

                client.models.Ownedstock.create({
                   currentPrice:  stock[Number(stockBuyIndex)].price,
                   stockName: stock[Number(stockBuyIndex)].name,
                   owns: true,
                   stockId: stock[Number(stockBuyIndex)].id,
                   shares: shareAmount,
                });

                newBal = oldBal - transAmount;
                newAccountVal = Number(account[0].accountvalue) + transAmount;

                client.models.Account.update({
                    id: account[0].id,
                    balance: newBal.toFixed(2).toString(),
                    accountvalue:  newAccountVal.toFixed(0).toString(),
                })
            }
            else {
                for(let st in ownedStock) {
                    if(stock[Number(stockBuyIndex)].id === ownedStock[st].stockId) {
                        client.models.Ownedstock.update({
                            id: ownedStock[st].id,
                            currentPrice:  stock[Number(stockBuyIndex)].price,
                            stockName: stock[Number(stockBuyIndex)].name,
                            owns: true,
                            stockId: stock[Number(stockBuyIndex)].id,
                            shares: shareAmount,
                        });

                        break;
                    }

                    
                }

                client.models.Transaction.create({
                    type: "buystock",
                    amount: transAmount.toString(), 
                    date: `${year}-${month}-${date}`,
                    stock: stock[Number(stockBuyIndex)].name,
                    owns: true,
                    success: true,
                    stockId: stock[Number(stockBuyIndex)].id,
                    shares: shareAmount,
                });

                client.models.Account.update({
                    id: account[0].id,
                    balance: newBal.toFixed(2).toString(),
                    accountvalue:  newAccountVal.toFixed(0).toString(),
                });
            }
        }
        handleBuyClose();
    }

    
    function sellStock() {
        console.log("test");
        handleSellClose();
    }*/}
    return(
        <Container className="py-4">
            <h1 className="text-white text-center mb-4">Time to Engage</h1>
            <div className="d-flex justify-content-between align-items-center mb-4">               
                <br/><br/>
                <h2 className="text-muted">Account Balance: ${account.length===1 ? account[0].balance : "0.00"}</h2>
                    <br/><br/>
                <div>
                    <span className="me-3">Welcome, {user?.signInDetails?.loginId?.split("@")[0]}</span>
                </div>
            </div>
    
            <Card className="mb-5">
                <Card.Header><h4>Available Stocks</h4></Card.Header>
                <Card.Body>
                    <Accordion>
                    {stock.map((s) => (
                    <Accordion.Item eventKey={s.id}>
                        <Accordion.Header>
                            <Col>{s.name}</Col> 
                            <Col>{s.price}</Col>
                        </Accordion.Header>
                        <Accordion.Body>
                            <Table striped bordered hover responsive>
                                <thead><tr><th>Company Name</th><th>Symbol</th><th>Price</th><th>Volume</th></tr></thead>
                                <tbody>
                                    <tr>
                                    <td>{s.name}</td>
                                    <td>{s.symbol}</td>
                                    <td>{s.price}</td>
                                    <td>{s.volume}</td>
                                    </tr>
                                </tbody>
                                <thead><tr><th>Owns</th><th>Shares</th><th>Buy</th><th>Sell</th></tr></thead>
                                <tbody>
                                    <tr>
                                    <td>no</td>
                                    <td>no</td>
                                    <td>
                                        <Button variant="primary" onClick={handleBuyShow}>
                                            Buy {s.name}
                                        </Button>
                                    </td>
                                    <td>
                                        <Button variant="primary" onClick={handleSellShow}>
                                            Sell {s.name}
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

            <Modal show={buyShow} onHide={handleBuyClose} backdrop="static" keyboard={false} aria-labelledby="contained-modal-title-vcenter" centered
                className='shadow-lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Buy Stock</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form>
                    <Modal.Title>Select a Stock</Modal.Title>
                    <br/>
                    <Form.Select aria-label="Default select example" id="buySelect" name="buySelect" value={stockBuyIndex} onChange={(e) => setStockBuyIndex(e.target.value)}>
                        {stock.map((s, index) => (
                            <option value={index}>{s.name}</option>
                        ))}    
                    </Form.Select>
                    <br/><br/>
                    <Form.Group className="mb-3" controlId="buyForm.ControlInput1">
                        <Modal.Title>How many shares would you like to purchase?</Modal.Title>
                        <br/>
                        <Form.Control type="text" placeholder="00" autoFocus value={stockBuyAmount} onChange={(e) => setStockBuyAmount(e.target.value)}/>
                    </Form.Group>
                    <br/>
                    <Modal.Title>That many shares will cost: {(Number(stockBuyAmount)*Number(stock[Number(stockBuyIndex)].price)).toFixed(2).toString()}</Modal.Title>
                    <br/>
                    <Modal.Title className='text-muted'>Your account balance is: ${account.length===1 ? account[0].balance : "0.00"}</Modal.Title>
                    <br/>
                    <Button variant="secondary" onClick={handleBuyClose}>Cancel</Button>
                    <Button variant="outline-primary" onClick={handleBuyClose}>Confirm Purchase</Button>    
                </Form>                     
                </Modal.Body>

            </Modal>

            <Modal show={sellShow} onHide={handleSellClose} backdrop="static" keyboard={false} aria-labelledby="contained-modal-title-vcenter" centered
                className="shadow-lg">
                <Modal.Header closeButton>
                    <Modal.Title>Sell Stock</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form>
                    <Form.Select aria-label="Default select example">
                        <option>Stocks Available to Sell</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                    </Form.Select>
                    <br/><br/>
                    <Form.Group className="mb-3" controlId="sellForm.ControlInput1">
                        <Modal.Title>How much would you like to sell?</Modal.Title>
                        <br/>
                        <Form.Control type="text" placeholder="00.00" autoFocus/>
                    </Form.Group>
                </Form> 
                </Modal.Body>
                <Modal.Footer>
                        <Button variant="secondary" onClick={handleSellClose}>Cancel</Button>
                        <Button variant="outline-primary" onClick={handleSellClose}>Confirm Sale</Button>
                </Modal.Footer>
            </Modal>
        </Container>

        
    )
}