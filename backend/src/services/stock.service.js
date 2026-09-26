const { Transaction } = require("sequelize");
const { sequelize, Stock, StockLedger } = require("../models");

const VALID_TRANSACTION_TYPES = [
  "RECEIPT",
  "DELIVERY",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "ADJUSTMENT",
];

// -----------------------------------------------------------------------
// moveStock()
//
// Single entry point for ALL stock-changing operations.
//
// Receipt Controller  ──┐
// Delivery Controller ──┤
// Transfer Controller ──┼──▶  moveStock()
// Adjustment Controller ┘
//
// RULES:
//   1. Stock update + StockLedger insert happen inside ONE transaction.
//   2. If either operation fails the entire transaction rolls back.
//   3. The Stock row is locked (SELECT … FOR UPDATE) so concurrent
//      movements for the same product+location cannot overwrite each other.
//   4. Resulting quantity must NEVER be negative.
//   5. The StockLedger is append-only — never update or delete rows.
// -----------------------------------------------------------------------

/**
 * @param {Object}  opts
 * @param {number}  opts.productId       - Required.
 * @param {number}  opts.locationId      - Required.
 * @param {number}  opts.quantityChange  - Required. Positive = increase, negative = decrease. Never 0.
 * @param {string}  opts.transactionType - Required. One of VALID_TRANSACTION_TYPES.
 * @param {string}  opts.referenceType   - Required. e.g. "RECEIPT", "DELIVERY", "TRANSFER", "ADJUSTMENT".
 * @param {number|null}  [opts.referenceId]   - ID of the header row. Null until those modules exist.
 * @param {number|null}  [opts.warehouseId]   - Optional. Links ledger to a warehouse.
 * @param {number|null}  [opts.createdBy]     - Optional. The User.id performing this action.
 * @param {string|null}  [opts.notes]         - Optional free-text note for the ledger entry.
 * @param {Transaction|null} [opts.transaction] - Optional. If the caller already has a
 *        Sequelize transaction (e.g. a Transfer that touches two locations) it can pass it
 *        here so both movements share the same commit/rollback boundary. When omitted the
 *        service creates and manages its own transaction.
 *
 * @returns {Promise<Object>} { stock, ledgerEntry, previousQuantity, newQuantity, quantityChange }
 */
async function moveStock({
  productId,
  locationId,
  warehouseId = null,
  quantityChange,
  transactionType,
  referenceType,
  referenceId = null,
  notes = null,
  createdBy = null,
  transaction: externalTransaction = null,
}) {
  // ---- Input validation ------------------------------------------------

  if (!productId) {
    const err = new Error("productId is required");
    err.status = 400;
    throw err;
  }

  if (!locationId) {
    const err = new Error("locationId is required");
    err.status = 400;
    throw err;
  }

  if (
    quantityChange === undefined ||
    quantityChange === null ||
    isNaN(Number(quantityChange))
  ) {
    const err = new Error("quantityChange must be a valid number");
    err.status = 400;
    throw err;
  }

  const qty = Number(quantityChange);

  if (qty === 0) {
    const err = new Error("quantityChange cannot be zero");
    err.status = 400;
    throw err;
  }

  if (!transactionType || !VALID_TRANSACTION_TYPES.includes(transactionType)) {
    const err = new Error(
      `transactionType must be one of: ${VALID_TRANSACTION_TYPES.join(", ")}`
    );
    err.status = 400;
    throw err;
  }

  if (!referenceType) {
    const err = new Error("referenceType is required");
    err.status = 400;
    throw err;
  }

  // ---- Transaction setup -----------------------------------------------
  // If the caller already owns a transaction we re-use it (the caller is
  // responsible for commit/rollback).  Otherwise we create our own so the
  // Stock update and Ledger insert are always atomic.
  const managedTransaction = !externalTransaction;
  const t = externalTransaction || (await sequelize.transaction());

  try {
    // ---- Lock the Stock row for this product + location ----------------
    // SELECT … FOR UPDATE prevents concurrent movements from reading a
    // stale quantity. If no row exists findOne returns null.
    let stock = await Stock.findOne({
      where: { productId, locationId },
      lock: Transaction.LOCK.UPDATE,
      transaction: t,
    });

    const currentQuantity = stock ? Number(stock.quantity) : 0;
    const newQuantity = currentQuantity + qty;

    // ---- Prevent negative stock ----------------------------------------
    if (newQuantity < 0) {
      const err = new Error(
        `Insufficient stock. Current: ${currentQuantity}, requested change: ${qty}`
      );
      err.status = 400;
      throw err;
    }

    // ---- Update or create the Stock snapshot row -----------------------
    if (stock) {
      stock.quantity = newQuantity;
      await stock.save({ transaction: t });
    } else {
      // First movement for this product + location.
      // newQuantity >= 0 is already guaranteed above (negative was rejected).
      stock = await Stock.create(
        { productId, locationId, quantity: newQuantity },
        { transaction: t }
      );
    }

    // ---- Append exactly ONE ledger entry (never update / delete) -------
    const ledgerEntry = await StockLedger.create(
      {
        transactionType,
        quantityChange: qty,
        resultingQuantity: newQuantity,
        referenceType,
        referenceId,
        notes,
        productId,
        locationId,
        warehouseId,
        createdBy,
      },
      { transaction: t }
    );

    // ---- Commit only if WE created the transaction --------------------
    if (managedTransaction) await t.commit();

    return {
      stock: stock.toJSON(),
      ledgerEntry: ledgerEntry.toJSON(),
      previousQuantity: currentQuantity,
      newQuantity,
      quantityChange: qty,
    };
  } catch (err) {
    // Roll back only if WE created the transaction; otherwise the caller
    // is responsible for rollback so the error simply propagates up.
    if (managedTransaction) {
      try {
        await t.rollback();
      } catch (_rollbackErr) {
        // Rollback itself failed (connection dropped, etc.). The original
        // error is more useful so we let it propagate.
      }
    }
    throw err;
  }
}

module.exports = { moveStock };
