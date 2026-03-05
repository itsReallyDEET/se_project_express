const router = require("express").Router();
const {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");

// GET /items
router.get("/", getItems);

// POST /items
router.post("/", createItem);

// PUT /items/:itemId/likes
router.put("/:itemId/likes", likeItem);

// DELETE /items/:itemId/likes
router.delete("/:itemId/likes", dislikeItem);

// DELETE /items/:itemId
router.delete("/:itemId", deleteItem);

module.exports = router;
