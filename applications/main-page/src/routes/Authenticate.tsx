import { useNavigate, useSearchParams } from "@solidjs/router";
import { onMount } from "solid-js";
import { saveUser } from "../state";

const Authenticate = () => {
    const [params] = useSearchParams();
    const n = useNavigate();
    onMount(async () => {
        if (typeof params.token === "string" && typeof params.continue === "string") {
            const result = (await saveUser(params.token).catch(() => {})) ?? false;
            if (result) localStorage.setItem("token", params.token);
            const continuePath = params.continue || "/";
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