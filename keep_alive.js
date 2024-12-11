import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

// Respond to any HTTP request, keeping the bot alive
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Start the server
app.listen(port, () => {
  console.log(`Keep-alive server running on port ${port}`);
});
