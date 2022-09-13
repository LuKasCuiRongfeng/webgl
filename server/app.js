import express from "express";
import cors from "cors";

const PORT = 20000;
const app = express();

app.use(
    cors({
        origin: "*",
    })
);

app.use("/assets", express.static("assets"));

app.listen(PORT, () => {
    console.log(`server runs port: ${PORT}`);
});
