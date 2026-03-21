import { exists, stat } from "fs/promises";

console.log("Listening on port 3001");
Bun.serve({
    port: 3001,
    async fetch(req) {
        if (req.method === "GET") {
            const path = "./bundle" + new URL(req.url).pathname;
            const e = await exists(path);
            if (e) {
                const result = await stat(path);
                if (result.isFile())
                    return new Response(Bun.file(path));
            } 
            return new Response(Bun.file("./bundle/index.html"));
        } else {
            return new Response("Method not allowed", { status: 405 });
        }
    },
});
