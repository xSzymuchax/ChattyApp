const app = require("./app");
require("dotenv").config();
const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Auth service running on port ${PORT}`);
});
