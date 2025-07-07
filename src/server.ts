import app from "./app";
import env from "./config/env";


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

app.listen(env.PORT || 3010, () => {
  console.log(`Server running on port ${env.PORT}`);
});
