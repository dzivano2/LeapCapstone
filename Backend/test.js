const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Server is working!');
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Test server running on port ${PORT}`));
