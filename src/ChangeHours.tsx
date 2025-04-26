import { useEffect, useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export default function ChangeHours() {
  const [market, setMarket] = useState<Array<Schema["Markethours"]["type"]>>([]);
  const [days, setDays] = useState<Array<Schema["Marketdays"]["type"]>>([]);
  const [open, setOpen] = useState(new Date());
  const [close, setClose] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const sub = client.models.Markethours.observeQuery().subscribe({
      next: (data) => setMarket(data.items),
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const sub = client.models.Marketdays.observeQuery().subscribe({
      next: (data) => setDays(data.items),
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleHoursSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const openTime = open.toLocaleTimeString();
    const closeTime = close.toLocaleTimeString();

    const confirmed = window.confirm(`Confirm new hours:\nOpen: ${openTime}\nClose: ${closeTime}`);
    if (!confirmed) return;

    client.models.Markethours.create({ open: openTime, close: closeTime })
      .then(() => alert("Market hours saved successfully."))
      .catch((err) => {
        console.error("Error saving hours:", err);
        alert("Failed to save hours.");
      });
  };

  const handleDaysSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDates.length) return alert("No dates selected.");

    const formatted = selectedDates.map(d => d.toDateString()).join(", ");

    alert(`Saving closed days:\n${formatted}`);

    client.models.Marketdays.create({ closedays: formatted })
      .then(() => alert("Closed days saved successfully."))
      .catch((err) => {
        console.error("Error saving days:", err);
        alert("Failed to save closed days.");
      });
  };

  return (
    <Container fluid className="min-vh-100 py-5 d-flex flex-column align-items-center">
      <div className="text-center mb-5">
        <h1 className="mb-2">Market Hour Management</h1>
        <h5 className="text-muted">Current Time: {currentTime.toLocaleTimeString()}</h5>
      </div>

      {/* Set Hours */}
      <Form onSubmit={handleHoursSubmit} className="w-50 mb-5">
        <h3>Set Market Open/Close Hours</h3>
        <Form.Group className="mb-3">
          <Form.Label>Opening Time</Form.Label>
          <br />
          <DatePicker
            selected={open}
            onChange={(t) => t && setOpen(t)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Closing Time</Form.Label>
          <br />
          <DatePicker
            selected={close}
            onChange={(t) => t && setClose(t)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
          />
        </Form.Group>
        <Button variant="outline-primary" type="submit">Submit Hours</Button>
      </Form>

      {/* Select Closed Days */}
      <Form onSubmit={handleDaysSubmit} className="w-50 mb-5">
        <h3>Select Market Closed Days</h3>
        <Form.Group className="mb-3">
          <Form.Label>Select Dates</Form.Label>
          <br />
          <DatePicker
            selectsMultiple
            selectedDates={selectedDates}
            onChange={(dates: any) => setSelectedDates(dates)}
            shouldCloseOnSelect={false}
            placeholderText="Choose multiple dates"
          />
        </Form.Group>
        <Button variant="outline-primary" type="submit">Save Closed Days</Button>
      </Form>

      {/* Display Saved Info */}
      <div className="w-75 mt-4">
        <h4 className="text-info">Saved Market Hours</h4>
        {market.length ? (
          <ul>
            {market.map((entry, idx) => (
              <li key={idx}>
                Open: {entry.open} &nbsp;&nbsp;|&nbsp;&nbsp; Close: {entry.close}
              </li>
            ))}
          </ul>
        ) : <p className="text-muted">No market hours saved.</p>}

        <h4 className="mt-4 text-info">Saved Closed Dates</h4>
        {days.length ? (
          <ul>
            {days.map((entry, idx) => (
              <li key={idx}>
                {entry.closedays?.split(",").map((date, i) => (
                  <div key={i}>{date.trim()}</div>
                ))}
              </li>
            ))}
          </ul>
        ) : <p className="text-muted">No closed dates saved.</p>}
      </div>
    </Container>
  );
}
