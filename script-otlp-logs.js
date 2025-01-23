import http from "k6/http";
import { check, sleep } from "k6";

const url = "http://localhost:4318/v1/logs";

export const options = {
  vus: 1,
  // iterations: 1,
  duration: "60m",
};

function randomString(length) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function randomTimestampUnixEpochNano() {
  return (Date.now() * 1e6).toString();
}

function randomHexId(size) {
  return [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
}

function randomLogLevel() {
  return ["ERROR", "WARN", "INFO", "DEBUG"][Math.floor(Math.random() * 4)];
}

// 25% GET, 75% POST
function randomHttpMethod() {
  const randomNumber = Math.random() * 100;
  if (randomNumber < 50) {
    return "GET";
  }
  return "POST";
}

function randomHttpStatusCode() {
  const randomNumber = Math.random() * 100;
  if (randomNumber < 50) {
    return "200";
  }
  return "500";
}

function randomReferenceUrl() {
  return ["/cart", "/checkout", "/order", "/user", "/", "/health"][
    Math.floor(Math.random() * 6)
  ];
}

function getPayload() {
  const timestamp = randomTimestampUnixEpochNano();
  const payload = JSON.stringify({
    resourceLogs: [
      {
        resource: {
          attributes: [
            {
              key: "service.name",
              value: {
                stringValue: "k6mock",
              },
            },
          ],
        },
        scopeLogs: [
          {
            scope: {
              name: "test.volume.01",
              version: "1.0.0",
              attributes: [
                {
                  key: "my.scope.attribute",
                  value: {
                    stringValue: randomString(10),
                  },
                },
              ],
            },
            logRecords: [
              {
                timeUnixNano: timestamp,
                observedTimeUnixNano: timestamp,
                severityNumber: 10,
                // severityText: randomLogLevel(),
                severityText: "Panic",
                traceId: randomHexId(32),
                spanId: randomHexId(16),
                body: {
                  stringValue: "Example log record",
                },
                attributes: [
                  {
                    key: "http.method",
                    value: {
                      stringValue: randomHttpMethod(),
                    },
                  },
                  {
                    key: "skip_sampling",
                    value: {
                      stringValue: "false",
                    },
                  },
                  {
                    key: "http.status_code",
                    value: {
                      stringValue: randomHttpStatusCode(),
                    },
                  },
                  {
                    key: "http.url",
                    value: {
                      stringValue: randomReferenceUrl(),
                    },
                  },
                  {
                    key: "timestamp",
                    value: {
                      stringValue: timestamp,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  return payload;
}

export default function () {
  const headers = {
    "Content-Type": "application/json",
  };
  let res = http.post(url, getPayload(), { headers });

  check(res, {
    "is status 200": (r) => r.status === 200,
  });

  // Sleep to avoid overloading the server and loose logs, try not sleep less than 0.0001
  sleep(0.0001);
}
