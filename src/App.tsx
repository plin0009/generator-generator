import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import EditPage from "./pages/Edit";
import GeneratorPage from "./pages/Generator";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/edit/:code?" exact component={EditPage} />
        <Route path="/:code" exact component={GeneratorPage} />
        <Route path="/" exact />
      </Switch>
    </Router>
  );
};

export default App;
