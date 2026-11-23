// src/server.ts
import { createApp } from './app';

const PORT = Number(process.env.PORT || 3000);
const app = createApp();

app.listen(PORT, () => {
  console.log(`StockAlert Web API corriendo en http://localhost:${PORT}`);
});