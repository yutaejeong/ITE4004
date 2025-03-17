const http = require("http");

require("dotenv").config();

const PORT = process.env.PORT || 8080;
const REDIRECT_URL = process.env.REDIRECT_URL;

const server = http.createServer((req, res) => {
  res.writeHead(302, { Location: REDIRECT_URL }); // 302 리디렉션 응답
  res.end(); // 응답 종료
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}, redirecting to ${REDIRECT_URL}`);
});