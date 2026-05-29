import fetch from 'node-fetch'; // if needed, or native fetch

async function run() {
  const apiKey = "fae42173511206256b61922e81229d4b";
  const targetDt = "20260528";
  
  try {
    const response = await fetch(`http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${apiKey}&targetDt=${targetDt}`);
    console.log("Status:", response.status);
    const data = await response.text();
    console.log("Data:", data.substring(0, 100));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
