import { Navigate, Route, Router } from "@solidjs/router";
import FormBase from "./components/FormBase";
import { createResource, Show } from "solid-js";
import Login from "./routes/Login";
import ManageAccount from "./routes/ManageAccount";
import Register from "./routes/Register";
import Authenticated from "./components/Authenticated";
import { GlobalStateProvider } from "./context";
import Logout from "./routes/Logout";
import Forgot from "./routes/Forgot";
import { getServerConfiguration } from "@nextania/core-api";

const App = () => {
  const [serverConfig] = createResource(getServerConfiguration);

  return (
    <Show when={!serverConfig.loading && !!serverConfig()} fallback={<div>Loading...</div>}>
      <GlobalStateProvider serverConfig={serverConfig()!}>
        <Router>
          <Route path="/" component={() => (
            <Authenticated>
              <Navigate href="/manage" />
            </Authenticated>
          )} />
          <Route path="/login" component={() => (
            <Authenticated noRedirect>
              <FormBase>
                <Login />
              </FormBase>
            </Authenticated>
          )} />
          <Route path="/register" component={() => (
            <Authenticated noRedirect>
              <FormBase>
                <Register />
              </FormBase>
            </Authenticated>
          )} />
          <Route path="/escalate" component={() => (
            <Authenticated>
              <FormBase>
                <Login escalate />
              </FormBase>
            </Authenticated>
          )} />
          <Route path="/manage/:category?" matchFilters={{ category: ["account", "profile", "sessions"] }} component={() => (
            <Authenticated>
              <ManageAccount />
            </Authenticated>
          )} />
          <Route path="/logout" component={() => (
            <Authenticated noRedirect>
              <FormBase>
                <Logout />
              </FormBase>
            </Authenticated>
          )} />
          <Route path="/forgot" component={() => (
            <Authenticated noRedirect>
              <FormBase>
                <Forgot />
              </FormBase>
            </Authenticated>
          )} />
        </Router>
      </GlobalStateProvider>
    </Show>
  );
};

export default App;
