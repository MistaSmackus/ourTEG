import { useEffect, useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export default function ChangeHours() {

  //const [market, setMarket] = useState<Array<Schema["Markethours"]["type"]>>([]);
  //const [days, setDays] = useState<Array<Schema["Marketdays"]["type"]>>([]);//
  const [open, setOpen] = useState(new Date());
  const [close, setClose] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const subscription = client.models.Markethours.observeQuery().subscribe({
      next: (data) => setMarket(data.items),
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = client.models.Marketdays.observeQuery().subscribe({
      next: (data) => setDays(data.items),
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleHoursSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const openTime = open.toLocaleTimeString();
    const closeTime = close.toLocaleTimeString();

    const confirm = window.confirm(`Set market hours:\nOpen: ${openTime}\nClose: ${closeTime}?`);
    if (!confirm) return;

    client.models.Markethours.create({
      open: openTime,
      close: closeTime,
    }).then(() => {
      alert("Market hours updated successfully.");
    }).catch((err) => {
      console.error("Error saving market hours:", err);
      alert("Failed to update market hours.");
    });
  };

  const handleDaysSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedDates = selectedDates
      .map(date => date.toDateString()) // Example: "Mon Apr 25 2025"
      .join(", ");

    alert(`Selected closed days:\n${formattedDates}`);

    client.models.Marketdays.create({
      closedays: formattedDates,
    }).then(() => {
      alert("Closed days updated successfully.");
    }).catch((err) => {
      console.error("Error saving closed days:", err);
      alert("Failed to update closed days.");
    });
  };

  return (
    <Container fluid className="min-vh-100 d-flex flex-column align-items-center py-5">
      <div className="text-center mb-5">
        <h1>Market Hour Management</h1>
        <h2 className="text-muted">Current Time: {currentTime.toLocaleTimeString()}</h2>
      </div>

      {/* Change Market Hours */}
      <Form onSubmit={handleHoursSubmit} className="w-50 mb-5">
        <h3>Set Market Hours</h3>
        <Form.Group className="mb-3">
          <Form.Label className="text-muted">Opening Time</Form.Label>
          <br />
          <DatePicker
            selected={open}
            onChange={(time) => time && setOpen(time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
          />
          <br /><br />
          <Form.Label className="text-muted">Closing Time</Form.Label>
          <br />
          <DatePicker
            selected={close}
            onChange={(time) => time && setClose(time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
          />
        </Form.Group>
        <Button variant="outline-primary" type="submit">Submit Hours</Button>
      </Form>

      {/* Select Market Closed Days */}
      <Form onSubmit={handleDaysSubmit} className="w-50">
        <h3>Select Closed Market Days</h3>
        <Form.Group className="mb-3">
          <Form.Label className="text-muted">Select Dates</Form.Label>
          <br />
          <DatePicker
            selected={selectedDates[0]}
            onChange={(dates: any) => setSelectedDates(dates)}
            selectsMultiple
            shouldCloseOnSelect={false}
            placeholderText="Click to select multiple dates"
          />
        </Form.Group>
        <Button variant="outline-primary" type="submit">Save Closed Days</Button>
      </Form>
    </Container>
  );
}
