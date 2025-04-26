import { useAuthenticator } from '@aws-amplify/ui-react';
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Dropdown from "react-bootstrap/Dropdown";
import { BrowserRouter as Router, Route, Routes, NavLink} from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import './App.css';
import Home from './Home.tsx';
import Portfolio from "./Portfolio.tsx";
import Market from './Market.tsx';
import UserTransaction from './UserTransaction.tsx';
import Admin from './Admin.tsx';
import AddStocks from './AddStocks.tsx';
import ChangeHours from './ChangeHours.tsx';
import BuySell from './BuySell.tsx';

export default function App() {

  const {user, signOut} = useAuthenticator();
  return (
    <main>
        <Router>
          <Nav variant="tabs" className="bg-body-tertiary">
            <Nav.Item>
              <NavLink to="/" className="nav-link">Titan Equity Group</NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/portfolio" className="nav-link">Your Portfolio</NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/market" className="nav-link">Market Overview</NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/buysell" className="nav-link">Buy Sell</NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/userTransaction" className="nav-link">Move Money</NavLink>
            </Nav.Item>
            <Nav.Item>
              <Dropdown as={Nav.Item} id="adminMenu">
                <Dropdown.Toggle as={NavLink} to="/admin">Admin Menu</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={NavLink} to="/addStocks">Add Stocks</Dropdown.Item>
                  <Dropdown.Item as={NavLink} to="/changeHours">Change Hours</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav.Item> 
            <Nav.Item>
              <Button onClick={signOut} id="signOutButton">Sign out</Button>
            </Nav.Item>

          </Nav>
          <Navbar.Text className="justify-content-end">Signed In as: {user?.signInDetails?.loginId?.split("@")[0]}</Navbar.Text>
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />}/>
            <Route path="/market" element={<Market />}/>
            <Route path="/buysell" element={<BuySell />}/>
            <Route path="/userTransaction" element={<UserTransaction />}/>
            <Route path="/admin" element={user?.signInDetails?.loginId?.includes("@asu.edu") ? <Admin /> : <Home />}/> 
            <Route path="/addstocks" element={user?.signInDetails?.loginId?.includes("@asu.edu") ? <AddStocks/> : <Home />}></Route>
            <Route path="/changeHours" element={user?.signInDetails?.loginId?.includes("@asu.edu") ? <ChangeHours/> : <Home />}></Route>
          </Routes>

        </Router>

      {/* Footer */}
      <footer className="mt-4 text-muted">
        <p>&copy; {new Date().getFullYear()} Titan Equity Group. All rights reserved.</p>
      </footer>
    </main>
  );
}