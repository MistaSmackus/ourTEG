import Marquee from "react-fast-marquee";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

const features: { title: string; desc: string }[] = [
  { title: "Real-Time Trading", desc: "Instant market access." },
  { title: "Portfolio Tracking", desc: "Manage your investments." },
  { title: "Market Insights", desc: "AI-driven analytics." },
];

var randIndex;
var randNightChanges = ["1","2"];
var newPrice;
var oldPrice;
var change;
var mentions;


export default function Home(): JSX.Element {
  const [stock, setStock] = useState<Array<Schema["Stock"]["type"]>>([]);
  const [marketval, setMarketVal] = useState<Array<Schema["Marketvalue"]["type"]>>([]);
  //var [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
      client.models.Stock.observeQuery().subscribe({
        next: (data) => setStock([...data.items]),
      });

  }, []); 

  useEffect(() => {
    client.models.Marketvalue.observeQuery().subscribe({
      next: (data) => setMarketVal([...data.items]),
    });

  }, []);

  {/*useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []); */}


  function generateRandomNight() {
    randNightChanges = [];
    for(let i=0; i<5; i++) {
      randIndex = Math.floor(Math.random() * (stock.length - 1));
      randNightChanges.push(stock[randIndex].id);
      change = Math.floor(Math.random() * 10);
      oldPrice = Number(stock[randIndex].price);
      newPrice = oldPrice + change;
      mentions = Math.floor(Math.random() * 100);

      client.models.Stock.update({
        id: randNightChanges[i],
        price: newPrice.toFixed(2).toString(),
        change: "+"+change.toFixed(2).toString(),
        last: oldPrice.toFixed(2).toString(),
        mentions: mentions.toString(),
      });
      
    }

    randNightChanges = [];
    for(let i=0; i<5; i++) {
      randIndex = Math.floor(Math.random() * (stock.length - 1));
      randNightChanges.push(stock[randIndex].id);
      change = Math.floor(Math.random() * 5);
      oldPrice = Number(stock[randIndex].price);
      newPrice = oldPrice - change;
      mentions = Math.floor(Math.random() * 100);

      client.models.Stock.update({
        id: randNightChanges[i],
        price: newPrice.toFixed(2).toString(),
        change: "-"+change.toFixed(2).toString(),
        last: oldPrice.toFixed(2).toString(),
        mentions: mentions.toString(),
      });
      
    }

 
  }

  function generateRandomDayIncrease() {
    randIndex = Math.floor(Math.random() * (stock.length));
    change = Math.floor(Math.random() * 10);
    oldPrice = Number(stock[randIndex].price);
    newPrice = oldPrice + change;
    mentions = Math.floor(Math.random() * 100);
    
    console.log("Changed: "+ stock[randIndex].name);

    client.models.Stock.update({
      id: stock[randIndex].id,
      price: newPrice.toFixed(2).toString(),
      change: "+"+ change.toFixed(2).toString(),
      last: oldPrice.toFixed(2).toString(),
      mentions: mentions.toString(),
    });
  }

  function generateRandomDayDecrease() {
    randIndex = Math.floor(Math.random() * (stock.length));
    oldPrice = Number(stock[randIndex].price);
    change = Math.floor(Math.random() * 10);
    if(change>oldPrice) {
      change = Math.floor(Math.random() * 5);
    }
    newPrice = oldPrice - change;
    mentions = Math.floor(Math.random() * 100);
    
    console.log("Changed: "+ stock[randIndex].name);

    client.models.Stock.update({
      id: stock[randIndex].id,
      price: newPrice.toFixed(2).toString(),
      change: "-" + change.toFixed(2).toString(),
      last: oldPrice.toFixed(2).toString(),
      mentions: mentions.toString(),
    });
  }

  {/*function generateMarketValue() {
    var marVal = 0;
    var setTime = "";

    for(let st in stock) {
      marVal = marVal + Number(stock[st].price);
    }

    setTime = currentTime.toLocaleTimeString().slice(0,5);
    setTime.endsWith(":") ? setTime.charAt(setTime.length - 1).replace(":", "") : setTime;

    client.models.Marketvalue.create({
      value: marVal.toFixed(0).toString(),
      time: setTime,
    });
  }*/}

  //window.onload = generateMarketValue;
  window.onbeforeunload = generateRandomNight;
  setInterval(generateRandomDayIncrease, 90000);
  setInterval(generateRandomDayDecrease, 1000000);

  return (
    <Container fluid className="min-vh-100 d-flex flex-column align-items-center py-5">
      {/* Stock Ticker */}
      <div className="w-100 bg-dark text-white text-center py-2">
        <Marquee>
          {stock.map((s) => (
            <span key={s.id} className="mx-3">
              {s.symbol}: ${s.price}{" "}
              <span className={s.change?.includes("-") ? "text-danger" : "text-success"}>
                ({s.change})
              </span>
            </span>
        
          ))}
        </Marquee>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-4">
        <h1 className="fw-bold">Your Wealth, Your Future -- Powered by Titan.</h1>
        <p className="text-muted">Rise Above. Invest Like a Titan.</p>
      </div>

      {/* Market Overview */}
      <Card className="w-100 shadow-sm mb-4" style={{ maxWidth: "600px" }}>
        <Card.Body>
          <h2 className="h5 mb-3">Market Snapshot</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={marketval}>
              <XAxis dataKey="time" stroke="#888"/>
              <YAxis domain={[100, 1000]} stroke="#888" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#007bff" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      {/* Features Section */}
      <Container>
        <Row className="g-3">
          {features.map((feature, index) => (
            <Col key={index} md={4}>
              <Card className="p-3 text-center shadow-sm">
                <Card.Body>
                  <h5>{feature.title}</h5>
                  <p className="text-muted">{feature.desc}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  );
}