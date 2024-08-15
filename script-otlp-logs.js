import http from "k6/http";
import { check, sleep } from "k6";

const url = "http://localhost:4318/v1/logs";

export const options = {
  vus: 1,
  // iterations: 100,
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

// 5% Error, 10% Warn, 30% Info, 55% Debug
function randomLogLevel() {
  const randomNumber = Math.random() * 100;
  if (randomNumber < 5) {
    return "ERROR";
  } else if (randomNumber < 15) {
    return "WARN";
  } else if (randomNumber < 45) {
    return "INFO";
  } else {
    return "DEBUG";
  }
}

function randomHttpMethod() {
  return ["GET", "POST", "PUT", "DELETE"][Math.floor(Math.random() * 4)];
}

function randomHttpStatusCode() {
  return ["200", "202", "400", "404", "500"][Math.floor(Math.random() * 5)];
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
                severityText: randomLogLevel(),
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

  // Sleep to avoid overloading the server and loose logs, 0.0001 is sufficient
  sleep(0.0001);
}
