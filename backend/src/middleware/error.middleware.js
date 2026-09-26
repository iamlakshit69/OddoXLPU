// Keeps every API response in the same { success, error } shape on failure.
function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  res.status(status).json({ success: false, error: message });
}

function notFound(req, res) {
  res.status(404).json({ success: false, error: "Route not found" });
}

module.exports = { errorHandler, notFound };
