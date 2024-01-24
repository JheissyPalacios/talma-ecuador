import { BrowserRouter, Switch, Route } from 'react-router-dom';
import './App.scss';
import Login from './pages/Login';
import Home from './pages/Home';
import { AppProvider } from './AppProvider';
function App() {
  return (
    <AppProvider>
        <BrowserRouter>
          <Switch>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/home">
              <Home />
            </Route>
          </Switch>
        </BrowserRouter>
    </AppProvider>
  );
}

export default App;
