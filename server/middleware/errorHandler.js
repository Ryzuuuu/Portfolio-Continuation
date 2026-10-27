export function notFound(_request, response) {
  response.status(404).json({ error: "Not found." });
}

// Express recognises error handlers by their four-argument signature.
export function errorHandler(error, _request, response, next) {
  if (response.headersSent) return next(error);

  if (error.type === "entity.parse.failed") {
    return response.status(400).json({ error: "Request body must be valid JSON." });
  }
  if (error.type === "entity.too.large") {
    return response.status(413).json({ error: "That message is too large to send." });
  }

  console.error("[api] Unhandled error:", error);
  return response.status(500).json({ error: "Something went wrong. Please try again." });
}
