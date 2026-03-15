import { Route, Router } from "@solidjs/router";
import Base from "./routes/Base";
import Authenticate from "./routes/Authenticate";
import { StateProvider } from "./state";

const App = () => {

  return (
    <>
      <StateProvider>
        <Router>
          <Route path="/authenticate" component={Authenticate} />
          <Route path="/" component={Base} />
          <Route path="/:page" component={Base} matchFilters={{ page: ["about", "services", "resources"] }} />
        </Router>
      </StateProvider>
    </>
  );
};

export default App;
