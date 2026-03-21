import { Route, Router } from "@solidjs/router";
import Base from "./routes/Base";
import Authenticate from "./routes/Authenticate";
import { StateProvider } from "./state";
import Home from "./routes/Home";
import About from "./routes/About";
import Services from "./routes/Services";
import Resources from "./routes/Resources";
import NotFound from "./routes/NotFound";

const App = () => {

  return (
    <>
      <StateProvider>
        <Router>
          <Route path="/authenticate" component={Authenticate} />
          <Route path="/" component={Base}>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/services" component={Services} />
            <Route path="/resources" component={Resources} />
            <Route path="*" component={NotFound} />
          </Route>
        </Router>
      </StateProvider>
    </>
  );
};

export default App;
