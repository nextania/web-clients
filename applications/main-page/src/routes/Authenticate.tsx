import { useNavigate, useSearchParams } from "@solidjs/router";
import { onMount } from "solid-js";
import { getUser } from "../state";

const Authenticate = () => {
    const [params] = useSearchParams();
    const n = useNavigate();
    onMount(async () => {
        if (typeof params.token === "string") {
            const user = await getUser(params.token);
            if (user) localStorage.setItem("token", params.token);
            const continuePath = typeof params.continue === "string" ? params.continue : "/";
            n(continuePath);
        }
    });
    return (
        <div>
            <p>Authenticating...</p>
            <p>If you are stuck on this message, this is a bug.</p>
        </div>
    );
};
export default Authenticate;