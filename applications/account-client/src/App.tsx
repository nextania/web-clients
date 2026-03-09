import { Navigate, Route, Router } from "@solidjs/router";
import FormBase from "./components/FormBase";
import { createSignal, onMount } from "solid-js";
import Login from "./routes/Login";
import ManageAccount from "./routes/ManageAccount";
import Register from "./routes/Register";
import Authenticated from "./components/Authenticated";
import { StateProvider, state } from "./context";
import Logout from "./routes/Logout";
import Forgot from "./routes/Forgot";
import { getServerConfiguration } from "@nextania/core-api";

const App = () => {
  const [loading, setLoading] = createSignal(false);

  onMount(async () => {
    try {
      const config = await getServerConfiguration();
      state.set("serverConfig", config);
    } catch {}
  });

  return (
      <StateProvider>
        <Router>
          <Route path="/" component={() => (
            <Authenticated>
              <Navigate href="/manage" />
            </Authenticated>
          )} />
          <Route path="/login" component={() => (
            <FormBase loading={loading}>
              <Login loading={loading} setLoading={setLoading} />
            </FormBase>
          )} />
          <Route path="/register" component={() => (
            <FormBase loading={loading}>
              <Register loading={loading} setLoading={setLoading} />
            </FormBase>
          )} />
          <Route path="/escalate" component={() => (
            <Authenticated>
              <FormBase loading={loading}>
                <Login loading={loading} setLoading={setLoading} escalate />
              </FormBase>
            </Authenticated>
          )} />
          <Route path="/manage/:category?" matchFilters={{ category: ["account", "profile", "sessions"] }} component={() => (
            <Authenticated>
              <ManageAccount loading={loading} setLoading={setLoading} />
            </Authenticated>
          )} />
          <Route path="/logout" component={() => (
            <FormBase loading={loading}>
              <Logout />
            </FormBase>
          )} />
          <Route path="/forgot" component={() => (
            <FormBase loading={loading}>
              <Forgot loading={loading} setLoading={setLoading}/>
            </FormBase>
          )} />
        </Router>
      </StateProvider>
  );
};

export default App;
