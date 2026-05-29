import fetch from 'node-fetch';

async function run() {
  try {
    const response = await fetch(`http://localhost:3000/api/boxoffice?targetDt=20260528`);
    console.log("Status:", response.status);
    const data = await response.text();
    console.log("Data:", data.substring(0, 100));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
